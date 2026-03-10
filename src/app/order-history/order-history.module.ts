import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { OrderHistoryRoutingModule } from './order-history-routing.module';
import { OrderHistoryPage } from './order-history.page';

@NgModule({
  imports: [SharedModule, OrderHistoryRoutingModule],
  declarations: [OrderHistoryPage],
})
export class OrderHistoryModule {}

