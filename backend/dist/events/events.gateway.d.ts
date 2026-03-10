import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { RequestService } from '../request/request.service';
import { UsersService } from '../users/users.service';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private request;
    private jwtService;
    private usersService;
    private configService;
    server: Server;
    private readonly logger;
    private userSockets;
    private socketUsers;
    constructor(request: RequestService, jwtService: JwtService, usersService: UsersService, configService: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    private broadcastEvent;
    handleHelperOnline(client: Socket, payload: {
        active: boolean;
    }): Promise<void>;
    handleJoin(client: Socket, payload: {
        userId: string;
    }): void;
    handleAccept(client: unknown, payload: {
        requestId: string;
        helperId: string;
    }): Promise<void>;
    handleReject(client: unknown, payload: {
        requestId: string;
        helperId: string;
    }): Promise<void>;
    handleReached(client: unknown, payload: {
        requestId: string;
        helperId: string;
    }): Promise<void>;
    handleDone(client: unknown, payload: {
        requestId: string;
        helperId: string;
    }): Promise<void>;
    handleChatSend(client: Socket, payload: {
        requestId: string;
        text: string;
    }): Promise<void>;
}
