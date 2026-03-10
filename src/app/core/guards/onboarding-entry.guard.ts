import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OnboardingService } from '../services/onboarding.service';

export const onboardingEntryGuard: CanActivateFn = () => {
  const onboarding = inject(OnboardingService);
  const router = inject(Router);

  if (onboarding.isComplete()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

