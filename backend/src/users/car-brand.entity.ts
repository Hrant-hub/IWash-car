import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CarModel } from './car-model.entity';

@Entity('car_brands')
export class CarBrand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 80, unique: true })
  name: string;

  @OneToMany(() => CarModel, (model) => model.brand)
  models: CarModel[];
}

