import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/auth/current-user.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Entry } from '@/domain/Entry';
import { FilterEntries } from '@/domain/FilterEntries';
import { User } from '@/domain/User';
import { EntriesService } from '@/services/EntriesService';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async retrieveEntries(@CurrentUser() user: User, @Query() query: any) {
    const userId = user?.id;
    if (!userId) {
      throw new BadRequestException('User not found in request context');
    }

    const filters = FilterEntries.validateInstance(query);
    return await this.entriesService.getByUser(
      new User({ ...user, id: userId }),
      filters,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createEntry(@CurrentUser() user: User, @Body() body: any) {
    const userId = user?.id;
    if (!userId) {
      throw new BadRequestException('User not found in request context');
    }

    const entry = Entry.validateForCreate(body);

    return await this.entriesService.create(
      new User({ ...user, id: userId }),
      entry,
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteEntry(@CurrentUser() user: User, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId) {
      throw new BadRequestException('User not found in request context');
    }

    await this.entriesService.delete(new User({ ...user, id: userId }), id);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateEntry(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const userId = user?.id;
    if (!userId) {
      throw new BadRequestException('User not found in request context');
    }

    const entry = Entry.validateForUpdate({ ...body, id });

    return await this.entriesService.update(
      new User({ ...user, id: userId }),
      entry,
    );
  }
}
