import { Body, Controller, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { HelperService } from './helper.service';
import { IsBoolean, IsNumber } from 'class-validator';

class SetActiveDto {
  @IsBoolean()
  isActive!: boolean;
}

class UpdateLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

@Controller('helper')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('helper')
export class HelperController {
  constructor(private helper: HelperService) {}

  @Put('active')
  async setActive(@Body() body: SetActiveDto, @Req() req: any) {
    await this.helper.setActive(req.user.id, body.isActive);
    return { ok: true };
  }

  @Put('location')
  async updateLocation(@Body() body: UpdateLocationDto, @Req() req: any) {
    await this.helper.updateLocation(req.user.id, body.lat, body.lng);
    return { ok: true };
  }
}
