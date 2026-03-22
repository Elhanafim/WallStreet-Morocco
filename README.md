# WallStreet Morocco

La plateforme de référence pour les investisseurs marocains. Analyses de la Bourse de Casablanca, OPCVM, portfolio tracker, calendrier économique et guides en français.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js v4 (JWT strategy, Credentials provider)
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Validation**: Zod
- **Language**: TypeScript

## Features

- Authentication (register, login, JWT sessions)
- Role-based access: FREE / PREMIUM / ADMIN
- Portfolio tracker: add, view, delete assets (STOCK, OPCVM, ETF, BOND)
- Dashboard: metric cards, line chart (growth), pie chart (allocation), recent transactions
- Profile page: edit name, change password, subscription status
- Protected routes via NextAuth middleware
- Fintech-grade UI: deep blue sidebar, white cards, gold accents

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local` and fill in your values:

```bash
cp .env.local .env.local
```

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Run database migrations

Make sure PostgreSQL is running, then:

```bash
npx prisma migrate dev --name init
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/wallstreet_morocco` |
| `NEXTAUTH_SECRET` | Secret for JWT signing (min 32 chars in production) | `your-secret-key-change-in-production` |
| `NEXTAUTH_URL` | Full URL of the app | `http://localhost:3000` |

## Project Structure

```
src/
  app/
    api/
      auth/[...nextauth]/   NextAuth handler
      auth/register/        User registration endpoint
      portfolio/            GET + POST portfolio entries
      portfolio/[id]/       PATCH + DELETE single entry
    auth/
      login/                Login page
      signup/               Signup page
    dashboard/
      page.tsx              Main dashboard overview
      portfolio/            Portfolio management
      profile/              User profile & settings
      layout.tsx            Dashboard shell (sidebar + topbar)
  components/
    dashboard/
      Sidebar.tsx           Navigation sidebar
      MetricCard.tsx        KPI card component
      AddAssetModal.tsx     Modal to add portfolio assets
  lib/
    db.ts                   Prisma singleton
    auth.ts                 NextAuth options
  middleware.ts             Route protection for /dashboard/*
  types/
    next-auth.d.ts          Extended NextAuth session types
prisma/
  schema.prisma             Database schema
```
