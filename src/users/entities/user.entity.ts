import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import * as crypto from 'crypto';



@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column('varchar', { length: 15 })
    phoneNumber: string;

    @Column()
    name: string;

    @Column('varchar', { length: 255 })
    address: string;

    @Column('varchar', { length: 255 })
    lga: string;

    @Column('varchar', { length: 255 })
    stateOfOrigin: string;

    @Column('varchar', { length: 255 })
    country: string;

    @Column('varchar', { nullable: true, length: 255 })
    password: string;

    @ManyToOne(() => Role, { eager: true })
    @JoinColumn({ name: 'roleId' })
    role: Role;

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

