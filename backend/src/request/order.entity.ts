import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type OrderStatus = 'completed' | 'cancelled';
export interface OrderChatMessage {
  senderId: string;
  senderRole: 'customer' | 'helper';
  text: string;
  timestamp: number;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  requestId: string;

  @Column({ type: 'uniqueidentifier' })
  customerId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  helperId: string | null;

  @Column({ length: 20 })
  status: OrderStatus;

  @Column({ type: 'float' })
  customerLat: number;

  @Column({ type: 'float' })
  customerLng: number;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  customerAddress: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  customerCarModel: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  customerPlateNumber: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  paymentMethod: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  helperName: string | null;

  @Column({ type: 'float', nullable: true })
  helperDistanceKm: number | null;

  @Column({ type: 'int', nullable: true })
  helperEtaMinutes: number | null;

  @Column({ type: 'simple-json', nullable: true })
  conversation: OrderChatMessage[] | null;

  @Column({ type: 'datetime2', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

