import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AppContext } from '@/auth/app-context.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UpdateUserDto } from '@/domain/dtos/user.dto';
import { RequestContext } from '@/domain/RequestContext';
import { User } from '@/domain/User';
import { UserService } from '@/services/UserService';

@ApiTags('User')
@ApiBearerAuth('BearerAuth')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async me(@AppContext() context: RequestContext) {
    return await this.userService.getUserById(context.requireUserId());
  }

  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateUserDto })
  @Patch()
  async update(@Body() body: any, @AppContext() context: RequestContext) {
    const instanceForUpdate = User.validateForUpdate({
      id: context.requireUserId(),
      preacherType: body.preacherType,
      monthlyGoal: body.monthlyGoal,
      showTutorial: body.showTutorial,
    });
    return await this.userService.updateUser(instanceForUpdate, context);
  }
}
