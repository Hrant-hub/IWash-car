"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const config_2 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const helper_module_1 = require("./helper/helper.module");
const request_module_1 = require("./request/request.module");
const events_module_1 = require("./events/events.module");
const user_entity_1 = require("./users/user.entity");
const order_entity_1 = require("./request/order.entity");
const customer_car_entity_1 = require("./users/customer-car.entity");
const customer_location_entity_1 = require("./users/customer-location.entity");
const customer_card_entity_1 = require("./users/customer-card.entity");
const car_brand_entity_1 = require("./users/car-brand.entity");
const car_model_entity_1 = require("./users/car-model.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_2.ConfigService],
                useFactory: (config) => ({
                    throttlers: [
                        {
                            ttl: Number(config.get('THROTTLE_TTL') || 60) * 1000,
                            limit: Number(config.get('THROTTLE_LIMIT') || 120),
                        },
                    ],
                }),
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mssql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '1433', 10),
                username: process.env.DB_USER || '',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'WashCar',
                entities: [user_entity_1.User, order_entity_1.Order, customer_car_entity_1.CustomerCar, customer_location_entity_1.CustomerLocation, customer_card_entity_1.CustomerCard, car_brand_entity_1.CarBrand, car_model_entity_1.CarModel],
                synchronize: (process.env.DB_SYNCHRONIZE || 'false') === 'true',
                extra: {
                    trustServerCertificate: (process.env.DB_TRUST_SERVER_CERT || 'false') === 'true',
                },
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            helper_module_1.HelperModule,
            request_module_1.RequestModule,
            events_module_1.EventsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map