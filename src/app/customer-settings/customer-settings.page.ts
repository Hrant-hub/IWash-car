import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, filter, finalize, takeUntil } from 'rxjs';
import { AuthService, UserProfile } from '../core/services/auth.service';
import {
  CustomerCar,
  CustomerCard,
  CustomerLocation,
  CustomerSettingsApiService,
} from '../core/services/customer-settings-api.service';
import { OrderHistoryService } from '../core/services/order-history.service';
import { CarBrandOption, CarCatalogService, CarModelOption } from '../core/services/car-catalog.service';

declare const google: any;

@Component({
  selector: 'app-customer-settings',
  templateUrl: './customer-settings.page.html',
  styleUrls: ['./customer-settings.page.scss'],
  standalone: false,
})
export class CustomerSettingsPage implements OnInit, OnDestroy {
  profile: UserProfile | null = null;
  loadingProfile = true;
  ordersCount = 0;

  cars: CustomerCar[] = [];
  locations: CustomerLocation[] = [];
  cards: CustomerCard[] = [];
  brands: CarBrandOption[] = [];
  models: CarModelOption[] = [];
  loadingCars = false;
  loadingLocations = false;
  loadingCards = false;
  loadingBrands = false;
  loadingModels = false;
  addingCard = false;
  addingCar = false;
  addingLocation = false;

  cardModalOpen = false;
  carModalOpen = false;
  locationModalOpen = false;
  cardForm: FormGroup;
  carForm: FormGroup;
  locationForm: FormGroup;
  locationSuggestions: Array<{ placeId: string; description: string }> = [];
  selectedLocationDraft: { address: string; lat: number; lng: number } | null = null;
  private locationInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private carsLoaded = false;
  private profileLoaded = false;
  private profileCarSyncStarted = false;

  constructor(
    private auth: AuthService,
    private customerSettingsApi: CustomerSettingsApiService,
    private carCatalog: CarCatalogService,
    private fb: FormBuilder,
    private history: OrderHistoryService,
    private router: Router
  ) {
    this.cardForm = this.fb.group({
      holderName: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{12,19}$/)]],
      expiry: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
    this.carForm = this.fb.group({
      brandId: [null, [Validators.required]],
      modelId: [null, [Validators.required]],
      plateNumber: ['', [Validators.required, Validators.minLength(5)]],
    });
    this.locationForm = this.fb.group({
      address: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.auth.getMe().pipe(takeUntil(this.destroy$)).subscribe({
      next: (me) => {
        this.profile = me;
        this.loadingProfile = false;
        this.profileLoaded = true;
        this.ensureProfileCarExistsInCarsTable();
      },
      error: () => {
        this.loadingProfile = false;
        this.profileLoaded = true;
      },
    });

    this.locationInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((value) => !!value && value.trim().length > 2),
        takeUntil(this.destroy$),
      )
      .subscribe((value) => this.searchPlaces(value.trim()));

    this.carForm.get('brandId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((brandId) => {
      this.carForm.patchValue({ modelId: null }, { emitEvent: false });
      this.models = [];
      const id = Number(brandId);
      if (Number.isInteger(id) && id > 0) {
        this.loadModels(id);
      }
    });

    this.loadBrands();
    this.loadCars();
    this.loadLocations();
    this.loadCards();
    this.history.getCustomerHistory().subscribe({
      next: (orders) => (this.ordersCount = orders.length),
      error: () => (this.ordersCount = 0),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAddCardModal(): void {
    this.cardModalOpen = true;
    this.cardForm.reset();
  }

  closeAddCardModal(): void {
    this.cardModalOpen = false;
  }

  saveCard(): void {
    if (this.cardForm.invalid || this.addingCard) return;
    this.addingCard = true;
    this.customerSettingsApi
      .addCard({
        holderName: String(this.cardForm.value.holderName || '').trim(),
        cardNumber: String(this.cardForm.value.cardNumber || '').replace(/\s+/g, ''),
        expiry: String(this.cardForm.value.expiry || '').trim(),
        cvc: String(this.cardForm.value.cvc || '').trim(),
      })
      .pipe(
        finalize(() => (this.addingCard = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res) => {
          this.cards = res.cards;
          this.cardModalOpen = false;
        },
      });
  }

  deleteCard(id: string): void {
    this.customerSettingsApi.deleteCard(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => (this.cards = res.cards),
    });
  }

  setDefaultCard(id: string): void {
    this.customerSettingsApi.setDefaultCard(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => (this.cards = res.cards),
    });
  }

  openAddCarModal(): void {
    this.carModalOpen = true;
    this.carForm.reset();
    this.models = [];
  }

  closeAddCarModal(): void {
    this.carModalOpen = false;
  }

