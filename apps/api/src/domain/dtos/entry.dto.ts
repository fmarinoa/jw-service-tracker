import { SessionType } from '@jw-tracker/shared';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntryDto {
  @ApiProperty({
    description: 'Preaching date as Unix timestamp (milliseconds)',
    example: 1719446400000,
    type: 'number',
  })
  preachingDate: number;

  @ApiProperty({
    description: 'Hours spent in preaching activity (0-24)',
    example: 2,
    type: 'integer',
    minimum: 0,
    maximum: 24,
  })
  hours: number;

  @ApiProperty({
    description: 'Minutes spent in preaching activity (0-59)',
    example: 30,
    type: 'integer',
    minimum: 0,
    maximum: 59,
  })
  minutes: number;

  @ApiProperty({
    description: 'Type of preaching session',
    enum: SessionType,
    example: 'house_to_house',
  })
  type: SessionType;

  @ApiProperty({
    description: 'Optional notes about the session',
    example: 'Good conversation',
    required: false,
    maxLength: 50,
  })
  notes?: string;

  @ApiProperty({
    description: 'Temporary ID for offline sync',
    example: 'temp_123abc',
    required: false,
  })
  tempId?: string;
}

export class UpdateEntryDto extends CreateEntryDto {
  @ApiProperty({
    description: 'Unique identifier of the entry',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;
}
