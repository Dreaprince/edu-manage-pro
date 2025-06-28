import { Course } from 'src/courses/entities/course.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity()
export class Syllabus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filePath: string;  // File path for syllabus upload (PDF or DOCX)

  @ManyToOne(() => Course, (course) => course.syllabus)
  course: Course;
}

