import { OfflineMutation, SyncEntriesResponse } from '@jw-tracker/shared';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

import { AuthTokenStorage } from '../storage/authTokens';
import { OfflineStorage, StorageDriver } from '../storage/offlineStorage';
import { AuthApi } from './authApi';
import { EntriesApi } from './entriesApi';
import { UserApi } from './userApi';

const MUTATION_QUEUE_KEY = 'offline_mutation_queue';
const isWeb = Platform.OS === 'web';

export class OfflineSyncService {
  static async isOffline(): Promise<boolean> {
    if (isWeb) {
      return typeof navigator !== 'undefined' && !navigator.onLine;
    }
    try {
      const state = await NetInfo.fetch();
      return !(state.isConnected ?? false);
    } catch {
      return false; // Default to online if NetInfo fails
    }
  }

  static async getQueue(): Promise<OfflineMutation[]> {
    try {
      const queueStr = await StorageDriver.getItem(MUTATION_QUEUE_KEY);
      return queueStr ? JSON.parse(queueStr) : [];
    } catch (e) {
      console.error('Failed to get offline queue', e);
      return [];
    }
  }

  static async saveQueue(queue: OfflineMutation[]): Promise<void> {
    try {
      const queueStr = JSON.stringify(queue);
      await StorageDriver.setItem(MUTATION_QUEUE_KEY, queueStr);
    } catch (e) {
      console.error('Failed to save offline queue', e);
    }
  }

