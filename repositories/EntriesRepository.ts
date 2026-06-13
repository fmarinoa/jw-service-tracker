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
}