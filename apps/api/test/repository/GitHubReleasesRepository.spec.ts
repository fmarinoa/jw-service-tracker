import { GitHubReleasesRepository } from '@/repositories/GitHubReleasesRepository';

describe('GitHubReleasesRepository', () => {
  let repository: GitHubReleasesRepository;
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    repository = new GitHubReleasesRepository({
      config: {
        urlBase: 'https://api.github.com/repos/test/repo',
      },
    });
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should fetch latest release from GitHub API, parse APK asset and return ReleaseInfo', async () => {
    const mockApiResponse = {
      tag_name: 'v0.0.4',
      name: 'Release v0.0.4',
      published_at: '2026-07-21T03:07:15Z',
      body: 'Notes for release',
      assets: [
        {
          name: 'jw-service-tracker-v0.0.4.apk',
          browser_download_url: 'https://github.com/test/download.apk',
          size: 1024567,
        },
        {
          name: 'source.zip',
          browser_download_url: 'https://github.com/test/source.zip',
          size: 500,
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockApiResponse),
    } as any);

    const result = await repository.getLatestRelease();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/test/repo/releases/latest',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': 'JW-Service-Tracker-API',
          Accept: 'application/vnd.github.v3+json',
        }),
      }),
    );
    expect(result).not.toBeNull();
    expect(result?.version).toBe('0.0.4');
    expect(result?.tagName).toBe('v0.0.4');
    expect(result?.apkAsset).toEqual({
      name: 'jw-service-tracker-v0.0.4.apk',
      downloadUrl: 'https://github.com/test/download.apk',
      size: 1024567,
    });
  });

  it('should include Authorization header if GITHUB_TOKEN is set in env', async () => {
    const tokenRepository = new GitHubReleasesRepository({
      config: {
        urlBase: 'https://api.github.com/repos/test/repo',
      },
      githubToken: 'mock-github-token',
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ tag_name: 'v1.0.0' }),
    } as any);

    await tokenRepository.getLatestRelease();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/test/repo/releases/latest',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-github-token',
        }),
      }),
    );
  });

  it('should return null if GitHub API returns status 404 or error', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(null, { status: 404 }));

    const result = await repository.getLatestRelease();
    expect(result).toBeNull();
  });
});
