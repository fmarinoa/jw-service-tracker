import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

// Mock the repositories module to prevent real database client instantiation
jest.mock('@/repositories', () => ({
  usersRepository: {},
  entriesRepository: {},
  authSessionsRepository: {},
}));

// Mock JwtAuthGuard to avoid resolving its AuthTokenService dependency during compilation
jest.mock('@/auth/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

import { EntriesController } from '@/controllers/EntriesController';
import { Entry } from '@/domain/Entry';
import { User } from '@/domain/User';
import { EntriesService } from '@/services/EntriesService';

describe('EntriesController', () => {
  let controller: EntriesController;
  let entriesService: EntriesService;

  beforeEach(async () => {
    const mockEntriesService = {
      getByUser: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      createMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntriesController],
      providers: [{ provide: EntriesService, useValue: mockEntriesService }],
    }).compile();

    controller = module.get<EntriesController>(EntriesController);
    entriesService = module.get<EntriesService>(EntriesService);
  });

  describe('retrieveEntries', () => {
    it('should retrieve entries for a valid user and query filters', async () => {
      const mockUser = new User({ id: 'user-123' });
      const mockQuery = {
        monthOffset: '0',
        page: '1',
        limit: '10',
      };

      const expectedResponse = {
        entries: [],
        total: 0,
        stats: { totalMinutes: 0, byType: {} },
      };

      (entriesService.getByUser as jest.Mock).mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.retrieveEntries(mockUser, mockQuery);

      expect(entriesService.getByUser).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should throw BadRequestException if user id is missing', async () => {
      const mockUser = new User({ name: 'Franco' }); // No ID
      const mockQuery = {};

      await expect(
        controller.retrieveEntries(mockUser, mockQuery),
      ).rejects.toThrow(BadRequestException);
      expect(entriesService.getByUser).not.toHaveBeenCalled();
    });
  });

  describe('createEntry', () => {
    it('should successfully create an entry with valid body', async () => {
      const mockUser = new User({ id: 'user-123' });
      const mockBody = {
        hours: 1,
        minutes: 30,
        preachingDate: Date.now() - 10000,
        type: 'house_to_house',
      };

      const expectedCreatedEntry = new Entry({
        id: 'entry-123',
        ...mockBody,
      });

      (entriesService.create as jest.Mock).mockResolvedValue(
        expectedCreatedEntry,
      );

      const result = await controller.createEntry(mockUser, mockBody);

      expect(entriesService.create).toHaveBeenCalled();
      expect(result).toEqual(expectedCreatedEntry);
    });

    it('should throw BadRequestException if creation body contains invalid data', async () => {
      const mockUser = new User({ id: 'user-123' });
      const mockBody = {
        hours: -5, // Invalid negative hours
        minutes: 70, // Invalid minutes
        preachingDate: Date.now(),
        type: 'invalid_type',
      };

      await expect(controller.createEntry(mockUser, mockBody)).rejects.toThrow(
        BadRequestException,
      );
      expect(entriesService.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteEntry', () => {
    it('should call delete on EntriesService successfully', async () => {
      const mockUser = new User({ id: 'user-123' });
      (entriesService.delete as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteEntry(mockUser, 'entry-123');

      expect(entriesService.delete).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user id is missing during delete', async () => {
      const mockUser = new User({ name: 'Franco' }); // No ID

      await expect(
        controller.deleteEntry(mockUser, 'entry-123'),
      ).rejects.toThrow(BadRequestException);
      expect(entriesService.delete).not.toHaveBeenCalled();
    });
  });

  describe('syncEntries', () => {
    it('should successfully sync entries with valid bodies', async () => {
      const mockUser = new User({ id: 'user-123' });
      const mockBody = [
        {
          tempId: 'temp-1',
          hours: 1,
          minutes: 30,
          preachingDate: Date.now() - 10000,
          type: 'house_to_house',
        },
      ];

      const expectedResponse = {
        successful: [
          {
            tempId: 'temp-1',
            entry: new Entry({
              id: 'entry-123',
              hours: 1,
              minutes: 30,
              preachingDate: Date.now() - 10000,
              type: 'house_to_house',
            }),
          },
        ],
        failed: [],
      };

      (entriesService.createMany as jest.Mock).mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.syncEntries(mockUser, mockBody);

      expect(entriesService.createMany).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should throw BadRequestException if sync body contains invalid data', async () => {
      const mockUser = new User({ id: 'user-123' });
      const mockBody = [
        {
          hours: -5, // Invalid negative hours
          minutes: 70, // Invalid minutes
          preachingDate: Date.now(),
          type: 'invalid_type',
        },
      ];

      await expect(controller.syncEntries(mockUser, mockBody)).rejects.toThrow(
        BadRequestException,
      );
      expect(entriesService.createMany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if sync body elements are missing tempId', async () => {
      const mockUser = new User({ id: 'user-123' });
      const mockBody = [
        {
          hours: 1,
          minutes: 30,
          preachingDate: Date.now() - 10000,
          type: 'house_to_house',
        },
      ];

      await expect(controller.syncEntries(mockUser, mockBody)).rejects.toThrow(
        BadRequestException,
      );
      expect(entriesService.createMany).not.toHaveBeenCalled();
    });
  });

  describe('updateEntry', () => {
    it('should successfully update an entry with valid body', async () => {
      const mockUser = new User({ id: 'user-123' });
      const mockBody = {
        hours: 2,
        minutes: 0,
        preachingDate: Date.now() - 10000,
        type: 'house_to_house',
      };

      const expectedUpdatedEntry = new Entry({
        id: 'entry-123',
        ...mockBody,
      });

      (entriesService.update as jest.Mock).mockResolvedValue(
        expectedUpdatedEntry,
      );

      const result = await controller.updateEntry(mockUser, 'entry-123', mockBody);

      expect(entriesService.update).toHaveBeenCalled();
      expect(result).toEqual(expectedUpdatedEntry);
    });

    it('should throw BadRequestException if update body contains invalid data', async () => {
      const mockUser = new User({ id: 'user-123' });
      const mockBody = {
        hours: -5,
        minutes: 70,
        preachingDate: Date.now(),
        type: 'invalid_type',
      };

      await expect(controller.updateEntry(mockUser, 'entry-123', mockBody)).rejects.toThrow(
        BadRequestException,
      );
      expect(entriesService.update).not.toHaveBeenCalled();
    });
  });
});
