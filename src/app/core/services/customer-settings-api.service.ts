import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CustomerCar {
  id: string;
  model: string;
  plateNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerLocation {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerCard {
  id: string;
  brand: 'visa' | 'mastercard' | string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CarsMutationResponse {
  car?: CustomerCar;
  cars: CustomerCar[];
}

export interface LocationsMutationResponse {
  location?: CustomerLocation;
  locations: CustomerLocation[];
}

export interface CardsMutationResponse {
  card?: CustomerCard;
  cards: CustomerCard[];
}

@Injectable({ providedIn: 'root' })
export class CustomerSettingsApiService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getCars(): Observable<CustomerCar[]> {
    return this.http.get<CustomerCar[]>(`${this.apiUrl()}/customer-settings/cars`);
  }

  addCar(input: { model: string; plateNumber: string }): Observable<CarsMutationResponse> {
    return this.http.post<CarsMutationResponse>(`${this.apiUrl()}/customer-settings/cars`, input);
  }

  updateCar(id: string, input: { model: string; plateNumber: string }): Observable<CarsMutationResponse> {
    return this.http.put<CarsMutationResponse>(`${this.apiUrl()}/customer-settings/cars/${id}`, input);
  }

  deleteCar(id: string): Observable<CarsMutationResponse> {
    return this.http.delete<CarsMutationResponse>(`${this.apiUrl()}/customer-settings/cars/${id}`);
  }

  getLocations(): Observable<CustomerLocation[]> {
    return this.http.get<CustomerLocation[]>(`${this.apiUrl()}/customer-settings/locations`);
  }

  addLocation(input: { address: string; lat: number; lng: number }): Observable<LocationsMutationResponse> {
    return this.http.post<LocationsMutationResponse>(
      `${this.apiUrl()}/customer-settings/locations`,
      input,
    );
  }

  updateLocation(
    id: string,
    input: { address: string; lat: number; lng: number },
  ): Observable<LocationsMutationResponse> {
    return this.http.put<LocationsMutationResponse>(
      `${this.apiUrl()}/customer-settings/locations/${id}`,
      input,
    );
  }

  deleteLocation(id: string): Observable<LocationsMutationResponse> {
    return this.http.delete<LocationsMutationResponse>(`${this.apiUrl()}/customer-settings/locations/${id}`);
  }

  getCards(): Observable<CustomerCard[]> {
    return this.http.get<CustomerCard[]>(`${this.apiUrl()}/customer-settings/cards`);
  }

  addCard(input: {
    cardNumber: string;
    expiry: string;
    cvc: string;
    holderName: string;
  }): Observable<CardsMutationResponse> {
    return this.http.post<CardsMutationResponse>(`${this.apiUrl()}/customer-settings/cards`, input);
  }

  deleteCard(id: string): Observable<CardsMutationResponse> {
    return this.http.delete<CardsMutationResponse>(`${this.apiUrl()}/customer-settings/cards/${id}`);
  }

  setDefaultCard(id: string): Observable<CardsMutationResponse> {
    return this.http.put<CardsMutationResponse>(`${this.apiUrl()}/customer-settings/cards/${id}/default`, {});
  }

  private apiUrl(): string {
    return this.auth.getApiUrl();
  }
}
