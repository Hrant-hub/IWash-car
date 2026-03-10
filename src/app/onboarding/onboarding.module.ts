import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OnboardingPage } from './onboarding.page';
import { OnboardingRoutingModule } from './onboarding-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, OnboardingRoutingModule],
  declarations: [OnboardingPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingModule {}
