import { ReleaseInfo } from '@/domain/ReleaseInfo';

describe('ReleaseInfo Domain', () => {
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

  describe('toCheckUpdateResult', () => {
    it('should return hasUpdate: true if client version is older than latest', () => {
      const releaseInfo = new ReleaseInfo(mockReleaseData);
      const result = releaseInfo.toCheckUpdateResult('0.0.3');

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

    it('should return hasUpdate: false if client version is equal or newer', () => {
      const releaseInfo = new ReleaseInfo(mockReleaseData);

      expect(releaseInfo.toCheckUpdateResult('0.0.4').hasUpdate).toBe(false);
      expect(releaseInfo.toCheckUpdateResult('0.0.5').hasUpdate).toBe(false);
    });

    it('should return hasUpdate: true if client version is omitted', () => {
      const releaseInfo = new ReleaseInfo(mockReleaseData);
      const result = releaseInfo.toCheckUpdateResult();

      expect(result.hasUpdate).toBe(true);
      expect(result.latestVersion).toBe('0.0.4');
    });
  });
});
