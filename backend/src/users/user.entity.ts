import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ length: 20, default: 'none' })
  role: 'customer' | 'helper' | 'none';

  @Column({ default: false })
  active: boolean;

  @Column({ type: 'float', nullable: true })
  lat: number | null;

  @Column({ type: 'float', nullable: true })
  lng: number | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  carModel: string | null;

  @Column({ nullable: true })
  carBrandId: number | null;

  @Column({ nullable: true })
  carModelId: number | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  plateNumber: string | null;

  @Column({ default: false })
  termsAccepted: boolean;

  @Column({ type: 'datetime2', nullable: true })
  termsAcceptedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
