import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';
import z from 'zod';

import { User } from './User';
import { MonthlyStats, SessionType } from '@jw-tracker/shared';

export const baseSchema = z.object({
  preachingDate: z.number().int().min(1, 'Fecha de predicación inválida'),
  hours: z
    .number()
    .int()
    .min(0, 'Horas inválidas')
    .max(24, 'Horas no pueden ser más de 24'),
  minutes: z
    .number()
    .int()
    .min(0, 'Minutos inválidos')
    .max(59, 'Minutos no pueden ser más de 59'),
  type: z.enum(SessionType),
  notes: z
    .string()
    .max(50, 'Las notas no pueden tener más de 50 caracteres')
    .optional(),
});

export const updateSchema = baseSchema.extend({
  id: z.string().min(1, 'ID de entrada inválido'),
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
      throw new BadRequestException(result.error.issues[0].message);
    }
    return new Entry(result.data);
  }

  static validateForUpdate(data: Partial<Entry>): Entry {
    const result = updateSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error.issues[0].message);
    }
    return new Entry(result.data);
  }

  validateHourPlusMinutes() {
    const totalMinutes = this.hours * 60 + this.minutes;
    if (totalMinutes > 24 * 60) {
      throw new BadRequestException(
        'La duración total no puede exceder las 24 horas en un día.',
      );
    }
  }

  preachingDateNotInFuture() {
    // Para evitar que se registren fechas futuras en la zona horaria del cliente
    // (por ejemplo, registrar el día de mañana antes de tiempo), comparamos contra
    // el tiempo absoluto actual más un margen de 10 minutos para tolerar desfases de reloj.
    const toleranceBufferMs = 10 * 60 * 1000; // 10 minutos
    const maxAllowedTimestamp = DateTime.now().toMillis() + toleranceBufferMs;
    if (this.preachingDate > maxAllowedTimestamp) {
      throw new BadRequestException(
        'La fecha de predicación no puede ser futura.',
      );
    }
  }

  static computeMonthlyStats(entries: Entry[]): MonthlyStats {
    return entries.reduce(
      (acc, curr) => {
        const hours = curr.hours || 0;
        const minutes = curr.minutes || 0;
        acc.totalMinutes += hours * 60 + minutes;
        acc.byType[curr.type] =
          (acc.byType[curr.type] || 0) + hours * 60 + minutes;
        return acc;
      },
      {
        totalMinutes: 0,
        byType: {
          house_to_house: 0,
          revisits: 0,
          bible_study: 0,
          other: 0,
        },
      },
    );
  }
}
