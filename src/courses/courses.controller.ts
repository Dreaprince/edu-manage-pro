// src/courses/courses.controller.ts

import { Controller, Post, Get, Param, Body, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { FileInterceptor } from '@nestjs/platform-express'; // File upload handling
import { ApiSecurity, } from '@nestjs/swagger';
import { Request } from 'express';




@ApiSecurity('auth-token')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }



  // Create or update course (Lecturer)
  @Post('create')
  async createCourse(@Body() courseDetails: any, @Req() req: Request) {
    try {
      return this.coursesService.createOrUpdateCourse(courseDetails, req);
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
  @Post(':courseId/enroll')
  async enrollStudent(@Param('courseId') courseId: string, @Req() req: Request) {
    try {
      return this.coursesService.enrollStudent(courseId, req);
    } catch (error) {
      throw error;
    }
  }

  // Approve or reject student enrollment (Admin)
  @Post(':enrollmentId/status')
  async updateEnrollmentStatus(@Param('enrollmentId') enrollmentId: string, @Req() req: Request) {
    try {
      return this.coursesService.updateEnrollmentStatus(enrollmentId, req);
    } catch (error) {
      throw error;
    }
  }

  // Get course recommendations (AI)
  @Post('recommend')
  async recommendCourses(@Body() body: { interests: string[] }) {
    try {
      return this.coursesService.recommendCourses(body.interests);
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
