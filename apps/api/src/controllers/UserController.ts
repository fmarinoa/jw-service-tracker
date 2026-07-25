import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/auth/current-user.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/domain/User';
import { UserService } from '@/services/UserService';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async me(@CurrentUser() user: User) {
    if (!user || !user.id) {
      throw new Error('User not found in request context');
    }
    return await this.userService.getUserById(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(@CurrentUser() user: User, @Body() body: unknown) {
    const instanceForUpdate = User.validateForUpdate({
      ...(body as any),
      id: user.id,
    });
    return await this.userService.updateUser(instanceForUpdate);
  }
}
