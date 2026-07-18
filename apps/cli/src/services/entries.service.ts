import { Db } from 'mongodb';
import { DbConnection } from '../db/connection';

export interface EntryDoc {
  id: string;
  userId: string;
  preachingDate: number;
  hours: number;
  minutes: number;
  type: string;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface EntriesServiceProps {
  dbConnection: DbConnection;
}

export class EntriesService {
  private dbConnection: DbConnection;

  constructor(props: EntriesServiceProps) {
    this.dbConnection = props.dbConnection;
  }

  private get db(): Db {
    return this.dbConnection.getDb();
  }

  /**
   * Retrieves preaching entries for a specific user ID, with optional date and limit filters.
   */
  async getEntries(
    userId: string, 
    filters: { month?: string; limit?: number }
  ): Promise<EntryDoc[]> {
    const entriesCollection = this.db.collection('entries');
    const query: any = { userId };

    if (filters.month) {
      const { DateTime } = await import('luxon');
      const [year, monthStr] = filters.month.split('-');
      if (year && monthStr && !isNaN(Number(year)) && !isNaN(Number(monthStr))) {
        const startOfMonth = DateTime.fromObject({ year: Number(year), month: Number(monthStr) }).startOf('month').toMillis();
        const endOfMonth = DateTime.fromObject({ year: Number(year), month: Number(monthStr) }).endOf('month').toMillis();
        query.preachingDate = {
          $gte: startOfMonth,
          $lte: endOfMonth,
        };
      }
    }

    const limit = filters.limit ?? 50;
    const docs = await entriesCollection
      .find(query)
      .sort({ preachingDate: -1 })
      .limit(limit)
      .toArray();

    return docs.map(doc => ({
      id: doc._id.toString(),
      userId: doc.userId,
      preachingDate: doc.preachingDate,
      hours: doc.hours,
      minutes: doc.minutes,
      type: doc.type,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }
}
