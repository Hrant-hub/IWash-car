import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RequestService } from './request.service';
import { Get } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

class RequestHelpDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  carModel!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  plateNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  paymentMethod!: string;
}

class CancelRequestDto {
  @IsString()
  @IsNotEmpty()
  requestId!: string;
}

@Controller('request')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestController {
  constructor(private request: RequestService) {}

  @Post('help')
  @Roles('customer')
  requestHelp(
    @Body() body: RequestHelpDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.request.requestHelp(req.user.id, body.lat, body.lng, {
      address: body.address,
      carModel: body.carModel,
      plateNumber: body.plateNumber,
      paymentMethod: body.paymentMethod,
    });
  }

  @Post('cancel')
  @Roles('customer')
  cancelRequest(
    @Body() body: CancelRequestDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.request.cancelByCustomer(body.requestId, req.user.id);
  }

  @Get('history/customer')
  @Roles('customer')
  getCustomerHistory(@Req() req: { user: { id: string } }) {
    return this.request.getCustomerHistory(req.user.id);
  }

  @Get('history/helper')
  @Roles('helper')
  getHelperHistory(@Req() req: { user: { id: string } }) {
    return this.request.getHelperHistory(req.user.id);
  }
}
