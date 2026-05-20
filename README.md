# EventQR

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
- Shareable scan-only session links for phone-based scanning
- Attendance matrix with per-session joined/missed state
- CSV and Excel export for event-series attendance
- Local profile image uploads with server-side validation and image rewriting
- Prisma migrations and seed data

## Product flow

1. A user creates an account at `/register`.
2. After sign-in, they can:
   - create a new organization
   - join an organization with a join code
   - open an invite link and auto-join
3. A user can belong to multiple organizations and switch the active workspace from the app shell or account settings.
4. Event series, sessions, attendees, scanning, and reports are scoped to the active organization.

## Additional documentation

- [Deletion lifecycle](</D:/mattc/Documents/Projects/EventQrAttendance/docs/deletion-lifecycle.md>)

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

Create local env files before starting:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Update values if needed:

- `backend/.env`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT`
  - `CORS_ORIGIN`
  - `ORGANIZATION_INACTIVE_WARNING_DAYS`
  - `ORGANIZATION_HARD_DELETE_DAYS`
  - `ORGANIZATION_CLEANUP_INTERVAL_MINUTES`
  - optional `SEED_USER_NAME`, `SEED_USER_EMAIL`, `SEED_USER_PASSWORD`
- `frontend/.env`
  - `VITE_API_BASE_URL`
  - `VITE_SITE_URL`

Set `VITE_SITE_URL` in `frontend/.env` to your real production domain before building for production so canonical URLs, sitemap, and robots output use the correct host.

For local verification in this workspace, `.env` files were also created and are gitignored.

## Quick start

1. Create env files:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

2. Install dependencies:

```bash
npm run install:all
```

3. Start PostgreSQL:

```bash
docker compose up -d
```

4. Apply migrations:

```bash
cd backend
npx prisma migrate deploy
```

5. Seed the database:

```bash
npm run prisma:seed
```

6. Start the backend:

```bash
cd ..
npm run dev:backend
```

7. Start the frontend in another terminal:

```bash
npm run dev:frontend
```

8. Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/api/health`

## Frontend routes

- `/` public landing page
- `/login` sign-in
- `/register` account creation
- `/invite/:token` invite acceptance
- `/app/onboarding` create or join an organization
- `/scan/:token` public scan-only page for a specific session
- `/app/*` authenticated workspace

## Workspace flow

- Users create an account at `/register`
- After login, users create a workspace or join one
- The left sidebar `Create or join` button opens a prompt with:
  - `Create workspace`
  - `Join workspace` with code entry
- Invite links still auto-join through `/invite/:token`

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
- `GET /api/scan/sessions/:eventSessionId/share-link`
- `GET /api/public/scan/:token`
- `POST /api/public/scan/:token/check-in`
- `GET /api/reports/event-series/:id`
- `GET /api/reports/event-series/:id/export.csv`
- `GET /api/reports/event-series/:id/export.xlsx`

## Profile image uploads

Attendee photos are stored locally on the backend server under `backend/uploads`.

Current behavior:

- uploads are sent from the attendee create/edit forms as `multipart/form-data`
- only `JPEG`, `PNG`, and `WebP` images are allowed
- max upload size is `5 MB`
- files are validated by decoding the image server-side
- files are re-encoded with `sharp` before saving
- saved files are organized by workspace and attendee name
- existing attendee photos can be replaced or removed from the attendee detail page

The upload path is designed for local or single-server deployments. If you later run multiple backend instances or ephemeral containers, you should mount a persistent volume for `backend/uploads` or move to object storage.

## Upload security

The current local upload pipeline includes these checks:

- browser mime allowlist
- server-side image decode validation
- dimension and pixel limits
- server-side image rewriting to clean the final stored image
- filename and path sanitization
- static file serving with `nosniff`

This is hardened for image-only uploads, but it is not full antivirus scanning.

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
- migrations applied successfully, including:
  - multi-organization accounts
  - public scanner links
- seed script ran successfully
- API smoke tests passed for:
  - account-only registration
  - create organization
  - join organization by code
  - accept invite link
  - switch active organization
  - owner role update for a member
  - member leave organization
- public scanner link generation
- organization inactivity lifecycle with warning and hard-purge thresholds
- browser render checks were performed for the landing page and register page
