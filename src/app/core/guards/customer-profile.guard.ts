import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, map, of, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const customerProfileGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getRole() !== 'customer') {
    return of(true);
  }

  return auth.getMe().pipe(
    map((me) => {
      const missingCarModel = !me.carModel || !me.carModel.trim();
      const missingPlateNumber = !me.plateNumber || !me.plateNumber.trim();
      if (missingCarModel || missingPlateNumber) {
        return router.parseUrl('/complete-profile');
      }
      return true;
    }),
    catchError(() => of(router.parseUrl('/complete-profile'))),
  );
};

