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
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const socket_io_1 = require("socket.io");
const request_service_1 = require("../request/request.service");
const users_service_1 = require("../users/users.service");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    constructor(request, jwtService, usersService, configService) {
        this.request = request;
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.configService = configService;
        this.logger = new common_1.Logger(EventsGateway_1.name);
        this.userSockets = new Map();
        this.socketUsers = new Map();
        this.request.onEvent((event, payload) => {
            this.broadcastEvent(event, payload);
        });
    }
    async handleConnection(client) {
        const rawToken = client.handshake?.auth?.token;
        const token = typeof rawToken === 'string' ? rawToken : Array.isArray(rawToken) ? rawToken[0] : null;
        if (!token) {
            this.logger.warn(`Socket ${client.id} missing auth token`);
            client.disconnect();
            return;
        }
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET') || '',
            });
            const userId = payload.sub;
            this.userSockets.set(userId, client.id);
            this.socketUsers.set(client.id, userId);
            client.join(`user:${userId}`);
            this.logger.log(`Socket connected: user=${userId}, role=${payload.role ?? 'unknown'}`);
            if (payload.role === 'helper') {
                const user = await this.usersService.findById(userId);
                if (user?.active) {
                    client.join('helpers');
                    this.logger.log(`Helper joined room on connect: user=${userId}`);
                }
            }
        }
        catch (error) {
            this.logger.warn(`Socket ${client.id} token verification failed`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = this.socketUsers.get(client.id);
        if (userId) {
            this.socketUsers.delete(client.id);
            this.userSockets.delete(userId);
            this.logger.log(`Socket disconnected: user=${userId}`);
            return;
        }
        for (const [userId, socketId] of this.userSockets) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                break;
            }
        }
    }
    broadcastEvent(event, payload) {
        this.server.emit('request:' + event, payload);
        if (event === 'request') {
            if (payload.helperId) {
                this.server.to(`user:${payload.helperId}`).emit('incoming_request', payload);
            }
            this.server.to('helpers').emit('incoming_request', payload);
            this.logger.log(`incoming_request emitted to helpers room (requestId=${payload.requestId})`);
        }
    }
    async handleHelperOnline(client, payload) {
        const userId = this.socketUsers.get(client.id);
        if (!userId)
            return;
        const user = await this.usersService.findById(userId);
        if (!user || user.role !== 'helper')
            return;
        if (payload?.active) {
            client.join('helpers');
            this.logger.log(`Helper joined room: user=${userId}`);
        }
        else {
            client.leave('helpers');
            this.logger.log(`Helper left room: user=${userId}`);
        }
    }
    handleJoin(client, payload) {
        const userId = payload?.userId || this.socketUsers.get(client.id);
        if (userId) {
            this.userSockets.set(userId, client.id);
            this.socketUsers.set(client.id, userId);
            client.join(`user:${userId}`);
            this.logger.log(`Join acknowledged: user=${userId}`);
        }
    }
    async handleAccept(client, payload) {
        await this.request.accept(payload.requestId, payload.helperId);
    }
    async handleReject(client, payload) {
        await this.request.reject(payload.requestId, payload.helperId);
    }
    async handleReached(client, payload) {
        await this.request.reached(payload.requestId, payload.helperId);
    }
    async handleDone(client, payload) {
        await this.request.done(payload.requestId, payload.helperId);
    }
    async handleChatSend(client, payload) {
        const senderId = this.socketUsers.get(client.id);
        if (!senderId)
            return;
        const text = payload?.text?.trim();
        if (!payload?.requestId || !text)
            return;
        const participants = this.request.getChatParticipants(payload.requestId);
        if (!participants)
            return;
        const isParticipant = senderId === participants.customerId || senderId === participants.helperId;
        if (!isParticipant)
            return;
        const senderRole = senderId === participants.customerId ? 'customer' : 'helper';
        const message = {
            requestId: payload.requestId,
            senderId,
            senderRole,
            text,
            timestamp: Date.now(),
        };
        const saved = this.request.appendChatMessage(payload.requestId, message);
        if (!saved)
            return;
        this.server.to(`user:${participants.customerId}`).emit('chat:message', message);
        this.server.to(`user:${participants.helperId}`).emit('chat:message', message);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('helper_online'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleHelperOnline", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('request:accept'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleAccept", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('request:reject'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleReject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('request:reached'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleReached", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('request:done'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleDone", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:send'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleChatSend", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [request_service_1.RequestService,
        jwt_1.JwtService,
        users_service_1.UsersService,
        config_1.ConfigService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map