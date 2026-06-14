import { UsersRepository } from "./UsersRepository";
import { EntriesRepository } from "./EntriesRepository";
import { MongoClient, MongoClientOptions, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options: MongoClientOptions = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
}
let client: MongoClient;

if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & { _mongoClient?: MongoClient };
    if (!globalWithMongo._mongoClient) globalWithMongo._mongoClient = new MongoClient(uri, options);
    client = globalWithMongo._mongoClient;
} else {
    client = new MongoClient(uri, options);
}


export const usersRepository = new UsersRepository({
    client,
    config: {
        collectionName: "users"
    }
})

export const entriesRepository = new EntriesRepository({
    client,
    config: {
        collectionName: "entries"
    }
})
