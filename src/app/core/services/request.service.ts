import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';

export interface HelperInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  etaMinutes: number;
}

export interface CustomerDetails {
  address?: string;
  carModel?: string;
  plateNumber?: string;
  paymentMethod?: string;
}

export interface ChatMessage {
  requestId: string;
  senderId: string;
  senderRole: 'customer' | 'helper';
  text: string;
  timestamp: number;
}

export type RequestStatus =
  | 'idle'
  | 'matching'
  | 'pending'
  | 'assigned'
  | 'reached'
  | 'completed'
  | 'no_helpers'
  | 'cancelled';

export interface RequestState {
  status: RequestStatus;
  requestId?: string;
  customerLocation?: { lat: number; lng: number };
  targetHelper?: HelperInfo;
  assignedHelper?: HelperInfo;
  customerDetails?: CustomerDetails;
  chatMessages?: ChatMessage[];
  pendingStartedAt?: number;
  lastTimeout?: boolean;
}

@Injectable({ providedIn: 'root' })
export class RequestService implements OnDestroy {
  private readonly state$ = new BehaviorSubject<RequestState>({ status: 'idle' });
  private destroy$ = new Subject<void>();

  requestState$: Observable<RequestState> = this.state$.asObservable();

  constructor(
    private http: HttpClient,
    private socket: SocketService,
    private auth: AuthService
  ) {
    this.listenToSocketEvents();
  }

