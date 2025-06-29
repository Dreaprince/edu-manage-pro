
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { User } from '../users/entities/user.entity';  // Lecturer reference
import { AiService } from '../ai/ai.service';
import { Request } from 'express';
import { CreateCourseDto, EnrollStudentDto, GenerateSyllabusDto, RecommendDto, UpdateEnrollmentStatusDto, UploadSyllabusDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Syllabus } from 'src/syllabus/entities/syllabus.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';



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

      // Create the course object with the provided details
      const course = this.courseRepository.create({
        title: createCourseDto.title,
        credits: createCourseDto.credits,
        syllabus: createCourseDto.syllabus,
        lecturer, // Lecturer is already a full entity
      });

      // If enrollments are provided, process them
      if (createCourseDto.enrollments && createCourseDto.enrollments.length > 0) {
        const enrollments = [];
        for (const studentId of createCourseDto.enrollments) {
          // Find the student by ID
          const student = await this.userRepository.findOne({ where: { id: studentId } });
          if (!student) {
            throw new NotFoundException(`Student with ID ${studentId} not found`);
          }

          // Create the Enrollment entity for each student
          const enrollment = this.enrollmentRepository.create({
            student, // The student entity
            course, // The course entity
          });

          enrollments.push(enrollment);
        }

        // Attach the enrollments to the course
        course.enrollments = enrollments;
      }

      // Save the course to the database, including the lecturer and enrollments
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
      course.credits = updateCourseDto.credits || course.credits;

      // Save the updated course
      const updatedCourse = await this.courseRepository.save(course);

      return {
        statusCode: "00",
        message: 'Course updated successful',
        data: updatedCourse,
      };
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }


  // Upload syllabus for a course
  async uploadSyllabus(uploadSyllabusDto: UploadSyllabusDto): Promise<any> {
    try {
      const course = await this.courseRepository.findOne({ where: { id: uploadSyllabusDto.courseId } });
      if (!course) {
        throw new ConflictException('Course not found');
      }

      // Define file path (assuming the file is saved under './uploads')
      const filePath = `./uploads/${uploadSyllabusDto.file.filename}`;

      // Create a new syllabus entry
      const syllabus = this.syllabusRepository.create({
        filePath,  // Save the file path in the database
        course,
      });

      // Save the syllabus record in the database
      const savedSyllabus = await this.syllabusRepository.save(syllabus);
      return {
        statusCode: '00',
        message: 'Syllabus uploaded successfully',
        data: savedSyllabus,
      };
    } catch (error) {
      console.error('Error creating Syllabus:', error);
      throw error;  // Rethrow the error
    }
  }

  // Enroll a student in a course
  async enrollStudent(enrollStudentDto: EnrollStudentDto, req: Request): Promise<any> {
    try {
      // Extract the role from the decoded JWT token
      const userRole = req?.decoded?.role;
      if (userRole !== 'student') {
        throw new ForbiddenException('Only students are allowed to enroll in courses.');
      }

      // Fetch the course based on courseId from the request
      const course = await this.courseRepository.findOne({ where: { id: enrollStudentDto.courseId } });
      if (!course) {
        throw new NotFoundException(`Course with ID ${enrollStudentDto.courseId} not found.`);
      }

      // Fetch the student based on studentId from the request
      const student = await this.userRepository.findOne({ where: { id: enrollStudentDto.studentId } });
      if (!student) {
        throw new NotFoundException(`Student with ID ${enrollStudentDto.studentId} not found.`);
      }

      // Create a new enrollment record
      const enrollment = this.enrollmentRepository.create({
        student,  // Set the student as the User entity
        course,   // Set the course as the Course entity
        status: 'pending',
      });

      // Save the new enrollment record in the database
      const savedEnrollment = await this.enrollmentRepository.save(enrollment);

      // Return a success response
      return {
        statusCode: '00', // Status code for success
        message: 'Enrollment successfully created.',
        data: savedEnrollment,
      };
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  }

  // Approve or reject student enrollment
  async updateEnrollmentStatus(updateEnrollmentStatusDto: UpdateEnrollmentStatusDto, req: Request): Promise<any> {
    try {
      const userRole = req?.decoded?.role;
      if (userRole !== 'admin') {
        throw new ForbiddenException('Only admin can update emrollment.');
      }

      const { status, enrollmentId } = updateEnrollmentStatusDto
      const enrollment = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } });
      if (!enrollment) {
        throw new NotFoundException('Enrollment not found');
      }

      enrollment.status = status;
      const updatedEnrollment = await this.enrollmentRepository.save(enrollment);
      return {
        statusCode: '00',
        message: 'Enrollment successfully updated.',
        data: updatedEnrollment,
      };
    } catch (error) {
      console.error('Error updating enrollment:', error);
      throw error;
    }
  }

  // Generate course recommendations based on student interests
  async recommendCourses(recommendDto: RecommendDto): Promise<any> {
    try {
      const recomendedCourse = await this.aiService.recommendCourses(recommendDto.interests);
      return {
        statusCode: '00',
        message: 'Course recomended successfully.',
        data: recomendedCourse,
      };
    } catch (error) {
      console.error('Error recomending course:', error);
      throw error;
    }
  }

  // Generate syllabus for a course
  async generateSyllabus(generateSyllabusDto: GenerateSyllabusDto): Promise<any> {
    try {
      const syllabusGenerated = await this.aiService.generateSyllabus(generateSyllabusDto.topic);
      return {
        statusCode: '00',
        message: 'Syllabus Generated successfully.',
        data: syllabusGenerated,
      };
    } catch (error) {
      console.error('Error generating Syllabus:', error);
      throw error;
    }
  }
}
