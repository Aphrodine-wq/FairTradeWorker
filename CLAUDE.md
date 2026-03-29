# FairTradeWorker -- Developer Guide

## Quick Commands

```bash
pnpm install          # Install deps
pnpm dev              # Dev server (Turbopack) on :3000
pnpm build            # Production build
pnpm lint             # ESLint
pnpm test             # Vitest unit tests (vitest run)
pnpm dev:electron     # Dev + Electron
pnpm build:electron   # Build macOS dmg
```

## Architecture

Next.js 15 App Router deployed as a server-side app on Vercel. Two user roles (contractor, homeowner) with separate route groups and layouts. API routes handle auth, jobs, bids, AI estimation, and QuickBooks integration. Database is PostgreSQL via Prisma 7. Analytics via PostHog (`posthog-js`).

The data layer (`src/shared/lib/data.ts`) tries the real Elixir API first and falls back to mock data. Pages import from `data.ts` instead of `mock-data.ts` directly.

The realtime client layer (`src/shared/lib/realtime.ts`) connects to the `ftw-realtime` backend at `NEXT_PUBLIC_REALTIME_URL` via STOMP/SockJS WebSocket and a comprehensive REST API wrapper.

Middleware (`src/middleware.ts`) handles auth route protection (JWT via `ftw-token` cookie), rate limiting on auth paths (10 req/min per IP), and security headers on all responses.

```
src/app/              # Pages (App Router)
  (auth)/             # Login/Signup/Forgot-Password/Reset-Password route group
  contractor/         # 13 pages, layout has sidebar + global top bar
  homeowner/          # 12 pages (incl. milestones), layout has sidebar only
  fairprice/          # Public FairPrice estimator
  record/[id]/        # Public FairRecord detail
  api/                # 27 API route files (see below)
  [marketing pages]   # Landing, pricing, features, how-it-works, testimonials,
                      #   about, blog, careers, contact, faq, terms, privacy

src/app/api/          # Next.js API routes
  auth/               # signup, login, forgot-password, reset-password, sync-token
  jobs/               # CRUD, bids, AI estimates
  bids/               # Accept bids
  contractor/         # Profile, licenses, insurance, estimates, estimate PDFs
  homeowner/          # Property management
  contact/            # Contact form submission
  integrations/       # QuickBooks OAuth2, invoices, estimates, payouts, receipts, webhooks

src/domains/          # Domain-specific components
  contractor/         # VoiceRecorder, EstimateCard, JobCard, BidDialog, StatCard
  marketplace/        # Navbar, Hero, Features, HowItWorks, StatsBar,
                      #   Testimonials, PricingSection, CtaSection, Footer, MobileNav

src/shared/
  components/         # Sidebar, AppHeader, AiEstimateCard, BrandMark, CookieConsent, EmptyState
  hooks/              # use-realtime.ts, use-estimate.ts, use-page-title.ts
  ui/                 # Radix-based primitives (AlertDialog, Button, Badge, Card, Dialog,
                      #   Input, Progress, Separator, Skeleton, Tabs, Textarea, Toaster)
  lib/utils.ts        # cn(), formatCurrency(), formatDate(), getInitials()
  lib/constants.ts    # Brand config, nav links, pricing tiers, job categories
  lib/mock-data.ts    # All TypeScript types + mock data
  lib/data.ts         # Data layer — tries real API, falls back to mock
  lib/realtime.ts     # STOMP/SockJS client + full REST API wrapper
  lib/db.ts           # Prisma client singleton (PrismaClient + pg adapter)
  lib/auth.ts         # JWT sign/verify, bcrypt hash/compare, getAuthUser
  lib/auth-store.ts   # Client-side auth state (localStorage + realtime sync)
  lib/quickbooks.ts   # Intuit OAuth2, QB API calls, invoice/estimate sync
  lib/analytics.ts    # PostHog analytics (init, identify, track, reset)
  lib/rate-limit.ts   # In-memory rate limiter for middleware

src/middleware.ts     # Auth protection + rate limiting + security headers
src/generated/prisma/ # Generated Prisma client + model types
src/__tests__/        # Vitest unit tests (utils.test.ts, constants.test.ts, mock-data.test.ts)
src/styles/globals.css

prisma/schema.prisma  # 19 models: User, Contractor, Homeowner, License,
                      #   InsuranceCert, Job, JobPhoto, Bid, AiEstimate,
                      #   SavedEstimate, Conversation, ConversationParticipant,
                      #   Message, Review, QuickBooksConnection, Invoice,
                      #   Payout, Receipt, Notification
```

