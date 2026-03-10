import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RequestModule } from '../request/request.module';
import { UsersModule } from '../users/users.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [RequestModule, AuthModule, UsersModule],
  providers: [EventsGateway],
})
export class EventsModule {}
