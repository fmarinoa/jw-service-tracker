import { Injectable, NotFoundException } from '@nestjs/common';

import { CheckUpdateResponse } from '@/domain/ReleaseInfo';
import { gitHubReleasesRepository } from '@/repositories';

@Injectable()
export class ReleasesService {
  async checkUpdate(clientVersion?: string): Promise<CheckUpdateResponse> {
    const release = await gitHubReleasesRepository.getLatestRelease();
    if (!release) {
      throw new NotFoundException('No se encontraron releases publicadas');
    }
    return release.toCheckUpdateResult(clientVersion);
  }
}
