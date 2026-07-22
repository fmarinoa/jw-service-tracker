import { DateTime } from 'luxon';
import { Collection, Document, MongoClient, ObjectId } from 'mongodb';

export interface BaseRepositoryProps {
  client: MongoClient;
  config: {
    collectionName: string;
  };
}

export abstract class BaseRepository {
  constructor(private props: BaseRepositoryProps) {}

  protected async handlerCollection<T>(
    callback: (collection: Collection<Document>) => Promise<T>,
  ) {
    const client = this.props.client;
    const collectionName = this.props.config.collectionName;

    const db = client.db();
    const collection = db.collection(collectionName);
    const start = Date.now();
    try {
      const result = await callback(collection);
      const duration = Date.now() - start;
      console.log(`[MongoDB] ${collectionName} - completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(
        `[MongoDB Error] ${collectionName} - failed in ${duration}ms: `,
        error instanceof Error ? error.message : String(error),
      );
      throw new Error(
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
