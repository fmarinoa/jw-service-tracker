import { User } from "./User";

export type SessionType = 'house_to_house' | 'revisits' | 'bible_study' | 'other';

export class Entry {
    id: string;
    user: User;
    preachingDate: number;
    hours: number;
    minutes: number;
    type: SessionType;
    notes?: string;
    createdAt: number;
    updatedAt: number;

    constructor(data: Partial<Entry>) {
        Object.assign(this, data);
    }
}
