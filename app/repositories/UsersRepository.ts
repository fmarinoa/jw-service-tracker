import { Collection, Document, ObjectId } from "mongodb";
import { User } from "../domain/User";
import { DateTime } from "luxon";
import bcrypt from 'bcrypt';

export interface UserRepositoryProps {
    collection: Collection<Document>;
}

export class UserRepository {
    constructor(private props: UserRepositoryProps) { }

    async findByPhone(phone: string) {
        return this.props.collection.findOne({ phone });
    }

    async findById(id: string){
        return this.props.collection.findOne({ _id: new ObjectId(id) });
    }

    async create(user: User): Promise<User> {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const item = {
            ...user,
            name: user.name.toUpperCase(),
            password: hashedPassword,
            createdAt: DateTime.now().toMillis(),
        }
        const result = await this.props.collection.insertOne(item);
        return new User({ ...item, id: result.insertedId.toString() });
    }
}