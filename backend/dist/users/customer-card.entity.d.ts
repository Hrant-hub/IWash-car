import { User } from './user.entity';
export declare class CustomerCard {
    id: string;
    customerId: string;
    customer: User;
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
