import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { RequestService, RequestEvent, RequestEventPayload } from '../request/request.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private userSockets: Map<string, string> = new Map();
  private socketUsers: Map<string, string> = new Map();

  constructor(
    private request: RequestService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    this.request.onEvent((event: RequestEvent, payload: RequestEventPayload) => {
      this.broadcastEvent(event, payload);
    });
  }

  async handleConnection(client: Socket) {
    const rawToken = client.handshake?.auth?.token;
    const token =
      typeof rawToken === 'string' ? rawToken : Array.isArray(rawToken) ? rawToken[0] : null;

    if (!token) {
      this.logger.warn(`Socket ${client.id} missing auth token`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') || '',
      }) as { sub: string; role?: string };
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
    } catch (error) {
      this.logger.warn(`Socket ${client.id} token verification failed`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
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

  private broadcastEvent(event: RequestEvent, payload: RequestEventPayload): void {
    this.server.emit('request:' + event, payload);
    if (event === 'request') {
      if (payload.helperId) {
        this.server.to(`user:${payload.helperId}`).emit('incoming_request', payload);
      }
      this.server.to('helpers').emit('incoming_request', payload);
      this.logger.log(`incoming_request emitted to helpers room (requestId=${payload.requestId})`);
    }
  }

  @SubscribeMessage('helper_online')
  async handleHelperOnline(client: Socket, payload: { active: boolean }) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;
    const user = await this.usersService.findById(userId);
    if (!user || user.role !== 'helper') return;
    if (payload?.active) {
      client.join('helpers');
      this.logger.log(`Helper joined room: user=${userId}`);
    } else {
      client.leave('helpers');
      this.logger.log(`Helper left room: user=${userId}`);
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { userId: string }) {
    const userId = payload?.userId || this.socketUsers.get(client.id);
    if (userId) {
      this.userSockets.set(userId, client.id);
      this.socketUsers.set(client.id, userId);
      client.join(`user:${userId}`);
      this.logger.log(`Join acknowledged: user=${userId}`);
    }
  }

  @SubscribeMessage('request:accept')
  async handleAccept(client: unknown, payload: { requestId: string; helperId: string }) {
    await this.request.accept(payload.requestId, payload.helperId);
  }

  @SubscribeMessage('request:reject')
  async handleReject(client: unknown, payload: { requestId: string; helperId: string }) {
    await this.request.reject(payload.requestId, payload.helperId);
  }

  @SubscribeMessage('request:reached')
  async handleReached(client: unknown, payload: { requestId: string; helperId: string }) {
    await this.request.reached(payload.requestId, payload.helperId);
  }

  @SubscribeMessage('request:done')
  async handleDone(client: unknown, payload: { requestId: string; helperId: string }) {
    await this.request.done(payload.requestId, payload.helperId);
  }

  @SubscribeMessage('chat:send')
  async handleChatSend(client: Socket, payload: { requestId: string; text: string }) {
    const senderId = this.socketUsers.get(client.id);
    if (!senderId) return;
    const text = payload?.text?.trim();
    if (!payload?.requestId || !text) return;

    const participants = this.request.getChatParticipants(payload.requestId);
    if (!participants) return;
    const isParticipant =
      senderId === participants.customerId || senderId === participants.helperId;
    if (!isParticipant) return;

    const senderRole: 'customer' | 'helper' =
      senderId === participants.customerId ? 'customer' : 'helper';
    const message = {
      requestId: payload.requestId,
      senderId,
      senderRole,
      text,
      timestamp: Date.now(),
    };
    const saved = this.request.appendChatMessage(payload.requestId, message);
    if (!saved) return;

    this.server.to(`user:${participants.customerId}`).emit('chat:message', message);
    this.server.to(`user:${participants.helperId}`).emit('chat:message', message);
  }
}
