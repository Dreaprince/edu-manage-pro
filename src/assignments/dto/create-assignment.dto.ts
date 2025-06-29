import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Course ID' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string; // ID of the course for the assignment

  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string; // ID of the student

  @ApiProperty({ description: 'File path or URL of the assignment file', required: false })
  @IsOptional()
  @IsString()
  file?: string; // Optional file associated with the assignment

  @ApiProperty({ description: 'Grade for the assignment', required: false })
  @IsOptional()
  @IsDecimal()
  grade?: number; // Optional grade
}

