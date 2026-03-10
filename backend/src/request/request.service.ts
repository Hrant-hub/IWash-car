import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelperService, HelperWithDistance } from '../helper/helper.service';
import { Order, OrderStatus } from './order.entity';

const ENABLE_REQUEST_TIMEOUT = false;
const RESPONSE_TIMEOUT_MS = 7000;

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
  helper?: { id: string; name: string; lat: number; lng: number; distanceKm: number; etaMinutes: number };
  customerLocation?: { lat: number; lng: number };
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

@Injectable()
export class RequestService {
  private requests: Map<string, HelpRequest> = new Map();
  private eventHandlers: ((event: RequestEvent, payload: RequestEventPayload) => void)[] = [];

  constructor(
    private helper: HelperService,
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
  ) {}

  onEvent(handler: (event: RequestEvent, payload: RequestEventPayload) => void): void {
    this.eventHandlers.push(handler);
  }

  private emit(event: RequestEvent, payload: RequestEventPayload): void {
    this.eventHandlers.forEach((h) => h(event, payload));
  }

  async requestHelp(
    customerId: string,
    lat: number,
    lng: number,
    details?: { address?: string; carModel?: string; plateNumber?: string; paymentMethod?: string },
  ): Promise<{ requestId: string }> {
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
      await this.persistOrder(this.requests.get(id)!, 'cancelled');
      this.emit('no_helpers', { requestId: id });
      return { requestId: id };
    }
    const first = sorted[0];
    const requestId = 'req-' + Date.now();
    const req: HelpRequest = {
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

  private scheduleTimeout(requestId: string): void {
    setTimeout(() => this.handleTimeout(requestId), RESPONSE_TIMEOUT_MS);
  }

  private async handleTimeout(requestId: string): Promise<void> {
    const req = this.requests.get(requestId);
    if (!req || req.status !== 'pending') return;
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

  async accept(requestId: string, helperId: string): Promise<boolean> {
    const req = this.requests.get(requestId);
    if (!req || req.status !== 'pending' || req.targetHelperId !== helperId) return false;
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

  async reject(requestId: string, helperId: string): Promise<boolean> {
    const req = this.requests.get(requestId);
    if (!req || req.status !== 'pending' || req.targetHelperId !== helperId) return false;
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

  async reached(requestId: string, helperId: string): Promise<boolean> {
    const req = this.requests.get(requestId);
    if (!req) return false;
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

  async done(requestId: string, helperId: string): Promise<boolean> {
    const req = this.requests.get(requestId);
    if (!req) return false;
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

  async cancelByCustomer(requestId: string, customerId: string): Promise<boolean> {
    const req = this.requests.get(requestId);
    if (!req || req.customerId !== customerId) return false;
    if (req.status === 'done' || req.status === 'cancelled') return false;

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

  async getCustomerHistory(customerId: string): Promise<Order[]> {
    return this.ordersRepo.find({
      where: { customerId },
      order: { completedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async getHelperHistory(helperId: string): Promise<Order[]> {
    return this.ordersRepo.find({
      where: { helperId },
      order: { completedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  getChatParticipants(requestId: string): ChatParticipants | null {
    const req = this.requests.get(requestId);
    if (!req || !req.assignedHelperId) return null;
    if (!['accepted', 'reached', 'done'].includes(req.status)) return null;
    return {
      customerId: req.customerId,
      helperId: req.assignedHelperId,
    };
  }

  appendChatMessage(
    requestId: string,
    message: { senderId: string; senderRole: 'customer' | 'helper'; text: string; timestamp: number },
  ): boolean {
    const req = this.requests.get(requestId);
    if (!req) return false;
    const participants = this.getChatParticipants(requestId);
    if (!participants) return false;
    if (message.senderId !== participants.customerId && message.senderId !== participants.helperId) {
      return false;
    }
    req.chatMessages.push(message);
    this.requests.set(requestId, req);
    return true;
  }

  private async persistOrder(req: HelpRequest, status: OrderStatus): Promise<void> {
    let helperName: string | null = null;
    let helperDistanceKm: number | null = null;
    let helperEtaMinutes: number | null = null;

    if (req.assignedHelperId || req.targetHelperId) {
      const helperId = req.assignedHelperId || req.targetHelperId!;
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
}
