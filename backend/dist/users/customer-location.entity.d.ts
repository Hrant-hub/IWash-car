import { User } from './user.entity';
export declare class CustomerLocation {
    id: string;
    customerId: string;
    customer: User;
    label: string;
    address: string;
    lat: number | null;
    lng: number | null;
    createdAt: Date;
    updatedAt: Date;
}
