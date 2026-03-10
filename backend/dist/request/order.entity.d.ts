export type OrderStatus = 'completed' | 'cancelled';
export interface OrderChatMessage {
    senderId: string;
    senderRole: 'customer' | 'helper';
    text: string;
    timestamp: number;
}
export declare class Order {
    id: string;
    requestId: string;
    customerId: string;
    helperId: string | null;
    status: OrderStatus;
    customerLat: number;
    customerLng: number;
    customerAddress: string | null;
    customerCarModel: string | null;
    customerPlateNumber: string | null;
    paymentMethod: string | null;
    helperName: string | null;
    helperDistanceKm: number | null;
    helperEtaMinutes: number | null;
    conversation: OrderChatMessage[] | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
