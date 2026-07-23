jest.mock('@/repositories', () => ({
  gitHubReleasesRepository: {
    getLatestRelease: jest.fn(),
  },
  historyReleasesRepository: {
    create: jest.fn(),
    findLast: jest.fn(),
  },
}));

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ReleaseInfo } from '@/domain/ReleaseInfo';
import {
  gitHubReleasesRepository,
  historyReleasesRepository,
} from '@/repositories';
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
    const mockReleaseData = {
      version: '0.0.4',
      tagName: 'v0.0.4',
      title: 'Release v0.0.4',
      publishedAt: '2026-07-21T03:07:15Z',
      notes: 'APK generado automáticamente para v0.0.4 de @jw-tracker/client.',
      apkAsset: {
        name: 'jw-service-tracker-v0.0.4.apk',
        downloadUrl:
          'https://github.com/fmarinoa/jw-service-tracker/releases/download/v0.0.4/jw-service-tracker-v0.0.4.apk',
        size: 45660528,
      },
    };

    it('should return update information and save to history when GitHub returns a new release with APK', async () => {
      const mockReleaseInfo = new ReleaseInfo(mockReleaseData);

      (
        gitHubReleasesRepository.getLatestRelease as jest.Mock
      ).mockResolvedValue(mockReleaseInfo);
      (historyReleasesRepository.findLast as jest.Mock).mockResolvedValue(null);
      (historyReleasesRepository.create as jest.Mock).mockResolvedValue({
        ...mockReleaseInfo,
        id: 'mock-id',
        createdAt: 1782882000000,
      });

      const result = await service.checkUpdate('0.0.3');

      expect(gitHubReleasesRepository.getLatestRelease).toHaveBeenCalled();
      expect(historyReleasesRepository.create).toHaveBeenCalledWith(
        mockReleaseInfo,
      );
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
        size: '43.55 MB',
      });
    });

    it('should NOT save to history if the latest version already exists in history database', async () => {
      const mockReleaseInfo = new ReleaseInfo(mockReleaseData);

      (
        gitHubReleasesRepository.getLatestRelease as jest.Mock
      ).mockResolvedValue(mockReleaseInfo);
      (historyReleasesRepository.findLast as jest.Mock).mockResolvedValue(
        mockReleaseInfo,
      );

      await service.checkUpdate('0.0.3');

      expect(gitHubReleasesRepository.getLatestRelease).toHaveBeenCalled();
      expect(historyReleasesRepository.findLast).toHaveBeenCalled();
      expect(historyReleasesRepository.create).not.toHaveBeenCalled();
    });

    it('should NOT save to history if release apkAsset is null', async () => {
      const mockReleaseWithoutApk = new ReleaseInfo({
        ...mockReleaseData,
        apkAsset: null,
      });

      (
        gitHubReleasesRepository.getLatestRelease as jest.Mock
      ).mockResolvedValue(mockReleaseWithoutApk);
      (historyReleasesRepository.findLast as jest.Mock).mockResolvedValue(null);

      const result = await service.checkUpdate('0.0.3');

      expect(historyReleasesRepository.create).not.toHaveBeenCalled();
      expect(result.downloadUrl).toBeNull();
    });

    it('should return cached result without calling GitHub API again within TTL', async () => {
      const mockReleaseInfo = new ReleaseInfo(mockReleaseData);

      (
        gitHubReleasesRepository.getLatestRelease as jest.Mock
      ).mockResolvedValue(mockReleaseInfo);
      (historyReleasesRepository.findLast as jest.Mock).mockResolvedValue(null);

      // First call -> hits GitHub
      await service.checkUpdate('0.0.3');
      expect(gitHubReleasesRepository.getLatestRelease).toHaveBeenCalledTimes(
        1,
      );

      // Second call -> uses in-memory cache
      const cachedResult = await service.checkUpdate('0.0.3');
      expect(gitHubReleasesRepository.getLatestRelease).toHaveBeenCalledTimes(
        1,
      );
      expect(cachedResult.latestVersion).toBe('0.0.4');
    });

    it('should fallback to history repository when GitHub returns null', async () => {
      const mockHistoryReleaseInfo = new ReleaseInfo({
        ...mockReleaseData,
        id: 'cached-id',
        createdAt: 1782882000000,
      });

      (
        gitHubReleasesRepository.getLatestRelease as jest.Mock
      ).mockResolvedValue(null);

      (historyReleasesRepository.findLast as jest.Mock).mockResolvedValue(
        mockHistoryReleaseInfo,
      );

      const result = await service.checkUpdate('0.0.3');

      expect(gitHubReleasesRepository.getLatestRelease).toHaveBeenCalled();
      expect(historyReleasesRepository.findLast).toHaveBeenCalled();
      expect(historyReleasesRepository.create).not.toHaveBeenCalled();
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
        size: '43.55 MB',
      });
    });

    it('should throw NotFoundException if both GitHub and history repositories return null', async () => {
      (
        gitHubReleasesRepository.getLatestRelease as jest.Mock
      ).mockResolvedValue(null);

      (historyReleasesRepository.findLast as jest.Mock).mockResolvedValue(null);

      await expect(service.checkUpdate('0.0.3')).rejects.toThrow(
        NotFoundException,
      );
      expect(historyReleasesRepository.findLast).toHaveBeenCalled();
    });

    it('should work correctly when client version is not provided', async () => {
      const mockReleaseInfo = new ReleaseInfo(mockReleaseData);

      (
        gitHubReleasesRepository.getLatestRelease as jest.Mock
      ).mockResolvedValue(mockReleaseInfo);

      (historyReleasesRepository.create as jest.Mock).mockResolvedValue({
        ...mockReleaseInfo,
        id: 'mock-id',
        createdAt: 1782882000000,
      });

      const result = await service.checkUpdate();

      expect(result.hasUpdate).toBe(true);
      expect(result.currentVersion).toBeUndefined();
    });
  });
});
