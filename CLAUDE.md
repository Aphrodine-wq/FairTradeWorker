# FairTradeWorker — Developer Guide

## Quick Commands

```bash
pnpm install          # Install deps
pnpm dev              # Dev server (Turbopack) on :3000
pnpm build            # Static export to /out/
pnpm lint             # ESLint
pnpm dev:electron     # Dev + Electron
pnpm build:electron   # Build macOS dmg
```

## Architecture

Next.js 15 App Router with static export. Two user roles (contractor, homeowner) with separate route groups and layouts. All data is mocked client-side — no backend, no API routes, no database yet.

```
src/app/              # Pages (App Router)
  (auth)/             # Login/Signup route group
  contractor/         # 10 pages, layout has sidebar + top bar
  homeowner/          # 5 pages, layout has sidebar only
  [marketing pages]   # Landing, pricing, about, etc.

src/domains/          # Domain-specific components
  contractor/         # Voice recorder, estimate cards, job cards
  homeowner/          # Contractor cards, profiles
  marketplace/        # Navbar, hero, features, pricing, testimonials

src/shared/
  components/         # Sidebar, AppHeader (shared across layouts)
  ui/                 # Radix-based primitives (Button, Badge, Card, Dialog, etc.)
  lib/utils.ts        # cn(), formatCurrency(), formatDate(), getInitials()
  lib/constants.ts    # Brand config, nav links, pricing tiers, job categories
  lib/mock-data.ts    # All TypeScript types + mock data
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
- **Colors**: Brand green (#059669), dark (#0F1419), surface (#FDFCFA)

## Layout Pattern

- **Contractor**: `contractor/layout.tsx` wraps all contractor pages with collapsible Sidebar + AppHeader (top bar with message/notification badges)
- **Homeowner**: `homeowner/layout.tsx` wraps all homeowner pages with Sidebar only (no top bar)
- **Marketing**: Root layout with no sidebar, standard page container

## Planned Backend (not built yet)

Backend READMEs in `backend/*/` describe planned Supabase Edge Functions, schemas, and integrations (Stripe Connect, ElevenLabs). No code exists there yet.

## AEON

Security profile configured in `.aeonrc.yml`. Custom taint sources/sinks for Supabase and payment flows. Run before integrating any backend.
