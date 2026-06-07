import { z } from 'zod';
import { DateTime } from 'luxon';
import { PreachingSessionType } from '@jw-tracker/shared';
import { User } from './User';

const baseObjectSchema = z.object({
  userId: z.string().min(1, { message: 'The userId field is required.' }),
  preachingDate: z.number().int().positive({ message: 'preachingDate must be a valid UTC milliseconds timestamp.' }),
  hours: z.number().int().nonnegative({ message: 'Hours must be an integer greater than or equal to 0.' }),
  minutes: z.number().int().min(0).max(59, { message: 'Minutes must be an integer between 0 and 59.' }),
  type: z.nativeEnum(PreachingSessionType, { message: 'type must be a valid session type.' }),
  notes: z.string().max(1000, { message: 'The notes field cannot exceed 1000 characters.' }).optional().nullable(),
});

const refineFn = (data: any, ctx: z.RefinementCtx) => {
  if (data.hours === 0 && data.minutes === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Total time reported must be greater than 0.',
      path: ['hours'],
    });
  }
  const parsedDate = DateTime.fromMillis(data.preachingDate, { zone: 'utc' });
  if (!parsedDate.isValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'The provided date is invalid.',
      path: ['preachingDate'],
    });
  }
  if (data.preachingDate > DateTime.now().toMillis()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'The preaching date cannot be in the future.',
      path: ['preachingDate'],
    });
  }
};

export const createEntrySchema = baseObjectSchema.superRefine(refineFn);

export const updateEntrySchema = baseObjectSchema.extend({
  id: z.string().uuid({ message: 'The id field must be a valid UUID v4.' }),
}).superRefine(refineFn);

export class Entry {
  id: string;
  user: User;
  preachingDate: number;
  hours: number;
  minutes: number;
  type: PreachingSessionType;
  notes?: string | null;
  createdAt: number;
  updatedAt?: number;

  constructor(data: Partial<Entry>) {
    Object.assign(this, data);
  }

  static validateForCreate(data: any): Entry {
    const parseResult = createEntrySchema.safeParse(data);
    if (!parseResult.success) {
      const messages = parseResult.error.errors.map(err => {
        let pathStr = err.path.join('.');
        return pathStr ? `${pathStr}: ${err.message}` : err.message;
      });
      const error = new Error(messages.join(', '));
      (error as any).code = 'VALIDATION_ERROR';
      throw error;
    }
    return new Entry({
      ...parseResult.data,
      user: new User({ id: parseResult.data.userId })
    });
  }

  static validateForUpdate(data: any): Entry {
    const parseResult = updateEntrySchema.safeParse(data);
    if (!parseResult.success) {
      const messages = parseResult.error.errors.map(err => {
        let pathStr = err.path.join('.');
        return pathStr ? `${pathStr}: ${err.message}` : err.message;
      });
      const error = new Error(messages.join(', '));
      (error as any).code = 'VALIDATION_ERROR';
      throw error;
    }
    return new Entry({
      ...parseResult.data,
      user: new User({ id: parseResult.data.userId })
    });
  }
}
