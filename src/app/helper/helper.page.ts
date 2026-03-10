import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RequestService, RequestState } from '../core/services/request.service';
import { HelperStateService } from '../core/services/helper-state.service';
import { SocketService } from '../core/services/socket.service';
import { AuthService } from '../core/services/auth.service';
import { MapMarker } from '../shared/components/map/map.component';

@Component({
  selector: 'app-helper',
  templateUrl: './helper.page.html',
  styleUrls: ['./helper.page.scss'],
  standalone: false,
})
export class HelperPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private myUserId = this.auth.getUserId() || '';

  requestState$ = this.requestService.requestState$;

  helperMapCenter = { lat: 40.7128, lng: -74.006 };
  helperMapMarkers: MapMarker[] = [];
  helperRoutePoints: { lat: number; lng: number }[] = [];
  chatText = '';

  constructor(
    private requestService: RequestService,
    private helperState: HelperStateService,
    private socketService: SocketService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.socketService.connect();
    this.auth.getMe().pipe(takeUntil(this.destroy$)).subscribe({
      next: (me) => {
        if (this.myUserId) {
          this.helperState.syncFromDb(this.myUserId, me.active === true);
        }
      },
      error: () => {},
    });
    this.syncCurrentLocation();
    this.requestState$.pipe(takeUntil(this.destroy$)).subscribe((s) => {
      this.updateHelperMap(s);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateHelperMap(state: {
    status: string;
    customerLocation?: { lat: number; lng: number };
    targetHelper?: { lat: number; lng: number; id?: string };
    assignedHelper?: { lat: number; lng: number; id?: string };
  }): void {
    if (state.status !== 'pending' && state.status !== 'assigned' && state.status !== 'reached') {
      this.helperMapMarkers = [];
      this.helperRoutePoints = [];
      return;
    }
    const cust = state.customerLocation;
    const helper = state.assignedHelper ?? state.targetHelper;
    if (!cust) return;
    const markers: MapMarker[] = [
      { id: 'customer', lat: cust.lat, lng: cust.lng, label: 'Customer', isCustomer: true },
    ];
    if (helper) {
      markers.push({ id: 'helper', lat: helper.lat, lng: helper.lng, label: 'You' });
      this.helperRoutePoints = [
        { lat: helper.lat, lng: helper.lng },
        { lat: cust.lat, lng: cust.lng },
      ];
      const midLat = (helper.lat + cust.lat) / 2;
      const midLng = (helper.lng + cust.lng) / 2;
      this.helperMapCenter = { lat: midLat, lng: midLng };
    } else {
      this.helperMapCenter = { ...cust };
      this.helperRoutePoints = [];
    }
    this.helperMapMarkers = markers;
  }

  updateLocation(lat: number, lng: number): void {
    this.helperState.updateLocation(lat, lng);
  }

  accept(): void {
    this.requestService.acceptRequest();
  }

  reject(): void {
    this.requestService.rejectRequest();
  }

  reached(): void {
    this.requestService.markReached();
  }

  done(): void {
    this.requestService.completeRequest();
  }

  sendChat(): void {
    this.requestService.sendChatMessage(this.chatText);
    this.chatText = '';
  }

  isOwnMessage(senderId: string): boolean {
    return senderId === this.myUserId;
  }

  isRequestForMe(state: RequestState): boolean {
    return (
      (state.status === 'pending' && state.targetHelper?.id === this.myUserId) ||
      ((state.status === 'assigned' || state.status === 'reached' || state.status === 'completed') &&
        state.assignedHelper?.id === this.myUserId)
    );
  }

  private syncCurrentLocation(): void {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.updateLocation(position.coords.latitude, position.coords.longitude);
      },
      () => {
        this.updateLocation(40.7128, -74.0060);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
}
