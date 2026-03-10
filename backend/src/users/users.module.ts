import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CustomerCar } from './customer-car.entity';
import { CustomerLocation } from './customer-location.entity';
import { CustomerCard } from './customer-card.entity';
import { CarBrand } from './car-brand.entity';
import { CarModel } from './car-model.entity';
import { UsersService } from './users.service';
import { CustomerDataController } from './customer-data.controller';
import { CustomerSettingsController } from './customer-settings.controller';
import { CustomerSettingsCompatController } from './customer-settings-compat.controller';
import { CarCatalogController } from './car-catalog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, CustomerCar, CustomerLocation, CustomerCard, CarBrand, CarModel])],
  controllers: [CustomerSettingsController, CustomerSettingsCompatController, CustomerDataController, CarCatalogController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
