import { RequestService } from './request.service';
declare class RequestHelpDto {
    lat: number;
    lng: number;
    address: string;
    carModel: string;
    plateNumber: string;
    paymentMethod: string;
}
declare class CancelRequestDto {
    requestId: string;
}
export declare class RequestController {
    private request;
    constructor(request: RequestService);
    requestHelp(body: RequestHelpDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
        requestId: string;
    }>;
    cancelRequest(body: CancelRequestDto, req: {
        user: {
            id: string;
        };
    }): Promise<boolean>;
    getCustomerHistory(req: {
        user: {
            id: string;
        };
    }): Promise<import("./order.entity").Order[]>;
    getHelperHistory(req: {
        user: {
            id: string;
        };
    }): Promise<import("./order.entity").Order[]>;
}
export {};
