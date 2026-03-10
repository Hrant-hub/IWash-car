import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { IonModal, ToastController } from '@ionic/angular';
import { Subject, debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs';
import { LocationService } from '../core/services/location.service';
import { RequestService, RequestState } from '../core/services/request.service';
import { HelperLocationService } from '../core/services/helper-location.service';
import { SocketService } from '../core/services/socket.service';
import { AuthService } from '../core/services/auth.service';
import { CustomerTourService } from '../core/services/customer-tour.service';
import { MapMarker } from '../shared/components/map/map.component';
import { CardService, SavedCard } from '../core/services/card.service';
import { CustomerPreferencesService } from '../core/services/customer-preferences.service';

type PaymentMethod = { type: 'cash' } | { type: 'card'; cardId: string };
declare const google: any;

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
  standalone: false,
})
export class CustomerPage implements OnInit, OnDestroy {
  @ViewChild('locationPickerMap') locationPickerMapRef?: ElementRef<HTMLDivElement>;
  @ViewChild('dashboardSheetModal') dashboardSheetModal?: IonModal;
  @ViewChild('paymentSheetModal') paymentSheetModal?: IonModal;
  @ViewChild('locationPickerModal') locationPickerModal?: IonModal;
  private destroy$ = new Subject<void>();
  private addressInput$ = new Subject<string>();
  mapCenter = { lat: 40.7128, lng: -74.006 };
  mapMarkers: MapMarker[] = [];
  customerLocation: { lat: number; lng: number } | null = null;
  selectedLocation: { lat: number; lng: number; address: string } | null = null;
  selectedPaymentMethod: PaymentMethod | null = null;
  paymentModalOpen = false;
  servicePrice = 3000;
  manualAddress = '';
  placeSuggestions: Array<{ placeId: string; description: string }> = [];
  savedLocations: Array<{ id: string; label: string; address: string }> = [];
  locationPickerOpen = false;
  dashboardSheetOpen = true;
  isCustomerDashboard = false;
  pickerMapCenter = { lat: 40.7128, lng: -74.006 };
  pickerSelectedLocation: { lat: number; lng: number; address: string } | null = null;
  mapDetailMode = false;
  isCompactSheet = false;
  resolvingLocation = false;
  dashboardSheetBreakpoint = 0.48;
  selectedCarId: string | null = null;
  selectedCardId: string | null = null;
  savedCards: SavedCard[] = [];
  showAddCardForm = false;
  cardForm: FormGroup;
  savedCars: Array<{ id: string; model: string; plateNumber: string }> = [];
  loading = true;
  error: string | null = null;
  requestState: RequestState = { status: 'idle' };
  assignedHelperPosition: { lat: number; lng: number } | null = null;
  tourActive = false;
  tourStepIndex = 0;
  highlightStyle: Record<string, string> = {};
  tooltipStyle: Record<string, string> = {};
  private pickerMap: any = null;
  private pickerMarker: any = null;
  private currentGpsAddress: string | null = null;
  private readonly hideCustomerOverlaysClass = 'hide-customer-overlays';
  private readonly hideCustomerOverlaysDuringNavClass = 'hide-customer-overlays-during-nav';

  private readonly tourSteps: Array<{ target: string; text: string }> = [
    { target: '[data-tour="car-selector"]', text: 'Select your car before requesting help.' },
    { target: '[data-tour="location-selector"]', text: 'Choose where you want the wash.' },
    { target: '[data-tour="request-help"]', text: 'Once everything is ready, tap here to find a helper.' },
    { target: '[data-tour="payment-hint"]', text: 'Choose how you want to pay.' },
  ];

