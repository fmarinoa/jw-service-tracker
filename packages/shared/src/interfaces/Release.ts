export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
}

export interface CheckUpdateResponse {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion?: string;
  downloadUrl: string | null;
  title: string;
  notes: string;
  publishedAt: string;
}