  saveCar(): void {
    if (this.carForm.invalid || this.addingCar) return;
    const brandId = Number(this.carForm.value.brandId);
    const modelId = Number(this.carForm.value.modelId);
    const plateNumber = String(this.carForm.value.plateNumber || '').trim().toUpperCase();
    const brand = this.brands.find((b) => b.id === brandId);
    const model = this.models.find((m) => m.id === modelId);
    if (!brand || !model || !plateNumber) return;
    const fullModel = `${brand.name} ${model.name}`;
    if (this.cars.some((c) => c.model.toLowerCase() === fullModel.toLowerCase() && c.plateNumber === plateNumber)) {
      return;
    }
    this.addingCar = true;
    this.customerSettingsApi
      .addCar({ model: fullModel, plateNumber })
      .pipe(
        finalize(() => (this.addingCar = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res) => {
          this.cars = res.cars;
          this.carModalOpen = false;
        },
      });
  }

  removeCar(id: string): void {
    this.customerSettingsApi.deleteCar(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => (this.cars = res.cars),
    });
  }

  openAddLocationModal(): void {
    this.locationModalOpen = true;
    this.locationForm.reset();
    this.locationSuggestions = [];
    this.selectedLocationDraft = null;
  }

  closeAddLocationModal(): void {
    this.locationModalOpen = false;
  }

  onLocationInput(event: any): void {
    const value = String(event?.detail?.value ?? event?.target?.value ?? '').trim();
    this.selectedLocationDraft = null;
    if (!value) {
      this.locationSuggestions = [];
      return;
    }
    this.locationInput$.next(value);
  }

  selectLocationSuggestion(suggestion: { placeId: string; description: string }): void {
    if (typeof google === 'undefined' || !google?.maps?.places?.PlacesService) return;
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails(
      { placeId: suggestion.placeId, fields: ['geometry', 'formatted_address'] },
      (place: any, status: string) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || suggestion.description;
        this.locationForm.patchValue({ address }, { emitEvent: false });
        this.selectedLocationDraft = { address, lat, lng };
        this.locationSuggestions = [];
      },
    );
  }

  saveLocation(): void {
    if (this.locationForm.invalid || this.addingLocation || !this.selectedLocationDraft) return;
    this.addingLocation = true;
    this.customerSettingsApi
      .addLocation(this.selectedLocationDraft)
      .pipe(
        finalize(() => (this.addingLocation = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res) => {
          this.locations = res.locations;
          this.locationModalOpen = false;
        },
      });
  }

  removeLocation(id: string): void {
    this.customerSettingsApi.deleteLocation(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => (this.locations = res.locations),
    });
  }

  onPlateInput(event: any): void {
    const value = String(event?.detail?.value ?? event?.target?.value ?? '').toUpperCase();
    this.carForm.patchValue({ plateNumber: value }, { emitEvent: false });
  }

  cardMask(last4: string): string {
    return `**** ${last4}`;
  }

  cardIcon(brand: string): string {
    return brand === 'visa' ? 'card-outline' : 'card-outline';
  }

  backToDashboard(): void {
    this.router.navigate(['/customer']);
  }

  private loadCars(): void {
    this.loadingCars = true;
    this.customerSettingsApi
      .getCars()
      .pipe(
        finalize(() => (this.loadingCars = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (cars) => {
          this.cars = cars;
          this.carsLoaded = true;
          this.ensureProfileCarExistsInCarsTable();
        },
        error: () => {
          this.cars = [];
          this.carsLoaded = true;
          this.ensureProfileCarExistsInCarsTable();
        },
      });
  }

  private loadLocations(): void {
    this.loadingLocations = true;
    this.customerSettingsApi
      .getLocations()
      .pipe(
        finalize(() => (this.loadingLocations = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (locations) => (this.locations = locations),
        error: () => (this.locations = []),
      });
  }

  private loadCards(): void {
    this.loadingCards = true;
    this.customerSettingsApi
      .getCards()
      .pipe(
        finalize(() => (this.loadingCards = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (cards) => (this.cards = cards),
        error: () => (this.cards = []),
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
        next: (brands) => (this.brands = brands || []),
        error: () => (this.brands = []),
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
        next: (models) => (this.models = models || []),
        error: () => (this.models = []),
      });
  }

  private searchPlaces(query: string): void {
    if (typeof google === 'undefined' || !google?.maps?.places?.AutocompleteService) return;
    const service = new google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: query }, (predictions: any[], status: string) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions?.length) {
        this.locationSuggestions = [];
        return;
      }
      this.locationSuggestions = predictions.slice(0, 6).map((p) => ({
        placeId: p.place_id,
        description: p.description,
      }));
    });
  }

  private ensureProfileCarExistsInCarsTable(): void {
    if (!this.profileLoaded || !this.carsLoaded || this.profileCarSyncStarted || this.cars.length > 0) {
      return;
    }
    const model = this.profile?.carModel?.trim();
    const plateNumber = this.profile?.plateNumber?.trim().toUpperCase();
    if (!model || !plateNumber) {
      return;
    }
    this.profileCarSyncStarted = true;
    this.customerSettingsApi.addCar({ model, plateNumber }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.cars = res.cars;
      },
      error: () => {
        this.profileCarSyncStarted = false;
      },
    });
  }
}
