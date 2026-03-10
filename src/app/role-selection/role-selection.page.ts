import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-role-selection',
  templateUrl: './role-selection.page.html',
  styleUrls: ['./role-selection.page.scss'],
  standalone: false,
})
export class RoleSelectionPage {
  submitting = false;

  constructor(
    private auth: AuthService,
    private toast: ToastController,
  ) {}

  select(role: 'customer' | 'helper'): void {
    if (this.submitting) return;
    this.submitting = true;
    this.auth.selectRole(role).subscribe({
      next: async () => {
        const t = await this.toast.create({
          message: 'Role selected successfully',
          color: 'success',
          duration: 1500,
        });
        await t.present();
        this.auth.navigateByRole();
        this.submitting = false;
      },
      error: async () => {
        const t = await this.toast.create({
          message: 'Could not save role. Try again.',
          color: 'danger',
          duration: 2000,
        });
        await t.present();
        this.submitting = false;
      },
    });
  }
}
