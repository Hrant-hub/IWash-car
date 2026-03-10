import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subject, finalize, takeUntil } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { CarBrandOption, CarCatalogService, CarModelOption } from '../core/services/car-catalog.service';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.page.html',
  styleUrls: ['./complete-profile.page.scss'],
  standalone: false,
})
export class CompleteProfilePage implements OnInit, OnDestroy {
  form: FormGroup;
  submitting = false;
  loadingBrands = false;
  loadingModels = false;
  brands: CarBrandOption[] = [];
  models: CarModelOption[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private carCatalog: CarCatalogService,
    private router: Router,
    private toast: ToastController,
  ) {
    this.form = this.fb.group({
      brandId: [null, [Validators.required]],
      modelId: [null, [Validators.required]],
      plateNumber: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    this.loadBrands();
    this.form
      .get('brandId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((brandId) => {
        this.form.patchValue({ modelId: null }, { emitEvent: false });
        this.models = [];
        const id = Number(brandId);
        if (Number.isInteger(id) && id > 0) {
          this.loadModels(id);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPlateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = (input?.value || '').toUpperCase();
    
    this.form.patchValue({ plateNumber: value }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;

    const brandId = Number(this.form.value.brandId);
    const modelId = Number(this.form.value.modelId);
    const plateNumber = this.form.value.plateNumber?.trim().toUpperCase();

    this.auth
      .completeProfile(brandId, modelId, plateNumber)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: async () => {
          const t = await this.toast.create({
            message: 'Profile completed successfully.',
            color: 'success',
            duration: 2000,
          });
          await t.present();
          this.router.navigate(['/customer']);
        },
        error: async () => {
          const t = await this.toast.create({
            message: 'Could not save profile. Please try again.',
            color: 'danger',
            duration: 2500,
          });
          await t.present();
        },
      });
  }

  private loadBrands(): void {
    this.loadingBrands = true;
    this.carCatalog
      .getBrands()
      .pipe(
        finalize(() => (this.loadingBrands = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (brands) => {
          this.brands = brands || [];
        },
        error: () => {
          this.brands = [];
        },
      });
  }

  private loadModels(brandId: number): void {
    this.loadingModels = true;
    this.carCatalog
      .getModelsByBrand(brandId)
      .pipe(
        finalize(() => (this.loadingModels = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (models) => {
          this.models = models || [];
        },
        error: () => {
          this.models = [];
        },
      });
  }
}

