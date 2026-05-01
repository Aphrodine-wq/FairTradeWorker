# FairTradeWorker

Two-sided construction marketplace connecting homeowners with verified contractors. AI estimation via ConstructionAI, QuickBooks-native payments, zero lead fees.

## Status

Frontend pages built with mock data fallback. Backend API routes implemented for auth, jobs, bids, AI estimation, and QuickBooks integration. Prisma schema defined with PostgreSQL (23 models). Middleware handles auth protection, role-based routing, and rate limiting. Pages use a data layer (`data.ts`) that tries the real API first and falls back to mock data. Realtime client layer wired to the `ftw-realtime` Spring Boot/Kotlin backend via STOMP/SockJS WebSocket. Deployed to Render (primary) with Vercel config also present.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, server deployment) |
| UI | React 19, Tailwind CSS 3.4, Radix UI primitives |
| Icons | Lucide React |
| Analytics | PostHog (`posthog-js`) |
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg` + `pg`) |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) + middleware route protection |
| Payments | QuickBooks Online API (direct Intuit OAuth2, no Stripe Connect) |
| AI Estimation | ConstructionAI FastAPI service (custom fine-tuned model) |
| Realtime | STOMP over WebSocket (`@stomp/stompjs` + `sockjs-client`) |
| Desktop | Electron 33.4 (macOS dmg) |
| Language | TypeScript 5.8+ |
| Package Manager | pnpm |
| Testing | Vitest 4 |

## Getting Started

```bash
pnpm install
pnpm dev              # Next.js dev server on localhost:3000
pnpm dev:electron     # Dev server + Electron app
```

Requires `DATABASE_URL` pointing to a PostgreSQL instance for API routes to function. Without it, pages fall back to mock data.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint check |
| `pnpm test` | Run Vitest test suite (`vitest run`) |
| `pnpm dev:electron` | Dev server + Electron window |
| `pnpm build:electron` | Build macOS dmg |
| `pnpm db:migrate` | Run Prisma migrations (`prisma migrate deploy`) |
| `pnpm db:seed` | Seed database (`tsx prisma/seed.ts`) |
| `pnpm db:reset` | Reset database (`prisma migrate reset`) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — (required for API) | PostgreSQL connection string |
| `JWT_SECRET` | `ftw-dev-secret-change-in-production` | Secret for signing auth JWTs |
| `NEXT_PUBLIC_REALTIME_URL` | `http://localhost:4000` | URL of the Spring Boot/Kotlin realtime backend (`ftw-realtime`) |
| `CONSTRUCTIONAI_API_URL` | `http://localhost:8000/api/estimate` | ConstructionAI FastAPI endpoint |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Base URL for password reset links |
| `NEXT_PUBLIC_POSTHOG_KEY` | — | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` | PostHog ingest host |
| `QB_CLIENT_ID` | — | Intuit OAuth2 client ID |
| `QB_CLIENT_SECRET` | — | Intuit OAuth2 client secret |
| `QB_REDIRECT_URI` | — | OAuth2 callback URL for QuickBooks |
| `QB_SANDBOX` | `false` | Set to `"true"` to use Intuit sandbox API |
| `QB_WEBHOOK_VERIFIER_TOKEN` | — | HMAC secret for verifying Intuit webhook signatures |

## Project Structure

```
src/
  app/                           # Next.js App Router
    (auth)/                      # Login, Signup, Forgot-Password, Reset-Password
    contractor/                  # 13 contractor pages + error boundary
      dashboard/                 # Bento grid dashboard
      work/                      # Browse job marketplace
      estimates/                 # Estimates + voice recorder agent
      projects/                  # Active projects
      invoices/                  # Invoice history
      payments/                  # Payment history + payouts
      clients/                   # CRM
      messages/                  # Chat interface
      notifications/             # Alert center
      reviews/                   # Ratings & feedback
      settings/                  # 12-section settings panel
      onboarding/                # Multi-step contractor onboarding
      records/                   # FairRecord history
    subcontractor/               # 12 subcontractor pages + layout
      dashboard/                 # Sub dashboard
      work/                      # Browse sub jobs
      jobs/                      # Assigned sub jobs
      estimates/                 # Sub estimates
      invoices/                  # Sub invoice history
      payments/                  # Sub payment history
      clients/                   # Sub client list
      messages/                  # Chat interface
      notifications/             # Alert center
      records/                   # FairRecord history
      settings/                  # Sub settings
      onboarding/                # Sub onboarding
    homeowner/                   # 12 homeowner pages + error boundary
      dashboard/                 # KPI cards + projects
      jobs/                      # Posted jobs
      post-job/                  # Multi-step job posting form
      bids/                      # Review incoming bids
      projects/                  # Active projects
      payments/                  # Payment history
      messages/                  # Chat interface
      notifications/             # Alert center
      reviews/                   # Ratings & feedback
      settings/                  # Account settings
      onboarding/                # Homeowner onboarding
      milestones/                # Project milestones
    fairprice/                   # Public FairPrice estimator landing
    record/[id]/                 # Public FairRecord detail page
    api/                         # 29 API route files (see below)
    pricing/                     # Pricing page
    features/                    # Features page
    how-it-works/                # How It Works page
    testimonials/                # Testimonials page
    sitemap.ts                   # Dynamic sitemap generation
    not-found.tsx                # Custom 404 page
    global-error.tsx             # Global error boundary
    about/ blog/ careers/ contact/ faq/ terms/ privacy/
    page.tsx                     # Landing page
  domains/                       # Domain-specific components
    contractor/components/       # VoiceRecorder, EstimateCard, JobCard, BidDialog, StatCard
    subcontractor/components/    # SubJobCard
    marketplace/components/      # Navbar, Hero, Features, HowItWorks, StatsBar,
                                 #   Testimonials, PricingSection, CtaSection, Footer, MobileNav
  shared/
    components/                  # Sidebar, RoleSwitcher, AppHeader, AiEstimateCard, BrandMark, CookieConsent, EmptyState
    hooks/
      use-realtime.ts            # useRealtimeJobs, useRealtimeBids, useRealtimeChat
      use-estimate.ts            # useJobEstimate, useBidSuggestion (AI-powered)
      use-page-title.ts          # Dynamic page title hook
    ui/                          # AlertDialog, Button, Badge, Card, Dialog, Input,
                                 #   Progress, Separator, Skeleton, Tabs, Textarea, Toaster
    lib/
      utils.ts                   # cn(), formatCurrency(), formatDate(), getInitials()
      constants.ts               # Brand config, nav links, pricing tiers, categories
      mock-data.ts               # All types + mock data
      data.ts                    # Data layer — tries real API, falls back to mock
      realtime.ts                # STOMP/SockJS client + full REST API wrapper
      db.ts                      # Prisma client singleton (PrismaClient + pg pool)
      auth.ts                    # JWT helpers: hash, verify, createToken, getAuthUser
      auth-store.ts              # Client-side auth state (localStorage + realtime sync)
      quickbooks.ts              # Intuit OAuth2, QB API calls, invoice/estimate sync
      analytics.ts               # PostHog analytics (init, identify, track, reset)
      rate-limit.ts              # In-memory rate limiter for middleware
  middleware.ts                  # Auth route protection + rate limiting + security headers
  generated/prisma/              # Generated Prisma client + model types
  __tests__/                     # Vitest unit tests (utils, constants, mock-data)
  styles/globals.css             # Global styles
