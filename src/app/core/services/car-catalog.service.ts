import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CarBrandOption {
  id: number;
  name: string;
}

export interface CarModelOption {
  id: number;
  name: string;
  brandId: number;
}

@Injectable({ providedIn: 'root' })
export class CarCatalogService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getBrands(): Observable<CarBrandOption[]> {
    return this.http.get<CarBrandOption[]>(`${this.auth.getApiUrl()}/car-brands`);
  }

  getModelsByBrand(brandId: number): Observable<CarModelOption[]> {
    return this.http.get<CarModelOption[]>(`${this.auth.getApiUrl()}/car-models/${brandId}`);
  }
}

