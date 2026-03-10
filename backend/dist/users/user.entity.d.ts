export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    role: 'customer' | 'helper' | 'none';
    active: boolean;
    lat: number | null;
    lng: number | null;
    carModel: string | null;
    carBrandId: number | null;
    carModelId: number | null;
    plateNumber: string | null;
    termsAccepted: boolean;
    termsAcceptedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
