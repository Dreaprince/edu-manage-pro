import { IsUUID, IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAssignmentGradeDto {
  @ApiProperty({ description: 'Assignment ID' })
  @IsUUID()
  assignmentId: string; // ID of the assignment

  @ApiProperty({ description: 'Grade for the assignment' })
  @IsDecimal()
  grade: number; // New grade for the assignment
}

