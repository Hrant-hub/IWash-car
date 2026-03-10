import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { HelperController } from './helper.controller';
import { HelperService } from './helper.service';

@Module({
  imports: [UsersModule],
  controllers: [HelperController],
  providers: [HelperService],
  exports: [HelperService],
})
export class HelperModule {}