  constructor(
    private locationService: LocationService,
    private requestService: RequestService,
    private helperLocation: HelperLocationService,
    private socketService: SocketService,
    private cardService: CardService,
    private authService: AuthService,
    private customerPreferences: CustomerPreferencesService,
    private customerTourService: CustomerTourService,
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastController
  ) {
    this.cardForm = this.fb.group({
      holderName: ['', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.minLength(12)]],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.applyGlobalOverlayVisibility(this.router.url, false);
  }

  ngOnInit(): void {
    this.syncDashboardVisibility(this.router.url);
    this.applyGlobalOverlayVisibility(this.router.url, false);
    this.router.events
      .pipe(
        filter((event): event is NavigationStart | NavigationEnd =>
          event instanceof NavigationStart || event instanceof NavigationEnd
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.applyGlobalOverlayVisibility(event.url, true);
        }
        const targetUrl = event instanceof NavigationEnd ? event.urlAfterRedirects : event.url;
        this.syncDashboardVisibility(targetUrl);
        if (event instanceof NavigationEnd) {
          this.applyGlobalOverlayVisibility(event.urlAfterRedirects, false);
        }
      });

    this.socketService.connect();
    this.loadLocation();
    this.authService.getMe().pipe(takeUntil(this.destroy$)).subscribe({
      next: (me) => {
        if (!this.savedCars.length && me.carModel && me.plateNumber) {
          this.savedCars = [
            {
              id: 'profile-car',
              model: me.carModel,
              plateNumber: me.plateNumber,
            },
          ];
          this.selectedCarId = 'profile-car';
        }
      },
      error: () => {},
    });
    this.customerPreferences.getCars().pipe(takeUntil(this.destroy$)).subscribe({
      next: (cars) => {
        if (cars.length > 0) {
          this.savedCars = cars.map((c) => ({ id: c.id, model: c.model, plateNumber: c.plateNumber }));
          if (!this.selectedCarId || !this.savedCars.some((car) => car.id === this.selectedCarId)) {
            this.selectedCarId = this.savedCars[0].id;
          }
        }
      },
      error: () => {},
    });
    this.customerPreferences.getLocations().pipe(takeUntil(this.destroy$)).subscribe({
      next: (locations) => {
        this.savedLocations = locations.map((l) => ({
          id: l.id,
          label: l.label,
          address: l.address,
        }));
      },
      error: () => {
        this.savedLocations = [];
      },
    });
    this.cardService.getSavedCards().pipe(takeUntil(this.destroy$)).subscribe((cards) => {
      this.savedCards = cards;
      if (!cards.length) {
        this.selectedCardId = null;
        if (this.selectedPaymentMethod?.type === 'card') {
          this.selectedPaymentMethod = null;
        }
      }
    });
    this.requestService.requestState$.pipe(takeUntil(this.destroy$)).subscribe((s) => {
      this.requestState = s;
      if (s.status === 'assigned' && s.assignedHelper && s.customerLocation) {
        this.startHelperMovementAnimation(s.assignedHelper, s.customerLocation);
        this.updateMapMarkers();
      }
    });
    this.addressInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((value) => !!value && value.trim().length > 2),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.searchPlaces(value.trim()));

