# FairTradeWorker — Developer Guide

## Quick Commands

```bash
pnpm install          # Install deps
pnpm dev              # Dev server (Turbopack) on :3000
pnpm build            # Static export to /out/
pnpm lint             # ESLint
pnpm test             # Vitest unit tests
pnpm dev:electron     # Dev + Electron
pnpm build:electron   # Build macOS dmg
```

## Architecture

Next.js 15 App Router with static export (`output: "export"` in `next.config.ts`). Two user roles (contractor, homeowner) with separate route groups and layouts. All page data is mocked client-side — no backend, no API routes, no database yet.

The realtime client layer (`src/shared/lib/realtime.ts`) is fully implemented using the `phoenix` npm package and targets the Elixir/Phoenix backend at `NEXT_PUBLIC_REALTIME_URL`. It is not yet connected to pages — pages still use `mock-data.ts`.

```
src/app/              # Pages (App Router)
  (auth)/             # Login/Signup route group
  contractor/         # 10 pages, layout has sidebar + global top bar
  homeowner/          # 5 pages, layout has sidebar only
  [marketing pages]   # Landing, pricing, about, blog, careers, contact, faq

src/domains/          # Domain-specific components
  contractor/         # VoiceRecorder, EstimateCard, JobCard, BidDialog, StatCard
  homeowner/          # ContractorCard, ContractorProfileDialog
  marketplace/        # Navbar, Hero, Features, HowItWorks, StatsBar,
                      #   Testimonials, PricingSection, CtaSection, Footer

src/shared/
  components/         # Sidebar, AppHeader (shared across layouts)
  hooks/              # use-realtime.ts — useRealtimeJobs, useRealtimeBids, useRealtimeChat
  ui/                 # Radix-based primitives (Button, Badge, Card, Dialog,
                      #   Input, Textarea, Tabs, Progress, Separator)
  lib/utils.ts        # cn(), formatCurrency(), formatDate(), getInitials()
  lib/constants.ts    # Brand config, nav links, pricing tiers, job categories
  lib/mock-data.ts    # All TypeScript types + mock data
  lib/realtime.ts     # Phoenix Channels client + REST api wrapper

src/__tests__/        # Vitest unit tests (utils.test.ts, constants.test.ts, mock-data.test.ts)
```

## Conventions

- **Path aliases**: `@/*`, `@contractor/*`, `@homeowner/*`, `@marketplace/*`, `@shared/*`
- **Component variants**: Use `class-variance-authority` (cva) for button/badge variants
- **Class merging**: Always use `cn()` from `@shared/lib/utils` (clsx + tailwind-merge)
- **Styling**: Tailwind utility classes. No CSS modules. Global styles in `src/styles/globals.css`
- **UI components**: Radix UI primitives wrapped in `src/shared/ui/`. Follow existing patterns.
- **Mock data**: All types and mock data live in `src/shared/lib/mock-data.ts`
- **No gradients**: Flat colors only
- **No emojis in UI**: Use Lucide icons instead
- **Font**: SF Pro via system font stack
- **Colors**: Brand green (#059669), dark (#0F1419), surface (#F7F8FA)

## Layout Pattern

- **Contractor**: `contractor/layout.tsx` — collapsible Sidebar (7 items) + GlobalTopBar with message/notification badge links. Messages, Notifications, and Reviews are pages but not in the sidebar; Messages and Notifications are in the top bar.
- **Homeowner**: `homeowner/layout.tsx` — Sidebar only (5 items), no top bar.
- **Marketing**: Root layout, no sidebar, standard page container.

## Realtime Client

`src/shared/lib/realtime.ts` exports:

- `realtimeClient` — singleton `RealtimeClient` instance. Call `.connect(userId?)` to open the WebSocket.
- `api` — REST fallback for jobs, bids, and chat messages.

`src/shared/hooks/use-realtime.ts` exports three hooks built on top of the client:

```ts
useRealtimeJobs()                    // live job feed
useRealtimeBids(jobId: string | null) // live bids on one job
useRealtimeChat(conversationId: string | null) // live chat
```

Set `NEXT_PUBLIC_REALTIME_URL` to the running Elixir backend. Defaults to `http://localhost:4000`.

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

Integrations section shows QuickBooks, Google Calendar, Stripe Connect, and CompanyCam — all mock state, none wired to real APIs yet.

## Planned Backend (not built yet)

Backend READMEs in `backend/*/` describe planned Supabase Edge Functions, schemas, and integrations (QuickBooks Online API, ElevenLabs). No code exists there yet. Payment integration uses QuickBooks Online (not Stripe Connect) per project spec.

## Testing

```bash
pnpm test
```

Vitest runs in `node` environment. Tests live in `src/__tests__/`. Currently covers `utils.ts`, `constants.ts`, and `mock-data.ts`. Config in `vitest.config.ts`.

## AEON

Security profile configured in `.aeonrc.yml`. Custom taint sources/sinks for Supabase and payment flows. Run before integrating any backend.
