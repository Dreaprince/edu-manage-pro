import { Controller, Get, Query } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { GetEnrollmentsDto } from './dto/create-enrollment.dto';
import { ApiSecurity } from '@nestjs/swagger';


@ApiSecurity('auth-token')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

   @Get('')
   async getCourses(@Query() getEnrollmentsDto: GetEnrollmentsDto,) {
     try {
       return await this.enrollmentService.getEnrollments(getEnrollmentsDto);
     } catch (error) {
       throw error;
     }
   }
}
