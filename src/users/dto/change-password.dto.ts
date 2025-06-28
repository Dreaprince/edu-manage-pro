import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The unique identifier for the user',
    example: '123',
    type: 'number'
  })
  @IsNotEmpty({ message: 'id is required.' })
  id: number;

  @ApiProperty({
    description: 'The current password of the user',
    example: 'oldPassword123'
  })
  @IsNotEmpty({ message: 'Old password is required.' })
  @IsString({ message: 'oldPassword must be a string.' })
  oldPassword: string;

  @ApiProperty({
    description: 'The new password to replace the old one',
    example: 'newPassword123'
  })
  @IsNotEmpty({ message: 'New password is required.' })
  @IsString({ message: 'newPassword must be a string.' })
  newPassword: string;
}
