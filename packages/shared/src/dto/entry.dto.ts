import { z } from 'zod';

import { SessionType } from '../interfaces/Entry';

export const CreateEntryRequestSchema = z.object({
  preachingDate: z.number().meta({
    description: 'Preaching date as Unix timestamp (milliseconds)',
    example: 1719446400000,
  }),
  hours: z.number().int().min(0).max(24).meta({
    description: 'Hours spent in preaching activity (0-24)',
    example: 2,
  }),
  minutes: z.number().int().min(0).max(59).meta({
    description: 'Minutes spent in preaching activity (0-59)',
    example: 30,
  }),
  type: z.enum(SessionType).meta({
    description: 'Type of preaching session',
    example: 'house_to_house',
  }),
  notes: z
    .string()
    .max(50)
    .meta({
      description: 'Optional notes about the session',
      example: 'Good conversation',
    })
    .optional(),
  tempId: z
    .string()
    .meta({
      description: 'Temporary ID for offline sync',
      example: 'temp_123abc',
    })
    .optional(),
});
export type CreateEntryRequestDto = z.infer<typeof CreateEntryRequestSchema>;

export const UpdateEntryRequestSchema = CreateEntryRequestSchema.extend({
  id: z.string().meta({
    description: 'Unique identifier of the entry',
    example: '507f1f77bcf86cd799439011',
  }),
});
export type UpdateEntryRequestDto = z.infer<typeof UpdateEntryRequestSchema>;
