import { Controller, Post, Get, Param, Body, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { FileInterceptor } from '@nestjs/platform-express'; // File upload handling
import { ApiSecurity, } from '@nestjs/swagger';
import { Request } from 'express';
import { EnrollStudentDto, RecommendDto, UpdateEnrollmentStatusDto } from './dto/create-course.dto';




@ApiSecurity('auth-token')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }



  // Create or update course (Lecturer)
  @Post('create')
  async createCourse(@Body() courseDetails: any, @Req() req: Request) {
    try {
      return this.coursesService.createCourse(courseDetails, req);
    } catch (error) {
      throw error;
    }
  }

  // Upload syllabus for a course (Lecturer)
  @Post(':courseId/syllabus')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSyllabus(@Param('courseId') courseId: string, @UploadedFile() file: Express.Multer.Filel, @Req() req: Request) {
    try {
      const filePath = `uploads/syllabus/${file.filename}`;
      return this.coursesService.uploadSyllabus(courseId, filePath);
    } catch (error) {
      throw error;
    }
  }

  // Enroll student in a course student
  @Post('/enroll')
  async enrollStudent(@Body() enrollStudentDto: EnrollStudentDto, @Req() req: Request) {
    try {
      return this.coursesService.enrollStudent(enrollStudentDto, req);
    } catch (error) {
      throw error;
    }
  }

  // Approve or reject student enrollment (Admin)
  @Post('/enrollment/status')
  async updateEnrollmentStatus(@Body() updateEnrollmentStatusDto: UpdateEnrollmentStatusDto, @Req() req: Request) {
    try {
      return this.coursesService.updateEnrollmentStatus(updateEnrollmentStatusDto, req);
    } catch (error) {
      throw error;
    }
  }

  // Get course recommendations (AI)
  @Post('recommend')
  async recommendCourses(@Body() recommendDto: RecommendDto) {
    try {
      return this.coursesService.recommendCourses(recommendDto);
    } catch (error) {
      throw error;
    }
  }

  // Generate syllabus for a course (AI)
  @Post('syllabus')
  async generateSyllabus(@Body() body: { topic: string }) {
    try {
      return this.coursesService.generateSyllabus(body.topic);
    } catch (error) {
      throw error;
    }
  }
}
