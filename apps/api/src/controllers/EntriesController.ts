import {
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
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AppContext } from '@/auth/app-context.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CreateEntryDto, UpdateEntryDto } from '@/domain/dtos/entry.dto';
import { Entry } from '@/domain/Entry';
import { FilterEntries } from '@/domain/FilterEntries';
import { RequestContext } from '@/domain/RequestContext';
import { User } from '@/domain/User';
import { EntriesService } from '@/services/EntriesService';

@ApiTags('Entries')
@ApiBearerAuth('BearerAuth')
@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async retrieveEntries(
    @AppContext() context: RequestContext,
    @Query() query: any,
  ) {
    const filters = FilterEntries.validateInstance(query);
    return await this.entriesService.getByUser(
      new User({ id: context.requireUserId() }),
      filters,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateEntryDto })
  @Post()
  async createEntry(@AppContext() context: RequestContext, @Body() body: any) {
    const entry = Entry.validateForCreate(body);

    return await this.entriesService.create(
      new User({ id: context.requireUserId() }),
      entry as Entry,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBody({
    type: CreateEntryDto,
    isArray: true,
    description: 'Array of entries to sync from client',
  })
  @Post('/sync')
  async syncEntries(@AppContext() context: RequestContext, @Body() body: any) {
    const entries = Entry.validateForCreate(body, true);
    return await this.entriesService.createMany(
      new User({ id: context.requireUserId() }),
      entries as Entry[],
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteEntry(
    @AppContext() context: RequestContext,
    @Param('id') id: string,
  ) {
    await this.entriesService.delete(
      new User({ id: context.requireUserId() }),
      id,
    );
    return;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateEntryDto })
  @Patch(':id')
  async updateEntry(
    @AppContext() context: RequestContext,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const entry = Entry.validateForUpdate({ ...body, id });

    return await this.entriesService.update(
      new User({ id: context.requireUserId() }),
      entry,
    );
  }
}
