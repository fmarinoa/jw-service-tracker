import { ReleaseInfo } from '@/domain/ReleaseInfo';

import { BaseRepository, BaseRepositoryProps } from './BaseRepository';
export interface GitHubReleasesRepositoryProps extends BaseRepositoryProps {
  githubToken?: string;
}

export class GitHubReleasesRepository extends BaseRepository {
  constructor(private readonly props: GitHubReleasesRepositoryProps) {
    super(props);
  }

  private get headers() {
    const headers: Record<string, string> = {
      'User-Agent': 'JW-Service-Tracker-API',
      Accept: 'application/vnd.github.v3+json',
    };

    const token = this.props.githubToken;
    if (token) {
      console.log('Using GitHub token for authentication');
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getLatestRelease(): Promise<ReleaseInfo | null> {
    try {
      const response = await this.handlerHttpRequest<{
        tag_name: string;
        name: string;
        published_at: string;
        body: string;
        assets?: Array<{
          name: string;
          browser_download_url: string;
          size: number;
        }>;
      }>(
        {
          method: 'GET',
          url: '/releases/latest',
          headers: this.headers,
        },
        {
          functionName: 'getLatestRelease',
          fastFail: false,
          parseResponse: true,
        },
      );

      if (response instanceof Response) {
        if (response.status === 404) return null;
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = response;

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
