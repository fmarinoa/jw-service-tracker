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
    updatedAt?: number;

    constructor(data: Partial<Entry>) {
        Object.assign(this, data);
    }

    static validate(data: Partial<Entry>): string | null {
        const hours = data.hours || 0;
        const minutes = data.minutes || 0;
        const totalMinutes = (hours * 60) + minutes;

        if (totalMinutes > 24 * 60) {
            return "La duración total no puede exceder las 24 horas en un día.";
        }

        if (data.notes && data.notes.length > 50) {
            return "Las notas no pueden tener más de 50 caracteres.";
        }

        return null;
    }
}
