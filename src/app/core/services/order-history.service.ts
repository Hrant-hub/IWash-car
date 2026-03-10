import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface OrderHistoryItem {
  id: string;
  requestId: string;
  customerId: string;
  helperId: string | null;
  status: 'completed' | 'cancelled';
  customerLat: number;
  customerLng: number;
  customerAddress: string | null;
  customerCarModel: string | null;
  customerPlateNumber: string | null;
  paymentMethod: string | null;
  helperName: string | null;
  helperDistanceKm: number | null;
  helperEtaMinutes: number | null;
  conversation: Array<{
    senderId: string;
    senderRole: 'customer' | 'helper';
    text: string;
    timestamp: number;
  }> | null;
  completedAt: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderHistoryService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getCustomerHistory(): Observable<OrderHistoryItem[]> {
    return this.http.get<OrderHistoryItem[]>(`${this.auth.getApiUrl()}/request/history/customer`);
  }

  getHelperHistory(): Observable<OrderHistoryItem[]> {
    return this.http.get<OrderHistoryItem[]>(`${this.auth.getApiUrl()}/request/history/helper`);
  }
}

