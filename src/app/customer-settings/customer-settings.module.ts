import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CustomerSettingsRoutingModule } from './customer-settings-routing.module';
import { CustomerSettingsPage } from './customer-settings.page';

@NgModule({
  imports: [SharedModule, CustomerSettingsRoutingModule],
  declarations: [CustomerSettingsPage],
})
export class CustomerSettingsModule {}
