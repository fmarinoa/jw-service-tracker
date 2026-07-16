import { Platform } from '@jw-tracker/shared';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { User } from '@/domain/User';

import { AuthSession } from '../../domain/AuthSession';
import { AuthTokenService } from './AuthTokenService';

@Injectable()
export class AuthSessionService {
  constructor(private readonly authTokenService: AuthTokenService) {}

  async createSession(
    user: User,
    platform: Platform,
    deviceName: string | null = null,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    session: AuthSession;
  }> {
    const sessionSid = randomUUID();

    const accessToken = this.authTokenService.generateAccessToken({
      sub: user.id,
      sid: sessionSid,
      name: user.name,
      phone: user.phone,
      platform,
    });

    const refreshToken = this.authTokenService.generateRefreshToken();
    const refreshTokenHash =
      this.authTokenService.hashRefreshToken(refreshToken);

    const expiresIn = this.authTokenService.getAccessTokenExpiresIn();
    const refreshExpiresIn = this.authTokenService.getRefreshTokenExpiresIn();

    const session = new AuthSession({
      sid: sessionSid,
      userId: user.id,
      refreshTokenHash,
      platform,
      deviceName,
      expiresAt: Date.now() + refreshExpiresIn * 1000,
      revokedAt: null,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      session,
    };
  }

  async refreshSession(
    user: User,
    session: AuthSession,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const newAccessToken = this.authTokenService.generateAccessToken({
      sub: user.id,
      sid: session.sid,
      name: user.name,
      phone: user.phone,
      platform: session.platform,
    });

    const newRefreshToken = this.authTokenService.generateRefreshToken();
    const newRefreshTokenHash =
      this.authTokenService.hashRefreshToken(newRefreshToken);

    session.refreshTokenHash = newRefreshTokenHash;
    session.lastUsedAt = Date.now();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
