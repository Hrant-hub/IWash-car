"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const class_validator_1 = require("class-validator");
class LoginDto {
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RegisterDto {
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "termsAccepted", void 0);
class GoogleLoginDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GoogleLoginDto.prototype, "token", void 0);
class SetRoleDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['customer', 'helper']),
    __metadata("design:type", String)
], SetRoleDto.prototype, "role", void 0);
class CompleteProfileDto {
}
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CompleteProfileDto.prototype, "brandId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CompleteProfileDto.prototype, "modelId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "plateNumber", void 0);
let AuthController = class AuthController {
    constructor(auth) {
        this.auth = auth;
    }
    async login(body) {
        const user = await this.auth.validateUser(body.email, body.password);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.auth.login(user);
    }
    async register(body) {
        if (body.termsAccepted !== true) {
            throw new common_1.BadRequestException('Terms must be accepted');
        }
        const user = await this.auth.register(body.email, body.password, body.termsAccepted);
        return this.auth.login(user);
    }
    async google(body) {
        if (!body.token?.trim()) {
            throw new common_1.BadRequestException('Google token is required');
        }
        const user = await this.auth.googleLogin(body.token.trim());
        return this.auth.login(user);
    }
    async setRole(body, req) {
        const user = await this.auth.setRole(req.user.id, body.role);
        return this.auth.login(user);
    }
    async me(req) {
        return this.auth.getMe(req.user.id);
    }
    async completeCustomerProfile(body, req) {
        if (req.user.role !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can update car info');
        }
        if (!body.plateNumber?.trim()) {
            throw new common_1.BadRequestException('plateNumber is required');
        }
        if (body.plateNumber.trim().length < 5) {
            throw new common_1.BadRequestException('plateNumber must be at least 5 characters');
        }
        const brandId = Number(body.brandId);
        const modelId = Number(body.modelId);
        const user = await this.auth.completeCustomerProfile(req.user.id, brandId, modelId, body.plateNumber.trim());
        return this.auth.login(user);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('google'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GoogleLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "google", null);
__decorate([
    (0, common_1.Put)('role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SetRoleDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setRole", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Put)('car-info'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CompleteProfileDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completeCustomerProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map