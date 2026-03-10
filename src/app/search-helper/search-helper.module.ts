import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { SearchHelperRoutingModule } from './search-helper-routing.module';
import { SearchHelperPage } from './search-helper.page';

@NgModule({
  imports: [SharedModule, SearchHelperRoutingModule],
  declarations: [SearchHelperPage],
})
export class SearchHelperModule {}

