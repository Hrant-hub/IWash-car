import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocationService {
  getCurrentPosition(): Observable<{ lat: number; lng: number }> {
    return new Observable((observer) => {
      if (!navigator?.geolocation) {
        observer.error(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          observer.next({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          observer.complete();
        },
        (err) => observer.error(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}
