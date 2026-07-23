import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';

import { AuthSessionsRepository } from './AuthSessionsRepository';
import { EntriesRepository } from './EntriesRepository';
import { GitHubReleasesRepository } from './GitHubReleasesRepository';
import { UsersRepository } from './UsersRepository';
import { HistoryReleasesRepository } from './HistoryReleasesRepository';

const uri = process.env.MONGODB_URI!;
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

export const authSessionsRepository = new AuthSessionsRepository({
  dbClient,
  config: {
    collectionName: 'auth_sessions',
  },
});

export const historyReleasesRepository = new HistoryReleasesRepository({
  dbClient,
  config: {
    collectionName: 'history_releases',
  },
});

export const gitHubReleasesRepository = new GitHubReleasesRepository({
  githubToken: process.env.GITHUB_TOKEN,
  config: {
    urlBase: 'https://api.github.com/repos/fmarinoa/jw-service-tracker',
  },
});
