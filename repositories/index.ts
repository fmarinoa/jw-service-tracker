import clientPromise from "@/lib/db";
import { UsersRepository } from "./UsersRepository";
import { EntriesRepository } from "./EntriesRepository";

const client = await clientPromise;
const db = client.db();

export const usersRepository = new UsersRepository({ collection: db.collection("users") })
export const entriesRepository = new EntriesRepository({ collection: db.collection("entries") })
