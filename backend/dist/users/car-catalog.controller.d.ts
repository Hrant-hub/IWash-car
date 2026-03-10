import { UsersService } from './users.service';
export declare class CarCatalogController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCarBrands(): Promise<{
        id: number;
        name: string;
    }[]>;
    getCarModels(brandId: string): Promise<{
        id: number;
        name: string;
        brandId: number;
    }[]>;
}
