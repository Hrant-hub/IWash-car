import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperModule } from '../helper/helper.module';
import { UsersModule } from '../users/users.module';
import { RequestController } from './request.controller';
import { Order } from './order.entity';
import { RequestService } from './request.service';

@Module({
  imports: [HelperModule, UsersModule, TypeOrmModule.forFeature([Order])],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
