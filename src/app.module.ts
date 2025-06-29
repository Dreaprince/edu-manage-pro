import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { RoleModule } from './role/role.module';
import { AiModule } from './ai/ai.module';
import { SyllabusModule } from './syllabus/syllabus.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { Course } from './courses/entities/course.entity';
import { User } from './users/entities/user.entity';
import { Enrollment } from './enrollment/entities/enrollment.entity';
import { Syllabus } from './syllabus/entities/syllabus.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Course, Enrollment, Syllabus, User, Role],
      synchronize: true
    }),
    AuthModule, 
    UsersModule, 
    CoursesModule, 
    AssignmentsModule, 
    RoleModule, 
    AiModule, 
    SyllabusModule, 
    EnrollmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
