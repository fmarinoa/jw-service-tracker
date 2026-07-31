import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';
import { Resend } from 'resend';

import { EmailRepository } from './EmailRepository';
import { GitHubReleasesRepository } from './external/GitHubReleasesRepository';
import { RenderRepository } from './external/RenderRepository';
import { SlackRepository } from './external/SlackRepository';
import { AuthSessionsRepository } from './persistence/AuthSessionsRepository';
import { CachedEmailsRepository } from './persistence/CachedEmailsRepository';
import { EntriesRepository } from './persistence/EntriesRepository';
import { FailedEmailsRepository } from './persistence/FailedEmailsRepository';
import { HistoryReleasesRepository } from './persistence/HistoryReleasesRepository';
import { InvitationsRepository } from './persistence/InvitationsRepository';
import { UsersRepository } from './persistence/UsersRepository';

const {
  MONGODB_URI,
  RESEND_API_KEY,
  GITHUB_TOKEN,
  SLACK_WEBHOOK_URL,
  EMAIL_FROM,
} = process.env;

const uri = MONGODB_URI!;
const options: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};
let dbClient: MongoClient;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };
  if (!globalWithMongo._mongoClient)
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  dbClient = globalWithMongo._mongoClient;
} else {
  dbClient = new MongoClient(uri, options);
}

export const usersRepository = new UsersRepository({
  dbClient,
  config: {
    collectionName: 'users',
  },
});

export const entriesRepository = new EntriesRepository({
  dbClient,
  config: {
    collectionName: 'entries',
  },
});

export const invitationsRepository = new InvitationsRepository({
  dbClient,
  config: {
    collectionName: 'invitations',
  },
});

export const authSessionsRepository = new AuthSessionsRepository({
  dbClient,
  config: {
    collectionName: 'auth_sessions',
  },
});

export const failedEmailsRepository = new FailedEmailsRepository({
  dbClient,
  config: {
    collectionName: 'failed_emails',
  },
});

export const historyReleasesRepository = new HistoryReleasesRepository({
  dbClient,
  config: {
    collectionName: 'history_releases',
  },
});

export const gitHubReleasesRepository = new GitHubReleasesRepository({
  githubToken: GITHUB_TOKEN,
  config: {
    urlBase: 'https://api.github.com/repos/fmarinoa/jw-service-tracker',
  },
});

export const slackRepository = new SlackRepository({
  config: {
    urlBase: SLACK_WEBHOOK_URL!,
  },
});

// EMAIL_CACHE_ONLY decides which EmailRepository gets constructed: Resend's
// client throws synchronously without an API key, so it must not be
// instantiated in environments that don't have access to it.
export const emailRepository: EmailRepository =
  process.env.EMAIL_CACHE_ONLY === 'true'
    ? new CachedEmailsRepository({
        dbClient,
        config: {
          collectionName: 'cached_emails',
        },
      })
    : new RenderRepository({
        resend: new Resend(RESEND_API_KEY),
        config: {
          from: EMAIL_FROM!,
        },
      });
