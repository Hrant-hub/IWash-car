import { UsersService } from './users.service';
declare class AddCarDto {
    model: string;
    plateNumber: string;
}
declare class AddLocationDto {
    address: string;
    lat: number;
    lng: number;
}
declare class AddCardDto {
    cardNumber: string;
    expiry: string;
    cvc: string;
    holderName: string;
}
export declare class CustomerSettingsController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCars(req: any): Promise<import("./customer-car.entity").CustomerCar[]>;
    addCar(req: any, body: AddCarDto): Promise<{
        car: import("./customer-car.entity").CustomerCar;
        cars: import("./customer-car.entity").CustomerCar[];
    }>;
    updateCar(req: any, id: string, body: AddCarDto): Promise<{
        car: import("./customer-car.entity").CustomerCar;
        cars: import("./customer-car.entity").CustomerCar[];
    }>;
    deleteCar(req: any, id: string): Promise<{
        cars: import("./customer-car.entity").CustomerCar[];
    }>;
    getLocations(req: any): Promise<import("./customer-location.entity").CustomerLocation[]>;
    addLocation(req: any, body: AddLocationDto): Promise<{
        location: import("./customer-location.entity").CustomerLocation;
        locations: import("./customer-location.entity").CustomerLocation[];
    }>;
    updateLocation(req: any, id: string, body: AddLocationDto): Promise<{
        location: import("./customer-location.entity").CustomerLocation;
        locations: import("./customer-location.entity").CustomerLocation[];
    }>;
    deleteLocation(req: any, id: string): Promise<{
        locations: import("./customer-location.entity").CustomerLocation[];
    }>;
    getCards(req: any): Promise<import("./customer-card.entity").CustomerCard[]>;
    addCard(req: any, body: AddCardDto): Promise<{
        card: import("./customer-card.entity").CustomerCard;
        cards: import("./customer-card.entity").CustomerCard[];
    }>;
    deleteCard(req: any, id: string): Promise<{
        cards: import("./customer-card.entity").CustomerCard[];
    }>;
    setDefaultCard(req: any, id: string): Promise<{
        cards: import("./customer-card.entity").CustomerCard[];
    }>;
}
export {};
