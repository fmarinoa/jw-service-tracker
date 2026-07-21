jest.mock('@/repositories', () => ({
  gitHubReleasesRepository: {
    getLatestRelease: jest.fn(),
  },
}));

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ReleaseInfo } from '@/domain/ReleaseInfo';
import { gitHubReleasesRepository } from '@/repositories';
import { ReleasesService } from '@/services/ReleasesService';

describe('ReleasesService', () => {
  let service: ReleasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReleasesService],
    }).compile();

    service = module.get<ReleasesService>(ReleasesService);
    jest.clearAllMocks();
  });

  describe('checkUpdate', () => {
    it('should return update information comparing with client version', async () => {
      const mockReleaseInfo = new ReleaseInfo({
        version: '0.0.4',
        tagName: 'v0.0.4',
        title: 'Release v0.0.4',
        publishedAt: '2026-07-21T03:07:15Z',
        notes:
          'APK generado automáticamente para v0.0.4 de @jw-tracker/client.',
        apkAsset: {
          name: 'jw-service-tracker-v0.0.4.apk',
          downloadUrl:
            'https://github.com/fmarinoa/jw-service-tracker/releases/download/v0.0.4/jw-service-tracker-v0.0.4.apk',
          size: 45660528,
        },
      });

      (
        gitHubReleasesRepository.getLatestRelease as jest.Mock
      ).mockResolvedValue(mockReleaseInfo);

      const result = await service.checkUpdate('0.0.3');

      expect(gitHubReleasesRepository.getLatestRelease).toHaveBeenCalled();
      expect(result).toEqual({
        hasUpdate: true,
        latestVersion: '0.0.4',
        currentVersion: '0.0.3',
        downloadUrl:
          'https://github.com/fmarinoa/jw-service-tracker/releases/download/v0.0.4/jw-service-tracker-v0.0.4.apk',
        title: 'Release v0.0.4',
        notes:
          'APK generado automáticamente para v0.0.4 de @jw-tracker/client.',
        publishedAt: '2026-07-21T03:07:15Z',
      });
    });

    it('should throw NotFoundException if repository returns null', async () => {
      (
        gitHubReleasesRepository.getLatestRelease as jest.Mock
      ).mockResolvedValue(null);

      await expect(service.checkUpdate('0.0.3')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
