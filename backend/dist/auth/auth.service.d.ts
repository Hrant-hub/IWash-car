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
export declare class AuthService {
    private jwtService;
    private usersService;
    constructor(jwtService: JwtService, usersService: UsersService);
    validateUser(email: string, password: string): Promise<AuthUser | null>;
    login(user: AuthUser): Promise<{
        access_token: string;
        user: AuthUser;
    }>;
    register(email: string, password: string, termsAccepted: boolean): Promise<AuthUser>;
    googleLogin(googleToken: string): Promise<AuthUser>;
    setRole(userId: string, role: 'customer' | 'helper'): Promise<AuthUser>;
    getMe(userId: string): Promise<AuthUser>;
    completeCustomerProfile(userId: string, brandId: number, modelId: number, plateNumber: string): Promise<AuthUser>;
    private extractEmailFromGoogleToken;
}
