import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Course } from 'src/courses/entities/course.entity';  // Assuming your Course entity is at this path

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Unique identifier for the assignment

  @ManyToOne(() => Course, (course) => course.enrollments)
  @JoinColumn({ name: 'courseId' })
  course: Course; // Foreign key to the Course entity

  @Column()
  studentId: string; // Store the studentId (no need for a full relationship with User)

  @Column({ nullable: true })
  file: string; // Path or URL to the uploaded file

  @Column('decimal', { nullable: true })
  grade: number; // Grade for the assignment

  @CreateDateColumn()
  createdAt: Date; // Timestamp for when the assignment was created

  @UpdateDateColumn()
  updatedAt: Date; // Timestamp for when the assignment was last updated
}


