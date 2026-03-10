import { User } from './user.entity';
export declare class CustomerCar {
    id: string;
    customerId: string;
    customer: User;
    model: string;
    plateNumber: string;
    createdAt: Date;
    updatedAt: Date;
}
