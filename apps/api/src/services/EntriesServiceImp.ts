import { EntriesService } from './EntriesService';
import { EntriesRepository } from '../repositories/EntriesRepository';
import { Entry } from '../domain/Entry';
import { error } from 'node:console';
import { FilterEntry } from '../domain/FilterEntry';

export interface EntriesServiceProps {
  repository: EntriesRepository;
}

export class EntriesServiceImp implements EntriesService {
  private repository: EntriesRepository;

  constructor(props: EntriesServiceProps) {
    this.repository = props.repository;
  }

  async getEntries(
    userId: string,
    filters: FilterEntry
  ): Promise<{ entries: Entry[]; nextCursor?: string }> {
    const { entries, lastEvaluatedKey } = await this.repository.getEntries(userId, filters);

    let nextCursor: string | undefined = undefined;
    const hasNextCursor = !!lastEvaluatedKey;
    if (hasNextCursor) {
      filters.nextCursor = lastEvaluatedKey;
      filters.encodeCursor();
      nextCursor = filters.nextCursor as unknown as string;
    }

    return { entries, nextCursor };
  }

  async createEntry(userId: string, entry: Entry): Promise<Pick<Entry, "id" | "createdAt">> {
    try {
      const response = await this.repository.createEntry(entry);
      return {
        id: response.id,
        createdAt: response.createdAt
      };
    }
    catch (err) {
      throw new Error(`Failed to create entry for user: ${userId}}`, { cause: err });
    }
  }

  async updateEntry(userId: string, entry: Entry): Promise<Pick<Entry, "id" | "updatedAt">> {
    await this.validateExistingEntry(userId, entry.id);
    return await this.repository.updateEntry(entry);
  }

  async deleteEntry(userId: string, id: string): Promise<void> {
    await this.validateExistingEntry(userId, id);
    await this.repository.deleteEntry(userId, id);
  }

  private async validateExistingEntry(userId: string, id: string): Promise<Entry> {
    return this.repository.getEntryById(userId, id).then(existing => {
      if (!existing) {
        const error = new Error('The preaching entry does not exist.');
        (error as any).code = 'NOT_FOUND';
        throw error;
      }
      return existing;
    });
  }
}
