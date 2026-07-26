import { InternalServerErrorException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Collection, Document, MongoClient, ObjectId } from 'mongodb';

export interface HandlerOptions {
  functionName?: string;
  fastFail?: boolean;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

export interface BaseRepositoryProps {
  dbClient: MongoClient;
  config: {
    collectionName: string;
  };
}

export abstract class BaseRepository {
  constructor(private readonly baseProps: BaseRepositoryProps) {}

  protected async handlerCollection<T>(
    callback: (collection: Collection<Document>) => Promise<T>,
    options?: HandlerOptions,
  ) {
    const client = this.baseProps.dbClient;
    if (!client)
      throw new InternalServerErrorException(
        'MongoDB client is not defined in the repository configuration.',
      );

    const collectionName = this.baseProps.config.collectionName;

    if (!collectionName)
      throw new InternalServerErrorException(
        'Collection name is not defined in the repository configuration.',
      );

    const db = client.db();
    const collection = db.collection(collectionName);
    const start = Date.now();
    try {
      const result = await callback(collection);
      const duration = Date.now() - start;
      console.log(
        `[MongoDB] ${collectionName}${options?.functionName ? ` (${options.functionName})` : ''} - completed in ${duration}ms`,
      );
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(
        `[MongoDB Error] ${collectionName}${options?.functionName ? ` (${options.functionName})` : ''} - failed in ${duration}ms: `,
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException(
        '[MongoDB Error: ' +
          collectionName +
          '] ' +
          (error instanceof Error ? error.message : String(error)),
        { cause: error },
      );
    }
  }

  protected buildIdFilter(id: string) {
    return { _id: new ObjectId(id) };
  }

  protected cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([, val]) => val !== undefined && val !== null,
      ),
    ) as Partial<T>;
  }

  protected getTimestamp() {
    return DateTime.now().toMillis();
  }
}
