import { Entry } from '../domain/Entry';
import { FilterEntry } from '../domain/FilterEntry';

export interface EntriesService {
  /**
   * Retrieves paginated preaching entries for a user.
   */
  getEntries(
    userId: string,
    filters: FilterEntry
  ): Promise<{ entries: Entry[]; nextCursor?: string }>;

  /**
   * Creates a specific preaching entry.
   */
  createEntry(userId: string, entry: Entry): Promise<Pick<Entry, "id" | "createdAt">>;

  /**
   * Updates a specific preaching entry.
   */
  updateEntry(userId: string, entry: Entry): Promise<Pick<Entry, "id" | "updatedAt">>;

  /**
   * Deletes a specific preaching entry.
   */
  deleteEntry(userId: string, id: string): Promise<void>;
}
