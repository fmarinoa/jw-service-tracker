import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { ReleasesService } from '@/services/ReleasesService';

@ApiTags('Releases')
@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @HttpCode(HttpStatus.OK)
  @Get('check')
  @ApiQuery({ name: 'version', required: false, type: String })
  async checkUpdate(@Query('version') clientVersion?: string) {
    return await this.releasesService.checkUpdate(clientVersion);
  }
}
