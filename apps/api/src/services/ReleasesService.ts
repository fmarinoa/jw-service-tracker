import { Injectable, NotFoundException } from '@nestjs/common';

import { CheckUpdateResponse, ReleaseInfo } from '@/domain/ReleaseInfo';
import {
  gitHubReleasesRepository,
  historyReleasesRepository,
} from '@/repositories';

@Injectable()
export class ReleasesService {
  private cachedRelease: ReleaseInfo | null = null;
  private lastFetchTime = 0;
  private readonly cacheTtlMs = 5 * 60 * 1000; // 5 minutes

  async checkUpdate(clientVersion?: string): Promise<CheckUpdateResponse> {
    const now = Date.now();
    let lastRelease: ReleaseInfo | null = null;

    if (this.cachedRelease && now - this.lastFetchTime < this.cacheTtlMs) {
      lastRelease = this.cachedRelease;
    } else {
      lastRelease = await gitHubReleasesRepository.getLatestRelease();
      if (lastRelease) {
        this.cachedRelease = lastRelease;
        this.lastFetchTime = now;

        const lastHistoryRelease = await historyReleasesRepository.findLast();
        if (
          lastRelease.apkAsset &&
          (!lastHistoryRelease ||
            lastHistoryRelease.version !== lastRelease.version)
        ) {
          await historyReleasesRepository.create(lastRelease);
        }
      }
    }

    if (lastRelease) {
      return lastRelease.toCheckUpdateResult(clientVersion);
    }

    const lastHistoryRelease = await historyReleasesRepository.findLast();
    if (!lastHistoryRelease)
      throw new NotFoundException('No se encontraron releases publicadas');

    return lastHistoryRelease.toCheckUpdateResult(clientVersion);
  }
}
