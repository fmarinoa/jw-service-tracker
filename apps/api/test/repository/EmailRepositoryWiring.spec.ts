const originalEnv = process.env;

describe('repositories/index EMAIL_CACHE_ONLY wiring', () => {
  let resendConstructorMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    resendConstructorMock = jest.fn();

    jest.doMock('mongodb', () => ({
      MongoClient: jest.fn().mockImplementation(() => ({
        db: jest.fn(),
      })),
      ServerApiVersion: { v1: '1' },
    }));

    jest.doMock('resend', () => ({
      Resend: jest.fn().mockImplementation((...args: unknown[]) => {
        resendConstructorMock(...args);
        return {};
      }),
    }));

    process.env = {
      ...originalEnv,
      MONGODB_URI: 'mongodb://localhost:27017/test',
      EMAIL_FROM: 'noreply@jw-reporta.com',
      SLACK_WEBHOOK_URL: 'https://hooks.slack.test/webhook',
      RESEND_API_KEY: 'resend-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.dontMock('mongodb');
    jest.dontMock('resend');
    jest.resetModules();
  });

  it('constructs a CachedEmailsRepository and never touches Resend when EMAIL_CACHE_ONLY=true', () => {
    process.env.EMAIL_CACHE_ONLY = 'true';
    delete process.env.RESEND_API_KEY;

    const { emailRepository } = require('@/repositories');
    const {
      CachedEmailsRepository,
    } = require('@/repositories/persistence/CachedEmailsRepository');

    expect(emailRepository).toBeInstanceOf(CachedEmailsRepository);
    expect(resendConstructorMock).not.toHaveBeenCalled();
  });

  it('constructs a RenderRepository backed by Resend when EMAIL_CACHE_ONLY is not true', () => {
    process.env.EMAIL_CACHE_ONLY = 'false';

    const { emailRepository } = require('@/repositories');
    const {
      RenderRepository,
    } = require('@/repositories/external/RenderRepository');

    expect(emailRepository).toBeInstanceOf(RenderRepository);
    expect(resendConstructorMock).toHaveBeenCalledWith('resend-key');
  });
});
