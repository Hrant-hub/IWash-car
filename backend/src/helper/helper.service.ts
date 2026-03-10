import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

export interface HelperWithDistance {
  id: string;
  email: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  etaMinutes: number;
}

@Injectable()
export class HelperService {
  constructor(private usersService: UsersService) {}

  async setActive(userId: string, isActive: boolean): Promise<void> {
    await this.usersService.setActive(userId, isActive);
  }

  async updateLocation(userId: string, lat: number, lng: number): Promise<void> {
    await this.usersService.updateLocation(userId, lat, lng);
  }

  async findClosest(
    customerLat: number,
    customerLng: number,
    excludeIds: string[] = [],
  ): Promise<HelperWithDistance[]> {
    const helpers = await this.usersService.getActiveHelpersExcluding(excludeIds);
    return helpers
      .filter((h) => h.lat != null && h.lng != null)
      .map((h) => ({
        id: h.id,
        email: h.email,
        name: h.email.split('@')[0],
        lat: h.lat!,
        lng: h.lng!,
        distanceKm: this.haversineKm(customerLat, customerLng, h.lat!, h.lng!),
        etaMinutes: 0,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map((h) => ({
        ...h,
        etaMinutes: Math.max(5, Math.min(30, Math.round(h.distanceKm * 3))),
      }));
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