prisma/
  schema.prisma                  # 23 models (see Database section)
backend/                         # Placeholder READMEs (no code yet)
  contractor/                    # Planned edge functions
  homeowner/                     # Planned edge functions
  marketplace/                   # Planned shared services
electron/                        # Electron main + preload (TypeScript)
docs/                            # Business intelligence + research
  01-market/                     # Market analysis (8 files)
  02-competition/                # Competitive analysis (5 files)
  03-product/                    # Product design (5 files)
  04-go-to-market/               # GTM strategy (5 files)
  05-legal-compliance/           # Legal/compliance (5 files)
  06-financials/                 # Financials + grants (4 files)
  07-infrastructure/             # Infrastructure cost model
  08-strategy/                   # Strategy + risk (4 files)
  pdf/                           # PDF exports of all docs
```

## API Routes

29 route files in `src/app/api/`.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create account (creates User + Contractor/Homeowner/SubContractor) |
| POST | `/api/auth/login` | Login, returns JWT + sets `ftw-token` cookie |
| POST | `/api/auth/forgot-password` | Send password reset link (JWT-based) |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/switch-role` | Switch active role (requires role in user's roles array, issues new JWT) |
| POST | `/api/auth/sync-token` | Sync auth token to httpOnly cookie |

### Jobs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/jobs` | List open jobs (paginated, filterable by category/location/status) |
| POST | `/api/jobs` | Create job (homeowner only, auth required) |
| GET | `/api/jobs/[id]` | Get job details |
| POST | `/api/jobs/[id]/bids` | Place bid on a job (contractor, auth required) |
| POST | `/api/jobs/[id]/estimate` | Generate AI estimate via ConstructionAI |

### Bids

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/bids/[id]/accept` | Accept a bid (homeowner only) |

### Contractor

| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/api/contractor/profile` | Contractor profile management |
| GET/POST | `/api/contractor/licenses` | License management |
| GET/POST | `/api/contractor/insurance` | Insurance cert management |
| GET/POST | `/api/estimates` | List or generate standalone estimates |
| GET/DELETE | `/api/estimates/[id]` | Single estimate detail or delete |
| GET | `/api/estimates/[id]/pdf` | Download or regenerate estimate PDF |

### Homeowner

| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/api/homeowner/property` | Homeowner property management |

### Contact

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/contact` | Submit contact form (forwards to Spring Boot backend if available) |

### QuickBooks Integration

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/quickbooks/connect` | Initiate Intuit OAuth2 flow |
| GET | `/api/quickbooks/callback` | OAuth2 callback handler |
| DELETE | `/api/quickbooks/disconnect` | Revoke QB connection |
| GET | `/api/quickbooks/status` | Check connection status |
| POST | `/api/quickbooks/create-invoice` | Create invoice in QB |
| POST | `/api/quickbooks/sync-estimate` | Sync estimate to QB |
| POST | `/api/quickbooks/payout` | Execute contractor payout via QB Bill |
| GET | `/api/quickbooks/receipt` | Generate payment receipt |
| POST | `/api/quickbooks/webhook` | Intuit webhook receiver |

### Seed

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/seed` | Seed database with demo data (requires `x-seed-secret` header matching `JWT_SECRET`) |

## Middleware

`src/middleware.ts` runs on all routes (except static assets):

- **Auth protection**: `/contractor/*`, `/subcontractor/*`, and `/homeowner/*` require `ftw-token` cookie. Redirects to `/login` if missing. Checks JWT `activeRole` to prevent cross-role access (e.g., a contractor cannot access homeowner pages). Supports demo tokens (`demo.*` prefix) that bypass role checking.
- **Rate limiting**: Auth paths (`/login`, `/signup`, `/forgot-password`, `/api/auth/*`) limited to 10 req/min per IP (in-memory fixed-window counter).
- **Security headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy on all responses.

## Database

Prisma schema (`prisma/schema.prisma`) with PostgreSQL, 23 models:

| Model | Description |
|-------|-------------|
| `User` | Base user with email/password, `roles[]` enum array (CONTRACTOR/HOMEOWNER/SUBCONTRACTOR), `activeRole` |
| `Contractor` | Profile: company, bio, specialty, skills, rating, verification flags |
| `Homeowner` | Profile: location |
| `SubContractor` | Subcontractor profile linked to a user |
| `SubJob` | Jobs posted by contractors for subcontractors (status enum: OPEN/IN_PROGRESS/COMPLETED/CANCELLED) |
| `SubBid` | Subcontractor bids on sub jobs |
| `SubPayout` | Subcontractor payouts (payment path: CONTRACTOR_ESCROW or PASSTHROUGH_ESCROW) |
| `License` | Contractor licenses with verification status |
| `InsuranceCert` | Insurance certs with coverage details |
| `Job` | Posted jobs with full property details, budget range, urgency, tags |
| `JobPhoto` | Job photos/videos |
| `Bid` | Contractor bids on jobs (unique per job+contractor) |
| `AiEstimate` | AI-generated cost estimates linked to jobs |
| `SavedEstimate` | Contractor standalone estimates (not tied to a job) |
| `Conversation` | Chat conversations (optionally linked to a job) |
| `ConversationParticipant` | Links contractors/homeowners to conversations |
| `Message` | Chat messages within conversations |
| `Review` | Ratings from homeowners or contractors |
| `QuickBooksConnection` | OAuth2 tokens per contractor |
| `Invoice` | Invoices linked to accepted bids, synced with QB |
| `Payout` | Contractor payouts via QB Bill/BillPayment |
| `Receipt` | Payment receipts for completed transactions |
| `Notification` | User notifications with type, read status |

Prisma client is generated to `src/generated/prisma/` using `@prisma/adapter-pg` with a `pg.Pool` connection.

## Routes

### Marketplace (public)

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/pricing` | 3-tier pricing (Starter $0, Pro $49/mo, Enterprise $149/mo) |
| `/fairprice` | Public FairPrice estimator |
| `/record/[id]` | Public FairRecord detail page |
| `/features` | Features page |
| `/how-it-works` | How It Works page |
| `/testimonials` | Testimonials page |
| `/about` | About page |
| `/blog` | Blog index + articles (escrow guide, Hunter voice AI, killing lead fees, Mississippi launch) |
| `/careers` | Careers |
| `/contact` | Contact form |
| `/faq` | FAQ |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/login` | Auth |
| `/signup` | Auth — supports `?role=contractor` or `?role=homeowner` |
| `/forgot-password` | Request password reset email |
| `/reset-password` | Reset password with token from email |

### Contractor Dashboard

| Path | Description |
|------|-------------|
| `/contractor/dashboard` | Bento grid: jobs, schedule, estimates, scorecard |
| `/contractor/work` | Browse job marketplace with filters |
| `/contractor/estimates` | Estimates with tabs: all, agent (voice recorder), my-estimates |
| `/contractor/projects` | Active projects with timelines |
| `/contractor/invoices` | Invoice history |
| `/contractor/payments` | Payment history + payouts |
| `/contractor/clients` | Client CRM |
| `/contractor/messages` | Messaging (top bar shortcut) |
| `/contractor/notifications` | Notifications (top bar shortcut) |
| `/contractor/reviews` | Ratings & feedback |
| `/contractor/settings` | 12-section settings panel |
| `/contractor/onboarding` | Multi-step onboarding flow |
| `/contractor/records` | FairRecord history |

Contractor sidebar nav: Dashboard, Browse Jobs, Estimates, Projects, Invoices, Payments, Clients, Settings. Messages and Notifications are accessible via the global top bar. Reviews and Records are accessible by direct URL.

### Homeowner Dashboard

| Path | Description |
|------|-------------|
| `/homeowner/dashboard` | KPI cards + active projects |
| `/homeowner/jobs` | Posted jobs management |
| `/homeowner/post-job` | Multi-step job posting form |
| `/homeowner/bids` | Review incoming bids |
| `/homeowner/projects` | Active projects with milestones |
| `/homeowner/payments` | Payment history |
| `/homeowner/messages` | Messaging |
| `/homeowner/notifications` | Notifications |
| `/homeowner/reviews` | Ratings & feedback |
| `/homeowner/settings` | Account settings |
| `/homeowner/onboarding` | Homeowner onboarding flow |
| `/homeowner/milestones` | Project milestones tracking |

### SubContractor Dashboard

| Path | Description |
|------|-------------|
| `/subcontractor/dashboard` | Sub dashboard |
| `/subcontractor/work` | Browse available sub jobs |
| `/subcontractor/jobs` | Assigned sub jobs |
| `/subcontractor/estimates` | Sub estimates |
| `/subcontractor/invoices` | Sub invoice history |
| `/subcontractor/payments` | Sub payment history |
| `/subcontractor/clients` | Sub client list |
| `/subcontractor/messages` | Messaging |
| `/subcontractor/notifications` | Notifications |
| `/subcontractor/records` | FairRecord history |
| `/subcontractor/settings` | Sub settings |
| `/subcontractor/onboarding` | Sub onboarding flow |

## Realtime Layer

A full realtime client is implemented in `src/shared/lib/realtime.ts`. It connects to the `ftw-realtime` Spring Boot/Kotlin backend via STOMP/SockJS WebSocket and exposes a comprehensive REST API wrapper via `api.*`.

### WebSocket Topics (STOMP)

| Topic | Description |
|-------|-------------|
| `/topic/jobs.feed` | Live job feed — new jobs push in as they're posted |
| `/topic/job.{id}` | Live bids on a specific job, bid accepted events |
| `/topic/chat.{id}` | Live chat messages, typing indicators, presence |
| `/topic/user.{id}` | User-level notifications |

STOMP methods support sending events back: `sendChatMessage`, `sendTypingIndicator`, `placeBidViaWS`, `postJobViaWS`.

### REST API Wrapper

The `api` object in `realtime.ts` wraps the `ftw-realtime` backend REST endpoints for: auth, jobs, bids, chat, estimates, invoices, projects, clients, reviews, notifications, AI estimation, file uploads, settings, verification, and FairRecords.

### React Hooks

| Hook | Topic | Description |
|------|-------|-------------|
| `useRealtimeJobs()` | `/topic/jobs.feed` | Live job feed — new jobs push in as they're posted |
| `useRealtimeBids(jobId)` | `/topic/job.{id}` | Live bids on a specific job |
| `useRealtimeChat(conversationId)` | `/topic/chat.{id}` | Live chat messages |
| `useJobEstimate(jobId)` | — (REST) | Fetch AI estimate for a job |
| `useBidSuggestion(jobId)` | — (REST) | AI-powered bid suggestion based on estimate |

## Path Aliases

```
@/*               -> src/*
@contractor/*     -> src/domains/contractor/*
@subcontractor/*  -> src/domains/subcontractor/*
@homeowner/*      -> src/domains/homeowner/*
@marketplace/*    -> src/domains/marketplace/*
@shared/*         -> src/shared/*
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

- `Contractor` — id, name, company, avatar, rating, reviewCount, specialty, location, yearsExperience, jobsCompleted, hourlyRate, verified, licensed, insured, bio, skills
- `Job` — id, title, description, detailedScope, category, subcategory, budget (min/max), location, fullAddress, postedBy, status, bidsCount, urgency, propertyType, sqft, yearBuilt, photos, requirements, tags, property (PropertyDetails)
- `JobPhoto` — url, caption, type
- `JobRequirement` — label, met
- `PropertyDetails` — stories, foundation, exterior, roofType, roofAge, garage, lotSize, hoa, heating, cooling, waterHeater, plumbing, electrical, sewer, knownIssues, recentWork
- `Estimate` — id, jobTitle, clientName, amount, status, lineItems[]
- `Review` — id, authorName, rating, text, role
- `Project` — id, title, contractor, status, progress, budget, spent, milestones[]
- `FairRecord` — id, publicId, projectId, contractorId, homeownerId, category, scopeSummary, estimatedBudget, finalCost, budgetAccuracyPct, onTime, avgRating, photos, homeownerConfirmed

Prisma models in `prisma/schema.prisma` define the database-level types (see Database section above).

## Deployment

Primary deployment is **Render** (`render.yaml`) with PostgreSQL on Render free tier. `vercel.json` is also present for Vercel deployment. Both are server-side Next.js (not static export). `vercel.json` sets security headers (X-Frame-Options, HSTS, Referrer-Policy), long-lived cache headers for static assets, and no-store for API routes. `next.config.ts` adds CSP, HSTS, and Permissions-Policy headers. `render.yaml` defines the web service, database, and all required env vars.
