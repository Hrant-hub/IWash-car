import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CustomerCar } from './customer-car.entity';
import { CustomerLocation } from './customer-location.entity';
import { CustomerCard } from './customer-card.entity';
import { CarBrand } from './car-brand.entity';
import { CarModel } from './car-model.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(CustomerCar)
    private readonly carRepo: Repository<CustomerCar>,
    @InjectRepository(CustomerLocation)
    private readonly locationRepo: Repository<CustomerLocation>,
    @InjectRepository(CustomerCard)
    private readonly cardRepo: Repository<CustomerCard>,
    @InjectRepository(CarBrand)
    private readonly carBrandRepo: Repository<CarBrand>,
    @InjectRepository(CarModel)
    private readonly carModelRepo: Repository<CarModel>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedCarCatalogIfEmpty();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateRole(userId: string, role: 'customer' | 'helper'): Promise<void> {
    await this.repo.update(userId, { role });
  }

  async updateCarInfo(userId: string, brandId: number, modelId: number, plateNumber: string): Promise<void> {
    const brand = await this.carBrandRepo.findOne({ where: { id: brandId } });
    const model = await this.carModelRepo.findOne({ where: { id: modelId, brandId } });
    if (!brand || !model) {
      throw new NotFoundException('Brand or model not found');
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
    } else {
      const created = this.carRepo.create({
        customerId: userId,
        model: fullModel,
        plateNumber: normalizedPlate,
      });
      await this.carRepo.save(created);
    }
  }

  async createUser(
    email: string,
    password: string,
    role: 'customer' | 'helper' | 'none',
    termsAccepted = false,
  ): Promise<User> {
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

  async findOrCreateByEmail(
    email: string,
    password: string,
    role: 'customer' | 'helper',
  ): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) return existing;
    return this.createUser(email, password, role);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async updateLocation(userId: string, lat: number, lng: number): Promise<void> {
    await this.repo.update(userId, { lat, lng });
  }

  async setActive(userId: string, active: boolean): Promise<void> {
    await this.repo.update(userId, { active });
  }

  async getActiveHelpers(): Promise<User[]> {
    return this.repo.find({
      where: { role: 'helper', active: true },
    });
  }

  async getActiveHelpersExcluding(excludeIds: string[]): Promise<User[]> {
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

  async getCustomerCars(customerId: string): Promise<CustomerCar[]> {
    return this.carRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCarBrands(): Promise<Array<{ id: number; name: string }>> {
    const brands = await this.carBrandRepo.find({ order: { id: 'ASC' } });
    return brands.map((brand) => ({ id: brand.id, name: brand.name }));
  }

  async getCarModelsByBrand(brandId: number): Promise<Array<{ id: number; name: string; brandId: number }>> {
    const models = await this.carModelRepo.find({
      where: { brandId },
      order: { id: 'ASC' },
    });
    return models.map((model) => ({ id: model.id, name: model.name, brandId: model.brandId }));
  }

  async addCustomerCar(
    customerId: string,
    model: string,
    plateNumber: string,
  ): Promise<CustomerCar> {
    const car = this.carRepo.create({
      customerId,
      model: model.trim(),
      plateNumber: plateNumber.trim().toUpperCase(),
    });
    const savedCar = await this.carRepo.save(car);
    await this.syncPrimaryCarInfo(customerId);
    return savedCar;
  }

  async updateCustomerCar(
    customerId: string,
    carId: string,
    model: string,
    plateNumber: string,
  ): Promise<CustomerCar> {
    const car = await this.carRepo.findOne({ where: { id: carId, customerId } });
    if (!car) throw new NotFoundException('Car not found');
    car.model = model.trim();
    car.plateNumber = plateNumber.trim().toUpperCase();
    const savedCar = await this.carRepo.save(car);
    await this.syncPrimaryCarInfo(customerId);
    return savedCar;
  }

  async deleteCustomerCar(customerId: string, carId: string): Promise<void> {
    const result = await this.carRepo.delete({ id: carId, customerId });
    if (!result.affected) throw new NotFoundException('Car not found');
    await this.syncPrimaryCarInfo(customerId);
  }

  async getCustomerLocations(customerId: string): Promise<CustomerLocation[]> {
    return this.locationRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async addCustomerLocation(
    customerId: string,
    address: string,
    lat?: number,
    lng?: number,
    label?: string,
  ): Promise<CustomerLocation> {
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

  async updateCustomerLocation(
    customerId: string,
    locationId: string,
    address: string,
    lat?: number,
    lng?: number,
    label?: string,
  ): Promise<CustomerLocation> {
    const location = await this.locationRepo.findOne({ where: { id: locationId, customerId } });
    if (!location) throw new NotFoundException('Location not found');
    const trimmedAddress = address.trim();
    location.label = (label?.trim() || trimmedAddress).slice(0, 80);
    location.address = trimmedAddress;
    location.lat = typeof lat === 'number' ? lat : null;
    location.lng = typeof lng === 'number' ? lng : null;
    return this.locationRepo.save(location);
  }

  async deleteCustomerLocation(customerId: string, locationId: string): Promise<void> {
    const result = await this.locationRepo.delete({ id: locationId, customerId });
    if (!result.affected) throw new NotFoundException('Location not found');
  }

  async getCustomerCards(customerId: string): Promise<CustomerCard[]> {
    return this.cardRepo.find({
      where: { customerId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async addCustomerCard(
    customerId: string,
    input: { brand: string; last4: string; expiryMonth: number; expiryYear: number; holderName: string },
  ): Promise<CustomerCard> {
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
      throw new BadRequestException('Card already exists');
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

  async deleteCustomerCard(customerId: string, cardId: string): Promise<void> {
    const card = await this.cardRepo.findOne({ where: { id: cardId, customerId } });
    if (!card) throw new NotFoundException('Card not found');
    const wasDefault = card.isDefault;
    await this.cardRepo.delete({ id: cardId, customerId });
    if (!wasDefault) return;
    const remaining = await this.cardRepo.find({
      where: { customerId },
      order: { createdAt: 'ASC' },
    });
    if (remaining.length > 0) {
      await this.cardRepo.update(remaining[0].id, { isDefault: true });
    }
  }

  async setDefaultCustomerCard(customerId: string, cardId: string): Promise<void> {
    const card = await this.cardRepo.findOne({ where: { id: cardId, customerId } });
    if (!card) throw new NotFoundException('Card not found');
    await this.cardRepo.createQueryBuilder()
      .update(CustomerCard)
      .set({ isDefault: false })
      .where('customerId = :customerId', { customerId })
      .execute();
    await this.cardRepo.update(cardId, { isDefault: true });
  }

  private async syncPrimaryCarInfo(customerId: string): Promise<void> {
    const firstCar = await this.carRepo.findOne({
      where: { customerId },
      order: { createdAt: 'ASC' },
    });
    await this.repo.update(customerId, {
      carModel: firstCar?.model ?? null,
      plateNumber: firstCar?.plateNumber ?? null,
    });
  }

  private async seedCarCatalogIfEmpty(): Promise<void> {
    const catalog: Record<string, string[]> = {
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
        await this.carModelRepo.save(
          missingModels.map((modelName) => this.carModelRepo.create({ name: modelName, brandId: brand!.id })),
        );
      }
    }
  }
}
