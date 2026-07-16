import { LoginRequestSchema, RefreshRequestSchema } from '@jw-tracker/shared';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/auth/current-user.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/domain/User';

import { AuthService } from '../services/AuthService';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: unknown) {
    const result = LoginRequestSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message || 'Invalid input data',
      );
    }
    const { phone, password } = result.data;
    const platform = (body as any)?.platform || 'web';
    const _deviceName = (body as any)?.deviceName || null;

    return this.authService.login(phone, password, platform);
  }

  @Post('refresh')
  async refresh(@Body() body: unknown) {
    const result = RefreshRequestSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message || 'Invalid input data',
      );
    }
    const { refreshToken } = result.data;
    return this.authService.refreshSession(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: User) {
    if (!user || !user.id) {
      throw new Error('User not found in request context');
    }

    await this.authService.revokeSession(user.id);
    return { ok: true };
  }

  @Post('register')
  async register(@Body() body: unknown) {
    const phone = (body as any)?.phone;
    const name = (body as any)?.name;
    const password = (body as any)?.password;

    if (!phone || !name || !password) {
      throw new BadRequestException('Faltan campos requeridos (phone, name, password)');
    }

    try {
      return await this.authService.register(phone, name, password);
    } catch (e: any) {
      throw new BadRequestException(e.message || 'Error al registrar usuario');
    }
  }
}
