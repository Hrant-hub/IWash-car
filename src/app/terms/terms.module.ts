import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { TermsRoutingModule } from './terms-routing.module';
import { TermsPage } from './terms.page';

@NgModule({
  imports: [SharedModule, TermsRoutingModule],
  declarations: [TermsPage],
})
export class TermsModule {}

