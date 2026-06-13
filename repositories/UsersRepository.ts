import { Collection, Document, ObjectId } from "mongodb";
import { User } from "@/domain/User";
import { DateTime } from "luxon";
import bcrypt from 'bcrypt';

export interface UsersRepositoryProps {
    collection: Collection<Document>;
}

export class UsersRepository {
    constructor(private props: UsersRepositoryProps) { }

    async findByPhone(phone: string) {
        const result = await this.props.collection.findOne({ phone });
        return result ? new User({ ...result, id: result._id.toString() }) : null;
    }

    async findById(id: string) {
        const result = await this.props.collection.findOne({ _id: new ObjectId(id) });
        return result ? new User({ ...result, id: result._id.toString() }) : null;
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

    async update(user: Partial<User>): Promise<User> {
        const id = user.id;
        if (!id) {
            throw new Error('User ID is required for update');
        }
        const { id: _, ...updates } = user;
        const updatedAt = DateTime.now().toMillis();
        await this.props.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updates, updatedAt } }
        );
        return new User({ ...user, updatedAt });
    }
}