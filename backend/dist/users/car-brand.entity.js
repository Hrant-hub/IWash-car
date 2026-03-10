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
exports.CarBrand = void 0;
const typeorm_1 = require("typeorm");
const car_model_entity_1 = require("./car-model.entity");
let CarBrand = class CarBrand {
};
exports.CarBrand = CarBrand;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CarBrand.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 80, unique: true }),
    __metadata("design:type", String)
], CarBrand.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => car_model_entity_1.CarModel, (model) => model.brand),
    __metadata("design:type", Array)
], CarBrand.prototype, "models", void 0);
exports.CarBrand = CarBrand = __decorate([
    (0, typeorm_1.Entity)('car_brands')
], CarBrand);
//# sourceMappingURL=car-brand.entity.js.map