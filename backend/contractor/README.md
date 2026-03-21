# Contractor Backend

Supabase Edge Functions + database schema for contractor-facing operations.

## Planned

- Authentication (contractor signup, login, session)
- Estimate CRUD (create, read, update, delete, send)
- Job bid submission and tracking
- Client management
- Voice AI transcript processing (ElevenLabs integration)
- File uploads (photos, documents)
- Notification delivery (email, SMS, push)

## Stack

- Supabase (Postgres + Auth + Storage + Edge Functions)
- ElevenLabs API (Voice AI)

## Schema (Draft)

```sql
contractors, estimates, line_items, bids, clients,
contractor_reviews, notifications, uploaded_files
```