    setTimeout(() => this.tryStartTour(), 350);
  }

  ionViewWillEnter(): void {
    this.dashboardSheetOpen = true;
  }

  ionViewWillLeave(): void {
    this.dashboardSheetOpen = false;
    this.locationPickerOpen = false;
    this.paymentModalOpen = false;
    this.placeSuggestions = [];
    this.forceDismissOverlays();
  }

  private syncDashboardVisibility(url: string): void {
    const cleanUrl = this.normalizeUrl(url);
    this.isCustomerDashboard = cleanUrl === '/customer';
    if (!this.isCustomerDashboard) {
      this.dashboardSheetOpen = false;
      this.locationPickerOpen = false;
      this.paymentModalOpen = false;
      this.placeSuggestions = [];
      this.forceDismissOverlays();
    }
  }

  get isRequestEnabled(): boolean {
    return !!this.selectedCarId && !!this.selectedLocation;
  }

  get isCustomerDashboardRoute(): boolean {
    const cleanUrl = this.normalizeUrl(this.router.url);
    return cleanUrl === '/customer';
  }

  private loadLocation(): void {
    this.loading = true;
    this.error = null;
    this.locationService.getCurrentPosition().subscribe({
      next: (pos) => {
        this.customerLocation = pos;
        this.mapCenter = { ...pos };
        this.updateMapMarkers();
        this.loading = false;
        this.resolveAddress(pos.lat, pos.lng, 'Ընթացիկ GPS տեղադրություն').then((address) => {
          this.currentGpsAddress = address;
          if (!this.selectedLocation) {
            this.selectedLocation = { lat: pos.lat, lng: pos.lng, address };
            this.updateMapMarkers();
          }
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not get location';
        this.customerLocation = { lat: 40.7128, lng: -74.006 };
        this.mapCenter = this.customerLocation;
        this.updateMapMarkers();
        this.toast.create({ message: 'Location unavailable, using default map center.', color: 'warning', duration: 3000 }).then((t) => t.present());
      },
    });
  }

  selectCar(carId: string): void {
    this.selectedCarId = carId;
  }

  openLocationPicker(): void {
    this.locationPickerOpen = true;
    this.manualAddress = this.selectedLocation?.address || '';
    this.placeSuggestions = [];
    this.pickerSelectedLocation = this.selectedLocation
      ? { ...this.selectedLocation }
      : this.customerLocation
        ? {
            lat: this.customerLocation.lat,
            lng: this.customerLocation.lng,
            address: this.currentGpsAddress || 'Ընթացիկ GPS տեղադրություն',
          }
        : null;
  }

  onLocationPickerDidPresent(): void {
    setTimeout(() => this.initLocationPickerMap(), 50);
  }

  closeLocationPicker(): void {
    this.locationPickerOpen = false;
  }

  confirmPickedLocation(): void {
    if (!this.pickerSelectedLocation) {
      this.toast.create({ message: 'Choose a location first.', color: 'warning', duration: 2000 }).then((t) => t.present());
      return;
    }
    this.selectedLocation = { ...this.pickerSelectedLocation };
    this.mapCenter = { lat: this.selectedLocation.lat, lng: this.selectedLocation.lng };
    this.updateMapMarkers();
    this.locationPickerOpen = false;
  }

  onManualAddressInput(event: any): void {
    const value = event?.detail?.value ?? event?.target?.value ?? this.manualAddress;
    const input = String(value || '').trim();
    if (!input) {
      this.placeSuggestions = [];
      return;
    }
    this.addressInput$.next(input);
  }

  selectPlaceSuggestion(suggestion: { placeId: string; description: string }): void {
    this.manualAddress = suggestion.description;
    this.placeSuggestions = [];
    this.resolvingLocation = true;
    if (typeof google === 'undefined' || !google?.maps?.places?.PlacesService) {
      this.resolvingLocation = false;
      return;
    }
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails(
      { placeId: suggestion.placeId, fields: ['geometry', 'formatted_address'] },
      (place: any, status: string) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) {
          this.resolvingLocation = false;
          return;
        }
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || suggestion.description;
        if (this.locationPickerOpen) {
          this.setPickerLocation(lat, lng, address);
          return;
        }
        this.selectedLocation = { lat, lng, address };
        this.mapCenter = { lat, lng };
        this.updateMapMarkers();
        this.resolvingLocation = false;
      }
    );
  }

  selectSavedLocation(location: { id: string; label: string; address: string }): void {
    const fallback = this.customerLocation || { lat: 40.7128, lng: -74.006 };
    this.selectedLocation = {
      lat: fallback.lat,
      lng: fallback.lng,
      address: location.address,
    };
    this.mapCenter = { lat: this.selectedLocation.lat, lng: this.selectedLocation.lng };
    this.updateMapMarkers();
  }

  onMainMapClick(point: { lat: number; lng: number }): void {
    this.resolvingLocation = true;
    this.selectedLocation = {
      lat: point.lat,
      lng: point.lng,
      address: 'Տեղադրությունը թարմացվում է...',
    };
    this.mapCenter = { lat: point.lat, lng: point.lng };
    this.updateMapMarkers();
    this.resolveAddress(point.lat, point.lng).then((address) => {
      this.selectedLocation = { lat: point.lat, lng: point.lng, address };
      this.mapCenter = { lat: point.lat, lng: point.lng };
      this.updateMapMarkers();
      this.resolvingLocation = false;
    });
  }

  onDashboardSheetBreakpointChanged(event: CustomEvent<{ breakpoint: number }>): void {
    const bp = event?.detail?.breakpoint ?? 0.5;
    this.dashboardSheetBreakpoint = bp;
    this.isCompactSheet = bp <= 0.25;
  }

  get mapHeightPx(): number {
    if (this.dashboardSheetBreakpoint <= 0.25) return 620;
    if (this.dashboardSheetBreakpoint <= 0.5) return 520;
    return 420;
  }

  async requestHelp(): Promise<void> {
    if (!this.isRequestEnabled || !this.selectedLocation) {
      this.toast.create({ message: 'Select a car and location first.', color: 'warning', duration: 2000 }).then((t) => t.present());
      return;
    }
    this.paymentModalOpen = true;
  }

  selectCash(): void {
    this.selectedCardId = null;
    this.selectedPaymentMethod = { type: 'cash' };
  }

  selectCard(cardId: string): void {
    this.selectedCardId = cardId;
    this.selectedPaymentMethod = { type: 'card', cardId };
  }

  openAddCardForm(): void {
    this.showAddCardForm = true;
  }

  cancelAddCardForm(): void {
    this.showAddCardForm = false;
    this.cardForm.reset();
  }

  saveCard(): void {
    if (this.cardForm.invalid) return;
    const holderName = this.cardForm.value.holderName.trim();
    const cardNumber = (this.cardForm.value.cardNumber || '').replace(/\s+/g, '');
    const card = this.cardService.addCard({ holderName, cardNumber });
    this.selectCard(card.id);
    this.cancelAddCardForm();
  }

  get isPaymentConfirmEnabled(): boolean {
    return !!this.selectedPaymentMethod;
  }

  get currentTourText(): string {
    return this.tourSteps[this.tourStepIndex]?.text || '';
  }

  get isLastTourStep(): boolean {
    return this.tourStepIndex === this.tourSteps.length - 1;
  }

  confirmPaymentAndContinue(): void {
    if (!this.selectedCarId || !this.selectedLocation || !this.selectedPaymentMethod) return;
    const selectedCar = this.savedCars.find((c) => c.id === this.selectedCarId);
    const paymentLabel = this.selectedPaymentMethod.type === 'cash' ? 'cash' : 'card';
    this.requestService.requestHelp(this.selectedLocation.lat, this.selectedLocation.lng, {
      address: this.selectedLocation.address,
      carModel: selectedCar?.model,
      plateNumber: selectedCar?.plateNumber,
      paymentMethod: paymentLabel,
    });
    this.paymentModalOpen = false;
    this.router.navigate(['/search-helper'], {
      state: {
        selectedCarId: this.selectedCarId,
        selectedLocation: this.selectedLocation,
        selectedPaymentMethod: this.selectedPaymentMethod,
        carModel: selectedCar?.model,
      },
    });
  }

  nextTourStep(): void {
    if (this.isLastTourStep) {
      this.finishTour();
      return;
    }
    this.tourStepIndex += 1;
    this.positionTourOverlay();
  }

  skipTour(): void {
    this.finishTour();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.positionTourOverlay();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.positionTourOverlay();
  }

  private startHelperMovementAnimation(
    helper: { id: string; lat: number; lng: number },
    customerLoc: { lat: number; lng: number }
  ): void {
    this.assignedHelperPosition = { lat: helper.lat, lng: helper.lng };
    this.helperLocation
      .simulateMovementToward(helper.id, helper.lat, helper.lng, customerLoc.lat, customerLoc.lng)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loc) => {
        this.assignedHelperPosition = { lat: loc.lat, lng: loc.lng };
        this.updateMapMarkers();
      });
  }

  private updateMapMarkers(): void {
    const markers: MapMarker[] = [];
    if (this.selectedLocation) {
      markers.push({
        id: 'selected-location',
        lat: this.selectedLocation.lat,
        lng: this.selectedLocation.lng,
        label: 'Wash location',
        isCustomer: true,
      });
    } else if (this.customerLocation) {
      markers.push({
        id: 'customer-preview',
        lat: this.customerLocation.lat,
        lng: this.customerLocation.lng,
        label: 'Current location',
        isCustomer: true,
      });
    }
    const pos = this.assignedHelperPosition ?? this.requestState.assignedHelper;
    if (pos && 'lat' in pos && 'lng' in pos) {
      markers.push({
        id: 'assigned-helper',
        lat: pos.lat,
        lng: pos.lng,
        label: (this.requestState.assignedHelper as any)?.name ?? 'Helper',
      });
    }
    this.mapMarkers = markers;
  }

  resetRequest(): void {
    this.assignedHelperPosition = null;
    this.selectedPaymentMethod = null;
    this.selectedCardId = null;
    this.requestService.reset();
    this.updateMapMarkers();
  }

  logout(): void {
    this.authService.logout();
  }

  goToCustomerSettings(): void {
    this.isCustomerDashboard = false;
    this.dashboardSheetOpen = false;
    this.locationPickerOpen = false;
    this.paymentModalOpen = false;
    this.placeSuggestions = [];
    this.router.navigate(['/customer-settings']);
  }

  onTourBackdropClick(event: Event): void {
    event.stopPropagation();
  }

  private tryStartTour(): void {
    const userId = this.authService.getUserId();
    if (!this.customerTourService.shouldRun(userId)) return;
    this.tourActive = true;
    this.tourStepIndex = 0;
    this.positionTourOverlay();
  }

  private finishTour(): void {
    this.tourActive = false;
    this.highlightStyle = {};
    this.tooltipStyle = {};
    this.customerTourService.markSeen(this.authService.getUserId());
  }

  private positionTourOverlay(): void {
    if (!this.tourActive) return;
    const step = this.tourSteps[this.tourStepIndex];
    const target = document.querySelector(step.target) as HTMLElement | null;
    if (!target) {
      if (this.isLastTourStep) {
        this.finishTour();
      } else {
        this.tourStepIndex += 1;
        this.positionTourOverlay();
      }
      return;
    }
    const rect = target.getBoundingClientRect();
    const padding = 8;
    this.highlightStyle = {
      top: `${Math.max(0, rect.top - padding)}px`,
      left: `${Math.max(0, rect.left - padding)}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`,
    };

    const tooltipWidth = Math.min(window.innerWidth - 24, 320);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - tooltipWidth - 12));
    const shouldShowBelow = rect.top < window.innerHeight * 0.5;
    const top = shouldShowBelow ? rect.bottom + 12 : rect.top - 148;
    this.tooltipStyle = {
      width: `${tooltipWidth}px`,
      left: `${left}px`,
      top: `${Math.max(12, Math.min(top, window.innerHeight - 170))}px`,
    };
  }

  private searchPlaces(query: string): void {
    if (typeof google === 'undefined' || !google?.maps?.places?.AutocompleteService) {
      return;
    }
    const service = new google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: query }, (predictions: any[], status: string) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions?.length) {
        this.placeSuggestions = [];
        return;
      }
      this.placeSuggestions = predictions.slice(0, 5).map((p) => ({
        placeId: p.place_id,
        description: p.description,
      }));
    });
  }

  private initLocationPickerMap(): void {
    const el = this.locationPickerMapRef?.nativeElement;
    if (!el || typeof google === 'undefined' || !google?.maps?.Map) return;

    const start =
      this.pickerSelectedLocation ||
      this.selectedLocation ||
      this.customerLocation || { lat: 40.7128, lng: -74.006 };
    this.pickerMapCenter = { lat: start.lat, lng: start.lng };

    
    if (this.pickerMarker?.setMap) {
      this.pickerMarker.setMap(null);
    }
    this.pickerMarker = null;
    this.pickerMap = new google.maps.Map(el, {
      center: this.pickerMapCenter,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
    });
    this.pickerMap.addListener('click', (event: any) => {
      const lat = event?.latLng?.lat?.();
      const lng = event?.latLng?.lng?.();
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      this.setPickerLocation(lat, lng);
    });

    if (this.pickerSelectedLocation) {
      this.setPickerLocation(
        this.pickerSelectedLocation.lat,
        this.pickerSelectedLocation.lng,
        this.pickerSelectedLocation.address,
      );
    }
  }

  private setPickerLocation(lat: number, lng: number, address?: string): void {
    this.pickerMapCenter = { lat, lng };
    if (this.pickerMap) {
      this.pickerMap.setCenter(this.pickerMapCenter);
    }
    if (!this.pickerMarker && this.pickerMap && google?.maps?.Marker) {
      this.pickerMarker = new google.maps.Marker({
        map: this.pickerMap,
        position: this.pickerMapCenter,
      });
    } else if (this.pickerMarker) {
      this.pickerMarker.setPosition(this.pickerMapCenter);
    }
    if (address) {
      this.pickerSelectedLocation = { lat, lng, address };
      this.manualAddress = address;
      return;
    }
    this.reverseGeocode(lat, lng);
  }

  private reverseGeocode(lat: number, lng: number): void {
    this.resolveAddress(lat, lng, 'Ընտրված վայր').then((address) => {
      this.pickerSelectedLocation = { lat, lng, address };
      this.manualAddress = address;
    });
  }

  private resolveAddress(lat: number, lng: number, fallback = 'Ընտրված վայր'): Promise<string> {
    if (typeof google === 'undefined' || !google?.maps?.Geocoder) {
      return Promise.resolve(fallback);
    }
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        const address =
          status === 'OK' && results?.length
            ? results[0].formatted_address || results[1]?.formatted_address || fallback
            : fallback;
        resolve(address);
      });
    });
  }

  private forceDismissOverlays(): void {
    void this.dashboardSheetModal?.dismiss();
    void this.paymentSheetModal?.dismiss();
    void this.locationPickerModal?.dismiss();
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  }

  private applyGlobalOverlayVisibility(url: string, isNavigating: boolean): void {
    const isCustomerRoute = this.normalizeUrl(url) === '/customer';
    document.body.classList.toggle(this.hideCustomerOverlaysClass, !isCustomerRoute);
    document.body.classList.toggle(this.hideCustomerOverlaysDuringNavClass, isNavigating);
  }
}
