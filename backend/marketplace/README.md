# Marketplace Backend

Shared infrastructure, matching engine, and cross-domain services.

## Planned

- Smart matching engine (contractor-job scoring)
- Messaging system (real-time with Supabase Realtime)
- Escrow transaction management
- Search indexing and ranking
- Analytics and reporting
- Admin dashboard API
- Webhook integrations (Stripe, ElevenLabs)

## Stack

- Supabase (Postgres + Realtime + Edge Functions)
- Stripe Connect (marketplace payments)

## Schema (Draft)

```sql
messages, conversations, escrow_transactions,
match_scores, analytics_events, admin_users
```
