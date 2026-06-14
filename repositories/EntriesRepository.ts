import { Collection, Document, ObjectId } from "mongodb";
import { Entry } from "@/domain/Entry";
import { DateTime } from "luxon";
import { User } from "@/domain/User";

export interface EntriesRepositoryProps {
    collection: Collection<Document>;
}

export class EntriesRepository {
    constructor(private props: EntriesRepositoryProps) { }

    async getByUser(user: User): Promise<Entry[]> {
        const result = await this.props.collection
            .find({ userId: user.id })
            .sort({ preachingDate: -1 })
            .toArray();

        if (!result) return [];
        return result.map((doc) => {
            const { _id, userId, ...rest } = doc;
            return new Entry({
                ...rest,
                id: _id.toString(),
                user: new User({ id: userId })
            });
        });
    }

    async create(user: User, data: Partial<Entry>): Promise<Entry> {
        const createdAt = DateTime.now().toMillis();
        const item = {
            ...data,
            userId: user.id,
            createdAt,
        }
        const result = await this.props.collection.insertOne(item);

        return new Entry({
            ...data,
            id: result.insertedId.toString(),
            user: new User({ id: user.id }),
            createdAt,
        });
    }

    async update(user: User, entry: Entry): Promise<Entry> {
        const updatedAt = DateTime.now().toMillis();
        const item = {
            ...entry,
            updatedAt,
        }
        await this.props.collection.updateOne(
            { _id: new ObjectId(entry.id), userId: user.id },
            {
                $set: {
                    item
                },
            }
        );
        return new Entry({
            ...entry,
            id: entry.id,
            user: new User({ id: user.id }),
            updatedAt,
        });
    }

    async delete(user: User, id: string): Promise<void> {
        await this.props.collection.deleteOne({
            _id: new ObjectId(id),
            userId: user.id,
        });
    }
}
