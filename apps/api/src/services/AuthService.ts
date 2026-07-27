import { Platform, UserStatus } from '@jw-tracker/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { authSessionsRepository, usersRepository } from '@/repositories';

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

    let user;
    try {
      user = await usersRepository.findByPhone(normalizedPhone);
    } catch {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña inválida');
    }

    if (user.status === UserStatus.PENDING) {
      throw new UnauthorizedException(
        'Tu cuenta está pendiente de aprobación.',
      );
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

    let user;
    try {
      user = await usersRepository.findById(session.userId);
    } catch {
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
}
