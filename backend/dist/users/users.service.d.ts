import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CustomerCar } from './customer-car.entity';
import { CustomerLocation } from './customer-location.entity';
import { CustomerCard } from './customer-card.entity';
import { CarBrand } from './car-brand.entity';
import { CarModel } from './car-model.entity';
export declare class UsersService {
    private readonly repo;
    private readonly carRepo;
    private readonly locationRepo;
    private readonly cardRepo;
    private readonly carBrandRepo;
    private readonly carModelRepo;
    constructor(repo: Repository<User>, carRepo: Repository<CustomerCar>, locationRepo: Repository<CustomerLocation>, cardRepo: Repository<CustomerCard>, carBrandRepo: Repository<CarBrand>, carModelRepo: Repository<CarModel>);
    onModuleInit(): Promise<void>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    updateRole(userId: string, role: 'customer' | 'helper'): Promise<void>;
    updateCarInfo(userId: string, brandId: number, modelId: number, plateNumber: string): Promise<void>;
    createUser(email: string, password: string, role: 'customer' | 'helper' | 'none', termsAccepted?: boolean): Promise<User>;
    findOrCreateByEmail(email: string, password: string, role: 'customer' | 'helper'): Promise<User>;
    validatePassword(user: User, password: string): Promise<boolean>;
    updateLocation(userId: string, lat: number, lng: number): Promise<void>;
    setActive(userId: string, active: boolean): Promise<void>;
    getActiveHelpers(): Promise<User[]>;
    getActiveHelpersExcluding(excludeIds: string[]): Promise<User[]>;
    getCustomerCars(customerId: string): Promise<CustomerCar[]>;
    getCarBrands(): Promise<Array<{
        id: number;
        name: string;
    }>>;
    getCarModelsByBrand(brandId: number): Promise<Array<{
        id: number;
        name: string;
        brandId: number;
    }>>;
    addCustomerCar(customerId: string, model: string, plateNumber: string): Promise<CustomerCar>;
    updateCustomerCar(customerId: string, carId: string, model: string, plateNumber: string): Promise<CustomerCar>;
    deleteCustomerCar(customerId: string, carId: string): Promise<void>;
    getCustomerLocations(customerId: string): Promise<CustomerLocation[]>;
    addCustomerLocation(customerId: string, address: string, lat?: number, lng?: number, label?: string): Promise<CustomerLocation>;
    updateCustomerLocation(customerId: string, locationId: string, address: string, lat?: number, lng?: number, label?: string): Promise<CustomerLocation>;
    deleteCustomerLocation(customerId: string, locationId: string): Promise<void>;
    getCustomerCards(customerId: string): Promise<CustomerCard[]>;
    addCustomerCard(customerId: string, input: {
        brand: string;
        last4: string;
        expiryMonth: number;
        expiryYear: number;
        holderName: string;
    }): Promise<CustomerCard>;
    deleteCustomerCard(customerId: string, cardId: string): Promise<void>;
    setDefaultCustomerCard(customerId: string, cardId: string): Promise<void>;
    private syncPrimaryCarInfo;
    private seedCarCatalogIfEmpty;
}
