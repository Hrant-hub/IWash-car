import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl;
const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'user_role';
const USER_ID_KEY = 'user_id';

export type UserRole = 'customer' | 'helper' | 'none';

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    carBrandId?: number | null;
    carModelId?: number | null;
    carModel?: string | null;
    plateNumber?: string | null;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  active?: boolean;
  carBrandId?: number | null;
  carModelId?: number | null;
  carModel?: string | null;
  plateNumber?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  loginWithGoogle(googleToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/google`, { token: googleToken })
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  register(email: string, password: string, termsAccepted: boolean): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, { email, password, termsAccepted })
      .pipe(tap((res) => {
        localStorage.removeItem(ROLE_KEY);
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_ID_KEY, res.user.id);
      }));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUserId(): string | null {
    return localStorage.getItem(USER_ID_KEY);
  }

  getRole(): UserRole | null {
    return localStorage.getItem(ROLE_KEY) as UserRole | null;
  }

  setRole(role: UserRole): void {
    localStorage.setItem(ROLE_KEY, role);
  }

  selectRole(role: UserRole): Observable<AuthResponse> {
    return this.http
      .put<AuthResponse>(`${API_URL}/auth/role`, { role })
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API_URL}/auth/me`);
  }

  completeProfile(brandId: number, modelId: number, plateNumber: string): Observable<AuthResponse> {
    return this.http
      .put<AuthResponse>(`${API_URL}/auth/car-info`, { brandId, modelId, plateNumber })
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  hasRole(): boolean {
    const role = this.getRole();
    return !!role && role !== 'none';
  }

  navigateAfterAuth(): void {
    if (!this.hasRole()) {
      this.router.navigate(['/role-selection']);
    } else {
      this.navigateByRole();
    }
  }

  navigateByRole(): void {
    const role = this.getRole();
    if (role === 'helper') {
      this.router.navigate(['/helper']);
    } else if (role === 'customer') {
      this.router.navigate(['/customer']);
    } else {
      this.router.navigate(['/role-selection']);
    }
  }

  getApiUrl(): string {
    return API_URL;
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_ID_KEY, res.user.id);
    if (res.user.role && res.user.role !== 'none') {
      this.setRole(res.user.role);
    }
  }
}
