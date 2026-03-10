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
exports.RequestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const helper_service_1 = require("../helper/helper.service");
const order_entity_1 = require("./order.entity");
const ENABLE_REQUEST_TIMEOUT = false;
const RESPONSE_TIMEOUT_MS = 7000;
let RequestService = class RequestService {
    constructor(helper, ordersRepo) {
        this.helper = helper;
        this.ordersRepo = ordersRepo;
        this.requests = new Map();
        this.eventHandlers = [];
    }
    onEvent(handler) {
        this.eventHandlers.push(handler);
    }
    emit(event, payload) {
        this.eventHandlers.forEach((h) => h(event, payload));
    }
    async requestHelp(customerId, lat, lng, details) {
        const sorted = await this.helper.findClosest(lat, lng);
        if (sorted.length === 0) {
            const id = 'req-' + Date.now();
            this.requests.set(id, {
                id,
                customerId,
                customerLat: lat,
                customerLng: lng,
                customerAddress: details?.address,
                customerCarModel: details?.carModel,
                customerPlateNumber: details?.plateNumber,
                paymentMethod: details?.paymentMethod,
                status: 'no_helpers',
                attemptedHelperIds: [],
                chatMessages: [],
            });
            await this.persistOrder(this.requests.get(id), 'cancelled');
            this.emit('no_helpers', { requestId: id });
            return { requestId: id };
        }
        const first = sorted[0];
        const requestId = 'req-' + Date.now();
        const req = {
            id: requestId,
            customerId,
            customerLat: lat,
            customerLng: lng,
            customerAddress: details?.address,
            customerCarModel: details?.carModel,
            customerPlateNumber: details?.plateNumber,
            paymentMethod: details?.paymentMethod,
            status: 'pending',
            targetHelperId: first.id,
            attemptedHelperIds: [first.id],
            chatMessages: [],
            pendingStartedAt: Date.now(),
        };
        this.requests.set(requestId, req);
        this.emit('request', {
            requestId,
            helperId: first.id,
            helper: first,
            customerLocation: { lat, lng },
            customerDetails: {
                address: details?.address,
                carModel: details?.carModel,
                plateNumber: details?.plateNumber,
                paymentMethod: details?.paymentMethod,
            },
            lastTimeout: false,
        });
        if (ENABLE_REQUEST_TIMEOUT) {
            this.scheduleTimeout(requestId);
        }
        return { requestId };
    }
    scheduleTimeout(requestId) {
        setTimeout(() => this.handleTimeout(requestId), RESPONSE_TIMEOUT_MS);
    }
    async handleTimeout(requestId) {
        const req = this.requests.get(requestId);
        if (!req || req.status !== 'pending')
            return;
        const sorted = await this.helper.findClosest(req.customerLat, req.customerLng, req.attemptedHelperIds);
        if (sorted.length === 0) {
            req.status = 'no_helpers';
            this.requests.set(requestId, req);
            await this.persistOrder(req, 'cancelled');
            this.emit('no_helpers', { requestId });
            return;
        }
        const next = sorted[0];
        req.targetHelperId = next.id;
        req.attemptedHelperIds.push(next.id);
        req.pendingStartedAt = Date.now();
        this.requests.set(requestId, req);
        this.emit('timeout', {
            requestId,
            helperId: next.id,
            helper: next,
            customerLocation: { lat: req.customerLat, lng: req.customerLng },
            customerDetails: {
                address: req.customerAddress,
                carModel: req.customerCarModel,
                plateNumber: req.customerPlateNumber,
                paymentMethod: req.paymentMethod,
            },
            lastTimeout: true,
        });
        this.emit('request', {
            requestId,
            helperId: next.id,
            helper: next,
            customerLocation: { lat: req.customerLat, lng: req.customerLng },
            customerDetails: {
                address: req.customerAddress,
                carModel: req.customerCarModel,
                plateNumber: req.customerPlateNumber,
                paymentMethod: req.paymentMethod,
            },
            lastTimeout: true,
        });
        if (ENABLE_REQUEST_TIMEOUT) {
            this.scheduleTimeout(requestId);
        }
    }
    async accept(requestId, helperId) {
        const req = this.requests.get(requestId);
        if (!req || req.status !== 'pending' || req.targetHelperId !== helperId)
            return false;
        req.status = 'accepted';
        req.assignedHelperId = helperId;
        this.requests.set(requestId, req);
        const sorted = await this.helper.findClosest(req.customerLat, req.customerLng);
        const helperData = sorted.find((h) => h.id === helperId);
        this.emit('accept', {
            requestId,
            helperId,
            helper: helperData || { id: helperId, name: 'Helper', lat: 0, lng: 0, distanceKm: 0, etaMinutes: 5 },
            customerLocation: { lat: req.customerLat, lng: req.customerLng },
            customerDetails: {
                address: req.customerAddress,
                carModel: req.customerCarModel,
                plateNumber: req.customerPlateNumber,
                paymentMethod: req.paymentMethod,
            },
        });
        return true;
    }
    async reject(requestId, helperId) {
        const req = this.requests.get(requestId);
        if (!req || req.status !== 'pending' || req.targetHelperId !== helperId)
            return false;
        const sorted = await this.helper.findClosest(req.customerLat, req.customerLng, req.attemptedHelperIds);
        if (sorted.length === 0) {
            req.status = 'no_helpers';
            this.requests.set(requestId, req);
            await this.persistOrder(req, 'cancelled');
            this.emit('no_helpers', { requestId });
            return true;
        }
        const next = sorted[0];
        req.targetHelperId = next.id;
        req.attemptedHelperIds.push(next.id);
        req.pendingStartedAt = Date.now();
        this.requests.set(requestId, req);
        this.emit('reject', {
            requestId,
            helperId: next.id,
            helper: next,
            customerLocation: { lat: req.customerLat, lng: req.customerLng },
            customerDetails: {
                address: req.customerAddress,
                carModel: req.customerCarModel,
                plateNumber: req.customerPlateNumber,
                paymentMethod: req.paymentMethod,
            },
        });
        this.emit('request', {
            requestId,
            helperId: next.id,
            helper: next,
            customerLocation: { lat: req.customerLat, lng: req.customerLng },
            customerDetails: {
                address: req.customerAddress,
                carModel: req.customerCarModel,
                plateNumber: req.customerPlateNumber,
                paymentMethod: req.paymentMethod,
            },
        });
        if (ENABLE_REQUEST_TIMEOUT) {
            this.scheduleTimeout(requestId);
        }
        return true;
    }
    async reached(requestId, helperId) {
        const req = this.requests.get(requestId);
        if (!req)
            return false;
        if ((req.status !== 'accepted' && req.status !== 'reached') || req.assignedHelperId !== helperId) {
            return false;
        }
        req.status = 'reached';
        this.requests.set(requestId, req);
        const sorted = await this.helper.findClosest(req.customerLat, req.customerLng);
        const helperData = sorted.find((h) => h.id === helperId);
        this.emit('reached', {
            requestId,
            helperId,
            helper: helperData || { id: helperId, name: 'Helper', lat: 0, lng: 0, distanceKm: 0, etaMinutes: 0 },
            customerLocation: { lat: req.customerLat, lng: req.customerLng },
            customerDetails: {
                address: req.customerAddress,
                carModel: req.customerCarModel,
                plateNumber: req.customerPlateNumber,
                paymentMethod: req.paymentMethod,
            },
        });
        return true;
    }
    async done(requestId, helperId) {
        const req = this.requests.get(requestId);
        if (!req)
            return false;
        if ((req.status !== 'accepted' && req.status !== 'reached') || req.assignedHelperId !== helperId) {
            return false;
        }
        req.status = 'done';
        this.requests.set(requestId, req);
        await this.persistOrder(req, 'completed');
        const sorted = await this.helper.findClosest(req.customerLat, req.customerLng);
        const helperData = sorted.find((h) => h.id === helperId);
        this.emit('done', {
            requestId,
            helperId,
            helper: helperData || { id: helperId, name: 'Helper', lat: 0, lng: 0, distanceKm: 0, etaMinutes: 0 },
            customerLocation: { lat: req.customerLat, lng: req.customerLng },
            customerDetails: {
                address: req.customerAddress,
                carModel: req.customerCarModel,
                plateNumber: req.customerPlateNumber,
                paymentMethod: req.paymentMethod,
            },
        });
        return true;
    }
    async cancelByCustomer(requestId, customerId) {
        const req = this.requests.get(requestId);
        if (!req || req.customerId !== customerId)
            return false;
        if (req.status === 'done' || req.status === 'cancelled')
            return false;
        req.status = 'cancelled';
        this.requests.set(requestId, req);
        await this.persistOrder(req, 'cancelled');
        const helperId = req.assignedHelperId || req.targetHelperId;
        const sorted = await this.helper.findClosest(req.customerLat, req.customerLng);
        const helperData = helperId
            ? sorted.find((h) => h.id === helperId) || {
                id: helperId,
                name: 'Helper',
                lat: 0,
                lng: 0,
                distanceKm: 0,
                etaMinutes: 0,
            }
            : undefined;
        this.emit('cancel', {
            requestId,
            helperId,
            helper: helperData,
            customerLocation: { lat: req.customerLat, lng: req.customerLng },
            customerDetails: {
                address: req.customerAddress,
                carModel: req.customerCarModel,
                plateNumber: req.customerPlateNumber,
                paymentMethod: req.paymentMethod,
            },
            cancelledBy: 'customer',
        });
        return true;
    }
    async getCustomerHistory(customerId) {
        return this.ordersRepo.find({
            where: { customerId },
            order: { completedAt: 'DESC', createdAt: 'DESC' },
        });
    }
    async getHelperHistory(helperId) {
        return this.ordersRepo.find({
            where: { helperId },
            order: { completedAt: 'DESC', createdAt: 'DESC' },
        });
    }
    getChatParticipants(requestId) {
        const req = this.requests.get(requestId);
        if (!req || !req.assignedHelperId)
            return null;
        if (!['accepted', 'reached', 'done'].includes(req.status))
            return null;
        return {
            customerId: req.customerId,
            helperId: req.assignedHelperId,
        };
    }
    appendChatMessage(requestId, message) {
        const req = this.requests.get(requestId);
        if (!req)
            return false;
        const participants = this.getChatParticipants(requestId);
        if (!participants)
            return false;
        if (message.senderId !== participants.customerId && message.senderId !== participants.helperId) {
            return false;
        }
        req.chatMessages.push(message);
        this.requests.set(requestId, req);
        return true;
    }
    async persistOrder(req, status) {
        let helperName = null;
        let helperDistanceKm = null;
        let helperEtaMinutes = null;
        if (req.assignedHelperId || req.targetHelperId) {
            const helperId = req.assignedHelperId || req.targetHelperId;
            const helpers = await this.helper.findClosest(req.customerLat, req.customerLng);
            const matched = helpers.find((h) => h.id === helperId);
            helperName = matched?.name ?? null;
            helperDistanceKm = matched?.distanceKm ?? null;
            helperEtaMinutes = matched?.etaMinutes ?? null;
        }
        const existing = await this.ordersRepo.findOne({ where: { requestId: req.id } });
        if (existing) {
            await this.ordersRepo.update(existing.id, {
                helperId: req.assignedHelperId || req.targetHelperId || null,
                status,
                customerAddress: req.customerAddress || null,
                customerCarModel: req.customerCarModel || null,
                customerPlateNumber: req.customerPlateNumber || null,
                paymentMethod: req.paymentMethod || null,
                helperName,
                helperDistanceKm,
                helperEtaMinutes,
                conversation: req.chatMessages?.length ? req.chatMessages : null,
                completedAt: new Date(),
            });
            return;
        }
        const order = this.ordersRepo.create({
            requestId: req.id,
            customerId: req.customerId,
            helperId: req.assignedHelperId || req.targetHelperId || null,
            status,
            customerLat: req.customerLat,
            customerLng: req.customerLng,
            customerAddress: req.customerAddress || null,
            customerCarModel: req.customerCarModel || null,
            customerPlateNumber: req.customerPlateNumber || null,
            paymentMethod: req.paymentMethod || null,
            helperName,
            helperDistanceKm,
            helperEtaMinutes,
            conversation: req.chatMessages?.length ? req.chatMessages : null,
            completedAt: new Date(),
        });
        await this.ordersRepo.save(order);
    }
};
exports.RequestService = RequestService;
exports.RequestService = RequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [helper_service_1.HelperService,
        typeorm_2.Repository])
], RequestService);
//# sourceMappingURL=request.service.js.map