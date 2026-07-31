import { UpdateUserRequestSchema } from '@jw-tracker/shared';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserDto extends createZodDto(UpdateUserRequestSchema) {}
