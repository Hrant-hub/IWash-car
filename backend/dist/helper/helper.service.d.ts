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
export declare class HelperService {
    private usersService;
    constructor(usersService: UsersService);
    setActive(userId: string, isActive: boolean): Promise<void>;
    updateLocation(userId: string, lat: number, lng: number): Promise<void>;
    findClosest(customerLat: number, customerLng: number, excludeIds?: string[]): Promise<HelperWithDistance[]>;
    private haversineKm;
}
