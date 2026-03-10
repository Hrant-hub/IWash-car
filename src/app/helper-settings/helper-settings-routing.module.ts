import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelperSettingsPage } from './helper-settings.page';

const routes: Routes = [{ path: '', component: HelperSettingsPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelperSettingsRoutingModule {}
