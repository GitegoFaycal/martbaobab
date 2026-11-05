# LOCO · Local Connect

LOCO is a Rwandan web app that connects buyers, sellers, workers and employers in every district. It has three parts:

| Section | What people do there |
| --- | --- |
| **Shop nearby** (`/shop`, `/services`) | Buy everyday goods and book local services from shops in their district, with moto delivery and MoMo or cash payment. |
| **Second-hand** (`/second-hand`) | Buy and sell used items at a lower price than new, with the original price shown so the saving is clear. |
| **Jobs** (`/jobs`) | Employers post daily or contract work (building sites, factories, farms, shops, homes). Workers apply with their phone number and get called. |

Everything is local to Rwanda: the 30 districts, Rwandan phone numbers, RWF prices, MTN Mobile Money, Airtel Money and cash on delivery.

## Stack

- Frontend: React 19, Vite, Tailwind CSS 4, React Router 7
- Backend: Node.js 20+, Express 5, Prisma 6, zod
- Database: PostgreSQL 17
- Hosting: Vercel (frontend and backend as separate projects)

## Repository layout

```
frontend/   React single-page app (Vite)
backend/    Express API, Prisma schema, migrations and seed
```

The root `package.json` is an npm workspace that runs both apps together.

## Run locally

1. Install Node.js 20+ and Docker Desktop.
2. Create the environment files and set `JWT_SECRET` in `backend/.env` to a long random string:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start PostgreSQL and install packages:

```bash
docker compose up -d
npm install
```

4. Create the tables and seed the categories (and the first admin if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `backend/.env`):

```bash
npm run db:migrate
npm run db:seed
```

5. Start frontend and backend:

```bash
npm run dev
```

Frontend: http://localhost:5173
API health check: http://localhost:5000/api/health

## Roles

- **Customer**: shop, order, post jobs, apply for jobs.
- **Seller**: everything a customer can do, plus one shop with listings (new, second-hand, services) and shop orders.
- **Admin**: verify shops, enable or disable users, see marketplace statistics. Created by the seed script only.

## API routes

All routes are under `/api`. "cookie" means the httpOnly session cookie set at login.

| Method | Path | Auth |
| --- | --- | --- |
| GET | /health | none |
| POST | /auth/register, /auth/login, /auth/logout | none |
| GET | /auth/me | cookie |
| PATCH | /accounts/profile, /accounts/change-password | cookie |
| POST | /accounts/forgot-password, /accounts/reset-password | none |
| GET | /categories?kind=GOODS,SERVICES,JOBS · /locations | none |
| GET | /shops · /shops/:slug | none |
| GET, POST, PATCH | /shops/me · /shops · /shops/me | seller |
| GET | /listings?search&category&district&condition&type&minPrice&maxPrice&sort&page · /listings/:slug | none |
| GET, POST, PATCH, DELETE | /listings/mine · /listings · /listings/:id | seller |
| POST, GET | /orders · /orders/mine · /orders/:id | cookie |
| GET | /orders/shop | seller |
| PATCH | /orders/:id/status | customer (cancel) or seller |
| GET | /jobs?search&category&district&jobType&page · /jobs/:slug | none |
| POST, PATCH | /jobs · /jobs/:id · /jobs/:id/toggle | cookie (owner) |
| GET | /jobs/mine · /applications/mine | cookie |
| POST | /jobs/:id/apply | cookie |
| GET, PATCH | /jobs/:id/applications · /jobs/:id/applications/:applicationId | cookie (owner) |
| GET, PATCH | /admin/stats · /admin/users · /admin/users/:id/active · /admin/shops · /admin/shops/:id/verify | admin |

## Deploy to Vercel

Create two Vercel projects from this repository.

### Backend project

- Root directory: `backend`
- Database: open the project's **Storage** tab and create or connect a **Prisma Postgres** (or Neon) database. The integration injects the connection variables. Do not add a manual `DATABASE_URL` that points at localhost
- Environment variables: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (first administrator), and the `SMTP_*` variables for password-reset email
- `CLIENT_URL` is optional. The production frontend and its preview deployments are allowed by default; add other origins comma-separated
- The build command (`npm run build`) generates the Prisma client, applies migrations and runs the idempotent seed, so a fresh database is ready after the first deployment. The same can be run by hand with `npm run db:deploy` from `backend`

### Frontend project

- Root directory: `frontend`
- Framework preset: Vite
- `VITE_API_URL` is optional. `frontend/.env.production` already points at the production API; set the variable in Vercel only to override it

Authentication uses a `SameSite=None; Secure` cookie in production, so both projects must be served over HTTPS.

## Roadmap

Photo upload, real MoMo and Airtel payment prompts, moto rider accounts and live delivery tracking, in-app chat, Kinyarwanda and French, reviews and ratings, seller subscriptions, SMS notifications, and multi-shop checkout.
