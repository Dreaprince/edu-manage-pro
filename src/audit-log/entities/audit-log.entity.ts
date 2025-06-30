import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AuditLog {
@PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  fullName: string;

  @Column()
  action: string; 

  @Column({ type: 'text' })
  newData: string; 

  
  @Column({ nullable: true }) 
  resource: string;

  @Column()
  role: string;
}
