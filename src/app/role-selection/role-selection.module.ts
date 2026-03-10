import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RoleSelectionRoutingModule } from './role-selection-routing.module';
import { RoleSelectionPage } from './role-selection.page';

@NgModule({
  imports: [SharedModule, RoleSelectionRoutingModule],
  declarations: [RoleSelectionPage],
})
export class RoleSelectionModule {}
