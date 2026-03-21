# Homeowner Backend

Supabase Edge Functions + database schema for homeowner-facing operations.

## Planned

- Authentication (homeowner signup, login, session)
- Job posting CRUD
- Bid review and acceptance
- Project milestone tracking
- Escrow payment management
- Contractor search and filtering
- Review/rating submission

## Stack

- Supabase (Postgres + Auth + Storage + Edge Functions)
- Stripe (Escrow payments)

## Schema (Draft)

```sql
homeowners, jobs, job_photos, bids, projects,
milestones, payments, homeowner_reviews
```
