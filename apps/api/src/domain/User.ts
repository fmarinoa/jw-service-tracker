import {
  normalizePeruvianPhone,
  PreacherType,
  UserStatus,
} from '@jw-tracker/shared';
import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

// Peruvian mobile: starts with 9, exactly 9 digits
const phoneRegex = /^9\d{8}$/;

export const phoneSchema = z
  .string()
  .trim()
  .regex(
    phoneRegex,
    'Debe ser un número de celular de 9 dígitos que empiece con 9',
  );

export const registerSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto').max(50),
  phone: phoneSchema,
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const updateSettingsSchema = z.object({
  id: z.string(),
  preacherType: z.enum(PreacherType).optional(),
  monthlyGoal: z
    .number()
    .int()
    .min(0, 'La meta debe ser un número entero no negativo')
    .optional(),
  showTutorial: z.boolean().optional(),
});

export class User {
  id: string;
  name: string;
  phone: string;
  password: string;
  preacherType: PreacherType;
  monthlyGoal: number;
  status: UserStatus;
  showTutorial: boolean;
  createdAt: number;
  updatedAt?: number;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }

  static validateForRegistration(data: Partial<User>) {
    const { data: validated, error } = registerSchema.safeParse(data);
    if (error) {
      throw new BadRequestException(
        error.issues[0]?.message || 'Datos inválidos',
      );
    }
    return new User({
      ...validated,
      phone: normalizePeruvianPhone(validated.phone),
      status: UserStatus.PENDING,
    });
  }

  static validateForUpdate(data: Partial<User>) {
    const { data: user, error } = updateSettingsSchema.safeParse(data);
    if (error) {
      throw new BadRequestException(
        error.issues[0]?.message || 'Datos inválidos',
      );
    }
    return new User(user);
  }

  updateGoals(newGoal: number, newPreacherType: PreacherType) {
    if (newGoal < 0 || !Number.isInteger(newGoal)) {
      throw new Error('La meta debe ser un número entero no negativo');
    }
    this.monthlyGoal = newGoal;
    this.preacherType = newPreacherType;
  }
}
