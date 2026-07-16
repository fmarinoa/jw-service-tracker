import { DateTime } from 'luxon';

import { Entry } from '@/domain/Entry';
import { User } from '@/domain/User';

import { BaseRepository, BaseRepositoryProps } from './BaseRepository';

export class EntriesRepository extends BaseRepository {
  constructor(props: BaseRepositoryProps) {
    super(props);
    // Ensure compound index for fast queries by user and date range
    this.handlerCollection(async (collection) => {
      await collection.createIndex({ userId: 1, preachingDate: -1 });
    }).catch((error) => {
      console.error('[EntriesRepository] Failed to create index:', error);
    });
  }

  async getByUser(
    user: User,
    options?: {
      startOfMonth: number;
      endOfMonth: number;
    },
  ): Promise<{
    entries: Entry[];
    total: number;
  }> {
    return this.handlerCollection(async (collection) => {
      const result = await collection
        .find({
          userId: user.id,
          ...(options && {
            preachingDate: {
              $gte: options.startOfMonth,
              $lte: options.endOfMonth,
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
      const createdAt = DateTime.now().toMillis();
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
      const updatedAt = DateTime.now().toMillis();
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

  async delete(user: User, id: string): Promise<void> {
    await this.handlerCollection(async (collection) => {
      await collection.deleteOne({
        ...this.buildIdFilter(id),
        userId: user.id,
      });
    });
  }
}
