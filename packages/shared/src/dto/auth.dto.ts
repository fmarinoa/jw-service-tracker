import { z } from 'zod';

import type { User } from '../interfaces/User';

export const LoginRequestSchema = z.object({
  phone: z.string().min(1, 'Phone number is required').meta({
    description: 'Phone number with country code',
    example: '+51912345678',
  }),
  password: z.string().min(1, 'Password is required').meta({
    description: 'User password',
    example: 'password123',
  }),
});
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

// Superset used only for Swagger doc generation (@ApiBody). Not used for
// validation — AuthController still validates via LoginRequestSchema.
export const LoginApiBodySchema = LoginRequestSchema.extend({
  platform: z
    .string()
    .meta({
      description: 'Platform identifier',
      example: 'web',
    })
    .optional(),
  deviceName: z
    .string()
    .meta({
      description: 'Device name for session tracking',
      example: 'iPhone 12',
    })
    .optional(),
});
export type LoginApiBodyDto = z.infer<typeof LoginApiBodySchema>;

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').meta({
    description: 'Refresh token for obtaining a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  }),
});
export type RefreshRequestDto = z.infer<typeof RefreshRequestSchema>;

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const LogoutRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type LogoutRequestDto = z.infer<typeof LogoutRequestSchema>;

export interface LogoutResponseDto {
  ok: boolean;
}

// Mirrors User.validateForRegistration's registerSchema (email optional).
// Pattern/description on `phone` is doc-only here — real enforcement stays
// in User.ts's own phoneSchema, untouched by this migration.
export const RegisterRequestSchema = z.object({
  name: z.string().min(2).max(50).meta({
    description: 'User full name',
    example: 'Juan Pérez',
  }),
  phone: z
    .string()
    .regex(/^9\d{8}$/)
    .meta({
      description: 'Peruvian mobile phone number (9 digits starting with 9)',
      example: '912345678',
    }),
  password: z.string().min(6).meta({
    description: 'User password',
    example: 'SecurePassword123',
  }),
  email: z
    .email()
    .meta({
      description: 'User email address',
      example: 'jw@example.com',
    })
    .optional(),
  invitationCode: z
    .string()
    .meta({
      description: 'Invitation code for registration',
      example: 'INV123456',
    })
    .optional(),
});
export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;

export interface RegisterResponseDto {
  user: User;
  success: boolean;
}

export interface UserDto {
  id: string;
  name: string;
  phone: string;
}
