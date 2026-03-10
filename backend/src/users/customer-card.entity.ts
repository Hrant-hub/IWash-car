import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('customer_cards')
export class CustomerCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  customerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ type: 'nvarchar', length: 20 })
  brand: string;

  @Column({ type: 'nvarchar', length: 4 })
  last4: string;

  @Column({ type: 'int' })
  expiryMonth: number;

  @Column({ type: 'int' })
  expiryYear: number;

  @Column({ type: 'nvarchar', length: 80 })
  holderName: string;

  @Column({ type: 'bit', default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
