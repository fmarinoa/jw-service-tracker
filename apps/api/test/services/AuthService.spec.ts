import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';

import { User } from '@/domain/User';
import { AuthService } from '@/services/AuthService';
import { AuthSessionService } from '@/services/auth/AuthSessionService';
import { AuthTokenService } from '@/services/auth/AuthTokenService';

// Mock the direct repository imports
jest.mock('@/repositories', () => {
  return {
    usersRepository: {
      findByPhone: jest.fn(),
      findById: jest.fn(),
    },
    authSessionsRepository: {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      update: jest.fn(),
      revokeAllForUser: jest.fn(),
    },
  };
});

import { authSessionsRepository, usersRepository } from '@/repositories';

describe('AuthService', () => {
  let authService: AuthService;
  let authSessionService: AuthSessionService;
  let authTokenService: AuthTokenService;

  beforeEach(async () => {
    const mockAuthSessionService = {
      createSession: jest.fn(),
      refreshSession: jest.fn(),
    };
    const mockAuthTokenService = {
      hashRefreshToken: jest.fn(),
      getAccessTokenExpiresIn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthSessionService, useValue: mockAuthSessionService },
        { provide: AuthTokenService, useValue: mockAuthTokenService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authSessionService = module.get<AuthSessionService>(AuthSessionService);
    authTokenService = module.get<AuthTokenService>(AuthTokenService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully log in and return session tokens if credentials are valid', async () => {
      const mockUser = new User({
        id: 'user-123',
        phone: '+51932337417',
        password: 'hashed-password',
      });

      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      (authSessionService.createSession as jest.Mock).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        session: { id: 'session-123' },
      });

      const result = await authService.login('932337417', 'password123', 'web');

      expect(usersRepository.findByPhone).toHaveBeenCalledWith('+51932337417');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(authSessionService.createSession).toHaveBeenCalledWith(mockUser, 'web');
      expect(authSessionsRepository.create).toHaveBeenCalledWith({ id: 'session-123' });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });
    });

    it('should throw UnauthorizedException if user phone is not found', async () => {
      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login('932337417', 'password123', 'web'),
      ).rejects.toThrow(new UnauthorizedException('Usuario no encontrado'));

      expect(authSessionsRepository.create).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockUser = new User({
        id: 'user-123',
        phone: '+51932337417',
        password: 'hashed-password',
      });

      (usersRepository.findByPhone as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(
        authService.login('932337417', 'wrong-password', 'web'),
      ).rejects.toThrow(new UnauthorizedException('Contraseña inválida'));

      expect(authSessionsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('refreshSession', () => {
    it('should successfully refresh session with valid refresh token', async () => {
      const mockSession = {
        userId: 'user-123',
        isActive: jest.fn().mockReturnValue(true),
      };
      const mockUser = new User({ id: 'user-123' });

      (authTokenService.hashRefreshToken as jest.Mock).mockReturnValue('hashed-token');
      (authSessionsRepository.findByTokenHash as jest.Mock).mockResolvedValue(mockSession);
      (usersRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (authSessionService.refreshSession as jest.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      (authTokenService.getAccessTokenExpiresIn as jest.Mock).mockReturnValue(900);

      const result = await authService.refreshSession('old-refresh-token');

      expect(authTokenService.hashRefreshToken).toHaveBeenCalledWith('old-refresh-token');
      expect(authSessionsRepository.findByTokenHash).toHaveBeenCalledWith('hashed-token');
      expect(usersRepository.findById).toHaveBeenCalledWith('user-123');
      expect(authSessionService.refreshSession).toHaveBeenCalledWith(mockUser, mockSession);
      expect(authSessionsRepository.update).toHaveBeenCalledWith(mockSession);
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });
    });

    it('should throw UnauthorizedException if session is invalid or inactive', async () => {
      const mockSession = {
        userId: 'user-123',
        isActive: jest.fn().mockReturnValue(false),
      };

      (authTokenService.hashRefreshToken as jest.Mock).mockReturnValue('hashed-token');
      (authSessionsRepository.findByTokenHash as jest.Mock).mockResolvedValue(mockSession);

      await expect(
        authService.refreshSession('invalid-refresh-token'),
      ).rejects.toThrow(
        new UnauthorizedException('Session is invalid, expired, or revoked'),
      );
    });

    it('should throw UnauthorizedException if session user no longer exists', async () => {
      const mockSession = {
        userId: 'deleted-user',
        isActive: jest.fn().mockReturnValue(true),
      };

      (authTokenService.hashRefreshToken as jest.Mock).mockReturnValue('hashed-token');
      (authSessionsRepository.findByTokenHash as jest.Mock).mockResolvedValue(mockSession);
      (usersRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.refreshSession('valid-refresh-token'),
      ).rejects.toThrow(new UnauthorizedException('User not found'));
    });
  });

  describe('revokeSession', () => {
    it('should call authSessionsRepository.revokeAllForUser', async () => {
      (authSessionsRepository.revokeAllForUser as jest.Mock).mockResolvedValue(undefined);

      await authService.revokeSession('user-123');

      expect(authSessionsRepository.revokeAllForUser).toHaveBeenCalledWith('user-123');
    });
  });
});
