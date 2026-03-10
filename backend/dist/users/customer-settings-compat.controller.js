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
exports.CustomerSettingsCompatController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const users_service_1 = require("./users.service");
const class_validator_1 = require("class-validator");
class CompatCardDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{12,19}$/),
    __metadata("design:type", String)
], CompatCardDto.prototype, "cardNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}\/\d{2}$/),
    __metadata("design:type", String)
], CompatCardDto.prototype, "expiry", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{3,4}$/),
    __metadata("design:type", String)
], CompatCardDto.prototype, "cvc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CompatCardDto.prototype, "holderName", void 0);
class CompatCarDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CompatCarDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CompatCarDto.prototype, "plateNumber", void 0);
class CompatLocationDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CompatLocationDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompatLocationDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompatLocationDto.prototype, "lng", void 0);
let CustomerSettingsCompatController = class CustomerSettingsCompatController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    getCards(req) {
        return this.usersService.getCustomerCards(req.user.id);
    }
    async addCard(req, body) {
        const cardNumber = (body.cardNumber || '').replace(/\s+/g, '');
        const holderName = body.holderName?.trim() || '';
        const expiry = body.expiry?.trim() || '';
        const cvc = (body.cvc || '').trim();
        const [monthRaw, yearRaw] = expiry.split('/');
        const expiryMonth = Number(monthRaw);
        const expiryYear = Number(yearRaw?.length === 2 ? `20${yearRaw}` : yearRaw);
        if (!/^\d{12,19}$/.test(cardNumber) || !holderName || !/^\d{3,4}$/.test(cvc)) {
            throw new common_1.BadRequestException('Invalid card payload');
        }
        if (!Number.isInteger(expiryMonth) || expiryMonth < 1 || expiryMonth > 12 || !Number.isInteger(expiryYear)) {
            throw new common_1.BadRequestException('Invalid expiry');
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
    async deleteCard(req, id) {
        await this.usersService.deleteCustomerCard(req.user.id, id);
        const cards = await this.usersService.getCustomerCards(req.user.id);
        return { cards };
    }
    getCars(req) {
        return this.usersService.getCustomerCars(req.user.id);
    }
    async addCar(req, body) {
        const model = body.model?.trim();
        const plateNumber = body.plateNumber?.trim();
        if (!model || !plateNumber)
            throw new common_1.BadRequestException('model and plateNumber are required');
        const car = await this.usersService.addCustomerCar(req.user.id, model, plateNumber);
        const cars = await this.usersService.getCustomerCars(req.user.id);
        return { car, cars };
    }
    async deleteCar(req, id) {
        await this.usersService.deleteCustomerCar(req.user.id, id);
        const cars = await this.usersService.getCustomerCars(req.user.id);
        return { cars };
    }
    getLocations(req) {
        return this.usersService.getCustomerLocations(req.user.id);
    }
    async addLocation(req, body) {
        const address = body.address?.trim();
        const lat = Number(body.lat);
        const lng = Number(body.lng);
        if (!address || !Number.isFinite(lat) || !Number.isFinite(lng)) {
            throw new common_1.BadRequestException('address, lat and lng are required');
        }
        const location = await this.usersService.addCustomerLocation(req.user.id, address, lat, lng);
        const locations = await this.usersService.getCustomerLocations(req.user.id);
        return { location, locations };
    }
    async deleteLocation(req, id) {
        await this.usersService.deleteCustomerLocation(req.user.id, id);
        const locations = await this.usersService.getCustomerLocations(req.user.id);
        return { locations };
    }
};
exports.CustomerSettingsCompatController = CustomerSettingsCompatController;
__decorate([
    (0, common_1.Get)('cards'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerSettingsCompatController.prototype, "getCards", null);
__decorate([
    (0, common_1.Post)('cards'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CompatCardDto]),
    __metadata("design:returntype", Promise)
], CustomerSettingsCompatController.prototype, "addCard", null);
__decorate([
    (0, common_1.Delete)('cards/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerSettingsCompatController.prototype, "deleteCard", null);
__decorate([
    (0, common_1.Get)('cars'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerSettingsCompatController.prototype, "getCars", null);
__decorate([
    (0, common_1.Post)('cars'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CompatCarDto]),
    __metadata("design:returntype", Promise)
], CustomerSettingsCompatController.prototype, "addCar", null);
__decorate([
    (0, common_1.Delete)('cars/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerSettingsCompatController.prototype, "deleteCar", null);
__decorate([
    (0, common_1.Get)('locations'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerSettingsCompatController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Post)('locations'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CompatLocationDto]),
    __metadata("design:returntype", Promise)
], CustomerSettingsCompatController.prototype, "addLocation", null);
__decorate([
    (0, common_1.Delete)('locations/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerSettingsCompatController.prototype, "deleteLocation", null);
exports.CustomerSettingsCompatController = CustomerSettingsCompatController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], CustomerSettingsCompatController);
//# sourceMappingURL=customer-settings-compat.controller.js.map