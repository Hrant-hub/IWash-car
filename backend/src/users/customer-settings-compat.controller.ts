import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

class CompatCardDto {
  @IsString()
  @Matches(/^\d{12,19}$/)
  cardNumber!: string;

  @IsString()
  @Matches(/^\d{2}\/\d{2}$/)
  expiry!: string;

  @IsString()
  @Matches(/^\d{3,4}$/)
  cvc!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  holderName!: string;
}

class CompatCarDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  model!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  plateNumber!: string;
}

class CompatLocationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
export class CustomerSettingsCompatController {
  constructor(private readonly usersService: UsersService) {}

  @Get('cards')
  getCards(@Req() req: any) {
    return this.usersService.getCustomerCards(req.user.id);
  }

  @Post('cards')
  async addCard(@Req() req: any, @Body() body: CompatCardDto) {
    const cardNumber = (body.cardNumber || '').replace(/\s+/g, '');
    const holderName = body.holderName?.trim() || '';
    const expiry = body.expiry?.trim() || '';
    const cvc = (body.cvc || '').trim();
    const [monthRaw, yearRaw] = expiry.split('/');
    const expiryMonth = Number(monthRaw);
    const expiryYear = Number(yearRaw?.length === 2 ? `20${yearRaw}` : yearRaw);
    if (!/^\d{12,19}$/.test(cardNumber) || !holderName || !/^\d{3,4}$/.test(cvc)) {
      throw new BadRequestException('Invalid card payload');
    }
    if (!Number.isInteger(expiryMonth) || expiryMonth < 1 || expiryMonth > 12 || !Number.isInteger(expiryYear)) {
      throw new BadRequestException('Invalid expiry');
    }
    const brand = cardNumber.startsWith('4') ? 'visa' : 'mastercard';
    const card = await this.usersService.addCustomerCard(req.user.id, {
      brand,
      last4: cardNumber.slice(-4),
      expiryMonth,
      expiryYear,
      holderName,
    });
    const cards = await this.usersService.getCustomerCards(req.user.id);
    return { card, cards };
  }

  @Delete('cards/:id')
  async deleteCard(@Req() req: any, @Param('id') id: string) {
    await this.usersService.deleteCustomerCard(req.user.id, id);
    const cards = await this.usersService.getCustomerCards(req.user.id);
    return { cards };
  }

  @Get('cars')
  getCars(@Req() req: any) {
    return this.usersService.getCustomerCars(req.user.id);
  }

  @Post('cars')
  async addCar(@Req() req: any, @Body() body: CompatCarDto) {
    const model = body.model?.trim();
    const plateNumber = body.plateNumber?.trim();
    if (!model || !plateNumber) throw new BadRequestException('model and plateNumber are required');
    const car = await this.usersService.addCustomerCar(req.user.id, model, plateNumber);
    const cars = await this.usersService.getCustomerCars(req.user.id);
    return { car, cars };
  }

  @Delete('cars/:id')
  async deleteCar(@Req() req: any, @Param('id') id: string) {
    await this.usersService.deleteCustomerCar(req.user.id, id);
    const cars = await this.usersService.getCustomerCars(req.user.id);
    return { cars };
  }

  @Get('locations')
  getLocations(@Req() req: any) {
    return this.usersService.getCustomerLocations(req.user.id);
  }

  @Post('locations')
  async addLocation(@Req() req: any, @Body() body: CompatLocationDto) {
    const address = body.address?.trim();
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (!address || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('address, lat and lng are required');
    }
    const location = await this.usersService.addCustomerLocation(req.user.id, address, lat, lng);
    const locations = await this.usersService.getCustomerLocations(req.user.id);
    return { location, locations };
  }

  @Delete('locations/:id')
  async deleteLocation(@Req() req: any, @Param('id') id: string) {
    await this.usersService.deleteCustomerLocation(req.user.id, id);
    const locations = await this.usersService.getCustomerLocations(req.user.id);
    return { locations };
  }
}