  private listenToSocketEvents(): void {
    this.socket.connect();

    this.socket.on<{
      requestId: string;
      helperId: string;
      helper: HelperInfo;
      customerLocation: { lat: number; lng: number };
      customerDetails?: CustomerDetails;
      lastTimeout: boolean;
    }>('incoming_request').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const myRole = this.auth.getRole();
      const myUserId = this.auth.getUserId();
      if (myRole !== 'helper' || !myUserId || data.helperId !== myUserId) return;
      this.state$.next({
        status: 'pending',
        requestId: data.requestId,
        targetHelper: data.helper,
        customerLocation: data.customerLocation,
        customerDetails: data.customerDetails,
        chatMessages: this.state$.value.chatMessages || [],
        pendingStartedAt: Date.now(),
        lastTimeout: data.lastTimeout,
      });
    });

    this.socket.on<{
      requestId: string;
      helperId: string;
      helper: HelperInfo;
      customerLocation: { lat: number; lng: number };
      customerDetails?: CustomerDetails;
      lastTimeout: boolean;
    }>('request:request').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const myRole = this.auth.getRole();
      const myUserId = this.auth.getUserId();
      if (myRole === 'helper' && data.helperId !== myUserId) return;
      this.state$.next({
        status: 'pending',
        requestId: data.requestId,
        targetHelper: data.helper,
        customerLocation: data.customerLocation,
        customerDetails: data.customerDetails,
        chatMessages: this.state$.value.chatMessages || [],
        pendingStartedAt: Date.now(),
        lastTimeout: data.lastTimeout,
      });
    });

    this.socket.on<{
      requestId: string;
      helperId: string;
      helper: HelperInfo;
      customerLocation: { lat: number; lng: number };
      customerDetails?: CustomerDetails;
    }>('request:accept').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.state$.next({
        status: 'assigned',
        requestId: data.requestId,
        assignedHelper: data.helper,
        customerLocation: data.customerLocation,
        customerDetails: data.customerDetails,
        chatMessages: this.state$.value.chatMessages || [],
        lastTimeout: false,
      });
    });

    this.socket.on<{
      requestId: string;
      helperId: string;
      helper: HelperInfo;
      customerLocation: { lat: number; lng: number };
      customerDetails?: CustomerDetails;
    }>('request:reached').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.state$.next({
        status: 'reached',
        requestId: data.requestId,
        assignedHelper: data.helper,
        customerLocation: data.customerLocation,
        customerDetails: data.customerDetails,
        chatMessages: this.state$.value.chatMessages || [],
        lastTimeout: false,
      });
    });

    this.socket.on<{
      requestId: string;
      helperId: string;
      helper: HelperInfo;
      customerLocation: { lat: number; lng: number };
      customerDetails?: CustomerDetails;
    }>('request:done').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const myRole = this.auth.getRole();
      if (myRole === 'helper') {
        this.state$.next({ status: 'idle' });
        return;
      }
      this.state$.next({
        status: 'completed',
        requestId: data.requestId,
        assignedHelper: data.helper,
        customerLocation: data.customerLocation,
        customerDetails: data.customerDetails,
        chatMessages: this.state$.value.chatMessages || [],
        lastTimeout: false,
      });
    });

    this.socket.on<{
      requestId: string;
      helperId?: string;
      helper?: HelperInfo;
      customerLocation?: { lat: number; lng: number };
      customerDetails?: CustomerDetails;
      cancelledBy?: 'customer';
    }>('request:cancel').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const current = this.state$.value;
      const myRole = this.auth.getRole();
      const myUserId = this.auth.getUserId();

      if (myRole === 'helper') {
        if (!myUserId || !data.helperId || data.helperId !== myUserId) return;
      } else if (myRole === 'customer') {
        if (!current.requestId || current.requestId !== data.requestId) return;
      } else {
        if (!current.requestId || current.requestId !== data.requestId) return;
      }

      this.state$.next({
        status: 'cancelled',
        requestId: data.requestId,
        assignedHelper: data.helper ?? current.assignedHelper,
        customerLocation: data.customerLocation ?? current.customerLocation,
        customerDetails: data.customerDetails ?? current.customerDetails,
        chatMessages: current.chatMessages || [],
      });
    });

    this.socket.on<ChatMessage>('chat:message')
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg) => {
        const current = this.state$.value;
        if (!current.requestId || current.requestId !== msg.requestId) return;
        this.state$.next({
          ...current,
          chatMessages: [...(current.chatMessages || []), msg],
        });
      });

    this.socket.on<{
      requestId: string;
      helperId: string;
      helper: HelperInfo;
      customerLocation: { lat: number; lng: number };
      lastTimeout: boolean;
    }>('request:timeout').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const current = this.state$.value;
      if (current.requestId === data.requestId) {
        this.state$.next({
          ...current,
          lastTimeout: true,
        });
      }
    });

    this.socket.on<{ requestId: string }>('request:no_helpers')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.state$.next({
          status: 'no_helpers',
          requestId: data.requestId,
        });
      });
  }

  requestHelp(lat: number, lng: number, details?: CustomerDetails): void {
    this.state$.next({ status: 'matching' });
    const apiUrl = this.auth.getApiUrl();
    this.http.post<{ requestId: string }>(`${apiUrl}/request/help`, {
      lat,
      lng,
      address: details?.address,
      carModel: details?.carModel,
      plateNumber: details?.plateNumber,
      paymentMethod: details?.paymentMethod,
    })
      .subscribe({
        next: (res) => {
          this.state$.next({
            status: 'matching',
            requestId: res.requestId,
            customerLocation: { lat, lng },
            customerDetails: details,
            chatMessages: [],
          });
        },
        error: () => {
          this.state$.next({ status: 'no_helpers' });
        },
      });
  }

  acceptRequest(): void {
    const s = this.state$.value;
    if (s.status !== 'pending' || !s.targetHelper || !s.requestId) return;
    this.socket.emit('request:accept', {
      requestId: s.requestId,
      helperId: s.targetHelper.id,
    });
  }

  rejectRequest(): void {
    const s = this.state$.value;
    if (s.status !== 'pending' || !s.targetHelper || !s.requestId) return;
    this.socket.emit('request:reject', {
      requestId: s.requestId,
      helperId: s.targetHelper.id,
    });
  }

  markReached(): void {
    const s = this.state$.value;
    if ((s.status !== 'assigned' && s.status !== 'reached') || !s.assignedHelper || !s.requestId) return;
    this.socket.emit('request:reached', {
      requestId: s.requestId,
      helperId: s.assignedHelper.id,
    });
  }

  completeRequest(): void {
    const s = this.state$.value;
    if ((s.status !== 'assigned' && s.status !== 'reached') || !s.assignedHelper || !s.requestId) return;
    this.socket.emit('request:done', {
      requestId: s.requestId,
      helperId: s.assignedHelper.id,
    });
  }

  cancelRequestByCustomer(): void {
    const s = this.state$.value;
    if (!s.requestId) return;
    const apiUrl = this.auth.getApiUrl();
    this.http.post<boolean>(`${apiUrl}/request/cancel`, { requestId: s.requestId }).subscribe({
      next: (ok) => {
        if (!ok) return;
        this.state$.next({
          ...this.state$.value,
          status: 'cancelled',
        });
      },
      error: () => {},
    });
  }

  sendChatMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    const s = this.state$.value;
    if (!s.requestId) return;
    if (s.status !== 'assigned' && s.status !== 'reached') return;
    this.socket.emit('chat:send', {
      requestId: s.requestId,
      text: trimmed,
    });
  }

  reset(): void {
    this.state$.next({ status: 'idle' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
