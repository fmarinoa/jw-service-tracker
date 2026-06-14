import z from "zod";
import { User } from "./User";
import { DateTime } from "luxon";

export const SessionType = {
    house_to_house: 'house_to_house',
    revisits: 'revisits',
    bible_study: 'bible_study',
    other: 'other',
} as const
export type SessionType = typeof SessionType[keyof typeof SessionType];

export const baseSchema = z.object({
    preachingDate: z.number().int().min(1, "Fecha de predicación inválida"),
    hours: z.number().int().min(0, "Horas inválidas").max(24, "Horas no pueden ser más de 24"),
    minutes: z.number().int().min(0, "Minutos inválidos").max(59, "Minutos no pueden ser más de 59"),
    type: z.enum(SessionType),
    notes: z.string().max(50, "Las notas no pueden tener más de 50 caracteres").optional()
});

export const updateSchema = baseSchema.extend({
    id: z.string().min(1, "ID de entrada inválido"),
});

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

    static validateForCreate(data: Partial<Entry>): Entry {
        const result = baseSchema.safeParse(data);
        if (!result.success) {
            throw new Error(result.error.issues[0].message);
        }
        return new Entry(result.data);
    }

    static validateForUpdate(data: Partial<Entry>): Entry {
        const result = updateSchema.safeParse(data);
        if (!result.success) {
            throw new Error(result.error.issues[0].message);
        }
        return new Entry(result.data);
    }

    validateHourPlusMinutes() {
        const totalMinutes = (this.hours * 60) + this.minutes;
        if (totalMinutes > 24 * 60) {
            throw new Error("La duración total no puede exceder las 24 horas en un día.");
        }
    }

    preachingDateNotInFuture() {
        const dateToValidate =  DateTime.now().startOf('day').toMillis();
        if (this.preachingDate > dateToValidate) {
            throw new Error("La fecha de predicación no puede ser futura.");
        }
    }
}
