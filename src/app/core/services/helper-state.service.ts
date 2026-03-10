import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class HelperStateService {
  private readonly state$ = new BehaviorSubject<Record<string, boolean>>({});

  activeState$: Observable<Record<string, boolean>> = this.state$.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private socket: SocketService
  ) {}

  isActive(helperId: string): boolean {
    return this.state$.value[helperId] ?? false;
  }

  setActive(helperId: string, active: boolean): void {
    const apiUrl = this.auth.getApiUrl();
    this.http.put<{ ok: boolean }>(`${apiUrl}/helper/active`, { isActive: active })
      .subscribe({
        next: () => {
          this.state$.next({ ...this.state$.value, [helperId]: active });
          this.socket.connect();
          this.socket.emit('helper_online', { active });
        },
        error: (err) => {
          console.error('Failed to set active state', err);
        },
      });
  }

  syncFromDb(helperId: string, active: boolean): void {
    this.state$.next({ ...this.state$.value, [helperId]: active });
    if (active) {
      this.socket.connect();
      this.socket.emit('helper_online', { active: true });
    }
  }

  updateLocation(lat: number, lng: number): void {
    const apiUrl = this.auth.getApiUrl();
    this.http.put<{ ok: boolean }>(`${apiUrl}/helper/location`, { lat, lng })
      .subscribe({
        error: (err) => console.error('Failed to update location', err),
      });
  }
}
