import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchHelperPage } from './search-helper.page';

const routes: Routes = [{ path: '', component: SearchHelperPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchHelperRoutingModule {}

