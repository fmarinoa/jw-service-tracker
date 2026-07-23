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
        size: '43.55 MB',
      });
    });

    it('should return hasUpdate: false if client version is equal or newer', () => {
      const releaseInfo = new ReleaseInfo(mockReleaseData);

      expect(releaseInfo.toCheckUpdateResult('0.0.4').hasUpdate).toBe(false);
      expect(releaseInfo.toCheckUpdateResult('0.0.5').hasUpdate).toBe(false);
      expect(releaseInfo.toCheckUpdateResult('v0.0.4').hasUpdate).toBe(false);
    });

    it('should return hasUpdate: true if client version is omitted', () => {
      const releaseInfo = new ReleaseInfo(mockReleaseData);
      const result = releaseInfo.toCheckUpdateResult();

      expect(result.hasUpdate).toBe(true);
      expect(result.latestVersion).toBe('0.0.4');
    });

    it('should handle null or empty apkAsset gracefully', () => {
      const releaseInfoWithoutApk = new ReleaseInfo({
        ...mockReleaseData,
        apkAsset: null,
      });

      const result = releaseInfoWithoutApk.toCheckUpdateResult('0.0.3');

      expect(result.downloadUrl).toBeNull();
      expect(result.size).toBe('0 Bytes');
    });

    it('should format different byte sizes correctly', () => {
      const releaseWith0Bytes = new ReleaseInfo({
        ...mockReleaseData,
        apkAsset: { name: 'test.apk', downloadUrl: 'http://test.com', size: 0 },
      });
      expect(releaseWith0Bytes.toCheckUpdateResult().size).toBe('0 Bytes');

      const releaseWithKB = new ReleaseInfo({
        ...mockReleaseData,
        apkAsset: {
          name: 'test.apk',
          downloadUrl: 'http://test.com',
          size: 2048,
        },
      });
      expect(releaseWithKB.toCheckUpdateResult().size).toBe('2 KB');

      const releaseWithGB = new ReleaseInfo({
        ...mockReleaseData,
        apkAsset: {
          name: 'test.apk',
          downloadUrl: 'http://test.com',
          size: 1073741824,
        },
      });
      expect(releaseWithGB.toCheckUpdateResult().size).toBe('1 GB');
    });

    it('should correctly compare complex semver versions', () => {
      const release = new ReleaseInfo({ ...mockReleaseData, version: '1.2.0' });

      expect(release.toCheckUpdateResult('1.1.9').hasUpdate).toBe(true);
      expect(release.toCheckUpdateResult('1.2.0').hasUpdate).toBe(false);
      expect(release.toCheckUpdateResult('1.2.1').hasUpdate).toBe(false);
      expect(release.toCheckUpdateResult('0.9.9').hasUpdate).toBe(true);
      expect(release.toCheckUpdateResult('1.10.0').hasUpdate).toBe(false);
    });
  });
});
