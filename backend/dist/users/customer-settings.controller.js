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
exports.CustomerSettingsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const users_service_1 = require("./users.service");
const class_validator_1 = require("class-validator");
class AddCarDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], AddCarDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], AddCarDto.prototype, "plateNumber", void 0);
class AddLocationDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], AddLocationDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddLocationDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddLocationDto.prototype, "lng", void 0);
class AddCardDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{12,19}$/),
    __metadata("design:type", String)
], AddCardDto.prototype, "cardNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}\/\d{2}$/),
    __metadata("design:type", String)
], AddCardDto.prototype, "expiry", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{3,4}$/),
    __metadata("design:type", String)
], AddCardDto.prototype, "cvc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], AddCardDto.prototype, "holderName", void 0);
let CustomerSettingsController = class CustomerSettingsController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getCars(req) {
        return this.usersService.getCustomerCars(req.user.id);
    }
    async addCar(req, body) {
        const model = body.model?.trim();
        const plateNumber = body.plateNumber?.trim();
        if (!model || !plateNumber) {
            throw new common_1.BadRequestException('model and plateNumber are required');
        }
        const car = await this.usersService.addCustomerCar(req.user.id, model, plateNumber);
        const cars = await this.usersService.getCustomerCars(req.user.id);
        return { car, cars };
    }
    async updateCar(req, id, body) {
        const model = body.model?.trim();
        const plateNumber = body.plateNumber?.trim();
        if (!model || !plateNumber) {
            throw new common_1.BadRequestException('model and plateNumber are required');
        }
        const car = await this.usersService.updateCustomerCar(req.user.id, id, model, plateNumber);
        const cars = await this.usersService.getCustomerCars(req.user.id);
        return { car, cars };
    }
    async deleteCar(req, id) {
        await this.usersService.deleteCustomerCar(req.user.id, id);
        const cars = await this.usersService.getCustomerCars(req.user.id);
        return { cars };
    }
    async getLocations(req) {
        return this.usersService.getCustomerLocations(req.user.id);
    }
    async addLocation(req, body) {
        const address = body.address?.trim();
        const lat = Number(body.lat);
        const lng = Number(body.lng);
        if (!address) {
            throw new common_1.BadRequestException('address is required');
        }
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            throw new common_1.BadRequestException('lat and lng are required');
        }
        const location = await this.usersService.addCustomerLocation(req.user.id, address, lat, lng);
        const locations = await this.usersService.getCustomerLocations(req.user.id);
        return { location, locations };
    }
    async updateLocation(req, id, body) {
        const address = body.address?.trim();
        const lat = Number(body.lat);
        const lng = Number(body.lng);
        if (!address) {
            throw new common_1.BadRequestException('address is required');
        }
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            throw new common_1.BadRequestException('lat and lng are required');
        }
        const location = await this.usersService.updateCustomerLocation(req.user.id, id, address, lat, lng);
        const locations = await this.usersService.getCustomerLocations(req.user.id);
        return { location, locations };
    }
    async deleteLocation(req, id) {
        await this.usersService.deleteCustomerLocation(req.user.id, id);
        const locations = await this.usersService.getCustomerLocations(req.user.id);
        return { locations };
    }
    async getCards(req) {
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
        if (!/^\d{12,19}$/.test(cardNumber)) {
            throw new common_1.BadRequestException('cardNumber is invalid');
        }
        if (!holderName) {
            throw new common_1.BadRequestException('holderName is required');
        }
        if (!Number.isInteger(expiryMonth) || expiryMonth < 1 || expiryMonth > 12 || !Number.isInteger(expiryYear)) {
            throw new common_1.BadRequestException('expiry is invalid');
        }
        if (!/^\d{3,4}$/.test(cvc)) {
            throw new common_1.BadRequestException('cvc is invalid');
        }
        const brand = cardNumber.startsWith('4') ? 'visa' : 'mastercard';
        const last4 = cardNumber.slice(-4);
        const card = await this.usersService.addCustomerCard(req.user.id, {
            brand,
            last4,
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
    async setDefaultCard(req, id) {
        await this.usersService.setDefaultCustomerCard(req.user.id, id);
        const cards = await this.usersService.getCustomerCards(req.user.id);
        return { cards };
    }
};
exports.CustomerSettingsController = CustomerSettingsController;
__decorate([
    (0, common_1.Get)('cars'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "getCars", null);
__decorate([
    (0, common_1.Post)('cars'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AddCarDto]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "addCar", null);
__decorate([
    (0, common_1.Put)('cars/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, AddCarDto]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "updateCar", null);
__decorate([
    (0, common_1.Delete)('cars/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "deleteCar", null);
__decorate([
    (0, common_1.Get)('locations'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Post)('locations'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AddLocationDto]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "addLocation", null);
__decorate([
    (0, common_1.Put)('locations/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, AddLocationDto]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Delete)('locations/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "deleteLocation", null);
__decorate([
    (0, common_1.Get)('cards'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "getCards", null);
__decorate([
    (0, common_1.Post)('cards'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AddCardDto]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "addCard", null);
__decorate([
    (0, common_1.Delete)('cards/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "deleteCard", null);
__decorate([
    (0, common_1.Put)('cards/:id/default'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerSettingsController.prototype, "setDefaultCard", null);
exports.CustomerSettingsController = CustomerSettingsController = __decorate([
    (0, common_1.Controller)('customer-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], CustomerSettingsController);
//# sourceMappingURL=customer-settings.controller.js.map