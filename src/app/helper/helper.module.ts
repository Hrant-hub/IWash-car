import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HelperPage } from './helper.page';
import { HelperPageRoutingModule } from './helper-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, IonicModule, HelperPageRoutingModule, SharedModule],
  declarations: [HelperPage],
})
export class HelperPageModule {}
