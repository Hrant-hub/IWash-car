import { Injectable } from '@angular/core';

const ONBOARDING_KEY = 'onboarding_done';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  isComplete(): boolean {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  }

  complete(): void {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  }

  reset(): void {
    localStorage.removeItem(ONBOARDING_KEY);
  }
}
