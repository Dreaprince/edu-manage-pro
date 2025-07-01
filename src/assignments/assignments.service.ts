import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto, GetAssignmentsDto } from './dto/create-assignment.dto';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity'; // Assuming you have User entity
import { UpdateAssignmentGradeDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  // Method to create an assignment
  async createAssignment(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const { courseId, studentId, file, grade } = createAssignmentDto;

    // Find the course and student
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const student = await this.userRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Create and save the assignment
    const assignment = this.assignmentRepository.create({
      course,
      studentId,
      file,
      grade,
    });

    return await this.assignmentRepository.save(assignment);
  }

  // Method to update an assignment's grade
  async updateGrade(updateAssignmentGradeDto: UpdateAssignmentGradeDto): Promise<Assignment> {
    const { assignmentId, grade } = updateAssignmentGradeDto;

    // Find the assignment
    const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Update the grade
    assignment.grade = grade;
    return await this.assignmentRepository.save(assignment);
  }

  async getAssignments(dto: GetAssignmentsDto): Promise<any> {
    try {
      const { courseId } = dto;

      const query = this.assignmentRepository
        .createQueryBuilder('assignment')
        .leftJoin('assignment.course', 'course')
        .addSelect(['course.id', 'student.title']);

      // Optional: If you want to select specific fields only, use addSelect

      if (courseId) {
        query.andWhere('course.id = :courseId', { courseId });
      }

      const assignments = await query.getMany();

      return {
        statusCode: '00',
        message: 'Assignments fetched successfully',
        data: assignments,
      };
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }



}
