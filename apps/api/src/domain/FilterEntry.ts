import { z } from 'zod';
import { DateTime } from 'luxon';

export const filterSchema = z.object({
  limit: z.number().int().positive().min(1).max(50).optional().default(50),
  startDate: z
    .number()
    .int()
    .refine((value) => DateTime.fromMillis(value).isValid, {
      message: 'Invalid timestamp millis',
    }),
  endDate: z
    .number()
    .int()
    .refine((value) => DateTime.fromMillis(value).isValid, {
      message: 'Invalid timestamp millis',
    }),
  nextCursor: z.string().optional(),
}).refine((data) => {
  return data.startDate <= data.endDate;
}, {
  message: 'startDate must be less than or equal to endDate',
});

export class FilterEntry {
  limit: number;
  startDate: number;
  endDate: number;
  nextCursor?: string | Record<string, any>;

  constructor(data: Partial<FilterEntry>) {
    Object.assign(this, data);
  }

  static validateFilter(data: Partial<FilterEntry>): FilterEntry {
    const result = filterSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Invalid filter parameters: ${result.error.message}`);
    }
    const parsedData = result.data;
    return new FilterEntry(parsedData);
  }

  decodeCursor() {
    if (this.nextCursor && typeof this.nextCursor === 'string') {
      try {
        const decoded = Buffer.from(this.nextCursor, 'base64').toString('utf-8');
        this.nextCursor = JSON.parse(decoded) as Record<string, any>;
      } catch (err) {
        throw new Error('Invalid pagination cursor format.');
      }
    }
  }

  encodeCursor() {
    if (this.nextCursor && typeof this.nextCursor === 'object') {
      const encodedCursor = Buffer.from(JSON.stringify(this.nextCursor)).toString('base64');
      this.nextCursor = encodedCursor;
    }
  }
}
