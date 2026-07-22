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

  private formatBytes(): string {
    if (this.apkAsset?.size === 0 || !this.apkAsset?.size) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(this.apkAsset.size) / Math.log(k));

    return (
      parseFloat((this.apkAsset.size / Math.pow(k, i)).toFixed(2)) +
      ' ' +
      sizes[i]
    );
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
      size: this.formatBytes(),
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
