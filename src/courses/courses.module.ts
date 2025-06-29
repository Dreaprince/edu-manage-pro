import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import { Syllabus } from 'src/syllabus/entities/syllabus.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { AiModule } from 'src/ai/ai.module';
import { AiService } from 'src/ai/ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, User, Syllabus, Enrollment]), 
    AiModule,  
  ],
  controllers: [CoursesController],
  providers: [CoursesService, AiService],  
})
export class CoursesModule {}
