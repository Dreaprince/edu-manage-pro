import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { Course } from '../../courses/entities/course.entity'; 
import * as crypto from 'crypto';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column('varchar', { nullable: true, length: 255 })
  password: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student) // Enrollment relationship
  enrollments: Enrollment[];

  @ManyToOne(() => Course, { nullable: true })  // Nullable if the user is not a lecturer
  @JoinColumn({ name: 'lecturerId' })  // Lecturer can be associated with a course
  course: Course;  // Courses the user is a lecturer for

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ default: true })
  passwordReset: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' })
  passwordChangedAt: Date;

  @Column({ nullable: true })
  passwordResetString: string;

  @Column({ length: 512, nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  // Utility method for password reset token
  createPasswordResetToken(): string {
    const resetToken: string = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = resetToken;
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    return resetToken;
  }
}
