# WashCar Backend (NestJS)

## Setup

```bash
cd backend
npm install --legacy-peer-deps
npm run start:dev
```

## Folder Structure

```
backend/
├── database/
│   └── schemas.sql          # SQL Server table schemas
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── roles.decorator.ts
│   ├── helper/
│   │   ├── helper.controller.ts
│   │   ├── helper.module.ts
│   │   └── helper.service.ts
│   ├── request/
│   │   ├── request.controller.ts
│   │   ├── request.module.ts
│   │   └── request.service.ts
│   ├── events/
│   │   ├── events.gateway.ts
│   │   └── events.module.ts
│   ├── app.module.ts
│   └── main.ts
└── package.json
```

## API Endpoints

### Auth (no JWT required)
- `POST /auth/login` – `{ email, password }` → `{ access_token, user }`
- `POST /auth/register` – `{ email, password, role? }` → `{ access_token, user }`

### Helper (JWT + role: helper)
- `PUT /helper/:id/active` – `{ isActive: boolean }`
- `PUT /helper/:id/location` – `{ lat, lng }`

### Request (JWT + role: customer)
- `POST /request/help` – `{ lat, lng }` → `{ requestId }`

## Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ userId }` | Join by userId |
| `request:accept` | `{ requestId, helperId }` | Helper accepts |
| `request:reject` | `{ requestId, helperId }` | Helper rejects |

### Server → Client (broadcast)
| Event | Payload | Description |
|-------|---------|-------------|
| `request:request` | `{ requestId, helperId, helper, customerLocation, lastTimeout }` | New request to helper |
| `request:accept` | `{ requestId, helperId, helper, customerLocation }` | Helper accepted |
| `request:timeout` | `{ requestId, helperId, helper, customerLocation, lastTimeout }` | Helper timed out |
| `request:reject` | `{ requestId, helperId, helper, customerLocation }` | Helper rejected |
| `request:no_helpers` | `{ requestId }` | No helpers available |

## Test Users

- customer@test.com / password123 (role: customer)
- helper@test.com / password123 (role: helper)

## SQL Server Schemas

See `database/schemas.sql` for table definitions (users, helpers, help_requests, request_helper_attempts).
