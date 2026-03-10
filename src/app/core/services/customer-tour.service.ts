import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomerTourService {
  private buildKey(userId: string): string {
    return `customer_tour_seen_${userId}`;
  }

  shouldRun(userId: string | null): boolean {
    if (!userId) return false;
    return localStorage.getItem(this.buildKey(userId)) !== 'true';
  }

  markSeen(userId: string | null): void {
    if (!userId) return;
    localStorage.setItem(this.buildKey(userId), 'true');
  }
}

