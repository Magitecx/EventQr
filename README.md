# Event QR Attendance

Reusable QR attendance platform for recurring workshops and event series.

## Stack

- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Auth: JWT
- Dev database: Docker Compose for PostgreSQL

## What is included

- Public landing page
- Account-first registration flow
- JWT login plus protected app routes
- Multi-organization memberships per user
- Organization creation, join codes, and invite links
- Account settings and organization settings
- Owner-only member role management and member removal
- Attendee CRUD with secure random `qrToken`
- QR code rendering and download on attendee profile
- Browser camera QR scanner with duplicate protection
- Attendance matrix with per-session joined/missed state
- CSV and Excel export for event-series attendance
- Prisma migrations and seed data

## Product flow

1. A user creates an account at `/register`.
2. After sign-in, they can:
   - create a new organization
   - join an organization with a join code
   - open an invite link and auto-join
3. A user can belong to multiple organizations and switch the active workspace from the app shell or account settings.
4. Event series, sessions, attendees, scanning, and reports are scoped to the active organization.

## Project structure

```text
.
|-- backend/
|   |-- prisma/
|   `-- src/
|-- frontend/
|   `-- src/
|-- docker-compose.yml
`-- README.md
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

3. Apply migrations:

```bash
cd backend
npx prisma migrate deploy
```

4. Seed the database:

```bash
npm run prisma:seed
```

5. Start the backend:

```bash
cd ..
npm run dev:backend
```

6. Start the frontend in another terminal:

```bash
npm run dev:frontend
```

7. Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/api/health`

## Frontend routes

- `/` public landing page
- `/login` sign-in
- `/register` account creation
- `/invite/:token` invite acceptance
- `/app/onboarding` create or join an organization
- `/app/*` authenticated workspace

## Seeded accounts and data

Seed creates:

- 2 organizations
- 1 event series
- 5 event sessions
- 10 attendees
- sample attendance records

Optional seeded user:

- If `SEED_USER_NAME`, `SEED_USER_EMAIL`, and `SEED_USER_PASSWORD` are set in `backend/.env`, seed will also create a user, attach that user to both organizations, and create a sample invite.
- If those variables are left blank, no login account is created by seed.

## Important local note

`docker-compose.yml` exposes PostgreSQL on port `5432` as requested. If you already have another PostgreSQL service using `5432`, stop that service before running `docker compose up -d`, or the container will fail to bind the port.

During verification in this workspace, another PostgreSQL instance was already bound to `5432`, so migrations and seed were run against that live local instance instead.

## Main API routes

Auth:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/switch-organization`
- `PATCH /api/auth/account`
- `POST /api/auth/change-password`

Organizations:

- `GET /api/organizations`
- `POST /api/organizations`
- `POST /api/organizations/join`
- `GET /api/organizations/invites/:token`
- `POST /api/organizations/invites/:token/accept`
- `GET /api/organizations/current`
- `PATCH /api/organizations/current`
- `POST /api/organizations/current/regenerate-join-code`
- `POST /api/organizations/current/invites`
- `POST /api/organizations/current/leave`
- `PATCH /api/organizations/current/members/:membershipId`
- `DELETE /api/organizations/current/members/:membershipId`

Attendance product:

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

## Verification

Verified in this workspace:

- backend TypeScript build passed
- frontend production build passed
- Prisma client regenerated successfully
- migrations applied successfully, including the multi-organization migration
- seed script ran successfully
- API smoke tests passed for:
  - account-only registration
  - create organization
  - join organization by code
  - accept invite link
  - switch active organization
  - owner role update for a member
  - member leave organization
- browser render checks were performed for the landing page and register page
