import { UsersService } from './users.service';
declare class CompatCardDto {
    cardNumber: string;
    expiry: string;
    cvc: string;
    holderName: string;
}
declare class CompatCarDto {
    model: string;
    plateNumber: string;
}
declare class CompatLocationDto {
    address: string;
    lat: number;
    lng: number;
}
export declare class CustomerSettingsCompatController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCards(req: any): Promise<import("./customer-card.entity").CustomerCard[]>;
    addCard(req: any, body: CompatCardDto): Promise<{
        card: import("./customer-card.entity").CustomerCard;
        cards: import("./customer-card.entity").CustomerCard[];
    }>;
    deleteCard(req: any, id: string): Promise<{
        cards: import("./customer-card.entity").CustomerCard[];
    }>;
    getCars(req: any): Promise<import("./customer-car.entity").CustomerCar[]>;
    addCar(req: any, body: CompatCarDto): Promise<{
        car: import("./customer-car.entity").CustomerCar;
        cars: import("./customer-car.entity").CustomerCar[];
    }>;
    deleteCar(req: any, id: string): Promise<{
        cars: import("./customer-car.entity").CustomerCar[];
    }>;
    getLocations(req: any): Promise<import("./customer-location.entity").CustomerLocation[]>;
    addLocation(req: any, body: CompatLocationDto): Promise<{
        location: import("./customer-location.entity").CustomerLocation;
        locations: import("./customer-location.entity").CustomerLocation[];
    }>;
    deleteLocation(req: any, id: string): Promise<{
        locations: import("./customer-location.entity").CustomerLocation[];
    }>;
}
export {};
