import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { AssignmentModule } from './assignments/assignments.module';
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
import { AuthMiddleware } from './auth/middleware';
import * as cors from 'cors';  // Using 'cors' for CORS middleware
import { Assignment } from './assignments/entities/assignment.entity';
import { AuditLog } from './audit-log/entities/audit-log.entity';
import { AuditLogModule } from './audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'edumanagepro',
      entities: [Course, Enrollment, Syllabus, User, Role, Assignment, AuditLog],
      synchronize: true,
    }),
    AuditLogModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    AssignmentModule,
    RoleModule,
    AiModule,
    SyllabusModule,
    EnrollmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply CORS middleware first
    consumer
      .apply(cors())
      .forRoutes('*'); // Apply CORS to all routes

    // Apply AuthMiddleware for all routes except specified exclusions
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/users/signup', method: RequestMethod.POST },
        { path: '/users/login', method: RequestMethod.POST },
        { path: '/users/reset-password/:token', method: RequestMethod.POST },
        { path: '/role/register', method: RequestMethod.POST },
      )
      .forRoutes('*'); // Apply AuthMiddleware to all other routes
  }
}
