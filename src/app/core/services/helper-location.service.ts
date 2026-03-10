import { Injectable } from '@angular/core';
import { interval, map, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HelperLocationService {
  simulateMovementToward(
    helperId: string,
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
  ) {
    const steps = 20;
    return interval(1500).pipe(
      take(steps),
      map((i) => {
        const t = (i + 1) / steps;
        return {
          id: helperId,
          lat: startLat + (endLat - startLat) * t,
          lng: startLng + (endLng - startLng) * t,
        };
      }),
    );
  }
}
