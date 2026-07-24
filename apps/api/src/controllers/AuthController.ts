import { LoginRequestSchema, RefreshRequestSchema } from '@jw-tracker/shared';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/auth/current-user.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Invitation } from '@/domain/Invitation';
import { User } from '@/domain/User';
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
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

  @HttpCode(HttpStatus.NO_CONTENT)
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
  async register(@Body() body: any) {
    const userInstance = User.validateForRegistration({
      phone: body.phone,
      name: body.name,
      password: body.password,
    });

    const invitation = body.invitationCode
      ? Invitation.validateForRegistration(body.invitationCode)
      : undefined;

    try {
      return await this.userService.register(userInstance, invitation);
    } catch (e: any) {
      throw new BadRequestException(e.message || 'Error al registrar usuario');
    }
  }
}
