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
exports.RequestController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const request_service_1 = require("./request.service");
const common_2 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
class RequestHelpDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RequestHelpDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RequestHelpDto.prototype, "lng", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], RequestHelpDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], RequestHelpDto.prototype, "carModel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], RequestHelpDto.prototype, "plateNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], RequestHelpDto.prototype, "paymentMethod", void 0);
class CancelRequestDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CancelRequestDto.prototype, "requestId", void 0);
let RequestController = class RequestController {
    constructor(request) {
        this.request = request;
    }
    requestHelp(body, req) {
        return this.request.requestHelp(req.user.id, body.lat, body.lng, {
            address: body.address,
            carModel: body.carModel,
            plateNumber: body.plateNumber,
            paymentMethod: body.paymentMethod,
        });
    }
    cancelRequest(body, req) {
        return this.request.cancelByCustomer(body.requestId, req.user.id);
    }
    getCustomerHistory(req) {
        return this.request.getCustomerHistory(req.user.id);
    }
    getHelperHistory(req) {
        return this.request.getHelperHistory(req.user.id);
    }
};
exports.RequestController = RequestController;
__decorate([
    (0, common_1.Post)('help'),
    (0, roles_decorator_1.Roles)('customer'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestHelpDto, Object]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "requestHelp", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, roles_decorator_1.Roles)('customer'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CancelRequestDto, Object]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "cancelRequest", null);
__decorate([
    (0, common_2.Get)('history/customer'),
    (0, roles_decorator_1.Roles)('customer'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "getCustomerHistory", null);
__decorate([
    (0, common_2.Get)('history/helper'),
    (0, roles_decorator_1.Roles)('helper'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "getHelperHistory", null);
exports.RequestController = RequestController = __decorate([
    (0, common_1.Controller)('request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [request_service_1.RequestService])
], RequestController);
//# sourceMappingURL=request.controller.js.map