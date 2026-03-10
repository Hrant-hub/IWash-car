import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
declare class RegisterDto {
    email: string;
    password: string;
    termsAccepted: boolean;
}
declare class GoogleLoginDto {
    token: string;
}
declare class SetRoleDto {
    role: 'customer' | 'helper';
}
declare class CompleteProfileDto {
    brandId: number;
    modelId: number;
    plateNumber: string;
}
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(body: LoginDto): Promise<{
        access_token: string;
        user: import("./auth.service").AuthUser;
    }>;
    register(body: RegisterDto): Promise<{
        access_token: string;
        user: import("./auth.service").AuthUser;
    }>;
    google(body: GoogleLoginDto): Promise<{
        access_token: string;
        user: import("./auth.service").AuthUser;
    }>;
    setRole(body: SetRoleDto, req: any): Promise<{
        access_token: string;
        user: import("./auth.service").AuthUser;
    }>;
    me(req: any): Promise<import("./auth.service").AuthUser>;
    completeCustomerProfile(body: CompleteProfileDto, req: any): Promise<{
        access_token: string;
        user: import("./auth.service").AuthUser;
    }>;
}
export {};
