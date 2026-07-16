import { BadRequestException } from '@nestjs/common';
import z from 'zod';

export const filterSchema = z.object({
  page: z.coerce.number().min(0, 'La página es inválida').default(1),
  limit: z.coerce.number().min(0, 'El límite es inválido').default(10),
  monthOffset: z.coerce
    .number()
    .max(1, 'El offset del mes es inválido')
    .min(-3, 'El offset del mes es inválido')
    .default(0),
});

export class FilterEntries {
  page: number;
  limit: number;
  monthOffset: number;
  startDate: number;
  endDate: number;

  constructor(data: Partial<FilterEntries>) {
    Object.assign(this, data);
  }
  static validateInstance(data: Partial<FilterEntries>) {
    const { data: validated, error } = filterSchema.safeParse(data);
    if (error) {
      throw new BadRequestException(
        error.issues[0]?.message || 'Datos inválidos',
      );
    }

    return new FilterEntries({
      ...validated,
    });
  }
}
