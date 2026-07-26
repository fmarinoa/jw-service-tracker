import { PreacherType } from '@jw-tracker/shared';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Preacher type classification',
    enum: PreacherType,
    example: 'pioneer',
    required: false,
  })
  preacherType?: PreacherType;

  @ApiProperty({
    description: 'Monthly preaching hours goal',
    example: 100,
    type: 'integer',
    minimum: 0,
    required: false,
  })
  monthlyGoal?: number;

  @ApiProperty({
    description: 'Whether to show tutorial on next login',
    example: false,
    type: 'boolean',
    required: false,
  })
  showTutorial?: boolean;
}
