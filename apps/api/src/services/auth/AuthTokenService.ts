import { Platform } from '@jw-tracker/shared';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
  sub: string;
  sid: string;
  name: string;
  phone: string;
  platform?: Platform;
}

@Injectable()
export class AuthTokenService {
  private readonly jwtSecret =
    process.env.JWT_SECRET || 'default-secret-key-change-me';
  private readonly accessTokenExpiresIn = parseInt(
    process.env.JWT_EXPIRES_IN || '900',
    10,
  ); // 15 mins default
  private readonly refreshTokenExpiresIn = parseInt(
    process.env.REFRESH_TOKEN_EXPIRES_IN || '604800',
    10,
  ); // 7 days default

  getAccessTokenExpiresIn(): number {
    return this.accessTokenExpiresIn;
  }

  getRefreshTokenExpiresIn(): number {
    return this.refreshTokenExpiresIn;
  }

  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as AccessTokenPayload;
    } catch {
      throw new Error('Invalid or expired access token');
    }
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
