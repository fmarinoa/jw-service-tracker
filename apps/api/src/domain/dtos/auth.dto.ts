import {
  LoginApiBodySchema,
  RefreshRequestSchema,
  RegisterRequestSchema,
} from '@jw-tracker/shared';
import { createZodDto } from 'nestjs-zod';

export class LoginRequestDto extends createZodDto(LoginApiBodySchema) {}
export class RefreshRequestDto extends createZodDto(RefreshRequestSchema) {}
export class RegisterDto extends createZodDto(RegisterRequestSchema) {}
