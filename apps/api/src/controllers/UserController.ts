import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentUser } from '@/auth/current-user.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserService } from '@/services/UserService';

import { User } from '../domain/User';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async me(@CurrentUser() user: User) {
    if (!user || !user.id) {
      throw new Error('User not found in request context');
    }
    return await this.userService.getUserById(user.id);
  }
}
