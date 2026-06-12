import clientPromise from "@/lib/db";
import { UserRepository } from "./UsersRepository";

const client = await clientPromise;
const db = client.db();

export const userRepository = new UserRepository({ collection: db.collection('users') })