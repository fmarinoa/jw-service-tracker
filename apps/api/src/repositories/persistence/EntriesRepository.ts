import { Collection, Document } from 'mongodb';

import { Entry } from '@/domain/Entry';
import { FilterEntries } from '@/domain/FilterEntries';
import { User } from '@/domain/User';

import { BaseRepository, BaseRepositoryProps } from './BaseRepository';

export class EntriesRepository extends BaseRepository {
  private indexCreated = false;

  constructor(props: BaseRepositoryProps) {
    super(props);
  }

  override async handlerCollection<T>(
    callback: (collection: Collection<Document>) => Promise<T>,
  ): Promise<T> {
    if (!this.indexCreated) {
      this.indexCreated = true;
      try {
        await super.handlerCollection(async (collection) => {
          await collection.createIndex({ userId: 1, preachingDate: -1 });
        });
      } catch (error) {
        console.error('[EntriesRepository] Failed to create index:', error);
      }
    }
    return super.handlerCollection(callback);
  }

  async getByUser(
    user: User,
    filters?: FilterEntries,
  ): Promise<{
    entries: Entry[];
    total: number;
  }> {
    return this.handlerCollection(async (collection) => {
      const result = await collection
        .find({
          userId: user.id,
          ...(filters && {
            preachingDate: {
              $gte: filters.startDate,
              $lte: filters.endDate,
            },
          }),
        })
        .sort({ preachingDate: -1 })
        .toArray();

      if (!result) {
        return { entries: [], total: 0 };
      }

      return {
        entries: result.map((doc) => {
          const { _id, userId, ...rest } = doc;
          return new Entry({
            ...rest,
            id: _id.toString(),
            user: new User({ id: userId }),
          });
        }),
        total: result.length,
      };
    });
  }

  async create(user: User, data: Partial<Entry>): Promise<Entry> {
    return this.handlerCollection(async (collection) => {
      const createdAt = this.getTimestamp();
      const insertData = this.cleanObject({
        preachingDate: data.preachingDate,
        hours: data.hours,
        minutes: data.minutes,
        type: data.type,
        userId: user.id,
        notes: data.notes,
        createdAt,
      });

      const result = await collection.insertOne(insertData);

      return new Entry({
        ...insertData,
        id: result.insertedId.toString(),
        user: new User({ id: user.id }),
      });
    });
  }

  async update(user: User, entry: Entry): Promise<Entry> {
    return this.handlerCollection(async (collection) => {
      const updatedAt = this.getTimestamp();
      const updateData = this.cleanObject({
        preachingDate: entry.preachingDate,
        hours: entry.hours,
        minutes: entry.minutes,
        type: entry.type,
        notes: entry.notes,
        updatedAt,
      });

      await collection.updateOne(
        { ...this.buildIdFilter(entry.id), userId: user.id },
        {
          $set: updateData,
        },
      );
      return new Entry({
        ...entry,
        id: entry.id,
        user: new User({ id: user.id }),
        updatedAt,
      });
    });
  }

  async delete(user: User, id: string): Promise<boolean> {
    return this.handlerCollection(async (collection) => {
      const result = await collection.deleteOne({
        ...this.buildIdFilter(id),
        userId: user.id,
      });
      return result.deletedCount > 0;
    });
  }
}
