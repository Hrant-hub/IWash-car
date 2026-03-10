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
exports.CustomerDataController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const users_service_1 = require("./users.service");
const class_validator_1 = require("class-validator");
class CustomerCarDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CustomerCarDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CustomerCarDto.prototype, "plateNumber", void 0);
class CustomerLocationDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CustomerLocationDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CustomerLocationDto.prototype, "address", void 0);
let CustomerDataController = class CustomerDataController {
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
        return this.usersService.addCustomerCar(req.user.id, model, plateNumber);
    }
    async updateCar(req, id, body) {
        const existing = (await this.usersService.getCustomerCars(req.user.id)).find((car) => car.id === id);
        if (!existing) {
            throw new common_1.BadRequestException('Car not found');
        }
        return this.usersService.updateCustomerCar(req.user.id, id, body.model?.trim() || existing.model, body.plateNumber?.trim() || existing.plateNumber);
    }
    async deleteCar(req, id) {
        await this.usersService.deleteCustomerCar(req.user.id, id);
        return { ok: true };
    }
    async getLocations(req) {
        return this.usersService.getCustomerLocations(req.user.id);
    }
    async addLocation(req, body) {
        const label = body.label?.trim();
        const address = body.address?.trim();
        if (!label || !address) {
            throw new common_1.BadRequestException('label and address are required');
        }
        return this.usersService.addCustomerLocation(req.user.id, address, undefined, undefined, label);
    }
    async updateLocation(req, id, body) {
        const existing = (await this.usersService.getCustomerLocations(req.user.id)).find((location) => location.id === id);
        if (!existing) {
            throw new common_1.BadRequestException('Location not found');
        }
        return this.usersService.updateCustomerLocation(req.user.id, id, body.address?.trim() || existing.address, undefined, undefined, body.label?.trim() || existing.label);
    }
    async deleteLocation(req, id) {
        await this.usersService.deleteCustomerLocation(req.user.id, id);
        return { ok: true };
    }
};
exports.CustomerDataController = CustomerDataController;
__decorate([
    (0, common_1.Get)('cars'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDataController.prototype, "getCars", null);
__decorate([
    (0, common_1.Post)('cars'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CustomerCarDto]),
    __metadata("design:returntype", Promise)
], CustomerDataController.prototype, "addCar", null);
__decorate([
    (0, common_1.Patch)('cars/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, CustomerCarDto]),
    __metadata("design:returntype", Promise)
], CustomerDataController.prototype, "updateCar", null);
__decorate([
    (0, common_1.Delete)('cars/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerDataController.prototype, "deleteCar", null);
__decorate([
    (0, common_1.Get)('locations'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDataController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Post)('locations'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CustomerLocationDto]),
    __metadata("design:returntype", Promise)
], CustomerDataController.prototype, "addLocation", null);
__decorate([
    (0, common_1.Patch)('locations/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, CustomerLocationDto]),
    __metadata("design:returntype", Promise)
], CustomerDataController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Delete)('locations/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerDataController.prototype, "deleteLocation", null);
exports.CustomerDataController = CustomerDataController = __decorate([
    (0, common_1.Controller)('customer-data'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], CustomerDataController);
//# sourceMappingURL=customer-data.controller.js.map