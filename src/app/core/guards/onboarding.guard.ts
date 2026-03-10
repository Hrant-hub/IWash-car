import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OnboardingService } from '../services/onboarding.service';

export const onboardingGuard: CanActivateFn = () => {
  const onboarding = inject(OnboardingService);
  const router = inject(Router);

  if (onboarding.isComplete()) {
    return true;
  }
  router.navigate(['/onboarding']);
  return false;
};
