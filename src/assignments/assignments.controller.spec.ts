import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentController } from './assignments.controller';
import { AssignmentService } from './assignments.service';


describe('AssignmentsController', () => {
  let controller: AssignmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentController],
      providers: [AssignmentService],
    }).compile();

    controller = module.get<AssignmentController>(AssignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
