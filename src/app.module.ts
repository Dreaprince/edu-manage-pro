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

@Module({
  imports: [AuthModule, UsersModule, CoursesModule, AssignmentsModule, RoleModule, AiModule, SyllabusModule, EnrollmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
