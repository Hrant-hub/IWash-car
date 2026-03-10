# WashCar

Mobile-first Ionic + Angular app with a NestJS + SQL Server backend for customer-helper car wash requests.

## Project Overview

- **Frontend**: Ionic + Angular (`/src`)
- **Backend**: NestJS + TypeORM (`/backend`)
- **Database**: Microsoft SQL Server
- **Realtime**: Socket.IO for helper/customer request events and chat

Main flows include:
- Authentication and role selection (`customer` / `helper`)
- Customer request flow with map + helper matching
- Helper accept/reject/reached/done lifecycle
- Customer/Helper settings
- Order history and realtime chat

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+
- SQL Server running and reachable

## Installation

### 1) Clone and install dependencies

```bash
npm install
cd backend
npm install
```

### 2) Backend environment setup

Create `backend/.env` from `backend/.env.example` and fill values:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=1433
DB_NAME=WashCar
DB_USER=washcar_app
DB_PASS=YOUR_DB_PASSWORD
DB_TRUST_SERVER_CERT=true
DB_SYNCHRONIZE=true
JWT_SECRET=YOUR_STRONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:4200
THROTTLE_TTL=60
THROTTLE_LIMIT=120
```

### 3) Frontend environment setup

Edit:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Set public values only:
- `apiUrl` (usually `http://localhost:3000`)
- `googleMapsApiKey` (if using maps)
- `googleClientId` (if using Google sign-in)

## Run the project

Open two terminals:

### Backend
```bash
cd backend
npm run start:dev
```

### Frontend
```bash
npm start
```

App URLs:
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`

## Build

### Backend
```bash
cd backend
npm run build
```

### Frontend
```bash
npm run build
```

## Security Notes

- Never commit real `.env` files or credentials.
- Use `.env.example` and `backend/.env.example` templates.
- Keep `JWT_SECRET` strong and private.
- Restrict Google API keys by HTTP referrer in Google Cloud.
- For production, keep `DB_SYNCHRONIZE=false`.

More details: see `SECURITY.md`.
