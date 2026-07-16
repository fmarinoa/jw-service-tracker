import { Platform } from '@jw-tracker/shared';

export class AuthSession {
  id: string;
  sid: string;
  userId: string;
  refreshTokenHash: string;
  platform: Platform;
  deviceName: string | null;
  createdAt: number;
  expiresAt: number;
  lastUsedAt: number | null;
  revokedAt: number | null;

  constructor(data: Partial<AuthSession>) {
    Object.assign(this, data);
  }

  isActive(): boolean {
    return !this.revokedAt && this.expiresAt > Date.now();
  }
}
