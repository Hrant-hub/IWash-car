import { UsersService } from './users.service';
declare class CustomerCarDto {
    model: string;
    plateNumber: string;
}
declare class CustomerLocationDto {
    label: string;
    address: string;
}
export declare class CustomerDataController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCars(req: any): Promise<import("./customer-car.entity").CustomerCar[]>;
    addCar(req: any, body: CustomerCarDto): Promise<import("./customer-car.entity").CustomerCar>;
    updateCar(req: any, id: string, body: CustomerCarDto): Promise<import("./customer-car.entity").CustomerCar>;
    deleteCar(req: any, id: string): Promise<{
        ok: boolean;
    }>;
    getLocations(req: any): Promise<import("./customer-location.entity").CustomerLocation[]>;
    addLocation(req: any, body: CustomerLocationDto): Promise<import("./customer-location.entity").CustomerLocation>;
    updateLocation(req: any, id: string, body: CustomerLocationDto): Promise<import("./customer-location.entity").CustomerLocation>;
    deleteLocation(req: any, id: string): Promise<{
        ok: boolean;
    }>;
}
export {};
