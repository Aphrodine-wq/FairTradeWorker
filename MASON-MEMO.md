# Mason — FTW Backend Deployment Memo

**Date:** 2026-03-31
**From:** James
**Re:** Spring Boot backend needs to go live on Render

## What's Done

The Next.js frontend and PostgreSQL database are live on **your Render workspace**:

- **Frontend:** https://fairtradeworker-n4rr.onrender.com
- **Database:** `dpg-d75ua07diees73ffrhng-a` (Postgres 16, free tier)
  - DB name: `ftw_1ngu`, user: `ftw`
  - Seeded with 9 demo users, 5 jobs, 4 bids, sub-jobs, reviews
  - All demo accounts use password: `demo1234`
- **Prisma migrations** run automatically on every deploy (in the build step)
- **Auto-deploy** is on — pushes to `main` trigger a new build

The frontend currently runs on mock data fallback because the Spring Boot backend isn't deployed yet. Once you get `ftw-realtime` up, the data layer (`src/shared/lib/data.ts`) will automatically hit the real API.

## What You Need To Do

Deploy the Spring Boot backend (`~/Projects/ftw-realtime/`) to Render under your workspace.

### Quick steps:

1. The repo already has `render.yaml` and `Dockerfile` configured
2. Create a new Web Service in your Render workspace pointing at the `ftw-realtime` GitHub repo
3. Set these env vars:
   - `DB_HOST` = `dpg-d75ua07diees73ffrhng-a` (internal hostname — same DB as frontend)
   - `DB_PORT` = `5432`
   - `DB_NAME` = `ftw_1ngu`
   - `DB_USERNAME` = `ftw`
   - `DB_PASSWORD` = (grab from Render dashboard, same password as the frontend's DATABASE_URL)
   - `SECRET_KEY_BASE` = (generate one)
   - `PORT` = `10000`
   - `SPRING_PROFILES_ACTIVE` = `prod`
4. Once it's live, tell me the URL and I'll set `NEXT_PUBLIC_REALTIME_URL` on the frontend

### What this unblocks:

- Auth end-to-end (signup, login, role switching with real DB)
- Job posting + bidding with persistence
- SubContractor flow
- Real-time WebSocket (chat, live bids, job feed)

Everything after this is wiring — the frontend code is already written to hit these endpoints.

## Render Workspace Info

- Your workspace ID: `tea-d0rnhsq4d50c73asiqp0`
- Render CLI is installed on my machine if you need me to do anything via API
- Free tier Postgres only allows internal connections (no external psql) — seed data goes through `POST /api/seed`

## Timeline

MVP deadline is April 17. Backend deployment is the critical path — auth, jobs, and payments all depend on it. No rush but sooner = more time to iron out bugs together.
