import { Injectable, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';

import { Entry } from '@/domain/Entry';
import { FilterEntries } from '@/domain/FilterEntries';
import { User } from '@/domain/User';
import { entriesRepository } from '@/repositories';

@Injectable()
export class EntriesService {
  async getByUser(user: User, filters: FilterEntries) {
    const now = DateTime.now().setZone('America/Lima');
    const targetMonth = now.minus({ months: filters.monthOffset });
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
