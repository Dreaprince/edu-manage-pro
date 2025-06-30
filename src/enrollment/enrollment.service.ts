import { Injectable } from '@nestjs/common';
import { GetEnrollmentsDto } from './dto/create-enrollment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Repository } from 'typeorm';


@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  // Fetch enrollments based on filter criteria
  async getEnrollments(getEnrollmentsDto: GetEnrollmentsDto): Promise<any> {
    try {
      const { status } = getEnrollmentsDto; // Extract status from DTO
      
      let query = this.enrollmentRepository.createQueryBuilder('enrollment')
        .leftJoin('enrollment.course', 'course') // Join with course
        .leftJoin('enrollment.student', 'student') // Join with student
        .addSelect(['course.id', 'course.title']) // Select only course id and name
        .addSelect(['student.id', 'student.name']); // Select only student id and name

      // Filter by status if provided
      if (status) {
        query = query.andWhere('enrollment.status = :status', { status });
      }

      // Execute the query and get the filtered enrollments
      const enrollments = await query.getMany();

      return {
        statusCode: '00',
        message: 'Enrollments fetched successfully',
        data: enrollments,
      };
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  }



}
