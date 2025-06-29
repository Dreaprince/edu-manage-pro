import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity'; // Assuming User entity
import { AssignmentController } from './assignments.controller';
import { AssignmentService } from './assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, Course, User])],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
export class AssignmentModule {}
