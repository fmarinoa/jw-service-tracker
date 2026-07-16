import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTime } from 'luxon';

import { Entry } from '@/domain/Entry';
import { FilterEntries } from '@/domain/FilterEntries';
import { User } from '@/domain/User';
import { EntriesService } from '@/services/EntriesService';

// Mock the direct repository imports
jest.mock('@/repositories', () => {
  return {
    entriesRepository: {
      getByUser: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };
});

import { entriesRepository } from '@/repositories';

describe('EntriesService', () => {
  let entriesService: EntriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntriesService],
    }).compile();

    entriesService = module.get<EntriesService>(EntriesService);
    jest.clearAllMocks();
  });

  describe('getByUser', () => {
    it('should retrieve, paginate, and calculate statistics for user entries', async () => {
      const user = new User({ id: 'user-123', name: 'Franco' });
      const filters = new FilterEntries({
        monthOffset: 0,
        page: 1,
        limit: 10,
      });

      const mockEntries = [
        new Entry({
          id: 'entry-1',
          hours: 2,
          minutes: 30,
          preachingDate: Date.now(),
          type: 'regular_pioneer',
        }),
        new Entry({
          id: 'entry-2',
          hours: 1,
          minutes: 45,
          preachingDate: Date.now(),
          type: 'regular_pioneer',
        }),
      ];

      (entriesRepository.getByUser as jest.Mock).mockResolvedValue({
        entries: mockEntries,
        total: 2,
      });

      const result = await entriesService.getByUser(user, filters);

      expect(entriesRepository.getByUser).toHaveBeenCalled();
      expect(result.entries.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.stats).toEqual({
        totalMinutes: 255,
        byType: {
          house_to_house: 0,
          revisits: 0,
          bible_study: 0,
          other: 0,
          regular_pioneer: 255,
        },
      });
    });

    it('should paginate entries correctly according to limit and page parameters', async () => {
      const user = new User({ id: 'user-123' });
      const filters = new FilterEntries({
        monthOffset: 0,
        page: 2,
        limit: 1,
      });

      const mockEntries = [
        new Entry({ id: 'entry-1', hours: 1, minutes: 0 }),
        new Entry({ id: 'entry-2', hours: 2, minutes: 0 }),
      ];

      (entriesRepository.getByUser as jest.Mock).mockResolvedValue({
        entries: mockEntries,
        total: 2,
      });

      const result = await entriesService.getByUser(user, filters);

      // Page 2 with limit 1 should return only the second entry
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].id).toBe('entry-2');
    });
  });

  describe('create', () => {
    it('should create an entry if valid', async () => {
      const user = new User({ id: 'user-123' });
      const entry = new Entry({
        hours: 2,
        minutes: 0,
        preachingDate: DateTime.now().minus({ days: 1 }).toMillis(), // Yesterday (valid)
        type: 'regular_pioneer',
      });

      (entriesRepository.create as jest.Mock).mockResolvedValue({
        ...entry,
        id: 'new-entry-id',
      });

      const result = await entriesService.create(user, entry);

      expect(entriesRepository.create).toHaveBeenCalledWith(user, entry);
      expect(result.id).toBe('new-entry-id');
    });

    it('should throw an error if the preachingDate is in the future', async () => {
      const user = new User({ id: 'user-123' });
      const entry = new Entry({
        hours: 2,
        minutes: 0,
        preachingDate: DateTime.now().plus({ days: 2 }).toMillis(), // Future (invalid)
        type: 'regular_pioneer',
      });

      await expect(entriesService.create(user, entry)).rejects.toThrow(
        'La fecha de predicación no puede ser futura.',
      );
      expect(entriesRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if total duration exceeds 24 hours', async () => {
      const user = new User({ id: 'user-123' });
      const entry = new Entry({
        hours: 25,
        minutes: 0,
        preachingDate: Date.now(),
        type: 'regular_pioneer',
      });

      await expect(entriesService.create(user, entry)).rejects.toThrow(
        'La duración total no puede exceder las 24 horas en un día.',
      );
      expect(entriesRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should call repository delete and return successfully if entry was deleted', async () => {
      const user = new User({ id: 'user-123' });
      (entriesRepository.delete as jest.Mock).mockResolvedValue(true);

      await entriesService.delete(user, 'entry-123');

      expect(entriesRepository.delete).toHaveBeenCalledWith(user, 'entry-123');
    });

    it('should throw NotFoundException if repository delete returns false', async () => {
      const user = new User({ id: 'user-123' });
      (entriesRepository.delete as jest.Mock).mockResolvedValue(false);

      await expect(entriesService.delete(user, 'entry-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(entriesRepository.delete).toHaveBeenCalledWith(user, 'entry-123');
    });
  });
});
