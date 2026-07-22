import { ReleaseInfo } from '@/domain/ReleaseInfo';

export interface GitHubReleasesRepositoryProps {
  urlBase: string;
}

export class GitHubReleasesRepository {
  constructor(private readonly props: GitHubReleasesRepositoryProps) {}

  async getLatestRelease(): Promise<ReleaseInfo | null> {
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'JW-Service-Tracker-API',
        Accept: 'application/vnd.github.v3+json',
      };

      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const response = await fetch(`${this.props.urlBase}/releases/latest`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        tag_name: string;
        name: string;
        published_at: string;
        body: string;
        assets?: Array<{
          name: string;
          browser_download_url: string;
          size: number;
        }>;
      };

      const apkAsset = data.assets?.find((asset) =>
        asset.name.endsWith('.apk'),
      );
      const version = data.tag_name ? data.tag_name.replace(/^v/, '') : '';

      return new ReleaseInfo({
        version,
        tagName: data.tag_name,
        title: data.name || data.tag_name,
        publishedAt: data.published_at,
        notes: data.body || '',
        apkAsset: apkAsset
          ? {
              name: apkAsset.name,
              downloadUrl: apkAsset.browser_download_url,
              size: apkAsset.size,
            }
          : null,
      });
    } catch (error) {
      console.error('Error fetching latest release from GitHub:', error);
      return null;
    }
  }
}
