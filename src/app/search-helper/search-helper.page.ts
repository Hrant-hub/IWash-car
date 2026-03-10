import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RequestService, RequestState } from '../core/services/request.service';
import { MapMarker } from '../shared/components/map/map.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-search-helper',
  templateUrl: './search-helper.page.html',
  styleUrls: ['./search-helper.page.scss'],
  standalone: false,
})
export class SearchHelperPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private myUserId = '';

  state: RequestState = { status: 'matching' };
  mapCenter = { lat: 40.7128, lng: -74.006 };
  markers: MapMarker[] = [];
  chatText = '';
  payload: {
    selectedCarId?: string;
    carModel?: string;
    selectedLocation?: { lat: number; lng: number; address: string };
    selectedPaymentMethod?: { type: 'cash' } | { type: 'card'; cardId: string };
  } = {};

  constructor(
    private router: Router,
    private requestService: RequestService,
    private auth: AuthService,
  ) {
    this.payload = (this.router.getCurrentNavigation()?.extras?.state || {}) as any;
    this.myUserId = this.auth.getUserId() || '';
  }

  ngOnInit(): void {
    this.requestService.requestState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.state = state;
        this.updateMapFromState();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  completeAndBack(): void {
    this.requestService.reset();
    this.router.navigate(['/customer']);
  }

  sendChat(): void {
    this.requestService.sendChatMessage(this.chatText);
    this.chatText = '';
  }

  cancelOrder(): void {
    this.requestService.cancelRequestByCustomer();
  }

  get canCancelOrder(): boolean {
    return ['matching', 'pending', 'assigned', 'reached'].includes(this.state.status);
  }

  isOwnMessage(senderId: string): boolean {
    return senderId === this.myUserId;
  }

  private updateMapFromState(): void {
    const markers: MapMarker[] = [];
    if (this.state.customerLocation) {
      markers.push({
        id: 'customer',
        lat: this.state.customerLocation.lat,
        lng: this.state.customerLocation.lng,
        label: 'You',
        isCustomer: true,
      });
      this.mapCenter = { ...this.state.customerLocation };
    }
    if (this.state.assignedHelper) {
      markers.push({
        id: 'helper',
        lat: this.state.assignedHelper.lat,
        lng: this.state.assignedHelper.lng,
        label: this.state.assignedHelper.name || 'Helper',
      });
      if (this.state.customerLocation) {
        this.mapCenter = {
          lat: (this.state.customerLocation.lat + this.state.assignedHelper.lat) / 2,
          lng: (this.state.customerLocation.lng + this.state.assignedHelper.lng) / 2,
        };
      }
    }
    this.markers = markers;
  }
}

