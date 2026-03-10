import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelperPage } from './helper.page';

const routes: Routes = [{ path: '', component: HelperPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelperPageRoutingModule {}
