import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = (route.data['roles'] as string[] | undefined) || [];
  const role = auth.getRole();

  if (!role) {
    router.navigate(['/role-selection']);
    return false;
  }
  if (!allowed.length || allowed.includes(role)) {
    return true;
  }
  auth.navigateByRole();
  return false;
};
