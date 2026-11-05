# LOCO · Local Connect

LOCO is a Rwandan web app that connects buyers, sellers, workers and employers in every district. It has three parts:

| Section | What people do there |
| --- | --- |
| **Shop nearby** (`/shop`, `/services`) | Find everyday goods and local services from shops in their district, then message the seller on WhatsApp to agree on price, payment and delivery. LOCO holds no payments and takes no fees. |
| **Second-hand** (`/second-hand`) | Buy and sell used items at a lower price than new, with the original price shown so the saving is clear. |
| **Jobs** (`/jobs`) | Employers post daily or contract work (building sites, factories, farms, shops, homes). Workers apply with their phone number and get called. |
| **People** (`/people`) | Profiles of the people behind LOCO: shop owners and specialists with a photo, what they do, skills and district. The landing page opens with people nearby. Anyone can add a headline, bio and skills to their profile to appear here. |

Everything is local to Rwanda: the 30 districts, Rwandan phone numbers, RWF prices, and deals closed directly between people on WhatsApp.

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

## Connections

A connection is recorded each time a visitor taps **WhatsApp me** or the call button on a listing, a shop or a profile (`POST /api/connections`, deduplicated per person and listing within an hour; guests are tracked by an anonymous browser key). Every profile shows its viewers and connections, every listing shows how many people asked about it, sellers see who contacted them and buyers see the sellers they contacted on `/connections`, and the homepage shows the running totals from `GET /api/stats`.

## Demo data

A fresh database is filled with demo content on the first deployment (or with `npm run db:demo`, and `SEED_DEMO=true` forces it): 8 shops across Rwanda, 41 listings (new, second-hand and services with photos), 12 jobs and applications. Set `SEED_DEMO=false` to disable. Every demo account uses the password `Demo1234`, for example:

| Account | Role |
| --- | --- |
| jeanne@demo.loco.rw | Seller (Mama Jeanne Boutique, Gasabo) |
| eric@demo.loco.rw | Seller (Imena Tech, Kicukiro) |
| diane@demo.loco.rw | Customer and employer (Gasabo) |
| innocent@demo.loco.rw | Worker with applications (Kicukiro) |

## Photos

Sellers upload photos for listings, shop logo and cover; everyone can set a profile photo. Photos are resized in the browser, then stored in PostgreSQL and served from `/api/images/:id`. Set `BLOB_READ_WRITE_TOKEN` (Vercel Blob) in the backend project to store files in object storage instead.

## Languages

The interface is available in Kinyarwanda, English and French. The language is detected from the browser, can be switched from the header or footer, and is remembered on the device. Dictionaries live in `frontend/src/i18n/`.

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
