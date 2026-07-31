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

import { AuthController } from '@/controllers/AuthController';
import { RequestContext } from '@/domain/RequestContext';
import { User } from '@/domain/User';
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      refreshSession: jest.fn(),
      revokeSession: jest.fn(),
    };

    const mockUserService = {
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('login', () => {
    it('should successfully log in and return access/refresh tokens with valid input', async () => {
      const mockBody = {
        phone: '932337417',
        password: 'password123',
        platform: 'web',
      };

      (authService.login as jest.Mock).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });

      const result = await controller.login(mockBody);

      expect(authService.login).toHaveBeenCalledWith(
        '932337417',
        'password123',
        'web',
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });
    });

    it('should throw BadRequestException if phone number is missing', async () => {
      const mockBody = {
        password: 'password123',
      };

      await expect(controller.login(mockBody)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if password is empty', async () => {
      const mockBody = {
        phone: '932337417',
        password: '',
      };

      await expect(controller.login(mockBody)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should successfully refresh session with valid refreshToken', async () => {
      const mockBody = {
        refreshToken: 'valid-refresh-token',
      };

      (authService.refreshSession as jest.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });

      const result = await controller.refresh(mockBody);

      expect(authService.refreshSession).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });
    });

    it('should throw BadRequestException if refreshToken is missing', async () => {
      const mockBody = {};

      await expect(controller.refresh(mockBody)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.refreshSession).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should successfully revoke session and return ok', async () => {
      const mockContext = new RequestContext({ userId: 'user-123' });
      (authService.revokeSession as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.logout(mockContext);

      expect(authService.revokeSession).toHaveBeenCalledWith('user-123');
      expect(result).toBeUndefined();
    });

    it('should throw error if current user is missing id', async () => {
      const mockContext = new RequestContext({}); // No ID

      await expect(controller.logout(mockContext)).rejects.toThrow(
        'User not found in request context',
      );
    });
  });

  describe('register', () => {
    it('should successfully register a user and return the user details', async () => {
      const mockBody = {
        phone: '932337417',
        name: 'Franco',
        password: 'password123',
      };

      const mockCreatedUser = {
        id: 'user-123',
        phone: '932337417',
        name: 'Franco',
      };

      (userService.register as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await controller.register(mockBody);

      expect(userService.register).toHaveBeenCalledWith(
        expect.any(Object),
        undefined,
      );
      expect(result).toEqual(mockCreatedUser);
    });

    it('should pass invitationCode through to userService.register when provided', async () => {
      const mockBody = {
        phone: '932337417',
        name: 'Franco',
        password: 'password123',
        invitationCode: 'ABC12345',
      };

      (userService.register as jest.Mock).mockResolvedValue({
        id: 'user-123',
      });

      await controller.register(mockBody);

      expect(userService.register).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ code: 'ABC12345' }),
      );
    });

    it('should throw BadRequestException if registration service throws', async () => {
      const mockBody = {
        phone: '932337417',
        name: 'Franco',
        password: 'password123',
      };

      (userService.register as jest.Mock).mockRejectedValue(
        new Error('User already exists'),
      );

      await expect(controller.register(mockBody)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
