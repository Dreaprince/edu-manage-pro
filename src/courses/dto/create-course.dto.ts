import { IsString, IsNotEmpty, IsUUID, IsIn, IsArray, ArrayNotEmpty, IsNumber, IsOptional } from 'class-validator'; // Validation decorators
import { Type } from 'class-transformer'; // To transform plain objects to class instances
import { User } from '../../users/entities/user.entity'; // Assuming User entity exists
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'Title of the course' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Number of credits for the course' })
  @IsNumber()
  @IsNotEmpty()
  credits: number;

  @ApiProperty({ description: 'Lecturer ID' })
  @IsNotEmpty()
  @Type(() => User)
  lecturerId: string;

  @ApiProperty({ description: 'Syllabus for the course', type: [String] })
  @IsArray()
  @IsString({ each: true })
  syllabus: string[];

  @ApiProperty({ description: 'Array of student IDs to be enrolled in the course', type: [String] })
  @IsOptional()
  @IsArray()
  enrollments?: string[];
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

export class GenerateSyllabusDto {
  @ApiProperty({ description: 'topic' })
  @IsString()
  @IsNotEmpty()
  topic: string;

}

export class UploadSyllabusDto {
  @ApiProperty({ type: 'string' })
  file: any;


  @ApiProperty({ description: 'courseId' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

}

export class GetCoursesDto {
  @ApiProperty({ description: 'Title of the course to filter by', required: false })
  @IsOptional()
  @IsString()
  title?: string; // Optional title filter for courses
}

