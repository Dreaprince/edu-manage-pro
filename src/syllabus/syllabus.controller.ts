import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SyllabusService } from './syllabus.service';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { UpdateSyllabusDto } from './dto/update-syllabus.dto';

@Controller('syllabus')
export class SyllabusController {
  constructor(private readonly syllabusService: SyllabusService) {}

  @Post()
  create(@Body() createSyllabusDto: CreateSyllabusDto) {
    return this.syllabusService.create(createSyllabusDto);
  }

  @Get()
  findAll() {
    return this.syllabusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.syllabusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSyllabusDto: UpdateSyllabusDto) {
    return this.syllabusService.update(+id, updateSyllabusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.syllabusService.remove(+id);
  }
}
