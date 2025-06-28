import { IsString, IsNotEmpty, IsUUID, IsIn, IsArray, ArrayNotEmpty } from 'class-validator'; // Validation decorators
import { Type } from 'class-transformer'; // To transform plain objects to class instances
import { User } from '../../users/entities/user.entity'; // Assuming User entity exists
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'Title' })
  @IsString()
  @IsNotEmpty()
  title: string; // Title of the course

  @ApiProperty({ description: 'Description' })
  @IsString()
  @IsNotEmpty()
  description: string; // Description of the course

  @ApiProperty({ description: 'lectureId' })
  @IsNotEmpty()
  @Type(() => User) // Transform to a User instance
  lecturerId: string; // Lecturer's user ID (will be used to assign the course to a lecturer)
}


export class EnrollStudentDto {
  @ApiProperty({ description: 'CourseId' })
  @IsString()
  @IsNotEmpty()
  courseId: string; // Title of the course

  @ApiProperty({ description: 'StudentId' })
  @IsNotEmpty()
  @Type(() => User) // Transform to a User instance
  studentId: string; // Lecturer's user ID (will be used to assign the course to a lecturer)
}

export class UpdateEnrollmentStatusDto {
  @ApiProperty({ description: 'EnrollmentId' })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({ description: 'Status' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'approved', 'rejected']) // Assuming status is a string with specific values
  status: string;
}

export class RecommendDto {
  @ApiProperty({ 
    description: 'Array of interests represented as UUIDs', 
    type: [String],  // Specifies the interest as an array of strings
  })
  @IsArray()  // Ensure the value is an array
  @ArrayNotEmpty()  // Ensure the array is not empty
  @IsNotEmpty()  // Ensure that the array is not empty
  interests: string[];
}

export class UpdateEnrollmentStatusDto {
  @ApiProperty({ description: 'EnrollmentId' })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({ description: 'Status' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'approved', 'rejected']) // Assuming status is a string with specific values
  status: string;
}

