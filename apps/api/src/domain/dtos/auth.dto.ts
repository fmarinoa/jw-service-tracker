import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Phone number with country code',
    example: '+51912345678',
  })
  phone: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  password: string;

  @ApiProperty({
    description: 'Platform identifier',
    example: 'web',
    required: false,
  })
  platform?: string;

  @ApiProperty({
    description: 'Device name for session tracking',
    example: 'iPhone 12',
    required: false,
  })
  deviceName?: string;
}

export class RefreshRequestDto {
  @ApiProperty({
    description: 'Refresh token for obtaining a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Juan Pérez',
    minLength: 2,
    maxLength: 50,
  })
  name: string;

  @ApiProperty({
    description: 'Peruvian mobile phone number (9 digits starting with 9)',
    example: '912345678',
    pattern: '^9\\d{8}$',
  })
  phone: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123',
    minLength: 6,
  })
  password: string;

  @ApiProperty({
    description: 'Invitation code for registration',
    example: 'INV123456',
    required: false,
  })
  invitationCode?: string;
}
