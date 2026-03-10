import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HelperSettingsRoutingModule } from './helper-settings-routing.module';
import { HelperSettingsPage } from './helper-settings.page';

@NgModule({
  imports: [SharedModule, HelperSettingsRoutingModule],
  declarations: [HelperSettingsPage],
})
export class HelperSettingsModule {}
