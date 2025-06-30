import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';  // Lecturer reference
import { Syllabus } from 'src/syllabus/entities/syllabus.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';


@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  credits: number;

  @ManyToOne(() => User, (user) => user.course)
  lecturer: User;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  // Updated to store syllabus as an array of strings
  @Column('simple-array', { nullable: true })
  syllabus: string[]; // Storing syllabus as an array of strings

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


