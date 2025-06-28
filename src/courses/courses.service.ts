
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { User } from '../users/entities/user.entity';  // Lecturer reference
import { Syllabus } from './entities/syllabus.entity';  // Syllabus handling
import { Enrollment } from './entities/enrollment.entity';  // Enrollment management
import { AiService } from '../ai/ai.service';
import { Request } from 'express';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';



@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Syllabus)
    private readonly syllabusRepository: Repository<Syllabus>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly aiService: AiService,
  ) { }

  // Create or update a course
  async createCourse(createCourseDto: CreateCourseDto, req: Request): Promise<any> {
    try {
      const roleCheck = req?.decoded?.role;  // Extract role from decoded JWT token
      if (!['lecturer'].includes(roleCheck)) {
        throw new ForbiddenException('You do not have permission to create a course.');
      }

      // Find the lecturer by their ID
      const lecturer = await this.userRepository.findOne({ where: { id: createCourseDto.lecturerId } });
      if (!lecturer) {
        throw new NotFoundException('Lecturer not found');
      }

      // Create the course and associate the lecturer
      const course = this.courseRepository.create({
        ...createCourseDto,
        lecturer,
      });

      // Save the course to the database
      const savedCourse = await this.courseRepository.save(course);

      return {
        statusCode: "00",
        message: 'Course creation successful',
        data: savedCourse,
      };
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async updateCourse(updateCourseDto: UpdateCourseDto, req: Request): Promise<any> {
    try {
      const roleCheck = req?.decoded?.role;  // Extract role from decoded JWT token
      if (!['lecturer'].includes(roleCheck)) {
        throw new ForbiddenException('You do not have permission to create a course.');
      }
      // Check if the course exists
      const course = await this.courseRepository.findOne({ where: { id: updateCourseDto.courseId } });
      if (!course) {
        throw new NotFoundException('Course not found');
      }

      // Check if the lecturer exists (if the lecturer is being updated)
      if (updateCourseDto.lecturerId) {
        const lecturer = await this.userRepository.findOne({ where: { id: updateCourseDto.lecturerId } });
        if (!lecturer) {
          throw new NotFoundException('Lecturer not found');
        }
        course.lecturer = lecturer;  // Assign the new lecturer
      }

      // Update other course details
      course.title = updateCourseDto.title || course.title;
      course.description = updateCourseDto.description || course.description;

      // Save the updated course
      const updatedCourse = await this.courseRepository.save(course);

      return {
        statusCode: "00",
        message: 'Course updated successful',
        data: updatedCourse,
      };
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }




  // Upload syllabus for a course
  async uploadSyllabus(courseId: string, filePath: string): Promise<Syllabus> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new ConflictException('Course not found');
    }

    const syllabus = this.syllabusRepository.create({
      filePath,
      course,
    });

    return await this.syllabusRepository.save(syllabus);
  }

  // Enroll a student in a course
  async enrollStudent(courseId: string, student: User): Promise<Enrollment> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const enrollment = this.enrollmentRepository.create({
      student,
      course,
      status: 'pending',
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  // Approve or reject student enrollment
  async updateEnrollmentStatus(enrollmentId: string, status: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.status = status;
    return await this.enrollmentRepository.save(enrollment);
  }

  // Generate course recommendations based on student interests
  async recommendCourses(interests: string[]): Promise<any> {
    return await this.aiService.recommendCourses(interests);
  }

  // Generate syllabus for a course
  async generateSyllabus(topic: string): Promise<any> {
    return await this.aiService.generateSyllabus(topic);
  }
}
