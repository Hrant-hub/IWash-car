import { BadRequestException, Body, Controller, ForbiddenException, Get, Post, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService, UserRole } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsBoolean, IsEmail, IsIn, IsInt, IsNotEmpty, IsString, MaxLength, Min, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsBoolean()
  termsAccepted!: boolean;
}

class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

class SetRoleDto {
  @IsString()
  @IsIn(['customer', 'helper'])
  role!: 'customer' | 'helper';
}

class CompleteProfileDto {
  @IsInt()
  @Min(1)
  brandId!: number;

  @IsInt()
  @Min(1)
  modelId!: number;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  plateNumber!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.auth.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.auth.login(user);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (body.termsAccepted !== true) {
      throw new BadRequestException('Terms must be accepted');
    }
    const user = await this.auth.register(body.email, body.password, body.termsAccepted);
    return this.auth.login(user);
  }

  @Post('google')
  async google(@Body() body: GoogleLoginDto) {
    if (!body.token?.trim()) {
      throw new BadRequestException('Google token is required');
    }
    const user = await this.auth.googleLogin(body.token.trim());
    return this.auth.login(user);
  }

  @Put('role')
  @UseGuards(JwtAuthGuard)
  async setRole(@Body() body: SetRoleDto, @Req() req: any) {
    const user = await this.auth.setRole(req.user.id, body.role);
    return this.auth.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    return this.auth.getMe(req.user.id);
  }

  @Put('car-info')
  @UseGuards(JwtAuthGuard)
  async completeCustomerProfile(
    @Body() body: CompleteProfileDto,
    @Req() req: any,
  ) {
    if (req.user.role !== 'customer') {
      throw new ForbiddenException('Only customers can update car info');
    }
    if (!body.plateNumber?.trim()) {
      throw new BadRequestException('plateNumber is required');
    }
    if (body.plateNumber.trim().length < 5) {
      throw new BadRequestException('plateNumber must be at least 5 characters');
    }
    const brandId = Number(body.brandId);
    const modelId = Number(body.modelId);
    const user = await this.auth.completeCustomerProfile(
      req.user.id,
      brandId,
      modelId,
      body.plateNumber.trim(),
    );
    return this.auth.login(user);
  }
}
