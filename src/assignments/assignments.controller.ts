import { Controller, Post, Body, Put, Get, Query } from '@nestjs/common';
import { CreateAssignmentDto, GetAssignmentsDto } from './dto/create-assignment.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AssignmentService } from './assignments.service';
import { UpdateAssignmentGradeDto } from './dto/update-assignment.dto';


@ApiSecurity('auth-token')
@ApiTags('Assignments')
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) { }

  // Endpoint to create a new assignment
  @Post()
  async createAssignment(
    @Body() createAssignmentDto: CreateAssignmentDto
  ) {
    const assignment = await this.assignmentService.createAssignment(createAssignmentDto);
    return {
      statusCode: 201,
      message: 'Assignment created successfully',
      data: assignment,
    };
  }

  // Endpoint to update the grade of an assignment
  @Put('grade')
  async updateAssignmentGrade(
    @Body() updateAssignmentGradeDto: UpdateAssignmentGradeDto
  ) {
    const updatedAssignment = await this.assignmentService.updateGrade(updateAssignmentGradeDto);
    return {
      statusCode: 200,
      message: 'Grade updated successfully',
      data: updatedAssignment,
    };
  }

  @Get('')
  async getCourses(@Query() getAssignmentsDto: GetAssignmentsDto) {
    try {
      return await this.assignmentService.getAssignments(getAssignmentsDto);
    } catch (error) {
      throw error;
    }
  }
}
