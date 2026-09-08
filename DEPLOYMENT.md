# PlacePro — Production Deployment & Operations Guide

## 1. System Architecture Overview

PlacePro is structured as a modern high-performance full-stack web application:
- **Frontend:** React (Vite, Lucide React, Recharts, Vanilla CSS Design System).
- **Backend:** Node.js / Express REST API with TypeScript and pure algorithmic engines.
- **ORM & Database:** Prisma ORM supporting SQLite (Edge/Dev) and PostgreSQL (Production Enterprise).

---

## 2. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14.0 (for enterprise deployment) or SQLite (for single-node setup)

---

## 3. Production Build & Run Instructions

### A. Backend Setup
```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure Environment
cp .env.example .env
# Edit .env with your production JWT_SECRET and DATABASE_URL

# 3. Synchronize Database Schema & Run Seeds
npx prisma db push
npm run prisma:seed

# 4. Execute Automated Test Suite
npm test

# 5. Build TypeScript Bundle
npm run build

# 6. Start Production Server
npm start
```

### B. Frontend Setup
```bash
cd placepro

# 1. Install dependencies
npm install

# 2. Build Production Bundle
npm run build

# 3. Serve with NGINX, Cloudflare Pages, or Static Host
# Static output is located in `placepro/dist/`
```

---

## 4. Environment Variables Reference

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | API Server listening port | `5000` | No |
| `NODE_ENV` | Environment mode (`development` / `production` / `test`) | `production` | Yes |
| `JWT_SECRET` | Secret key for signing and verifying HS256 auth tokens | *Secret 64-char string* | **Yes** |
| `DATABASE_URL` | Database connection string | `file:./dev.db` or `postgresql://user:pass@host:5432/placepro` | **Yes** |
| `CORS_ORIGIN` | Allowed origin for frontend requests | `https://placepro.edu` | Recommended |

---

## 5. PostgreSQL Production Migration Path

PlacePro is architected to switch from SQLite to PostgreSQL with zero code changes:

1. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Configure `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL="postgresql://placepro_user:strong_password@localhost:5432/placepro_prod?schema=public"
```

3. Run Prisma Migration:
```bash
cd backend
npx prisma migrate dev --name init_postgresql
npx prisma db seed
```

---

## 6. Health & Liveness Verification
```bash
curl -i http://localhost:5000/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "service": "PlacePro Skill Intelligence API",
  "timestamp": "2026-09-07T10:20:00.000Z"
}
```

---

## 7. Security Best Practices
- **Never commit `.env` or secrets to source control.**
- **Enforce HTTPS (TLS 1.3) via Reverse Proxy (NGINX/Caddy/Cloudflare).**
- **Set strict rate limiting on `/api/auth/login` and `/api/auth/register`.**
- **Public Skill Passport endpoints strictly omit student PII.**
