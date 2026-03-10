import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SavedCard {
  id: string;
  brand: 'visa' | 'mastercard';
  last4: string;
  holderName: string;
}

@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly cards$ = new BehaviorSubject<SavedCard[]>([
    { id: 'card-1', brand: 'visa', last4: '1234', holderName: 'John Doe' },
  ]);

  getSavedCards(): Observable<SavedCard[]> {
    return this.cards$.asObservable();
  }

  addCard(input: { cardNumber: string; holderName: string }): SavedCard {
    const last4 = input.cardNumber.slice(-4);
    const firstDigit = input.cardNumber[0];
    const brand: SavedCard['brand'] = firstDigit === '4' ? 'visa' : 'mastercard';
    const card: SavedCard = {
      id: `card-${Date.now()}`,
      brand,
      last4,
      holderName: input.holderName,
    };
    this.cards$.next([card, ...this.cards$.value]);
    return card;
  }
}

