import { DateTime } from "luxon";
import { Entry } from "@/domain/Entry";
import { User } from "@/domain/User";
import { BaseRepository, BaseRepositoryProps } from "./BaseRepository";

export class EntriesRepository extends BaseRepository {
    constructor(props: BaseRepositoryProps) {
        super(props);
    }
    async getByUser(user: User): Promise<Entry[]> {
        return this.handlerCollection(async (collection) => {
            const result = await collection
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
            })
        });
    }

    async create(user: User, data: Partial<Entry>): Promise<Entry> {
        return this.handlerCollection(async (collection) => {
            const createdAt = DateTime.now().toMillis();
            const insertData = this.cleanObject({
                preachingDate: data.preachingDate,
                hours: data.hours,
                minutes: data.minutes,
                type: data.type,
                userId: user.id,
                notes: data.notes,
                createdAt,
            });

            const result = await collection.insertOne(insertData);

            return new Entry({
                ...insertData,
                id: result.insertedId.toString(),
                user: new User({ id: user.id }),
            })
        });
    }

    async update(user: User, entry: Entry): Promise<Entry> {
        return this.handlerCollection(async (collection) => {
            const updatedAt = DateTime.now().toMillis();
            const updateData = this.cleanObject({
                preachingDate: entry.preachingDate,
                hours: entry.hours,
                minutes: entry.minutes,
                type: entry.type,
                notes: entry.notes,
                updatedAt,
            });

            await collection.updateOne(
                { ...this.buildIdFilter(entry.id), userId: user.id },
                {
                    $set: updateData,
                }
            );
            return new Entry({
                ...entry,
                id: entry.id,
                user: new User({ id: user.id }),
                updatedAt,
            })
        });
    }

    async delete(user: User, id: string): Promise<void> {
        await this.handlerCollection(async (collection) => {
            await collection.deleteOne({
                ...this.buildIdFilter(id),
                userId: user.id,
            });
        });
    }
}
