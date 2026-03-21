# FairTradeWorker

Two-sided construction marketplace connecting homeowners with verified contractors. Voice AI estimation, escrow payments, zero lead fees.

## Status

Frontend-complete with mock data. No backend, no API routes, no authentication yet. All data is client-side.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.3.2 (App Router, static export) |
| UI | React 19.1, Tailwind CSS 3.4, Radix UI primitives |
| Icons | Lucide React |
| Desktop | Electron 33.4 (macOS dmg) |
| Language | TypeScript 5.8 |
| Package Manager | pnpm |

### Planned (not yet integrated)

- **Supabase** — Postgres, Auth, Edge Functions, Realtime, Storage
- **Stripe Connect** — Escrow payments, marketplace splits
- **ElevenLabs** — Voice AI for estimate transcription

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
| `pnpm dev:electron` | Dev server + Electron window |
| `pnpm build:electron` | Build macOS dmg |

## Project Structure

```
src/
  app/                        # Next.js App Router (24 pages)
    (auth)/                   # Login, Signup
    contractor/               # 10 contractor pages
      dashboard/              # Bento grid dashboard
      work/                   # Browse job marketplace
      estimates/              # Estimates + Voice AI agent
      projects/               # Active projects
      invoices/               # Payment history
      clients/                # CRM
      messages/               # Chat interface
      notifications/          # Alert center
      reviews/                # Ratings & feedback
      settings/               # Profile & integrations
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
    contractor/components/    # Voice recorder, estimate cards, job cards
    homeowner/components/     # Contractor search, profiles
    marketplace/components/   # Navbar, hero, features, pricing, testimonials
  shared/
    components/               # Sidebar, AppHeader
    ui/                       # Button, Badge, Card, Dialog, Input, etc.
    lib/
      utils.ts                # cn(), formatCurrency(), formatDate(), getInitials()
      constants.ts            # Brand config, nav links, pricing tiers, categories
      mock-data.ts            # All types + mock data (~500 LOC)
backend/                      # Placeholder READMEs (no code yet)
  contractor/                 # Supabase Edge Functions (planned)
  homeowner/                  # Supabase Edge Functions (planned)
  marketplace/                # Shared services (planned)
electron/                     # Electron main + preload
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
| `/signup` | Auth (supports `?role=contractor` or `?role=homeowner`) |

### Contractor Dashboard

| Path | Description |
|------|-------------|
| `/contractor/dashboard` | Bento grid: jobs, schedule, estimates, scorecard |
| `/contractor/work` | Browse job marketplace with filters |
| `/contractor/estimates` | Estimates with tabs: all, agent (voice AI), my-estimates |
| `/contractor/projects` | Active projects with timelines |
| `/contractor/invoices` | Payment history |
| `/contractor/clients` | Client CRM |
| `/contractor/messages` | Messaging |
| `/contractor/notifications` | Notifications |
| `/contractor/reviews` | Ratings & feedback |
| `/contractor/settings` | Profile, Stripe, ElevenLabs integrations |

### Homeowner Dashboard

| Path | Description |
|------|-------------|
| `/homeowner/dashboard` | KPI cards + active projects |
| `/homeowner/jobs` | Posted jobs management |
| `/homeowner/contractors` | Search & filter contractors |
| `/homeowner/projects` | Active projects with milestones |
| `/homeowner/messages` | Messaging |

## Path Aliases

```
@/*           → src/*
@contractor/* → src/domains/contractor/*
@homeowner/*  → src/domains/homeowner/*
@marketplace/* → src/domains/marketplace/*
@shared/*     → src/shared/*
```

## Design System

- **Font**: SF Pro (system-ui fallback)
- **Brand green**: #059669 (hover: #047857)
- **Dark**: #0F1419 (near-black for text and buttons)
- **Surface**: #FDFCFA (off-white backgrounds)
- **No gradients, no emojis in UI**
- **Sidebar**: Collapsible (expanded: w-56, collapsed: w-16)
- **Contractor layout**: Sidebar + global top bar (messages/notifications)
- **Homeowner layout**: Sidebar only

## Key Types

All defined in `src/shared/lib/mock-data.ts`:

- `Contractor` — id, name, company, rating, specialty, verified, licensed, insured
- `Homeowner` — id, name, location, memberSince
- `Job` — id, title, category, budget, status, property details, requirements
- `Estimate` — id, jobTitle, amount, status, lineItems[]
- `Project` — id, title, status, progress, budget, milestones[]
- `Review` — id, authorName, rating, text, role
