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

import { UserController } from '@/controllers/UserController';
import { RequestContext } from '@/domain/RequestContext';
import { User } from '@/domain/User';
import { UserService } from '@/services/UserService';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  const mockContext = new RequestContext({ userId: 'user-123' });
  const mockContextNoId = new RequestContext({});

  beforeEach(async () => {
    const mockUserService = {
      getUserById: jest.fn(),
      updateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('me', () => {
    it('should return the current user details', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        name: 'Franco',
        preacherType: 'publisher',
        monthlyGoal: 0,
      });

      const result = await controller.me(mockContext);

      expect(userService.getUserById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        id: 'user-123',
        name: 'Franco',
        preacherType: 'publisher',
        monthlyGoal: 0,
      });
    });

    it('should throw an error if user is missing id', async () => {
      await expect(controller.me(mockContextNoId)).rejects.toThrow(
        'User not found in request context',
      );
    });
  });

  describe('update', () => {
    it('should successfully update user details when valid', async () => {
      const mockBody = {
        preacherType: 'regular_pioneer',
        monthlyGoal: 50,
      };

      const expectedUpdatedUser = new User({
        id: 'user-123',
        preacherType: 'regular_pioneer',
        monthlyGoal: 50,
      });

      (userService.updateUser as jest.Mock).mockResolvedValue(
        expectedUpdatedUser,
      );

      const result = await controller.update(mockBody, mockContext);

      expect(userService.updateUser).toHaveBeenCalled();
      expect(result).toEqual(expectedUpdatedUser);
    });

    it('should throw validation error if body parameters are invalid', async () => {
      const mockBody = {
        preacherType: 'invalid_type', // Invalid enum option
        monthlyGoal: -10, // Invalid range
      };

      await expect(controller.update(mockBody, mockContext)).rejects.toThrow();
      expect(userService.updateUser).not.toHaveBeenCalled();
    });
  });
});
