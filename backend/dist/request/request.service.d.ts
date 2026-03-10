import { Repository } from 'typeorm';
import { HelperService } from '../helper/helper.service';
import { Order } from './order.entity';
export interface HelpRequest {
    id: string;
    customerId: string;
    customerLat: number;
    customerLng: number;
    customerAddress?: string;
    customerCarModel?: string;
    customerPlateNumber?: string;
    paymentMethod?: string;
    status: 'pending' | 'accepted' | 'reached' | 'done' | 'rejected' | 'timeout' | 'no_helpers' | 'cancelled';
    targetHelperId?: string;
    assignedHelperId?: string;
    attemptedHelperIds: string[];
    chatMessages: {
        senderId: string;
        senderRole: 'customer' | 'helper';
        text: string;
        timestamp: number;
    }[];
    pendingStartedAt?: number;
}
export type RequestEvent = 'request' | 'accept' | 'reached' | 'done' | 'timeout' | 'reject' | 'no_helpers' | 'cancel';
export interface RequestEventPayload {
    requestId: string;
    helperId?: string;
    helper?: {
        id: string;
        name: string;
        lat: number;
        lng: number;
        distanceKm: number;
        etaMinutes: number;
    };
    customerLocation?: {
        lat: number;
        lng: number;
    };
    customerDetails?: {
        address?: string;
        carModel?: string;
        plateNumber?: string;
        paymentMethod?: string;
    };
    lastTimeout?: boolean;
    cancelledBy?: 'customer';
}
export interface ChatParticipants {
    customerId: string;
    helperId: string;
}
export declare class RequestService {
    private helper;
    private readonly ordersRepo;
    private requests;
    private eventHandlers;
    constructor(helper: HelperService, ordersRepo: Repository<Order>);
    onEvent(handler: (event: RequestEvent, payload: RequestEventPayload) => void): void;
    private emit;
    requestHelp(customerId: string, lat: number, lng: number, details?: {
        address?: string;
        carModel?: string;
        plateNumber?: string;
        paymentMethod?: string;
    }): Promise<{
        requestId: string;
    }>;
    private scheduleTimeout;
    private handleTimeout;
    accept(requestId: string, helperId: string): Promise<boolean>;
    reject(requestId: string, helperId: string): Promise<boolean>;
    reached(requestId: string, helperId: string): Promise<boolean>;
    done(requestId: string, helperId: string): Promise<boolean>;
    cancelByCustomer(requestId: string, customerId: string): Promise<boolean>;
    getCustomerHistory(customerId: string): Promise<Order[]>;
    getHelperHistory(helperId: string): Promise<Order[]>;
    getChatParticipants(requestId: string): ChatParticipants | null;
    appendChatMessage(requestId: string, message: {
        senderId: string;
        senderRole: 'customer' | 'helper';
        text: string;
        timestamp: number;
    }): boolean;
    private persistOrder;
}
