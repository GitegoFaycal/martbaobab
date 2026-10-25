# MartBaobab

A Rwanda-focused web marketplace for products, services, delivery, seller growth and community earning opportunities.

## Stack

- Frontend: React 19, Vite, Tailwind CSS 4, React Router 7
- Backend: Node.js 20+, Express 5, Prisma 6
- Database: PostgreSQL 17
- Hosting: Vercel (frontend and backend as separate projects)

## Repository layout

```
frontend/   React single-page app (Vite)
backend/    Express API, Prisma schema and migrations
```

The root `package.json` is an npm workspace that runs both apps together.

## Run locally

1. Install Node.js 20+ and Docker Desktop.
2. Create the environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

   Set `JWT_SECRET` in `backend/.env` to a long random string.

3. Start PostgreSQL and install packages:

```bash
docker compose up -d
npm install
```

4. Create the database tables and generate the Prisma client:

```bash
npm run db:migrate
```

5. (Optional) Create the first administrator. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`, then run:

```bash
npm run db:seed
```

6. Start frontend and backend:

```bash
npm run dev
```

Frontend: http://localhost:5173
API health check: http://localhost:5000/api/health

## What is implemented

- Responsive brand homepage (burgundy, orange, mint and cream palette)
- Registration as customer or seller, login, logout, session restore
- Profile view and edit, change password, forgot and reset password by email
- Role-based routes: customer, seller dashboard, admin dashboard
- Express API with Helmet, CORS allow-list, rate limiting, zod validation and central error handling
- httpOnly JWT cookie authentication
- PostgreSQL marketplace schema (users, shops, listings, orders, payments, reviews)
- Docker Compose for local PostgreSQL

## API routes

| Method | Path | Auth |
| --- | --- | --- |
| GET | /api/health | none |
| POST | /api/auth/register | none |
| POST | /api/auth/login | none |
| POST | /api/auth/logout | none |
| GET | /api/auth/me | cookie |
| PATCH | /api/accounts/profile | cookie |
| PATCH | /api/accounts/change-password | cookie |
| POST | /api/accounts/forgot-password | none |
| POST | /api/accounts/reset-password | none |

## Deploy to Vercel

Create two Vercel projects from the same repository.

### Backend project

- Root directory: `backend`
- Build command: `npm run build` (runs `prisma generate`)
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`
- `CLIENT_URL` is optional. `https://martbaobab-frontend.vercel.app` and its preview deployments are allowed by default; add other origins comma-separated
- Optional: `VERCEL_PREVIEW_PATTERN` as a regex such as `^https://martbaobab-[a-z0-9-]+\.vercel\.app$` to allow preview deployments
- Run migrations against the production database once: `npx prisma migrate deploy` from the `backend` folder with `DATABASE_URL` set

### Frontend project

- Root directory: `frontend`
- Framework preset: Vite
- `VITE_API_URL` is optional. `frontend/.env.production` already points at `https://martbaobab-backend.vercel.app/api`; set the variable in Vercel only to override it

Authentication uses a `SameSite=None; Secure` cookie in production, so both projects must be served over HTTPS and `CLIENT_URL` must match the frontend origin exactly.

## Planned modules

Shops, product and service listings, search and filters, cart, single-shop ordering, payments, delivery, reviews, subscriptions, admin moderation, notifications, rewards and later multi-shop checkout.
