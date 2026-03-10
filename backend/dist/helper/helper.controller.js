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
exports.HelperController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const helper_service_1 = require("./helper.service");
const class_validator_1 = require("class-validator");
class SetActiveDto {
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetActiveDto.prototype, "isActive", void 0);
class UpdateLocationDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "lng", void 0);
let HelperController = class HelperController {
    constructor(helper) {
        this.helper = helper;
    }
    async setActive(body, req) {
        await this.helper.setActive(req.user.id, body.isActive);
        return { ok: true };
    }
    async updateLocation(body, req) {
        await this.helper.updateLocation(req.user.id, body.lat, body.lng);
        return { ok: true };
    }
};
exports.HelperController = HelperController;
__decorate([
    (0, common_1.Put)('active'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SetActiveDto, Object]),
    __metadata("design:returntype", Promise)
], HelperController.prototype, "setActive", null);
__decorate([
    (0, common_1.Put)('location'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateLocationDto, Object]),
    __metadata("design:returntype", Promise)
], HelperController.prototype, "updateLocation", null);
exports.HelperController = HelperController = __decorate([
    (0, common_1.Controller)('helper'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('helper'),
    __metadata("design:paramtypes", [helper_service_1.HelperService])
], HelperController);
//# sourceMappingURL=helper.controller.js.map