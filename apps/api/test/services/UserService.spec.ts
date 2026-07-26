import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Invitation } from '@/domain/Invitation';
import { User } from '@/domain/User';
import { UserService } from '@/services/UserService';

// Mock the direct repository imports
jest.mock('@/repositories', () => {
  return {
    usersRepository: {
      findById: jest.fn(),
      update: jest.fn(),
      findByPhone: jest.fn(),
      create: jest.fn(),
    },
    invitationsRepository: {
      findByCode: jest.fn(),
      markUsed: jest.fn(),
    },
  };
});

// Import the mocked repository so we can define mock implementations in individual tests
import { invitationsRepository, usersRepository } from '@/repositories';

describe('UserService', () => {
  let userService: UserService;
  let eventEmitterMock: Partial<EventEmitter2>;

  beforeEach(async () => {
    eventEmitterMock = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EventEmitter2, useValue: eventEmitterMock },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user details without password if user is found', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Franco Mariño',
        phone: '+51932337417',
        password: 'hashed-password',
        preacherType: 'publisher',
        monthlyGoal: 0,
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('user-123');

      expect(usersRepository.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        id: 'user-123',
        name: 'Franco Mariño',
        phone: '+51932337417',
        preacherType: 'publisher',
        monthlyGoal: 0,
      });
      expect((result as any).password).toBeUndefined();
    });

    it('should throw an error if user is not found', async () => {
      (usersRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById('user-123')).rejects.toThrow(
        'User with ID user-123 not found',
      );
    });
  });

  describe('updateUser', () => {
    it('should update user goal and preacher type successfully', async () => {
      const mockOriginalUser = new User({
        id: 'user-123',
        name: 'Franco Mariño',
        phone: '+51932337417',
        preacherType: 'publisher',
        monthlyGoal: 0,
      });

      (usersRepository.findById as jest.Mock).mockResolvedValue(
        mockOriginalUser,
      );
      (usersRepository.update as jest.Mock).mockResolvedValue({
        ...mockOriginalUser,
        preacherType: 'regular_pioneer',
        monthlyGoal: 50,
      });

      const updatedUserPayload = new User({
        id: 'user-123',
        preacherType: 'regular_pioneer',
        monthlyGoal: 50,
      });

      const result = await userService.updateUser(updatedUserPayload);

      expect(usersRepository.findById).toHaveBeenCalledWith('user-123');
      expect(usersRepository.update).toHaveBeenCalled();
      expect(result.preacherType).toBe('regular_pioneer');
      expect(result.monthlyGoal).toBe(50);
    });

    it('should throw BadRequestException if user is not found during update', async () => {
      (usersRepository.findById as jest.Mock).mockResolvedValue(null);

      const updatedUserPayload = new User({
        id: 'user-123',
        preacherType: 'regular_pioneer',
        monthlyGoal: 50,
      });

      await expect(userService.updateUser(updatedUserPayload)).rejects.toThrow(
        BadRequestException,
      );
      expect(usersRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const buildUser = () =>
      new User({
        name: 'Franco',
        phone: '+51932337417',
        password: 'password123',
        status: 'PENDING',
      });

    it('should throw BadRequestException if phone is already registered', async () => {
      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(
        new User({ id: 'existing' }),
      );

      await expect(userService.register(buildUser())).rejects.toThrow(
        'El celular ya está registrado.',
      );
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('should register with status pending when no inviteCode is provided', async () => {
      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(null);
      (usersRepository.create as jest.Mock).mockImplementation((u) =>
        Promise.resolve({ ...u, id: 'user-123' }),
      );

      const result = await userService.register(buildUser());

      expect(invitationsRepository.findByCode).not.toHaveBeenCalled();
      expect(result.user.status).toBe('PENDING');
      expect(result.success).toBe(true);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'user.created',
        expect.any(Object),
      );
    });

    it('should approve registration and mark invitation used when inviteCode is valid', async () => {
      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(null);
      (usersRepository.create as jest.Mock).mockImplementation((u) =>
        Promise.resolve({ ...u, id: 'user-123' }),
      );
      const invitation = new Invitation({
        id: 'inv-1',
        code: 'ABC123',
        expiresAt: Date.now() + 100_000,
      });
      (invitationsRepository.findByCode as jest.Mock).mockResolvedValue(
        invitation,
      );

      const result = await userService.register(
        buildUser(),
        new Invitation({ code: 'ABC123' }),
      );

      expect(result.user.status).toBe('APPROVED');
      expect(invitationsRepository.markUsed).toHaveBeenCalledWith(
        'inv-1',
        'user-123',
      );
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'user.created',
        expect.any(Object),
      );
    });

    it('should approve registration when invitation phone matches', async () => {
      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(null);
      (usersRepository.create as jest.Mock).mockImplementation((u) =>
        Promise.resolve({ ...u, id: 'user-123' }),
      );
      const invitation = new Invitation({
        id: 'inv-1',
        code: 'ABC123',
        phone: '+51932337417',
        expiresAt: Date.now() + 100_000,
      });
      (invitationsRepository.findByCode as jest.Mock).mockResolvedValue(
        invitation,
      );

      const result = await userService.register(
        buildUser(),
        new Invitation({ code: 'ABC123' }),
      );

      expect(result.user.status).toBe('APPROVED');
    });

    it('should throw BadRequestException when inviteCode does not exist', async () => {
      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(null);
      (invitationsRepository.findByCode as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.register(buildUser(), new Invitation({ code: 'MISSING' })),
      ).rejects.toThrow('Código de invitación inválido o expirado.');
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when inviteCode is already used', async () => {
      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(null);
      const invitation = new Invitation({
        id: 'inv-1',
        code: 'ABC123',
        expiresAt: Date.now() + 100_000,
        usedAt: Date.now() - 1000,
      });
      (invitationsRepository.findByCode as jest.Mock).mockResolvedValue(
        invitation,
      );

      await expect(
        userService.register(buildUser(), new Invitation({ code: 'ABC123' })),
      ).rejects.toThrow('Código de invitación inválido o expirado.');
    });

    it('should throw BadRequestException when inviteCode is expired', async () => {
      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(null);
      const invitation = new Invitation({
        id: 'inv-1',
        code: 'ABC123',
        expiresAt: Date.now() - 1000,
      });
      (invitationsRepository.findByCode as jest.Mock).mockResolvedValue(
        invitation,
      );

      await expect(
        userService.register(buildUser(), new Invitation({ code: 'ABC123' })),
      ).rejects.toThrow('Código de invitación inválido o expirado.');
    });

    it('should throw BadRequestException when inviteCode is bound to a different phone', async () => {
      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(null);
      const invitation = new Invitation({
        id: 'inv-1',
        code: 'ABC123',
        phone: '+51999999999',
        expiresAt: Date.now() + 100_000,
      });
      (invitationsRepository.findByCode as jest.Mock).mockResolvedValue(
        invitation,
      );

      await expect(
        userService.register(buildUser(), new Invitation({ code: 'ABC123' })),
      ).rejects.toThrow('Código de invitación inválido o expirado.');
      expect(usersRepository.create).not.toHaveBeenCalled();
    });
  });
});
