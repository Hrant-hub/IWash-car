import { HelperService } from './helper.service';
declare class SetActiveDto {
    isActive: boolean;
}
declare class UpdateLocationDto {
    lat: number;
    lng: number;
}
export declare class HelperController {
    private helper;
    constructor(helper: HelperService);
    setActive(body: SetActiveDto, req: any): Promise<{
        ok: boolean;
    }>;
    updateLocation(body: UpdateLocationDto, req: any): Promise<{
        ok: boolean;
    }>;
}
export {};
