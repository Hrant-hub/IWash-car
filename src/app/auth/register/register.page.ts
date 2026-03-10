import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { OnboardingService } from '../../core/services/onboarding.service';
import { RegisterDraftService } from '../../core/services/register-draft.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnDestroy {
  private destroy$ = new Subject<void>();
  form: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private onboarding: OnboardingService,
    private registerDraft: RegisterDraftService,
    private toast: ToastController
  ) {
    this.form = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        termsAccepted: [false, Validators.requiredTrue],
      },
      { validators: (g: AbstractControl) => this.passwordMatch(g as FormGroup) }
    );

    const draft = this.registerDraft.load();
    if (draft) {
      this.form.patchValue(draft);
    }
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.registerDraft.save(value));
  }

  private passwordMatch(group: FormGroup): null | { passwordMismatch: true } {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p !== c ? { passwordMismatch: true } : null;
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    const { email, password, termsAccepted } = this.form.value;

    this.auth
      .register(email, password, termsAccepted)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: async () => {
          this.registerDraft.clear();
          this.onboarding.complete();
          const t = await this.toast.create({
            message: 'Registration successful',
            color: 'success',
            duration: 2000,
          });
          await t.present();
          this.auth.navigateAfterAuth();
        },
        error: async () => {
          const t = await this.toast.create({
            message: 'Registration failed. Please try again.',
            color: 'danger',
            duration: 2500,
          });
          await t.present();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
