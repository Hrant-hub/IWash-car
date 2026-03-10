"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./user.entity");
const customer_car_entity_1 = require("./customer-car.entity");
const customer_location_entity_1 = require("./customer-location.entity");
const customer_card_entity_1 = require("./customer-card.entity");
const car_brand_entity_1 = require("./car-brand.entity");
const car_model_entity_1 = require("./car-model.entity");
let UsersService = class UsersService {
    constructor(repo, carRepo, locationRepo, cardRepo, carBrandRepo, carModelRepo) {
        this.repo = repo;
        this.carRepo = carRepo;
        this.locationRepo = locationRepo;
        this.cardRepo = cardRepo;
        this.carBrandRepo = carBrandRepo;
        this.carModelRepo = carModelRepo;
    }
    async onModuleInit() {
        await this.seedCarCatalogIfEmpty();
    }
    async findByEmail(email) {
        return this.repo.findOne({ where: { email } });
    }
    async findById(id) {
        return this.repo.findOne({ where: { id } });
    }
    async updateRole(userId, role) {
        await this.repo.update(userId, { role });
    }
    async updateCarInfo(userId, brandId, modelId, plateNumber) {
        const brand = await this.carBrandRepo.findOne({ where: { id: brandId } });
        const model = await this.carModelRepo.findOne({ where: { id: modelId, brandId } });
        if (!brand || !model) {
            throw new common_1.NotFoundException('Brand or model not found');
        }
        const fullModel = `${brand.name} ${model.name}`;
        const normalizedPlate = plateNumber.toUpperCase();
        await this.repo.update(userId, {
            carBrandId: brand.id,
            carModelId: model.id,
            carModel: fullModel,
            plateNumber: normalizedPlate,
        });
        const existingPrimaryCar = await this.carRepo.findOne({
            where: { customerId: userId },
            order: { createdAt: 'ASC' },
        });
        if (existingPrimaryCar) {
            existingPrimaryCar.model = fullModel;
            existingPrimaryCar.plateNumber = normalizedPlate;
            await this.carRepo.save(existingPrimaryCar);
        }
        else {
            const created = this.carRepo.create({
                customerId: userId,
                model: fullModel,
                plateNumber: normalizedPlate,
            });
            await this.carRepo.save(created);
        }
    }
    async createUser(email, password, role, termsAccepted = false) {
        const passwordHash = await bcrypt.hash(password, 10);
        const user = this.repo.create({
            email,
            passwordHash,
            role,
            termsAccepted,
            termsAcceptedAt: termsAccepted ? new Date() : null,
        });
        return this.repo.save(user);
    }
    async findOrCreateByEmail(email, password, role) {
        const existing = await this.findByEmail(email);
        if (existing)
            return existing;
        return this.createUser(email, password, role);
    }
    async validatePassword(user, password) {
        return bcrypt.compare(password, user.passwordHash);
    }
    async updateLocation(userId, lat, lng) {
        await this.repo.update(userId, { lat, lng });
    }
    async setActive(userId, active) {
        await this.repo.update(userId, { active });
    }
    async getActiveHelpers() {
        return this.repo.find({
            where: { role: 'helper', active: true },
        });
    }
    async getActiveHelpersExcluding(excludeIds) {
        if (excludeIds.length === 0) {
            return this.getActiveHelpers();
        }
        const qb = this.repo.createQueryBuilder('u')
            .where('u.role = :role', { role: 'helper' })
            .andWhere('u.active = :active', { active: true })
            .andWhere('u.lat IS NOT NULL')
            .andWhere('u.lng IS NOT NULL')
            .andWhere('u.id NOT IN (:...excludeIds)', { excludeIds });
        return qb.getMany();
    }
    async getCustomerCars(customerId) {
        return this.carRepo.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
        });
    }
    async getCarBrands() {
        const brands = await this.carBrandRepo.find({ order: { id: 'ASC' } });
        return brands.map((brand) => ({ id: brand.id, name: brand.name }));
    }
    async getCarModelsByBrand(brandId) {
        const models = await this.carModelRepo.find({
            where: { brandId },
            order: { id: 'ASC' },
        });
        return models.map((model) => ({ id: model.id, name: model.name, brandId: model.brandId }));
    }
    async addCustomerCar(customerId, model, plateNumber) {
        const car = this.carRepo.create({
            customerId,
            model: model.trim(),
            plateNumber: plateNumber.trim().toUpperCase(),
        });
        const savedCar = await this.carRepo.save(car);
        await this.syncPrimaryCarInfo(customerId);
        return savedCar;
    }
    async updateCustomerCar(customerId, carId, model, plateNumber) {
        const car = await this.carRepo.findOne({ where: { id: carId, customerId } });
        if (!car)
            throw new common_1.NotFoundException('Car not found');
        car.model = model.trim();
        car.plateNumber = plateNumber.trim().toUpperCase();
        const savedCar = await this.carRepo.save(car);
        await this.syncPrimaryCarInfo(customerId);
        return savedCar;
    }
    async deleteCustomerCar(customerId, carId) {
        const result = await this.carRepo.delete({ id: carId, customerId });
        if (!result.affected)
            throw new common_1.NotFoundException('Car not found');
        await this.syncPrimaryCarInfo(customerId);
    }
    async getCustomerLocations(customerId) {
        return this.locationRepo.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
        });
    }
    async addCustomerLocation(customerId, address, lat, lng, label) {
        const trimmedAddress = address.trim();
        const location = this.locationRepo.create({
            customerId,
            label: (label?.trim() || trimmedAddress).slice(0, 80),
            address: trimmedAddress,
            lat: typeof lat === 'number' ? lat : null,
            lng: typeof lng === 'number' ? lng : null,
        });
        return this.locationRepo.save(location);
    }
    async updateCustomerLocation(customerId, locationId, address, lat, lng, label) {
        const location = await this.locationRepo.findOne({ where: { id: locationId, customerId } });
        if (!location)
            throw new common_1.NotFoundException('Location not found');
        const trimmedAddress = address.trim();
        location.label = (label?.trim() || trimmedAddress).slice(0, 80);
        location.address = trimmedAddress;
        location.lat = typeof lat === 'number' ? lat : null;
        location.lng = typeof lng === 'number' ? lng : null;
        return this.locationRepo.save(location);
    }
    async deleteCustomerLocation(customerId, locationId) {
        const result = await this.locationRepo.delete({ id: locationId, customerId });
        if (!result.affected)
            throw new common_1.NotFoundException('Location not found');
    }
    async getCustomerCards(customerId) {
        return this.cardRepo.find({
            where: { customerId },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }
    async addCustomerCard(customerId, input) {
        const duplicate = await this.cardRepo.findOne({
            where: {
                customerId,
                brand: input.brand,
                last4: input.last4,
                expiryMonth: input.expiryMonth,
                expiryYear: input.expiryYear,
            },
        });
        if (duplicate) {
            throw new common_1.BadRequestException('Card already exists');
        }
        const existingCards = await this.getCustomerCards(customerId);
        const card = this.cardRepo.create({
            customerId,
            brand: input.brand,
            last4: input.last4,
            expiryMonth: input.expiryMonth,
            expiryYear: input.expiryYear,
            holderName: input.holderName.trim(),
            isDefault: existingCards.length === 0,
        });
        return this.cardRepo.save(card);
    }
    async deleteCustomerCard(customerId, cardId) {
        const card = await this.cardRepo.findOne({ where: { id: cardId, customerId } });
        if (!card)
            throw new common_1.NotFoundException('Card not found');
        const wasDefault = card.isDefault;
        await this.cardRepo.delete({ id: cardId, customerId });
        if (!wasDefault)
            return;
        const remaining = await this.cardRepo.find({
            where: { customerId },
            order: { createdAt: 'ASC' },
        });
        if (remaining.length > 0) {
            await this.cardRepo.update(remaining[0].id, { isDefault: true });
        }
    }
    async setDefaultCustomerCard(customerId, cardId) {
        const card = await this.cardRepo.findOne({ where: { id: cardId, customerId } });
        if (!card)
            throw new common_1.NotFoundException('Card not found');
        await this.cardRepo.createQueryBuilder()
            .update(customer_card_entity_1.CustomerCard)
            .set({ isDefault: false })
            .where('customerId = :customerId', { customerId })
            .execute();
        await this.cardRepo.update(cardId, { isDefault: true });
    }
    async syncPrimaryCarInfo(customerId) {
        const firstCar = await this.carRepo.findOne({
            where: { customerId },
            order: { createdAt: 'ASC' },
        });
        await this.repo.update(customerId, {
            carModel: firstCar?.model ?? null,
            plateNumber: firstCar?.plateNumber ?? null,
        });
    }
    async seedCarCatalogIfEmpty() {
        const catalog = {
            BMW: ['1 Series', '3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X6', 'M3'],
            Mercedes: ['A Class', 'C Class', 'E Class', 'S Class', 'GLA', 'GLC', 'GLE', 'G Class'],
            Toyota: ['Yaris', 'Corolla', 'Camry', 'RAV4', 'Highlander', 'Prado', 'Land Cruiser', 'Prius'],
            Audi: ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8'],
            Volkswagen: ['Polo', 'Golf', 'Passat', 'Jetta', 'Tiguan', 'Touareg'],
            Nissan: ['Micra', 'Sentra', 'Altima', 'Qashqai', 'X-Trail', 'Patrol'],
            Honda: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot'],
            Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona'],
            Kia: ['Rio', 'Cerato', 'Optima', 'Sportage', 'Sorento'],
            Ford: ['Focus', 'Fusion', 'Mustang', 'Escape', 'Explorer', 'F-150'],
            Chevrolet: ['Spark', 'Cruze', 'Malibu', 'Equinox', 'Tahoe'],
            Lexus: ['IS', 'ES', 'GS', 'RX', 'NX', 'LX'],
            Mazda: ['Mazda 3', 'Mazda 6', 'CX-3', 'CX-5', 'CX-9'],
            Porsche: ['Cayenne', 'Macan', 'Panamera', '911', 'Taycan'],
            Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y'],
            Renault: ['Clio', 'Megane', 'Duster', 'Captur', 'Kadjar'],
            Peugeot: ['208', '308', '3008', '5008', '508'],
            Skoda: ['Fabia', 'Octavia', 'Superb', 'Kodiaq', 'Karoq'],
            Subaru: ['Impreza', 'Legacy', 'Forester', 'Outback', 'XV'],
            Mitsubishi: ['Lancer', 'ASX', 'Outlander', 'Pajero', 'Eclipse Cross'],
            Jeep: ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler'],
            Volvo: ['S60', 'S90', 'XC40', 'XC60', 'XC90'],
            Infiniti: ['Q50', 'Q60', 'QX50', 'QX60', 'QX80'],
            Jaguar: ['XE', 'XF', 'XJ', 'F-PACE', 'E-PACE'],
            'Land Rover': ['Range Rover', 'Range Rover Sport', 'Velar', 'Discovery', 'Defender'],
        };
        for (const [brandName, models] of Object.entries(catalog)) {
            let brand = await this.carBrandRepo.findOne({ where: { name: brandName } });
            if (!brand) {
                brand = await this.carBrandRepo.save(this.carBrandRepo.create({ name: brandName }));
            }
            const existingModels = await this.carModelRepo.find({ where: { brandId: brand.id } });
            const existingModelNames = new Set(existingModels.map((m) => m.name.toLowerCase()));
            const missingModels = models.filter((modelName) => !existingModelNames.has(modelName.toLowerCase()));
            if (missingModels.length > 0) {
                await this.carModelRepo.save(missingModels.map((modelName) => this.carModelRepo.create({ name: modelName, brandId: brand.id })));
            }
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_car_entity_1.CustomerCar)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_location_entity_1.CustomerLocation)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_card_entity_1.CustomerCard)),
    __param(4, (0, typeorm_1.InjectRepository)(car_brand_entity_1.CarBrand)),
    __param(5, (0, typeorm_1.InjectRepository)(car_model_entity_1.CarModel)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map