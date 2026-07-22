import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@/repositories', () => ({
  usersRepository: {},
  entriesRepository: {},
  authSessionsRepository: {},
  historyReleasesRepository: {},
  gitHubReleasesRepository: {},
}));

import { ReleasesController } from '@/controllers/ReleasesController';
import { ReleasesService } from '@/services/ReleasesService';

describe('ReleasesController', () => {
  let controller: ReleasesController;
  let service: ReleasesService;

  beforeEach(async () => {
    const mockReleasesService = {
      checkUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReleasesController],
      providers: [{ provide: ReleasesService, useValue: mockReleasesService }],
    }).compile();

    controller = module.get<ReleasesController>(ReleasesController);
    service = module.get<ReleasesService>(ReleasesService);
  });

  describe('checkUpdate', () => {
    it('should delegate to releasesService.checkUpdate with query version', async () => {
      const mockResult = {
        hasUpdate: true,
        latestVersion: '0.0.4',
        currentVersion: '0.0.3',
        downloadUrl:
          'https://github.com/fmarinoa/jw-service-tracker/releases/download/v0.0.4/jw-service-tracker-v0.0.4.apk',
        title: 'Release v0.0.4',
        notes:
          'APK generado automáticamente para v0.0.4 de @jw-tracker/client.',
        publishedAt: '2026-07-21T03:07:15Z',
      };

      (service.checkUpdate as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.checkUpdate('0.0.3');

      expect(service.checkUpdate).toHaveBeenCalledWith('0.0.3');
      expect(result).toEqual(mockResult);
    });
  });
});
