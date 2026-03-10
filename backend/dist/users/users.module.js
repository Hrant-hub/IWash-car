"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./user.entity");
const customer_car_entity_1 = require("./customer-car.entity");
const customer_location_entity_1 = require("./customer-location.entity");
const customer_card_entity_1 = require("./customer-card.entity");
const car_brand_entity_1 = require("./car-brand.entity");
const car_model_entity_1 = require("./car-model.entity");
const users_service_1 = require("./users.service");
const customer_data_controller_1 = require("./customer-data.controller");
const customer_settings_controller_1 = require("./customer-settings.controller");
const customer_settings_compat_controller_1 = require("./customer-settings-compat.controller");
const car_catalog_controller_1 = require("./car-catalog.controller");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, customer_car_entity_1.CustomerCar, customer_location_entity_1.CustomerLocation, customer_card_entity_1.CustomerCard, car_brand_entity_1.CarBrand, car_model_entity_1.CarModel])],
        controllers: [customer_settings_controller_1.CustomerSettingsController, customer_settings_compat_controller_1.CustomerSettingsCompatController, customer_data_controller_1.CustomerDataController, car_catalog_controller_1.CarCatalogController],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map