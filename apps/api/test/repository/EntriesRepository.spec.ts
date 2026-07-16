import { ObjectId } from 'mongodb';

import { Entry } from '@/domain/Entry';
import { FilterEntries } from '@/domain/FilterEntries';
import { User } from '@/domain/User';
import { EntriesRepository } from '@/repositories/EntriesRepository';

describe('EntriesRepository', () => {
  let repository: EntriesRepository;
  let mockCollection: any;
  let mockDb: any;
  let mockClient: any;

  beforeEach(() => {
    mockCollection = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      createIndex: jest.fn().mockResolvedValue(undefined),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    mockClient = {
      db: jest.fn().mockReturnValue(mockDb),
    };

    repository = new EntriesRepository({
      client: mockClient as any,
      config: { collectionName: 'entries' },
    });

    jest.clearAllMocks();
  });

  describe('getByUser', () => {
    it('should query entries for a user with sorting', async () => {
      const user = new User({ id: 'user-123' });
      const mockDbEntries = [
        {
          _id: new ObjectId('6a2a3169441e2b16bc9d1867'),
          hours: 2,
          minutes: 30,
          type: 'house_to_house',
          userId: 'user-123',
        },
      ];

      mockCollection.toArray.mockResolvedValue(mockDbEntries);

      const result = await repository.getByUser(user);

      expect(mockCollection.find).toHaveBeenCalledWith({ userId: 'user-123' });
      expect(mockCollection.sort).toHaveBeenCalledWith({ preachingDate: -1 });
      expect(result.entries.length).toBe(1);
      expect(result.entries[0]).toBeInstanceOf(Entry);
      expect(result.entries[0].id).toBe('6a2a3169441e2b16bc9d1867');
      expect(result.total).toBe(1);
    });

    it('should apply preachingDate filters if provided', async () => {
      const user = new User({ id: 'user-123' });
      const filters = new FilterEntries({
        startDate: 1000,
        endDate: 2000,
      });

      mockCollection.toArray.mockResolvedValue([]);

      await repository.getByUser(user, filters);

      expect(mockCollection.find).toHaveBeenCalledWith({
        userId: 'user-123',
        preachingDate: { $gte: 1000, $lte: 2000 },
      });
    });
  });

  describe('create', () => {
    it('should insert a new entry for a user and return the Entry object with insertedId', async () => {
      const user = new User({ id: 'user-123' });
      const data = {
        hours: 1,
        minutes: 45,
        type: 'revisits' as const,
        preachingDate: 123456,
        notes: 'Some notes',
      };

      const mockInsertedId = new ObjectId('6a2a3169441e2b16bc9d1867');
      mockCollection.insertOne.mockResolvedValue({ insertedId: mockInsertedId });

      const result = await repository.create(user, data);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          hours: 1,
          minutes: 45,
          type: 'revisits',
          userId: 'user-123',
          preachingDate: 123456,
          notes: 'Some notes',
          createdAt: expect.any(Number),
        }),
      );
      expect(result).toBeInstanceOf(Entry);
      expect(result.id).toBe(mockInsertedId.toString());
      expect(result.user.id).toBe('user-123');
    });
  });

  describe('update', () => {
    it('should successfully update and return the updated Entry object', async () => {
      const user = new User({ id: 'user-123' });
      const entryId = '6a2a3169441e2b16bc9d1867';
      const entryToUpdate = new Entry({
        id: entryId,
        hours: 2,
        minutes: 15,
        type: 'bible_study',
        preachingDate: 654321,
      });

      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await repository.update(user, entryToUpdate);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(entryId), userId: 'user-123' },
        {
          $set: expect.objectContaining({
            hours: 2,
            minutes: 15,
            type: 'bible_study',
            preachingDate: 654321,
            updatedAt: expect.any(Number),
          }),
        },
      );
      expect(result.id).toBe(entryId);
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(15);
      expect(result.type).toBe('bible_study');
    });
  });

  describe('delete', () => {
    it('should perform deleteOne and return true if a document was deleted', async () => {
      const user = new User({ id: 'user-123' });
      const id = '6a2a3169441e2b16bc9d1867';

      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await repository.delete(user, id);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: new ObjectId(id),
        userId: 'user-123',
      });
      expect(result).toBe(true);
    });

    it('should return false if no document was deleted', async () => {
      const user = new User({ id: 'user-123' });
      const id = '6a2a3169441e2b16bc9d1867';

      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await repository.delete(user, id);

      expect(result).toBe(false);
    });
  });
});
