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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(jwtService, usersService) {
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user)
            return null;
        const valid = await this.usersService.validatePassword(user, password);
        if (!valid)
            return null;
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            active: user.active,
            carBrandId: user.carBrandId,
            carModelId: user.carModelId,
            carModel: user.carModel,
            plateNumber: user.plateNumber,
        };
    }
    async login(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
    async register(email, password, termsAccepted) {
        const existing = await this.usersService.findByEmail(email);
        if (existing)
            throw new common_1.ConflictException('Email already exists');
        const user = await this.usersService.createUser(email, password, 'none', termsAccepted);
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            active: user.active,
            carBrandId: user.carBrandId,
            carModelId: user.carModelId,
            carModel: user.carModel,
            plateNumber: user.plateNumber,
        };
    }
    async googleLogin(googleToken) {
        const email = this.extractEmailFromGoogleToken(googleToken);
        const existing = await this.usersService.findByEmail(email);
        const user = existing ??
            (await this.usersService.createUser(email, `google-${Date.now()}`, 'none', true));
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            active: user.active,
            carBrandId: user.carBrandId,
            carModelId: user.carModelId,
            carModel: user.carModel,
            plateNumber: user.plateNumber,
        };
    }
    async setRole(userId, role) {
        await this.usersService.updateRole(userId, role);
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            active: user.active,
            carBrandId: user.carBrandId,
            carModelId: user.carModelId,
            carModel: user.carModel,
            plateNumber: user.plateNumber,
        };
    }
    async getMe(userId) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            active: user.active,
            carBrandId: user.carBrandId,
            carModelId: user.carModelId,
            carModel: user.carModel,
            plateNumber: user.plateNumber,
        };
    }
    async completeCustomerProfile(userId, brandId, modelId, plateNumber) {
        await this.usersService.updateCarInfo(userId, brandId, modelId, plateNumber);
        return this.getMe(userId);
    }
    extractEmailFromGoogleToken(token) {
        const parts = token.split('.');
        if (parts.length < 2) {
            throw new common_1.BadRequestException('Invalid Google token format');
        }
        try {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (!payload.email) {
                throw new common_1.BadRequestException('Google token missing email');
            }
            return payload.email.toLowerCase();
        }
        catch {
            throw new common_1.BadRequestException('Invalid Google token payload');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map