## Conventions

- **Path aliases**: `@/*`, `@contractor/*`, `@homeowner/*`, `@marketplace/*`, `@shared/*`
- **Component variants**: Use `class-variance-authority` (cva) for button/badge variants
- **Class merging**: Always use `cn()` from `@shared/lib/utils` (clsx + tailwind-merge)
- **Styling**: Tailwind utility classes. No CSS modules. Global styles in `src/styles/globals.css`
- **UI components**: Radix UI primitives wrapped in `src/shared/ui/`. Follow existing patterns.
- **Mock data**: All types and mock data live in `src/shared/lib/mock-data.ts`
- **Data layer**: Pages use `src/shared/lib/data.ts` which tries real API first, falls back to mock
- **No gradients**: Flat colors only
- **No emojis in UI**: Use Lucide icons instead
- **Font**: SF Pro via system font stack
- **Colors**: Brand green (#059669), dark (#0F1419), surface (#F7F8FA)

## Layout Pattern

- **Contractor**: `contractor/layout.tsx` -- collapsible Sidebar (7 items) + GlobalTopBar with message/notification badge links. Messages, Notifications, Reviews, and Records are pages but not in the sidebar; Messages and Notifications are in the top bar.
- **Homeowner**: `homeowner/layout.tsx` -- Sidebar only, no top bar.
- **Marketing**: Root layout, no sidebar, standard page container.

## Auth System

JWT-based auth with `ftw-token` httpOnly cookie (7-day expiry). Auth helpers in `src/shared/lib/auth.ts`:

- `hashPassword` / `verifyPassword` -- bcrypt with 12 rounds
- `createToken` / `verifyToken` -- JWT sign/verify with `JWT_SECRET`
- `getAuthUser(req)` -- extracts and verifies token from Authorization header or cookie

Client-side auth state managed by `src/shared/lib/auth-store.ts`:

- Calls `/api/auth/login` and `/api/auth/signup` API routes
- Persists token + user in localStorage
- Syncs token to realtime client via `setAuthToken()`
- Exposes `authStore.login()`, `authStore.register()`, `authStore.logout()`

Middleware redirects unauthenticated users from `/contractor/*` and `/homeowner/*` to `/login`. Checks JWT role to prevent cross-role access (contractor can't access homeowner pages and vice versa).

## API Routes

27 route files in `src/app/api/`:

- **Auth**: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/sync-token`
- **Jobs**: `GET/POST /api/jobs`, `GET /api/jobs/[id]`, `POST /api/jobs/[id]/bids`, `POST /api/jobs/[id]/estimate`
- **Bids**: `POST /api/bids/[id]/accept` (also creates QB invoice + queues contractor payout)
- **Contractor**: `GET/PUT /api/contractor/profile`, `GET/POST /api/contractor/licenses`, `GET/POST /api/contractor/insurance`, `GET/POST /api/contractor/estimates`, `GET/DELETE /api/contractor/estimates/[id]`, `GET /api/contractor/estimates/[id]/pdf`
- **Homeowner**: `GET/PUT /api/homeowner/property`
- **Contact**: `POST /api/contact`
- **QuickBooks**: 9 routes under `/api/integrations/quickbooks/` (connect, callback, disconnect, status, create-invoice, sync-estimate, payout, receipt, webhook)

All database routes use `prisma` from `src/shared/lib/db.ts`. Auth-required routes call `getAuthUser(req)`.

## QuickBooks Integration

Full Intuit OAuth2 implementation in `src/shared/lib/quickbooks.ts`:

- OAuth2 connect/callback/disconnect flow
- Token auto-refresh (5-min buffer before expiry)
- Authenticated QB API calls via `qbFetch(contractorId, endpoint)`
- Customer sync (`findOrCreateCustomer`)
- Vendor sync for contractors (`findOrCreateVendor`)
- Estimate sync to QB (`syncEstimateToQB`)
- Invoice creation + email sending (`createQBInvoice`, `sendQBInvoice`)
- Invoice fetch (`getQBInvoice`)
- Bill creation for payouts (`createQBBill`)
- Bill payment execution (`payQBBill`)
- Payment status polling (`getInvoicePayments`)
- Webhook signature verification (HMAC-SHA256)

Payment flow: homeowner accepts bid -> QB invoice sent (bid + 3% service fee) -> homeowner pays -> webhook fires -> payout executes (bid - 5% platform fee) via QB Bill/BillPayment -> receipt generated.

Requires env vars: `QB_CLIENT_ID`, `QB_CLIENT_SECRET`, `QB_REDIRECT_URI`, `QB_SANDBOX`, `QB_WEBHOOK_VERIFIER_TOKEN`.

## AI Estimation (ConstructionAI v4)

Backend calls the ConstructionAI FastAPI service at `CONSTRUCTIONAI_API_URL` (default `http://localhost:8000/api/estimate`).

**Job-linked estimates:**

`POST /api/jobs/[id]/estimate` -- generate or retrieve cached AI estimate for a job. Send `{ force: true }` to regenerate. Returns full structured estimate with CSI division breakdown, line items, material takeoff, labor/material/equipment costs, markup percentages, exclusions, notes, timeline, and PDF URL.

**Contractor standalone estimates:**

- `GET /api/contractor/estimates` -- list saved estimates
- `POST /api/contractor/estimates` -- generate standalone estimate (not tied to a job). Body: `{ projectType, description, location, sqft?, quality?, clientName?, propertyType?, yearBuilt? }`
- `GET /api/contractor/estimates/[id]` -- single estimate detail
- `DELETE /api/contractor/estimates/[id]` -- remove saved estimate
- `GET /api/contractor/estimates/[id]/pdf` -- download/regenerate PDF

**Prisma models:** `AiEstimate` (job-linked, full v4 fields), `SavedEstimate` (contractor's standalone estimates).

Client-side hooks in `src/shared/hooks/use-estimate.ts`:

- `useJobEstimate(jobId)` -- fetches AI estimate via API, returns `regenerate()` callback
- `useBidSuggestion(jobId)` -- calculates competitive bid suggestion from AI estimate
- `useContractorEstimates()` -- list all saved estimates, returns `refresh()` and `remove(id)` callbacks
- `useGenerateEstimate()` -- generate standalone estimate, returns `generate(params)` async function

## Realtime Client

`src/shared/lib/realtime.ts` exports:

- `realtimeClient` -- singleton `RealtimeClient` instance. Call `.connect(token)` to open the STOMP/SockJS WebSocket (requires auth token).
- `api` -- REST API wrapper with methods for all backend endpoints (auth, jobs, bids, chat, estimates, invoices, projects, clients, reviews, notifications, AI estimation, file uploads, settings, verification, FairRecords).
- `setAuthToken(token)` / `getAuthToken()` -- token management for both REST and WebSocket.

WebSocket topics (STOMP): `/topic/jobs.feed`, `/topic/job.{id}`, `/topic/chat.{id}`, `/topic/user.{id}`.

`src/shared/hooks/use-realtime.ts` exports three hooks:

```ts
useRealtimeJobs()                    // live job feed
useRealtimeBids(jobId: string | null) // live bids on one job
useRealtimeChat(conversationId: string | null) // live chat
```

## Contractor Settings Page

`src/app/contractor/settings/page.tsx` renders 12 sections via a left-nav panel:

| Section | Key |
|---------|-----|
| Profile | `profile` |
| Service Area | `service-area` |
| Job Preferences | `job-prefs` |
| Team | `team` |
| Availability | `availability` |
| Licenses | `licenses` |
| Insurance | `insurance` |
| Integrations | `integrations` |
| Appearance | `appearance` |
| Account | `account` |
| Security | `security` |
| Notifications | `notifications` |

Integrations section shows QuickBooks, Google Calendar, Stripe Connect, and CompanyCam -- QuickBooks is wired to real OAuth2 API routes, others are mock state.

## Testing

```bash
pnpm test
```

Vitest runs in `node` environment. Tests live in `src/__tests__/`. Currently covers `utils.ts`, `constants.ts`, and `mock-data.ts`. Config in `vitest.config.ts`.

## AEON

Security profile configured in `.aeonrc.yml`. Custom taint sources/sinks for database and payment flows. Run before integrating any new backend routes.
