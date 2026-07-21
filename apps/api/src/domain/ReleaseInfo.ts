import { CheckUpdateResponse, ReleaseAsset } from '@jw-tracker/shared';

export type { CheckUpdateResponse, ReleaseAsset };

export class ReleaseInfo {
  version: string;
  tagName: string;
  title: string;
  publishedAt: string;
  notes: string;
  apkAsset: ReleaseAsset | null;

  constructor(data: Partial<ReleaseInfo>) {
    Object.assign(this, data);
  }

  private isNewerThan(clientVersion?: string): boolean {
    if (!clientVersion) return true;
    return this.compareVersions(this.version, clientVersion) > 0;
  }

  toCheckUpdateResult(clientVersion?: string): CheckUpdateResponse {
    return {
      hasUpdate: this.isNewerThan(clientVersion),
      latestVersion: this.version,
      currentVersion: clientVersion,
      downloadUrl: this.apkAsset?.downloadUrl || null,
      title: this.title,
      notes: this.notes,
      publishedAt: this.publishedAt,
    };
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1
      .replace(/^v/, '')
      .split('.')
      .map((n) => parseInt(n, 10) || 0);
    const parts2 = v2
      .replace(/^v/, '')
      .split('.')
      .map((n) => parseInt(n, 10) || 0);

    const maxLength = Math.max(parts1.length, parts2.length);
    for (let i = 0; i < maxLength; i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }
}