  static async queueMutation(mut: Omit<OfflineMutation, 'id'>): Promise<void> {
    const queue = await this.getQueue();
    const id = `mut_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newMutation: OfflineMutation = { id, ...mut };

    if (newMutation.type === 'UPDATE_ENTRY') {
      const isTemp = newMutation.entryId?.startsWith('temp_');
      if (isTemp) {
        // Find CREATE_ENTRY with tempId === entryId
        const createMut = queue.find(
          (m) => m.type === 'CREATE_ENTRY' && m.tempId === newMutation.entryId,
        );
        if (createMut) {
          createMut.payload = { ...createMut.payload, ...newMutation.payload };
          await this.saveQueue(queue);
          return;
        }
      } else {
        // Find existing UPDATE_ENTRY with same entryId
        const existingUpdate = queue.find(
          (m) => m.type === 'UPDATE_ENTRY' && m.entryId === newMutation.entryId,
        );
        if (existingUpdate) {
          existingUpdate.payload = {
            ...existingUpdate.payload,
            ...newMutation.payload,
          };
          await this.saveQueue(queue);
          return;
        }
      }
    } else if (newMutation.type === 'DELETE_ENTRY') {
      const isTemp = newMutation.entryId?.startsWith('temp_');
      if (isTemp) {
        // Remove CREATE_ENTRY and any UPDATE_ENTRY with this entryId
        const filtered = queue.filter(
          (m) =>
            !(m.type === 'CREATE_ENTRY' && m.tempId === newMutation.entryId) &&
            !(m.type === 'UPDATE_ENTRY' && m.entryId === newMutation.entryId),
        );
        await this.saveQueue(filtered);
        return;
      } else {
        // Remove any UPDATE_ENTRY for this entryId, then queue DELETE_ENTRY
        const filtered = queue.filter(
          (m) =>
            !(m.type === 'UPDATE_ENTRY' && m.entryId === newMutation.entryId),
        );
        filtered.push(newMutation);
        await this.saveQueue(filtered);
        return;
      }
    } else if (newMutation.type === 'UPDATE_SETTINGS') {
      const existingUpdate = queue.find((m) => m.type === 'UPDATE_SETTINGS');
      if (existingUpdate) {
        existingUpdate.payload = {
          ...existingUpdate.payload,
          ...newMutation.payload,
        };
        await this.saveQueue(queue);
        return;
      }
    }

    queue.push(newMutation);
    await this.saveQueue(queue);
  }

  static async syncOfflineRequests(): Promise<void> {
    const isOffline = await this.isOffline();
    if (isOffline) return;

    const queue = await this.getQueue();
    if (queue.length === 0) return;

    // Refresh token first before doing any backend mutations
    try {
      const refreshToken = await AuthTokenStorage.getRefreshToken();
      if (refreshToken) {
        const refreshRes = await AuthApi.refresh(refreshToken);
        await AuthTokenStorage.setAccessToken(refreshRes.accessToken);
        await AuthTokenStorage.setRefreshToken(refreshRes.refreshToken);
      }
    } catch (e) {
      console.error(
        'OfflineSyncService: Failed to refresh token during sync',
        e,
      );
      if (e instanceof Error && e.name === 'NetworkError') {
        // Connection lost during refresh, abort sync
        return;
      }
      // If it's a token verification error, let the caller throw it
      throw e;
    }

    const remainingQueue = [...queue];

    const entriesToCreate: OfflineMutation[] = remainingQueue.filter(
      (mut) => mut.type === 'CREATE_ENTRY',
    );

    let syncResponse: SyncEntriesResponse | null = null;
    if (entriesToCreate.length > 0) {
      try {
        syncResponse = await EntriesApi.createMany(
          entriesToCreate.map((mut) => ({
            ...mut.payload,
            tempId: mut.tempId,
          })),
        );

        // Replace tempId with realId in remaining mutations and cache
        if (syncResponse && syncResponse.successful) {
          for (const success of syncResponse.successful) {
            const tempId = success.tempId;
            const realEntry = success.entry;
            const realId = realEntry.id;

            for (const remainingMut of remainingQueue) {
              if (remainingMut.entryId === tempId) {
                remainingMut.entryId = realId;
              }
            }

            await OfflineStorage.replaceTempIdInCache(tempId, realEntry);
          }
        }
      } catch (e) {
        console.error(
          'OfflineSyncService: Failed to createMany during sync',
          e,
        );
        if (e instanceof Error && e.name === 'NetworkError') {
          // Network error: abort sync and try again later
          return;
        }
        // For other errors (validation, etc.), we fall back to individual processing in the loop below
      }
    }

    while (remainingQueue.length > 0) {
      const mut = remainingQueue[0];
      try {
        if (mut.type === 'CREATE_ENTRY') {
          // Check if this tempId was already successfully created in the batch createMany
          const alreadyCreated = syncResponse?.successful.find(
            (c) => c.tempId === mut.tempId,
          );
          if (alreadyCreated) {
            // Already created in batch, just remove from queue
            remainingQueue.shift();
            await this.saveQueue(remainingQueue);
            continue;
          }

          // Check if this tempId failed to be created in the batch createMany
          const alreadyFailed = syncResponse?.failed.find(
            (f) => f.entry.tempId === mut.tempId,
          );
          if (alreadyFailed) {
            // Already failed in batch, remove from queue and proceed to next (to avoid blocking queue)
            console.warn(
              `Mutation CREATE_ENTRY with tempId ${mut.tempId} failed in batch sync: ${alreadyFailed.error}`,
            );
            remainingQueue.shift();
            await this.saveQueue(remainingQueue);
            continue;
          }

          // If not created in batch, try individual creation
          const realEntry = await EntriesApi.createEntry(mut.payload);
          const realId = realEntry.id;
          const tempId = mut.tempId!;

          // Replace tempId with realId in remaining mutations in this sync batch
          for (const remainingMut of remainingQueue) {
            if (remainingMut.entryId === tempId) {
              remainingMut.entryId = realId;
            }
          }

          // Replace tempId with realEntry in cache
          await OfflineStorage.replaceTempIdInCache(tempId, realEntry);
        } else if (mut.type === 'UPDATE_ENTRY') {
          await EntriesApi.updateEntry(mut.entryId!, mut.payload);
        } else if (mut.type === 'DELETE_ENTRY') {
          await EntriesApi.deleteEntry(mut.entryId!);
        } else if (mut.type === 'UPDATE_SETTINGS') {
          await UserApi.updateSettings(mut.payload);
        }

        // Mutation processed successfully, remove from queue
        remainingQueue.shift();
        await this.saveQueue(remainingQueue);
      } catch (e) {
        console.error(
          `OfflineSyncService: Failed to process mutation ${mut.type}`,
          e,
        );
        if (e instanceof Error && e.name === 'NetworkError') {
          // Network error: stop processing, keep current item in queue
          break;
        } else {
          // Client or Validation error (400, 404, etc.): discard to not block queue
          remainingQueue.shift();
          await this.saveQueue(remainingQueue);
        }
      }
    }
  }

  static async clearQueue(): Promise<void> {
    try {
      await StorageDriver.removeItem(MUTATION_QUEUE_KEY);
    } catch (e) {
      console.error('Failed to clear queue', e);
    }
  }
}
