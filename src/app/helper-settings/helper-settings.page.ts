import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../core/services/auth.service';
import { HelperStateService } from '../core/services/helper-state.service';
import { OrderHistoryService } from '../core/services/order-history.service';

@Component({
  selector: 'app-helper-settings',
  templateUrl: './helper-settings.page.html',
  styleUrls: ['./helper-settings.page.scss'],
  standalone: false,
})
export class HelperSettingsPage implements OnInit {
  profile: UserProfile | null = null;
  loadingProfile = true;
  ordersCount = 0;
  isActive = false;
  userId = '';

  constructor(
    private auth: AuthService,
    private helperState: HelperStateService,
    private history: OrderHistoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId() || '';
    this.auth.getMe().subscribe({
      next: (me) => {
        this.profile = me;
        this.isActive = me.active === true;
        if (this.userId) {
          this.helperState.syncFromDb(this.userId, this.isActive);
        }
        this.loadingProfile = false;
      },
      error: () => (this.loadingProfile = false),
    });
    this.history.getHelperHistory().subscribe({
      next: (orders) => (this.ordersCount = orders.length),
      error: () => (this.ordersCount = 0),
    });
    this.helperState.activeState$.subscribe((state) => {
      if (this.userId in state) {
        this.isActive = state[this.userId] ?? false;
      }
    });
  }

  toggleActive(next: boolean): void {
    if (!this.userId) return;
    this.helperState.setActive(this.userId, next);
  }

  backToDashboard(): void {
    this.router.navigate(['/helper']);
  }
}
