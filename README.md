# Event QR Attendance MVP

Reusable QR attendance platform for recurring workshops and event series.

## Stack

- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Auth: JWT
- Dev database: Docker Compose for PostgreSQL

## What’s included

- Admin login with JWT auth
- Public organization registration with first admin onboarding
- Organizations, event series, and event sessions
- Attendee CRUD with secure random `qrToken`
- QR code rendering and download on attendee profile
- Browser camera QR scanner with duplicate check protection
- Attendance dashboard and series report percentages
- CSV and Excel export for event-series attendance
- Prisma migration and seed data

## Project structure

```text
.
├─ backend/
│  ├─ prisma/
│  └─ src/
├─ frontend/
│  └─ src/
├─ docker-compose.yml
└─ README.md
```

## Environment files

Example files are included:

- [backend/.env.example](backend/.env.example)
- [frontend/.env.example](frontend/.env.example)

For local verification in this workspace, `.env` files were also created and are gitignored.

## Quick start

1. Install dependencies:

```bash
npm run install:all
```

2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Run the Prisma migration:

```bash
npm run prisma:migrate --prefix backend -- --name init
```

4. Seed the database:

```bash
npm run prisma:seed --prefix backend
```

5. Start the backend:

```bash
npm run dev:backend
```

6. Start the frontend in another terminal:

```bash
npm run dev:frontend
```

7. Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/api/health`

The frontend now uses:

- `/` for the public landing page
- `/login` for sign-in
- `/register` for organization/admin signup
- `/app/*` for the authenticated workspace

## Seeded admin login

- Email: `admin@example.com`
- Password: `admin123`

## Important local note

`docker-compose.yml` intentionally exposes PostgreSQL on port `5432` as requested. If you already have a local PostgreSQL service using `5432`, stop that service before running `docker compose up -d`, or the container will fail to bind that port.

During verification in this workspace, an existing PostgreSQL instance was already bound to `5432`, so the Prisma migration and seed were run against that live local instance instead.

## Main API routes

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/event-series`
- `POST /api/event-series`
- `GET /api/event-series/:id`
- `POST /api/event-series/:id/sessions`
- `GET /api/attendees`
- `POST /api/attendees`
- `GET /api/attendees/:id`
- `PATCH /api/attendees/:id`
- `DELETE /api/attendees/:id`
- `POST /api/scan/check-in`
- `GET /api/reports/event-series/:id`
- `GET /api/reports/event-series/:id/export.csv`
- `GET /api/reports/event-series/:id/export.xlsx`

## Attendance percentage

```text
attendancePercentage = attendedSessions / totalSessions * 100
```

## Useful commands

```bash
npm run db:up
npm run db:down
npm run build
npm run dev:backend
npm run dev:frontend
npm run seed
```

## Verification completed

- Backend TypeScript build passed
- Frontend production build passed
- Prisma migration was created and applied
- Seed script ran successfully
- API smoke tests passed for:
  - login
  - attendee list/detail
  - event series list
  - event series report
  - scan success
  - duplicate scan protection
  - invalid QR response
