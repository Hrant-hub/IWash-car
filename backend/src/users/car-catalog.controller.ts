import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class CarCatalogController {
  constructor(private readonly usersService: UsersService) {}

  @Get('car-brands')
  async getCarBrands() {
    return this.usersService.getCarBrands();
  }

  @Get('car-models/:brandId')
  async getCarModels(@Param('brandId') brandId: string) {
    const id = Number(brandId);
    if (!Number.isInteger(id) || id <= 0) {
      return [];
    }
    return this.usersService.getCarModelsByBrand(id);
  }
}

