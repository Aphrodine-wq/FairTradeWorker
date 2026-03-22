# FairTradeWorker

Two-sided construction marketplace connecting homeowners with verified contractors. Voice AI estimation, escrow payments, zero lead fees.

## Status

Frontend-complete with mock data. Realtime client layer built and wired to the Elixir/Phoenix backend (`ftw-realtime`). No auth, no live database yet. All UI data is client-side mock.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.3.2 (App Router, static export) |
| UI | React 19.1, Tailwind CSS 3.4, Radix UI primitives |
| Icons | Lucide React |
| Realtime | Phoenix Channels (`phoenix` npm package) |
| Desktop | Electron 33.4 (macOS dmg) |
| Language | TypeScript 5.8 |
| Package Manager | pnpm |
| Testing | Vitest |

### Planned (not yet integrated)

- **Supabase** — Postgres, Auth, Edge Functions, Storage
- **QuickBooks Online API** — Payments and invoice sync (node-quickbooks)
- **ElevenLabs** — Voice AI for live estimate transcription

## Getting Started

```bash
pnpm install
pnpm dev              # Next.js dev server on localhost:3000
pnpm dev:electron     # Dev server + Electron app
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Static export to `/out/` |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint check |
| `pnpm test` | Run Vitest test suite |
| `pnpm dev:electron` | Dev server + Electron window |
| `pnpm build:electron` | Build macOS dmg |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_REALTIME_URL` | `http://localhost:4000` | URL of the Elixir/Phoenix realtime backend |

## Project Structure

```
src/
  app/                        # Next.js App Router (27 pages)
    (auth)/                   # Login, Signup
    contractor/               # 10 contractor pages
      dashboard/              # Bento grid dashboard
      work/                   # Browse job marketplace
      estimates/              # Estimates + voice recorder agent
      projects/               # Active projects
      invoices/               # Payment history
      clients/                # CRM
      messages/               # Chat interface
      notifications/          # Alert center
      reviews/                # Ratings & feedback
      settings/               # 12-section settings panel
    homeowner/                # 5 homeowner pages
      dashboard/              # KPI cards + projects
      jobs/                   # Posted jobs
      contractors/            # Search contractors
      projects/               # Active projects
      messages/               # Chat interface
    pricing/                  # Pricing page
    about/ blog/ careers/ contact/ faq/
    page.tsx                  # Landing page
  domains/                    # Domain-specific components
    contractor/components/    # VoiceRecorder, EstimateCard, JobCard, BidDialog, StatCard
    homeowner/components/     # ContractorCard, ContractorProfileDialog
    marketplace/components/   # Navbar, Hero, Features, HowItWorks, StatsBar,
                              #   Testimonials, PricingSection, CtaSection, Footer
  shared/
    components/               # Sidebar, AppHeader
    hooks/
      use-realtime.ts         # useRealtimeJobs, useRealtimeBids, useRealtimeChat
    ui/                       # Button, Badge, Card, Dialog, Input, Textarea,
                              #   Tabs, Progress, Separator
    lib/
      utils.ts                # cn(), formatCurrency(), formatDate(), getInitials()
      constants.ts            # Brand config, nav links, pricing tiers, categories
      mock-data.ts            # All types + mock data
      realtime.ts             # Phoenix Channels client + REST api wrapper
  __tests__/                  # Vitest unit tests (utils, constants, mock-data)
backend/                      # Placeholder READMEs (no code yet)
  contractor/                 # Planned Supabase Edge Functions
  homeowner/                  # Planned Supabase Edge Functions
  marketplace/                # Planned shared services
electron/                     # Electron main + preload (TypeScript)
docs/
  business-intelligence.md    # Revenue model and BI notes
```

## Routes

### Marketplace (public)

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/pricing` | 3-tier pricing (Starter $0, Pro $49/mo, Enterprise $149/mo) |
| `/about` | About page |
| `/blog` | Blog (placeholder) |
| `/careers` | Careers |
| `/contact` | Contact form |
| `/faq` | FAQ |
| `/login` | Auth |
| `/signup` | Auth — supports `?role=contractor` or `?role=homeowner` |

### Contractor Dashboard

| Path | Description |
|------|-------------|
| `/contractor/dashboard` | Bento grid: jobs, schedule, estimates, scorecard |
| `/contractor/work` | Browse job marketplace with filters |
| `/contractor/estimates` | Estimates with tabs: all, agent (voice recorder), my-estimates |
| `/contractor/projects` | Active projects with timelines |
| `/contractor/invoices` | Payment history |
| `/contractor/clients` | Client CRM |
| `/contractor/messages` | Messaging (top bar shortcut) |
| `/contractor/notifications` | Notifications (top bar shortcut) |
| `/contractor/reviews` | Ratings & feedback |
| `/contractor/settings` | 12-section settings panel |

Contractor sidebar nav: Dashboard, Browse Jobs, Estimates, Projects, Invoices, Clients, Settings. Messages and Notifications are accessible via the global top bar. Reviews are accessible by direct URL.

### Homeowner Dashboard

| Path | Description |
|------|-------------|
| `/homeowner/dashboard` | KPI cards + active projects |
| `/homeowner/jobs` | Posted jobs management |
| `/homeowner/contractors` | Search & filter contractors |
| `/homeowner/projects` | Active projects with milestones |
| `/homeowner/messages` | Messaging |

## Realtime Layer

The `phoenix` npm package is installed and a full client is implemented in `src/shared/lib/realtime.ts`. It connects to the Elixir backend (`ftw-realtime`) via Phoenix Channels over WebSocket and exposes a REST fallback via `api.*`.

Three React hooks wrap the client:

| Hook | Channel | Description |
|------|---------|-------------|
| `useRealtimeJobs()` | `jobs:feed` | Live job feed — new jobs push in as they're posted |
| `useRealtimeBids(jobId)` | `job:<id>` | Live bids on a specific job |
| `useRealtimeChat(conversationId)` | `chat:<id>` | Live chat messages |

The hooks are not yet wired into pages — pages still render from mock data. Connect them when the Elixir backend is running.

## Path Aliases

```
@/*            → src/*
@contractor/*  → src/domains/contractor/*
@homeowner/*   → src/domains/homeowner/*
@marketplace/* → src/domains/marketplace/*
@shared/*      → src/shared/*
```

## Design System

- **Font**: SF Pro (system-ui fallback)
- **Brand green**: #059669 (hover: #047857)
- **Dark**: #0F1419 (near-black for text and buttons)
- **Surface**: #F7F8FA (soft background), #FFFFFF (cards)
- **No gradients, no emojis in UI**
- **Sidebar**: Collapsible (expanded: w-56, collapsed: w-16)
- **Contractor layout**: Sidebar + global top bar (messages/notifications badges)
- **Homeowner layout**: Sidebar only

## Key Types

All defined in `src/shared/lib/mock-data.ts`:

- `Contractor` — id, name, company, rating, reviewCount, specialty, location, yearsExperience, jobsCompleted, hourlyRate, verified, licensed, insured, bio, skills
- `Homeowner` — id, name, location, memberSince, projectsPosted
- `Job` — id, title, category, budget, status, propertyType, sqft, yearBuilt, photos, requirements, propertyDetails, urgency, tags
- `Estimate` — id, jobTitle, clientName, amount, status, lineItems[]
- `Project` — id, title, status, progress, budget, spent, milestones[]
- `Review` — id, authorName, rating, text, role

## Deployment

Deployed to Vercel. `vercel.json` sets security headers (X-Frame-Options, HSTS, CSP) and long-lived cache headers for static assets. Build output is a static export (`/out/`).
