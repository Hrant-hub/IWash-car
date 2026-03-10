import {
  Component,
  Input,
  Output,
  EventEmitter,
  NgZone,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  isCustomer?: boolean;
}

declare const google: {
  maps: {
    Map: new (el: HTMLElement, opts: object) => { setCenter: (c: object) => void; setZoom: (z: number) => void };
    Marker: new (opts: { position: object; map?: unknown; title?: string; icon?: string }) => { setMap: (m: unknown) => void };
    Polyline: new (opts: { path: object[]; map?: unknown; strokeColor?: string; strokeWeight?: number }) => { setMap: (m: unknown) => void };
    event: { trigger: (instance: unknown, eventName: string) => void };
  };
};

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: false,
})
export class MapComponent implements AfterViewInit, OnChanges {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  @Input() center: { lat: number; lng: number } = { lat: 40.7128, lng: -74.006 };
  @Input() zoom = 14;
  @Input() markers: MapMarker[] = [];
  @Input() routePoints: { lat: number; lng: number }[] = [];
  @Input() refreshToken: string | number | null = null;
  @Output() mapClick = new EventEmitter<{ lat: number; lng: number }>();

  private map: any = null;
  private googleMarkers: { setMap: (m: unknown) => void }[] = [];
  private routeLine: { setMap: (m: unknown) => void } | null = null;
  private initAttempts = 0;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      if (changes['center']) {
        this.map.setCenter(this.center);
      }
      if (changes['zoom']) {
        this.map.setZoom(this.zoom);
      }
      if (changes['markers']) {
        this.updateMarkers();
      }
      if (changes['routePoints']) {
        this.updateRoute();
      }
      if (changes['refreshToken']) {
        this.refreshMapSize();
      }
    }
  }

  private initMap(): void {
    if (typeof google === 'undefined' || !google.maps || !this.mapContainer?.nativeElement) {
      if (this.initAttempts < 20) {
        this.initAttempts += 1;
        setTimeout(() => this.initMap(), 300);
      }
      return;
    }
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      mapTypeControl: true,
      zoomControl: true,
    });
    this.map.addListener('click', (event: any) => {
      const lat = event?.latLng?.lat?.();
      const lng = event?.latLng?.lng?.();
      if (typeof lat === 'number' && typeof lng === 'number') {
        this.ngZone.run(() => this.mapClick.emit({ lat, lng }));
      }
    });
    this.updateMarkers();
    this.updateRoute();
  }

  private updateRoute(): void {
    if (this.routeLine) {
      this.routeLine.setMap(null);
      this.routeLine = null;
    }
    if (!this.map || !google?.maps || this.routePoints.length < 2) return;
    const path = this.routePoints.map((p) => ({ lat: p.lat, lng: p.lng }));
    this.routeLine = new google.maps.Polyline({
      path,
      map: this.map,
      strokeColor: '#4285F4',
      strokeWeight: 4,
    });
  }

  private updateMarkers(): void {
    this.clearMarkers();
    if (!this.map || !google?.maps) return;
    this.markers.forEach((m) => {
      const marker = new google.maps.Marker({
        position: { lat: m.lat, lng: m.lng },
        map: this.map,
        title: m.label ?? m.id,
        icon: m.isCustomer
          ? undefined
          : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      });
      this.googleMarkers.push(marker);
    });
  }

  private clearMarkers(): void {
    this.googleMarkers.forEach((m) => m.setMap(null));
    this.googleMarkers = [];
  }

  private refreshMapSize(): void {
    if (!this.map || !google?.maps) return;
    setTimeout(() => {
      if (google?.maps?.event?.trigger) {
        google.maps.event.trigger(this.map, 'resize');
      }
      this.map.setCenter(this.center);
    }, 30);
  }
}
