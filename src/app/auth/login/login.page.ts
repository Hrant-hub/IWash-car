import { environment } from '../../../environments/environment';
import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { OnboardingService } from '../../core/services/onboarding.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements AfterViewInit {
  form: FormGroup;
  submitting = false;
  private googleInitialized = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private onboarding: OnboardingService,
    private toast: ToastController
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    const { email, password } = this.form.value;

    this.auth
      .login(email, password)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: async () => {
          this.onboarding.complete();
          const t = await this.toast.create({
            message: 'Login successful',
            color: 'success',
            duration: 2000,
          });
          await t.present();
          this.auth.navigateAfterAuth();
        },
        error: async () => {
          const t = await this.toast.create({
            message: 'Login failed. Please try again.',
            color: 'danger',
            duration: 2500,
          });
          await t.present();
        },
      });
  }

  ngAfterViewInit(): void {
    this.initGoogleButton();
  }

  private initGoogleButton(): void {
    if (this.googleInitialized) return;
    const g = (window as any).google;
    const googleClientId = (window as any).__env?.googleClientId || environment.googleClientId || '';
    if (!g?.accounts?.id) return;
    if (!googleClientId) return;

    g.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response: { credential?: string }) => {
        const token = response?.credential;
        if (!token) return;
        this.auth.loginWithGoogle(token).subscribe({
          next: async () => {
            this.onboarding.complete();
            const t = await this.toast.create({
              message: 'Google login successful',
              color: 'success',
              duration: 2000,
            });
            await t.present();
            this.auth.navigateAfterAuth();
          },
          error: async () => {
            const t = await this.toast.create({
              message: 'Google login failed',
              color: 'danger',
              duration: 2500,
            });
            await t.present();
          },
        });
      },
    });

    const container = document.getElementById('google-btn');
    if (container) {
      g.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        width: 320,
      });
      this.googleInitialized = true;
    }
  }
}
