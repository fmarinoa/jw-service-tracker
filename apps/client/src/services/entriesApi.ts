import {
  EntriesResponse,
  Entry,
  SyncEntriesResponse,
} from '@jw-tracker/shared';

import { BaseService } from './baseApi';

export class EntriesApi extends BaseService {
  static async getEntries(
    page: number,
    monthOffset: number,
  ): Promise<EntriesResponse> {
    return this.handleRequest<EntriesResponse>({
      path: `/entries`,
      queryParams: { page, limit: 10, monthOffset },
    });
  }

  static async createEntry(data: {
    preachingDate: number;
    hours: number;
    minutes: number;
    type: string;
    notes?: string;
  }): Promise<Entry> {
    return this.handleRequest<Entry>({
      path: `/entries`,
      method: 'POST',
      body: data,
    });
  }

  static async createMany(
    data: {
      preachingDate: number;
      hours: number;
      minutes: number;
      type: string;
      notes?: string;
      tempId?: string;
    }[],
  ): Promise<SyncEntriesResponse> {
    return this.handleRequest<SyncEntriesResponse>({
      path: `/entries/sync`,
      method: 'POST',
      body: data,
    });
  }

  static async updateEntry(
    id: string,
    data: {
      preachingDate: number;
      hours: number;
      minutes: number;
      type: string;
      notes?: string;
    },
  ): Promise<Entry> {
    return this.handleRequest<Entry>({
      path: `/entries/${id}`,
      method: 'PATCH',
      body: data,
    });
  }

  static async deleteEntry(id: string): Promise<void> {
    await this.handleRequest<void>({
      path: `/entries/${id}`,
      method: 'DELETE',
    });
  }
}
