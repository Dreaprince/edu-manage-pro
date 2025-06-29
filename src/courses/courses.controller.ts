import { Controller, Post, Body, Req, UploadedFile, UseInterceptors, Patch, BadRequestException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { FileInterceptor } from '@nestjs/platform-express'; // File upload handling
import { ApiSecurity, } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateCourseDto, EnrollStudentDto, GenerateSyllabusDto, RecommendDto, UpdateEnrollmentStatusDto, UploadSyllabusDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBody, ApiConsumes, } from '@nestjs/swagger';
import { Express } from 'express';




@ApiSecurity('auth-token')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }



  // Create or update course (Lecturer)
  @Post('/create')
  async createCourse(@Body() createCourseDto: CreateCourseDto, @Req() req: Request) {
    try {
      return this.coursesService.createCourse(createCourseDto, req);
    } catch (error) {
      throw error;
    }
  }

  @Patch('/update')
  async updateCourse(@Body() updateCourseDto: UpdateCourseDto, @Req() req: Request) {
    try {
      return this.coursesService.updateCourse(updateCourseDto, req);
    } catch (error) {
      throw error;
    }
  }


  @Post('/update/syllabus')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        courseId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB file size limit
      },
      dest: './uploads',  // Destination for file storage
    }),
  )
  async uploadSyllabus(
    @Body() uploadSyllabusDto: UploadSyllabusDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      // Check if the file is available
      if (!file) {
        throw new BadRequestException('File is missing or invalid');
      }

      // Validate file type (only PDF or DOCX)
      const allowedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedFileTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only PDF and DOCX files are allowed');
      }

      // Set the file path in the DTO
      uploadSyllabusDto.file = file;  // Attach the file to the DTO
      return await this.coursesService.uploadSyllabus(uploadSyllabusDto);  // Call the service to save
    } catch (error) {
      throw error;  // Rethrow the error to be handled by a global exception filter
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
  @Post('/recommend')
  async recommendCourses(@Body() recommendDto: RecommendDto) {
    try {
      return this.coursesService.recommendCourses(recommendDto);
    } catch (error) {
      throw error;
    }
  }

  // Generate syllabus for a course (AI)
  @Post('/syllabus')
  async generateSyllabus(@Body() generateSyllabusDto: GenerateSyllabusDto) {
    try {
      return this.coursesService.generateSyllabus(generateSyllabusDto);
    } catch (error) {
      throw error;
    }
  }
}
