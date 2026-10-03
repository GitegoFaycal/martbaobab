# MartBaobab

A Rwanda-focused web marketplace for products, services, delivery, seller growth and community earning opportunities.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Prisma
- Source control: Git and GitHub

## First sprint included

- Responsive brand homepage based on the supplied burgundy, orange, mint and cream palette
- Shared header, logo, hero, categories, verified providers and seller call-to-action
- Placeholder routes for planned modules
- Express API foundation with security and logging middleware
- Initial PostgreSQL marketplace schema
- Docker Compose for local PostgreSQL
- GitHub Actions frontend build check

## Run locally

1. Install Node.js 20+ and Docker Desktop.
2. Copy environment variables:

```bash
cp .env.example .env
cp .env.example server/.env
```

3. Start PostgreSQL and install packages:

```bash
docker compose up -d
npm install
```

4. Create the database tables:

```bash
npm run db:migrate -- --name init
```

5. Start frontend and backend:

```bash
npm run dev
```

Frontend: http://localhost:5173  
API health check: http://localhost:5000/api/health

## Publish to GitHub

Create an empty repository named `martbaobab`, then run:

```bash
git init
git add .
git commit -m "feat: initialize MartBaobab monorepo"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/martbaobab.git
git push -u origin main
```

## Planned modules

Authentication, customer profiles, seller dashboard, shops, product and service listings, search and filters, cart, single-shop ordering, payments, delivery, reviews, subscriptions, admin moderation, notifications, rewards and later multi-shop checkout.
