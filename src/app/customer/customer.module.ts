import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CustomerPage } from './customer.page';
import { CustomerPageRoutingModule } from './customer-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, CustomerPageRoutingModule, SharedModule],
  declarations: [CustomerPage],
})
export class CustomerPageModule {}
