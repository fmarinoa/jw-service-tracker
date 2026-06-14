import { Collection, Document, MongoClient, ObjectId } from "mongodb";

export interface BaseRepositoryProps {
    client: MongoClient;
    config: {
        collectionName: string;
    }
}

export abstract class BaseRepository {
    constructor(private props: BaseRepositoryProps) { }

    async handlerCollection<T>(callback: (collection: Collection<Document>) => Promise<T>) {
        const client = this.props.client;
        const collectionName = this.props.config.collectionName;

        const db = client.db();
        const collection = db.collection(collectionName);
        try {
            return await callback(collection);
        } catch (error) {
            throw new Error("[MongoDB Error: " + collectionName + "] " + (error instanceof Error ? error.message : String(error)));
        }
    }

    buildIdFilter(id: string) {
        return { _id: new ObjectId(id) };
    }

    cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, val]) => val !== undefined && val !== null)
        ) as Partial<T>;
    }
}