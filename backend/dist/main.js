"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const helmet_1 = require("helmet");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret || jwtSecret.startsWith('CHANGE_ME')) {
        throw new Error('JWT_SECRET is missing or insecure. Set a strong value in environment.');
    }
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:4200').split(',').map((o) => o.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map