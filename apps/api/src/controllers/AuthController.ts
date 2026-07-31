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
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AppContext } from '@/auth/app-context.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  LoginRequestDto,
  RefreshRequestDto,
  RegisterDto,
} from '@/domain/dtos/auth.dto';
import { Invitation } from '@/domain/Invitation';
import { RequestContext } from '@/domain/RequestContext';
import { User } from '@/domain/User';
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginRequestDto })
  @Post('login')
  async login(@Body() body: LoginRequestDto) {
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

  @ApiBody({ type: RefreshRequestDto })
  @Post('refresh')
  async refresh(@Body() body: RefreshRequestDto) {
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
  @ApiBearerAuth('BearerAuth')
  @Post('logout')
  async logout(@AppContext() context: RequestContext) {
    await this.authService.revokeSession(context.requireUserId());
  }

  @ApiBody({ type: RegisterDto })
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
