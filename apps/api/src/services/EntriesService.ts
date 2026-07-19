import { EntriesResponse, SyncEntriesResponse } from '@jw-tracker/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';

import { Entry } from '@/domain/Entry';
import { FilterEntries } from '@/domain/FilterEntries';
import { User } from '@/domain/User';
import { entriesRepository } from '@/repositories';

@Injectable()
export class EntriesService {
  async getByUser(
    user: User,
    filters: FilterEntries,
  ): Promise<EntriesResponse> {
    const now = DateTime.now().setZone('America/Lima');
    const targetMonth = now.plus({ months: filters.monthOffset });
    const startDate = targetMonth.startOf('month').toMillis();
    const endDate = targetMonth.endOf('month').toMillis();

    const newFilters = new FilterEntries({
      ...filters,
      startDate,
      endDate,
    });

    console.log(
      `[EntriesService.getEntriesByUser] filters:`,
      JSON.stringify(newFilters),
    );
    const result = await entriesRepository.getByUser(user, newFilters);

    const startIndex = (filters.page - 1) * filters.limit;
    const entries = result.entries.slice(
      startIndex,
      startIndex + filters.limit,
    );

    return {
      entries,
      total: result.total,
      stats: Entry.computeMonthlyStats(result.entries),
    };
  }

  async create(user: User, entry: Entry) {
    entry.validateHourPlusMinutes();
    entry.preachingDateNotInFuture();
    return await entriesRepository.create(user, entry);
  }

  async createMany(user: User, entries: Entry[]): Promise<SyncEntriesResponse> {
    const createdEntries: { entry: Entry; tempId: string }[] = [];
    const failedEntries: { entry: Entry; error: string }[] = [];
    let errorCount = 0;
    await Promise.all(
      entries.map(async (entry) => {
        try {
          if (!entry.tempId) {
            throw new Error('tempId is required for syncing entries');
          }
          const createdEntry = await this.create(user, entry);
          createdEntries.push({ entry: createdEntry, tempId: entry.tempId! });
        } catch (error: any) {
          console.error(
            `[EntriesService.createMany] Error creating entry for user ${user.id}:`,
            error,
          );
          failedEntries.push({ entry, error: error.message });
          errorCount++;
        }
      }),
    );
    console.log(
      `[EntriesService.createMany] Created ${createdEntries.length} entries with ${errorCount} errors for user ${user.id}`,
    );
    return {
      successful: createdEntries,
      failed: failedEntries,
    };
  }

  async delete(user: User, entryId: string) {
    const wasDeleted = await entriesRepository.delete(user, entryId);
    if (!wasDeleted) {
      throw new NotFoundException(
        `Entry with ID ${entryId} not found for user ${user.id}`,
      );
    }
  }

  async update(user: User, entry: Entry) {
    entry.validateHourPlusMinutes();
    entry.preachingDateNotInFuture();
    const updatedEntry = await entriesRepository.update(user, entry);
    if (!updatedEntry) {
      throw new NotFoundException(
        `Entry with ID ${entry.id} not found for user ${user.id}`,
      );
    }
    return updatedEntry;
  }
}
