import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

class CustomerCarDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  model!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  plateNumber!: string;
}

class CustomerLocationDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address!: string;
}

@Controller('customer-data')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
export class CustomerDataController {
  constructor(private readonly usersService: UsersService) {}

  @Get('cars')
  async getCars(@Req() req: any) {
    return this.usersService.getCustomerCars(req.user.id);
  }

  @Post('cars')
  async addCar(@Req() req: any, @Body() body: CustomerCarDto) {
    const model = body.model?.trim();
    const plateNumber = body.plateNumber?.trim();
    if (!model || !plateNumber) {
      throw new BadRequestException('model and plateNumber are required');
    }
    return this.usersService.addCustomerCar(req.user.id, model, plateNumber);
  }

  @Patch('cars/:id')
  async updateCar(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: CustomerCarDto,
  ) {
    const existing = (await this.usersService.getCustomerCars(req.user.id)).find((car) => car.id === id);
    if (!existing) {
      throw new BadRequestException('Car not found');
    }
    return this.usersService.updateCustomerCar(
      req.user.id,
      id,
      body.model?.trim() || existing.model,
      body.plateNumber?.trim() || existing.plateNumber,
    );
  }

  @Delete('cars/:id')
  async deleteCar(@Req() req: any, @Param('id') id: string) {
    await this.usersService.deleteCustomerCar(req.user.id, id);
    return { ok: true };
  }

  @Get('locations')
  async getLocations(@Req() req: any) {
    return this.usersService.getCustomerLocations(req.user.id);
  }

  @Post('locations')
  async addLocation(@Req() req: any, @Body() body: CustomerLocationDto) {
    const label = body.label?.trim();
    const address = body.address?.trim();
    if (!label || !address) {
      throw new BadRequestException('label and address are required');
    }
    return this.usersService.addCustomerLocation(req.user.id, address, undefined, undefined, label);
  }

  @Patch('locations/:id')
  async updateLocation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: CustomerLocationDto,
  ) {
    const existing = (await this.usersService.getCustomerLocations(req.user.id)).find(
      (location) => location.id === id,
    );
    if (!existing) {
      throw new BadRequestException('Location not found');
    }
    return this.usersService.updateCustomerLocation(
      req.user.id,
      id,
      body.address?.trim() || existing.address,
      undefined,
      undefined,
      body.label?.trim() || existing.label,
    );
  }

  @Delete('locations/:id')
  async deleteLocation(@Req() req: any, @Param('id') id: string) {
    await this.usersService.deleteCustomerLocation(req.user.id, id);
    return { ok: true };
  }
}
