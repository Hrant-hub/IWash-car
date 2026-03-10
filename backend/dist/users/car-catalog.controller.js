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
exports.CarCatalogController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
let CarCatalogController = class CarCatalogController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getCarBrands() {
        return this.usersService.getCarBrands();
    }
    async getCarModels(brandId) {
        const id = Number(brandId);
        if (!Number.isInteger(id) || id <= 0) {
            return [];
        }
        return this.usersService.getCarModelsByBrand(id);
    }
};
exports.CarCatalogController = CarCatalogController;
__decorate([
    (0, common_1.Get)('car-brands'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CarCatalogController.prototype, "getCarBrands", null);
__decorate([
    (0, common_1.Get)('car-models/:brandId'),
    __param(0, (0, common_1.Param)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CarCatalogController.prototype, "getCarModels", null);
exports.CarCatalogController = CarCatalogController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], CarCatalogController);
//# sourceMappingURL=car-catalog.controller.js.map