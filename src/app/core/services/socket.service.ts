import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private events$ = new Map<string, Subject<any>>();
  private isConnecting = false;

  constructor(private auth: AuthService) {}

  connect(): void {
    const userId = this.auth.getUserId();
    const token = this.auth.getToken();
    if (!token || !userId) {
      return;
    }

    if (this.socket?.connected || this.isConnecting) return;

    
    
    if (this.socket && !this.socket.connected) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnecting = true;
    this.socket = io(this.auth.getApiUrl(), {
      auth: { userId, token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('[socket] connected', this.socket?.id);
      if (userId) {
        this.socket!.emit('join', { userId });
      }
    });
    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      console.error('[socket] connection error', err?.message || err);
    });
    this.socket.on('disconnect', () => {
      this.isConnecting = false;
    });

    const eventNames = [
      'incoming_request',
      'request:request',
      'request:accept',
      'request:reached',
      'request:done',
      'request:cancel',
      'request:reject',
      'request:timeout',
      'request:no_helpers',
      'chat:message',
    ];
    for (const name of eventNames) {
      this.socket.on(name, (data: any) => {
        this.getSubject(name).next(data);
      });
    }
  }

  disconnect(): void {
    this.isConnecting = false;
    this.socket?.disconnect();
    this.socket = null;
  }

  on<T = any>(event: string): Observable<T> {
    return this.getSubject(event).asObservable();
  }

  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  private getSubject(event: string): Subject<any> {
    if (!this.events$.has(event)) {
      this.events$.set(event, new Subject());
    }
    return this.events$.get(event)!;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.events$.forEach((s) => s.complete());
  }
}
