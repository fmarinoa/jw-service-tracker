import { Entry, MonthlyStats, User } from '@jw-tracker/shared';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CACHED_USER_KEY = 'cached_user_profile';
const CACHED_ENTRIES_PREFIX = 'cached_entries_month_';
const KEYS_INDEX_KEY = 'secure_store_keys_index';

const isWeb = Platform.OS === 'web';

const webStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

export class StorageDriver {
  private static useMemoryFallback = false;
  private static memoryCache: Record<string, string> = {};

  private static async getKeysIndex(): Promise<string[]> {
    if (this.useMemoryFallback) {
      return Object.keys(this.memoryCache);
    }
    try {
      const indexStr = isWeb
        ? webStorage.getItem(KEYS_INDEX_KEY)
        : await SecureStore.getItemAsync(KEYS_INDEX_KEY);
      return indexStr ? JSON.parse(indexStr) : [];
    } catch (e) {
      console.warn('StorageDriver: Failed to get keys index', e);
      return [];
    }
  }

  private static async saveKeysIndex(keys: string[]): Promise<void> {
    if (this.useMemoryFallback) return;
    try {
      const indexStr = JSON.stringify(keys);
      if (isWeb) {
        webStorage.setItem(KEYS_INDEX_KEY, indexStr);
      } else {
        await SecureStore.setItemAsync(KEYS_INDEX_KEY, indexStr);
      }
    } catch (e) {
      console.warn('StorageDriver: Failed to save keys index', e);
    }
  }

  static async getItem(key: string): Promise<string | null> {
    if (this.useMemoryFallback) {
      return this.memoryCache[key] || null;
    }
    try {
      if (isWeb) return webStorage.getItem(key);
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      if (e instanceof Error && e.message.includes('Native module is null')) {
        console.warn('StorageDriver: Falling back to in-memory cache.');
        this.useMemoryFallback = true;
        return this.memoryCache[key] || null;
      }
      throw e;
    }
  }

  static async setItem(key: string, value: string): Promise<void> {
    this.memoryCache[key] = value;
    const keys = await this.getKeysIndex();
    if (!keys.includes(key)) {
      keys.push(key);
      await this.saveKeysIndex(keys);
    }
    if (this.useMemoryFallback) return;
    try {
      if (isWeb) {
        webStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Native module is null')) {
        console.warn('StorageDriver: Falling back to in-memory cache.');
        this.useMemoryFallback = true;
        return;
      }
      throw e;
    }
  }

  static async removeItem(key: string): Promise<void> {
    delete this.memoryCache[key];
    const keys = await this.getKeysIndex();
    const filtered = keys.filter((k) => k !== key);
    await this.saveKeysIndex(filtered);

    if (this.useMemoryFallback) return;
    try {
      if (isWeb) {
        webStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Native module is null')) {
        console.warn('StorageDriver: Falling back to in-memory cache.');
        this.useMemoryFallback = true;
        return;
      }
      throw e;
    }
  }

  static async getAllKeys(): Promise<string[]> {
    return await this.getKeysIndex();
  }

  static async multiRemove(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.removeItem(key);
    }
  }
}

export class OfflineStorage {
  static async getCachedUser(): Promise<User | null> {
    try {
      const dataStr = await StorageDriver.getItem(CACHED_USER_KEY);
      return dataStr ? JSON.parse(dataStr) : null;
    } catch (e) {
      console.error('Failed to get cached user', e);
      return null;
    }
  }

  static async setCachedUser(user: User): Promise<void> {
    try {
      const dataStr = JSON.stringify(user);
      await StorageDriver.setItem(CACHED_USER_KEY, dataStr);
    } catch (e) {
      console.error('Failed to cache user profile', e);
    }
  }

  static async getCachedDashboardData(
    monthOffset: number,
    page: number,
  ): Promise<{ entries: Entry[]; stats: MonthlyStats; total: number } | null> {
    try {
      const key = `${CACHED_ENTRIES_PREFIX}${monthOffset}_page_${page}`;
      const dataStr = await StorageDriver.getItem(key);
      return dataStr ? JSON.parse(dataStr) : null;
    } catch (e) {
      console.error(
        `Failed to get cached entries for offset ${monthOffset}`,
        e,
      );
      return null;
    }
  }

  static async setCachedDashboardData(
    monthOffset: number,
    page: number,
    data: { entries: Entry[]; stats: MonthlyStats; total: number },
  ): Promise<void> {
    try {
      const key = `${CACHED_ENTRIES_PREFIX}${monthOffset}_page_${page}`;
      const dataStr = JSON.stringify(data);
      await StorageDriver.setItem(key, dataStr);
    } catch (e) {
      console.error(`Failed to cache entries for offset ${monthOffset}`, e);
    }
  }

  static async replaceTempIdInCache(
    tempId: string,
    realEntry: Entry,
  ): Promise<void> {
    try {
      const keys = await StorageDriver.getAllKeys();
      const cacheKeys = keys.filter((key) =>
        key.startsWith(CACHED_ENTRIES_PREFIX),
      );
      for (const key of cacheKeys) {
        const dataStr = await StorageDriver.getItem(key);
        if (dataStr) {
          const data = JSON.parse(dataStr);
          if (data.entries) {
            const idx = data.entries.findIndex((e: any) => e.id === tempId);
            if (idx !== -1) {
              data.entries[idx] = realEntry;
              await StorageDriver.setItem(key, JSON.stringify(data));
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to replace tempId in cache', e);
    }
  }

  static async clearCache(): Promise<void> {
    try {
      await StorageDriver.removeItem(CACHED_USER_KEY);
      const keys = await StorageDriver.getAllKeys();
      const cacheKeys = keys.filter((key) =>
        key.startsWith(CACHED_ENTRIES_PREFIX),
      );
      if (cacheKeys.length > 0) {
        await StorageDriver.multiRemove(cacheKeys);
      }
    } catch (e) {
      console.error('Failed to clear cache', e);
    }
  }
}
