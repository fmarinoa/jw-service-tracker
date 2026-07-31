import { z } from 'zod';

import { PreacherType } from '../interfaces/User';

export const UpdateUserRequestSchema = z.object({
  preacherType: z
    .enum(PreacherType)
    .meta({
      description: 'Preacher type classification',
      example: 'publisher',
    })
    .optional(),
  monthlyGoal: z
    .number()
    .int()
    .min(0)
    .max(744)
    .meta({
      description: 'Monthly preaching hours goal',
      example: 50,
    })
    .optional(),
  showTutorial: z
    .boolean()
    .meta({
      description: 'Whether to show tutorial on next login',
      example: false,
    })
    .optional(),
});
export type UpdateUserRequestDto = z.infer<typeof UpdateUserRequestSchema>;
