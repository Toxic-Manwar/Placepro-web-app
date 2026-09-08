# PlacePro V2 — Render Production Deployment Guide

This guide details how to deploy **PlacePro** on **Render** with a managed **PostgreSQL** database and unified Express/Vite architecture.

---

## Architecture Overview

```
Render Web Service (Node.js 18+)
   ├── Express REST API (/api/*)
   ├── Static Frontend SPA Assets (placepro/dist)
   └── Prisma ORM Client
          ↓ (DATABASE_URL)
Render Managed PostgreSQL Database (placepro-db)
```

---

## Method 1: Instant 1-Click Deployment via Blueprint (Recommended)

1. Navigate to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Select your repository: **`Toxic-Manwar/Placepro-web-app`**.
4. Render automatically parses `render.yaml`, provisions:
   - **PostgreSQL Database:** `placepro-db` (Free tier)
   - **Web Service:** `placepro-app` (Free tier) with `DATABASE_URL` linked directly to `placepro-db`.
5. Click **Apply**.
6. Render builds the project, applies database migrations, seeds initial data, and publishes your live URL.

---

## Method 2: Manual Web Service & Database Setup

### Step 1: Create a PostgreSQL Database on Render
1. In the Render Dashboard, click **New +** $\rightarrow$ **PostgreSQL**.
2. Configure database settings:
   - **Name:** `placepro-db`
   - **Database:** `placepro`
   - **User:** `placepro_user`
   - **Region:** Any (e.g. `Oregon (US West)` or `Singapore`)
   - **Plan:** `Free`
3. Click **Create Database**.
4. Once created, scroll down to **Connections** and copy the **Internal Database URL** (e.g., `postgresql://placepro_user:PASSWORD@dpg-xxxxxxxx-a:5432/placepro`).

---

### Step 2: Create the Web Service
1. In the Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Select your repository: **`Toxic-Manwar/Placepro-web-app`**.
3. Configure service parameters:
   - **Name:** `placepro-app`
   - **Language:** `Node`
   - **Branch:** `main`
   - **Region:** Same region as your database
   - **Root Directory:** *(Leave blank / root)*
   - **Build Command:**
     ```bash
     npm run render-build
     ```
   - **Start Command:**
     ```bash
     npm run start:prod
     ```
   - **Plan:** `Free`

---

### Step 3: Configure Environment Variables
Under the **Environment Variables** tab of your Web Service, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production runtime flag |
| `PORT` | `5000` | Server listening port |
| `DATABASE_URL` | *Paste your Render Internal Database URL* | PostgreSQL connection string |
| `JWT_SECRET` | *(Generate a 32+ char secure key)* | Secret key for JWT auth tokens |
| `CORS_ORIGIN` | `https://<your-subdomain>.onrender.com` | Allowed CORS origin (optional) |

---

### Step 4: Configure Health Check Path
- **Health Check Path:** `/api/health`

Click **Create Web Service** (or **Manual Deploy** $\rightarrow$ **Deploy latest commit**).

---

## Verification & Health Check

Once the deployment finishes:
- **Application URL:** `https://<your-service-name>.onrender.com`
- **Health Check Endpoint:** `https://<your-service-name>.onrender.com/api/health`
  - Expected JSON:
    ```json
    {
      "status": "ok",
      "service": "PlacePro Skill Intelligence API",
      "timestamp": "2026-09-08T..."
    }
    ```

---

## Local Development Workflow

- **Local SQLite (Zero Config):**
  ```bash
  # backend/.env
  DATABASE_URL="file:./dev.db"
  ```
  Run: `npm run dev`

- **Local PostgreSQL:**
  ```bash
  # backend/.env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/placepro"
  ```
  Run: `npm run prisma:push --prefix backend && npm run dev`
