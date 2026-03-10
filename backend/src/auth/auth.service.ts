import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

export type UserRole = 'customer' | 'helper' | 'none';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  active?: boolean;
  carBrandId?: number | null;
  carModelId?: number | null;
  carModel?: string | null;
  plateNumber?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const valid = await this.usersService.validatePassword(user, password);
    if (!valid) return null;
    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      active: user.active,
      carBrandId: user.carBrandId,
      carModelId: user.carModelId,
      carModel: user.carModel,
      plateNumber: user.plateNumber,
    };
  }

  async login(user: AuthUser): Promise<{ access_token: string; user: AuthUser }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(email: string, password: string, termsAccepted: boolean): Promise<AuthUser> {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already exists');
    const user = await this.usersService.createUser(email, password, 'none', termsAccepted);
    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      active: user.active,
      carBrandId: user.carBrandId,
      carModelId: user.carModelId,
      carModel: user.carModel,
      plateNumber: user.plateNumber,
    };
  }

  async googleLogin(googleToken: string): Promise<AuthUser> {
    const email = this.extractEmailFromGoogleToken(googleToken);
    const existing = await this.usersService.findByEmail(email);
    const user =
      existing ??
      (await this.usersService.createUser(email, `google-${Date.now()}`, 'none', true));
    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      active: user.active,
      carBrandId: user.carBrandId,
      carModelId: user.carModelId,
      carModel: user.carModel,
      plateNumber: user.plateNumber,
    };
  }

  async setRole(userId: string, role: 'customer' | 'helper'): Promise<AuthUser> {
    await this.usersService.updateRole(userId, role);
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      active: user.active,
      carBrandId: user.carBrandId,
      carModelId: user.carModelId,
      carModel: user.carModel,
      plateNumber: user.plateNumber,
    };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      active: user.active,
      carBrandId: user.carBrandId,
      carModelId: user.carModelId,
      carModel: user.carModel,
      plateNumber: user.plateNumber,
    };
  }

  async completeCustomerProfile(userId: string, brandId: number, modelId: number, plateNumber: string): Promise<AuthUser> {
    await this.usersService.updateCarInfo(userId, brandId, modelId, plateNumber);
    return this.getMe(userId);
  }

  private extractEmailFromGoogleToken(token: string): string {
    const parts = token.split('.');
    if (parts.length < 2) {
      throw new BadRequestException('Invalid Google token format');
    }
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8')) as {
        email?: string;
      };
      if (!payload.email) {
        throw new BadRequestException('Google token missing email');
      }
      return payload.email.toLowerCase();
    } catch {
      throw new BadRequestException('Invalid Google token payload');
    }
  }
}
