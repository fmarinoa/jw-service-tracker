import { ObjectId } from 'mongodb';

import { ReleaseInfo } from '@/domain/ReleaseInfo';
import { HistoryReleasesRepository } from '@/repositories/HistoryReleasesRepository';

describe('HistoryReleasesRepository', () => {
  let repository: HistoryReleasesRepository;
  let mockCollection: any;
  let mockDb: any;
  let mockClient: any;
  let mockCursor: any;

  beforeEach(() => {
    mockCursor = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };

    mockCollection = {
      insertOne: jest.fn(),
      find: jest.fn().mockReturnValue(mockCursor),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    mockClient = {
      db: jest.fn().mockReturnValue(mockDb),
    };

    repository = new HistoryReleasesRepository({
      client: mockClient,
      config: { collectionName: 'history_releases' },
    });

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should clean release object, add timestamp, insert into collection and return ReleaseInfo with id', async () => {
      const inputRelease = new ReleaseInfo({
        version: '0.0.4',
        tagName: 'v0.0.4',
        title: 'Release v0.0.4',
        publishedAt: '2026-07-21T03:07:15Z',
        notes: 'Release notes',
        apkAsset: {
          name: 'app.apk',
          downloadUrl: 'http://example.com/app.apk',
          size: 1024,
        },
      });

      const mockInsertedId = new ObjectId('6a2a3169441e2b16bc9d1867');
      mockCollection.insertOne.mockResolvedValue({
        insertedId: mockInsertedId,
      });

      const result = await repository.create(inputRelease);

      expect(mockDb.collection).toHaveBeenCalledWith('history_releases');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          version: '0.0.4',
          tagName: 'v0.0.4',
          title: 'Release v0.0.4',
          publishedAt: '2026-07-21T03:07:15Z',
          notes: 'Release notes',
          createdAt: expect.any(Number),
        }),
      );
      expect(result).toBeInstanceOf(ReleaseInfo);
      expect(result.id).toBe(mockInsertedId.toString());
      expect(result.version).toBe('0.0.4');
    });
  });

  describe('findLast', () => {
    it('should query collection sorted by createdAt desc with limit 1 and return ReleaseInfo', async () => {
      const mockDoc = {
        _id: new ObjectId('6a2a3169441e2b16bc9d1867'),
        version: '0.0.4',
        tagName: 'v0.0.4',
        title: 'Release v0.0.4',
        publishedAt: '2026-07-21T03:07:15Z',
        notes: 'Release notes',
        apkAsset: {
          name: 'app.apk',
          downloadUrl: 'http://example.com/app.apk',
          size: 1024,
        },
        createdAt: 1782882000000,
      };

      mockCursor.toArray.mockResolvedValue([mockDoc]);

      const result = await repository.findLast();

      expect(mockDb.collection).toHaveBeenCalledWith('history_releases');
      expect(mockCollection.find).toHaveBeenCalled();
      expect(mockCursor.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockCursor.limit).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(ReleaseInfo);
      expect(result?.version).toBe('0.0.4');
    });

    it('should return null if no releases found in collection', async () => {
      mockCursor.toArray.mockResolvedValue([]);

      const result = await repository.findLast();

      expect(result).toBeNull();
    });
  });
});
