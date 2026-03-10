import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HelperModule } from './helper/helper.module';
import { RequestModule } from './request/request.module';
import { EventsModule } from './events/events.module';
import { User } from './users/user.entity';
import { Order } from './request/order.entity';
import { CustomerCar } from './users/customer-car.entity';
import { CustomerLocation } from './users/customer-location.entity';
import { CustomerCard } from './users/customer-card.entity';
import { CarBrand } from './users/car-brand.entity';
import { CarModel } from './users/car-model.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: Number(config.get(process.env.THROTTLE_TTL) || 60) * 1000,
            limit: Number(config.get(process.env.THROTTLE_LIMIT) || 120),
          },
        ],
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '1433', 10),
      username: process.env.DB_USER || '',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'WashCar',
      entities: [User, Order, CustomerCar, CustomerLocation, CustomerCard, CarBrand, CarModel],
      synchronize: (process.env.DB_SYNCHRONIZE || 'false') === 'true',
      extra: {
        trustServerCertificate: (process.env.DB_TRUST_SERVER_CERT || 'false') === 'true',
      },
    }),
    UsersModule,
    AuthModule,
    HelperModule,
    RequestModule,
    EventsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
