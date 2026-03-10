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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelperService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
let HelperService = class HelperService {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async setActive(userId, isActive) {
        await this.usersService.setActive(userId, isActive);
    }
    async updateLocation(userId, lat, lng) {
        await this.usersService.updateLocation(userId, lat, lng);
    }
    async findClosest(customerLat, customerLng, excludeIds = []) {
        const helpers = await this.usersService.getActiveHelpersExcluding(excludeIds);
        return helpers
            .filter((h) => h.lat != null && h.lng != null)
            .map((h) => ({
            id: h.id,
            email: h.email,
            name: h.email.split('@')[0],
            lat: h.lat,
            lng: h.lng,
            distanceKm: this.haversineKm(customerLat, customerLng, h.lat, h.lng),
            etaMinutes: 0,
        }))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .map((h) => ({
            ...h,
            etaMinutes: Math.max(5, Math.min(30, Math.round(h.distanceKm * 3))),
        }));
    }
    haversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};
exports.HelperService = HelperService;
exports.HelperService = HelperService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], HelperService);
//# sourceMappingURL=helper.service.js.map