import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CompleteProfileRoutingModule } from './complete-profile-routing.module';
import { CompleteProfilePage } from './complete-profile.page';

@NgModule({
  imports: [SharedModule, CompleteProfileRoutingModule],
  declarations: [CompleteProfilePage],
})
export class CompleteProfileModule {}

