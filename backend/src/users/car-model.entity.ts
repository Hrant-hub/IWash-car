import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CarBrand } from './car-brand.entity';

@Entity('car_models')
export class CarModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 100 })
  name: string;

  @Column()
  brandId: number;

  @ManyToOne(() => CarBrand, (brand) => brand.models, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brandId' })
  brand: CarBrand;
}

