import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';

import { ReleasesService } from '@/services/ReleasesService';

@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @HttpCode(HttpStatus.OK)
  @Get('check')
  async checkUpdate(@Query('version') clientVersion?: string) {
    return await this.releasesService.checkUpdate(clientVersion);
  }
}
