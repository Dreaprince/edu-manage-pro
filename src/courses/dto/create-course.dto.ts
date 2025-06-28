import { IsString, IsNotEmpty, IsUUID } from 'class-validator'; // Validation decorators
import { Type } from 'class-transformer'; // To transform plain objects to class instances
import { User } from '../../users/entities/user.entity'; // Assuming User entity exists

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string; // Title of the course

  @IsString()
  @IsNotEmpty()
  description: string; // Description of the course

  @IsUUID()
  @IsNotEmpty()
  @Type(() => User) // Transform to a User instance
  lecturerId: string; // Lecturer's user ID (will be used to assign the course to a lecturer)
}

