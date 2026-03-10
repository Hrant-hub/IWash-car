import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CustomerCar {
  id: string;
  model: string;
  plateNumber: string;
}

export interface CustomerLocation {
  id: string;
  label: string;
  address: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerPreferencesService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getCars(): Observable<CustomerCar[]> {
    return this.http.get<CustomerCar[]>(`${this.apiUrl()}/customer-data/cars`);
  }

  addCar(input: { model: string; plateNumber: string }): Observable<CustomerCar> {
    return this.http.post<CustomerCar>(`${this.apiUrl()}/customer-data/cars`, input);
  }

  updateCar(id: string, input: { model?: string; plateNumber?: string }): Observable<CustomerCar> {
    return this.http.patch<CustomerCar>(`${this.apiUrl()}/customer-data/cars/${id}`, input);
  }

  removeCar(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl()}/customer-data/cars/${id}`);
  }

  getLocations(): Observable<CustomerLocation[]> {
    return this.http.get<CustomerLocation[]>(`${this.apiUrl()}/customer-data/locations`);
  }

  addLocation(input: { label: string; address: string }): Observable<CustomerLocation> {
    return this.http.post<CustomerLocation>(`${this.apiUrl()}/customer-data/locations`, input);
  }

  updateLocation(id: string, input: { label?: string; address?: string }): Observable<CustomerLocation> {
    return this.http.patch<CustomerLocation>(`${this.apiUrl()}/customer-data/locations/${id}`, input);
  }

  removeLocation(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl()}/customer-data/locations/${id}`);
  }

  private apiUrl(): string {
    return this.auth.getApiUrl();
  }
}
