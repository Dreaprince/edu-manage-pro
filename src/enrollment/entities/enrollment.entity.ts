import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; 
import { Course } from 'src/courses/entities/course.entity';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, (course) => course.enrollments)
  course: Course;

  @ManyToOne(() => User, (user) => user.enrollments)
  student: User;

  @Column({ default: 'pending' }) 
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;
}


