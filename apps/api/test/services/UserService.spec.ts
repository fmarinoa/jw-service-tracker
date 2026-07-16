import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '@/domain/User';
import { UserService } from '@/services/UserService';

// Mock the direct repository imports
jest.mock('@/repositories', () => {
  return {
    usersRepository: {
      findById: jest.fn(),
      update: jest.fn(),
    },
  };
});

// Import the mocked repository so we can define mock implementations in individual tests
import { usersRepository } from '@/repositories';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
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

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockOriginalUser);
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
});
