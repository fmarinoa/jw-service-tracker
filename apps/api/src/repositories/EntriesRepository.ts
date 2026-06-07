import { Entry } from '../domain/Entry';
import { FilterEntry } from '../domain/FilterEntry';

export interface EntriesRepository {
  /**
   * Retrieves a paginated list of preaching entries for a user, sorted by date descending.
   */
  getEntries(
    userId: string,
    filters: FilterEntry
  ): Promise<{ entries: Entry[]; lastEvaluatedKey?: Record<string, any> }>;

  /**
   * Retrieves a specific preaching entry by id.
   */
  getEntryById(userId: string, id: string): Promise<Entry | null>;

  /**
   * Saves a new preaching entry.
   */
  createEntry(entry: Entry): Promise<Entry>;

  /**
   * Updates an existing preaching entry.
   */
  updateEntry(entry: Entry): Promise<Entry>;

  /**
   * Deletes a preaching entry physically.
   */
  deleteEntry(userId: string, id: string): Promise<void>;
}
