import {
  CreateEntryRequestSchema,
  UpdateEntryRequestSchema,
} from '@jw-tracker/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateEntryDto extends createZodDto(CreateEntryRequestSchema) {}
export class UpdateEntryDto extends createZodDto(UpdateEntryRequestSchema) {}
