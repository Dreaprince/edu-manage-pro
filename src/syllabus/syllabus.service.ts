import { Injectable } from '@nestjs/common';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { UpdateSyllabusDto } from './dto/update-syllabus.dto';

@Injectable()
export class SyllabusService {
  create(createSyllabusDto: CreateSyllabusDto) {
    return 'This action adds a new syllabus';
  }

  findAll() {
    return `This action returns all syllabus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} syllabus`;
  }

  update(id: number, updateSyllabusDto: UpdateSyllabusDto) {
    return `This action updates a #${id} syllabus`;
  }

  remove(id: number) {
    return `This action removes a #${id} syllabus`;
  }
}
