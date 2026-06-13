import { z } from "zod";

export const PreacherType = {
    regular_pioneer: 'regular_pioneer',
    auxiliary_pioneer: 'auxiliary_pioneer',
    publisher: 'publisher',
} as const
export type PreacherType = typeof PreacherType[keyof typeof PreacherType];

// Peruvian mobile: starts with 9, exactly 9 digits
const phoneRegex = /^9\d{8}$/;

export const phoneSchema = z.string().trim().regex(phoneRegex, "Debe ser un número de celular de 9 dígitos que empiece con 9");

export const registerSchema = z.object({
    name: z.string().min(2, "Nombre muy corto").max(50),
    phone: phoneSchema,
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

const updateSettingsSchema = z.object({
    id: z.string().min(1),
    preacherType: z.enum(PreacherType),
    monthlyGoal: z.number().int().min(0, "La meta debe ser un número entero no negativo"),
});

export const DEFAULT_GOALS: Record<PreacherType, number | null> = {
    regular_pioneer: 50,
    auxiliary_pioneer: 30,
    publisher: null, // Opcional
};

export const PREACHER_TYPE_LABELS: Record<PreacherType, string> = {
    regular_pioneer: 'Precursor Regular',
    auxiliary_pioneer: 'Precursor Auxiliar',
    publisher: 'Publicador',
};

export class User {
    id: string;
    name: string;
    phone: string;
    password: string;
    preacherType: PreacherType;
    monthlyGoal: number;
    createdAt: number;
    updatedAt?: number;

    constructor(data: Partial<User>) {
        Object.assign(this, data);
    }

    static validateForRegistration(data: Partial<User>) {
        const {data: validated, error} = registerSchema.safeParse(data);
        if (error) {
            throw new Error(error.issues[0]?.message || 'Datos inválidos');
        }
        return new User({ ...validated, phone: `+51${validated.phone}`, preacherType: 'publisher', monthlyGoal: 0 });
    }

    static validateForUpdate(data: Partial<User>) {
        const { data: user, error } = updateSettingsSchema.safeParse(data);
        if (error) {
            throw new Error(error.issues[0]?.message || 'Datos inválidos');
        }
        return new User(user);
    }
}
