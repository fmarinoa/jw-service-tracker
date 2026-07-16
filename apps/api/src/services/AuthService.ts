import { Platform } from '@jw-tracker/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { authSessionsRepository, usersRepository } from '../repositories';
import { AuthSessionService } from './auth/AuthSessionService';
import { AuthTokenService } from './auth/AuthTokenService';

@Injectable()
export class AuthService {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async login(
    phone: string,
    password: string,
    platform: Platform,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const normalizedPhone = phone.startsWith('+51') ? phone : `+51${phone}`;
    const user = await usersRepository.findByPhone(normalizedPhone);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña inválida');
    }

    const { accessToken, refreshToken, expiresIn, session } =
      await this.authSessionService.createSession(user, platform);

    await authSessionsRepository.create(session);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async refreshSession(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const hash = this.authTokenService.hashRefreshToken(refreshToken);
    const session = await authSessionsRepository.findByTokenHash(hash);

    if (!session || !session.isActive()) {
      throw new UnauthorizedException(
        'Session is invalid, expired, or revoked',
      );
    }

    const user = await usersRepository.findById(session.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authSessionService.refreshSession(user, session);

    await authSessionsRepository.update(session);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.authTokenService.getAccessTokenExpiresIn(),
    };
  }

  async revokeSession(userId: string): Promise<void> {
    await authSessionsRepository.revokeAllForUser(userId);
  }

  async register(
    phone: string,
    name: string,
    password: string,
  ): Promise<{ user: any; success: boolean }> {
    const normalizedPhone = phone.startsWith('+51') ? phone : `+51${phone}`;
    const existingUser = await usersRepository.findByPhone(normalizedPhone);
    if (existingUser) {
      throw new Error('El celular ya está registrado.');
    }

    const { User } = require('../domain/User');
    const rawPhone = phone.replace(/^\+51/, '');
    const userInstance = User.validateForRegistration({
      phone: rawPhone,
      name,
      password,
    });

    const createdUser = await usersRepository.create(userInstance);
    const { password: _, ...safeUser } = createdUser;
    return { user: safeUser, success: true };
  }
}
