import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntriesServiceImp } from '../src/services/EntriesServiceImp';
import { EntriesRepository } from '../src/repositories/EntriesRepository';
import { Entry } from '../src/domain/Entry';
import { User } from '../src/domain/User';

describe('EntriesServiceImp Unit Tests', () => {
  let repositoryMock: EntriesRepository;
  let service: EntriesServiceImp;

  beforeEach(() => {
    repositoryMock = {
      getEntries: vi.fn(),
      getEntryById: vi.fn(),
      createEntry: vi.fn(),
      updateEntry: vi.fn(),
      deleteEntry: vi.fn(),
    } as any;
    service = new EntriesServiceImp({ repository: repositoryMock });
  });

  describe('getEntries', () => {
    it('should delegate to repository.getEntries', async () => {
      const mockResult = { entries: [], lastEvaluatedKey: undefined };
      vi.mocked(repositoryMock.getEntries).mockResolvedValue(mockResult);

      const result = await service.getEntries('user-1', 50, { id: 'x' });

      expect(repositoryMock.getEntries).toHaveBeenCalledWith('user-1', 50, { id: 'x' }, undefined, undefined);
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteEntry', () => {
    it('should delete entry if it exists in repository', async () => {
      const mockEntry = new Entry({
        id: '123',
        user: new User({ id: 'user-1' }),
        hours: 1,
        minutes: 0,
        type: 'house_to_house',
        createdAt: 1000,
        updatedAt: 1000,
      });
      vi.mocked(repositoryMock.getEntryById).mockResolvedValue(mockEntry);

      await service.deleteEntry('user-1', '123');

      expect(repositoryMock.getEntryById).toHaveBeenCalledWith('user-1', '123');
      expect(repositoryMock.deleteEntry).toHaveBeenCalledWith('user-1', '123');
    });

    it('should throw an error with code NOT_FOUND if entry does not exist', async () => {
      vi.mocked(repositoryMock.getEntryById).mockResolvedValue(null);

      await expect(service.deleteEntry('user-1', '123')).rejects.toThrow(
        'The preaching entry does not exist.'
      );
      expect(repositoryMock.deleteEntry).not.toHaveBeenCalled();
    });
  });

  describe('createEntry', () => {
    it('should create an entry and return it', async () => {
      const entry = new Entry({
        user: new User({ id: 'user-1' }),
        preachingDate: 1770000000000,
        hours: 1,
        minutes: 30,
        type: 'house_to_house',
      });

      const mockCreated = new Entry({ ...entry, id: 'uuid-1', createdAt: 2000 });
      vi.mocked(repositoryMock.createEntry).mockResolvedValue(mockCreated);

      const result = await service.createEntry('user-1', entry);

      expect(repositoryMock.createEntry).toHaveBeenCalledWith(entry);
      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateEntry', () => {
    it('should update entry if it exists', async () => {
      const entry = new Entry({
        id: '123',
        user: new User({ id: 'user-1' }),
        preachingDate: 1770000000000,
        hours: 2,
        minutes: 0,
        type: 'revisits',
      });

      const mockExisting = new Entry({ ...entry, createdAt: 1000 });
      const mockUpdated = new Entry({ ...entry, createdAt: 1000, updatedAt: 2000 });

      vi.mocked(repositoryMock.getEntryById).mockResolvedValue(mockExisting);
      vi.mocked(repositoryMock.updateEntry).mockResolvedValue(mockUpdated);

      const result = await service.updateEntry('user-1', '123', entry);

      expect(repositoryMock.getEntryById).toHaveBeenCalledWith('user-1', '123');
      expect(repositoryMock.updateEntry).toHaveBeenCalledWith(entry);
      expect(result).toEqual(mockUpdated);
    });

    it('should throw error if entry does not exist for update', async () => {
      const entry = new Entry({
        id: '123',
        user: new User({ id: 'user-1' }),
        preachingDate: 1770000000000,
        hours: 2,
        minutes: 0,
        type: 'revisits',
      });

      vi.mocked(repositoryMock.getEntryById).mockResolvedValue(null);

      await expect(service.updateEntry('user-1', '123', entry)).rejects.toThrow(
        'The preaching entry does not exist.'
      );
      expect(repositoryMock.updateEntry).not.toHaveBeenCalled();
    });
  });
});
