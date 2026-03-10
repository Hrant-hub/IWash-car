import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { OrderHistoryItem, OrderHistoryService } from '../core/services/order-history.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
  standalone: false,
})
export class OrderHistoryPage implements OnInit {
  loading = true;
  orders: OrderHistoryItem[] = [];
  role: 'customer' | 'helper' = 'customer';

  constructor(
    private auth: AuthService,
    private historyService: OrderHistoryService,
  ) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.role = role === 'helper' ? 'helper' : 'customer';
    const source$ = this.role === 'helper'
      ? this.historyService.getHelperHistory()
      : this.historyService.getCustomerHistory();

    source$.subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.orders = [];
        this.loading = false;
      },
    });
  }
}

