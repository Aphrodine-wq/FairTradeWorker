# Infrastructure Cost Model

## Supabase Scaling Analysis

### Tier Comparison

| Tier | Monthly | Database | Auth MAU | Bandwidth | Storage | Backups |
|------|---------|----------|----------|-----------|---------|---------|
| Free | $0 | 500MB, 2 projects | 50K | 2GB/mo | 1GB | None. **Pauses after 7 days inactivity.** |
| Pro | $25 | 8GB | 100K | 250GB/mo | 100GB | Daily, 7-day retention |
| Team | $599 | 8GB (same base) | 100K | 250GB/mo | 100GB | Daily, 28-day retention + SOC 2, SSO |

### Overage Pricing (Pro Tier)

| Resource | Included | Overage Rate |
|----------|----------|-------------|
| Database size | 8GB | $0.125/GB/month |
| Auth MAU | 100K | $0.00325/MAU |
| Storage | 100GB | $0.021/GB/month |
| Bandwidth | 250GB | $0.09/GB |
| Realtime messages | 5M/month | $2.50 per million |
| Edge Function invocations | 2M/month | $2/million |

### When Do You Need to Upgrade from Pro?

**Row count is NOT a hard limit on Pro** — Supabase does not cap rows. The constraint is database size (8GB included). Here is how database size grows:

| Scale Point | Estimated Rows | Estimated DB Size | Pro Tier Status |
|-------------|---------------|-------------------|----------------|
| 50 contractors, 500 homeowners | ~50K rows | ~200MB | Well within limits |
| 200 contractors, 2,000 homeowners | ~500K rows | ~1.5GB | Comfortable |
| 500 contractors, 5,000 homeowners | ~2M rows | ~4GB | 50% of included storage |
| 1,000 contractors, 10,000 homeowners | ~5M rows | ~8GB | At limit — overages start |
| 2,000 contractors, 20,000 homeowners | ~12M rows | ~16GB | $1/mo overage ($0.125/GB x 8GB over) |

**Trigger for upgrade to Team ($599/mo):** Only needed if you require SOC 2 compliance (enterprise clients asking for it), SSO for team accounts, or 28-day backup retention. For most scenarios, staying on Pro with overages is cheaper than Team until the overage bill exceeds ~$500/mo — which would require a very large database (~4TB+, unrealistic for FTW's use case).

**Storage scaling (file uploads):** If contractors upload project photos, documents, and estimates, storage grows faster than database. At 500 contractors uploading an average of 50 photos (2MB each) + 20 documents (500KB each): ~55GB. Within Pro's 100GB limit. At 2,000 contractors with the same pattern: ~220GB. Overage: ~$2.50/mo for the extra 120GB.

**Auth MAU scaling:** FTW will have both contractors and homeowners. At 10,000 contractors + 50,000 homeowners = 60,000 MAU. Well within Pro's 100K MAU limit. Upgrade trigger: 100K+ MAU, at which point overage is $0.00325/MAU = $3.25 per 1,000 users over the limit.

**Realtime messages:** If FTW uses Supabase Realtime for live bidding/chat (separate from the Elixir/Phoenix backend), 5M messages/month covers ~10,000 active conversations with 500 messages each. If using Elixir/Phoenix for realtime (which is the plan), Supabase Realtime usage stays near zero.

**Action item:** Start on Supabase Pro ($25/mo) at launch. Monitor database size monthly. The first upgrade trigger is likely storage (photo uploads), not database rows. Consider compressing/resizing uploaded images client-side to 500KB max to extend storage runway.

---

## Vercel Scaling Analysis

### Bandwidth Projections

FTW uses Next.js with static export (`output: "export"`). This means pages are pre-rendered HTML/CSS/JS files served from Vercel's CDN — very bandwidth-efficient.

| User Count | Estimated Monthly Page Views | Estimated Bandwidth | Vercel Pro Status |
|------------|-----------------------------|--------------------|------------------|
| 100 users | ~10K page views | ~5GB | 0.5% of 1TB limit |
| 1,000 users | ~100K page views | ~50GB | 5% of limit |
| 10,000 users | ~1M page views | ~400GB | 40% of limit |
| 50,000 users | ~5M page views | ~1.5TB | Over limit — $75/mo overage |
| 100,000 users | ~10M page views | ~3TB | Over limit — $300/mo overage |

**Assumptions:** Average page weight ~500KB (HTML + JS + CSS + fonts). 10 page views per user per month. No large image/video assets served from Vercel (offloaded to Supabase Storage or CDN).

### When to Add Cloudflare CDN

**Trigger:** When monthly bandwidth exceeds 500GB (~25,000 users) OR when image-heavy pages (contractor portfolios, project galleries) start consuming disproportionate bandwidth.

**Cloudflare Free Tier** provides:
- Unlimited bandwidth for cached assets
- DDoS protection
- SSL termination
- Basic analytics

**Implementation:** Point fairtradeworker.com DNS to Cloudflare. Cloudflare proxies to Vercel. Static assets are cached at Cloudflare's edge — Vercel only serves cache misses. Expected bandwidth reduction: **50-80%**.

**Cloudflare Pro ($20/mo)** adds: image optimization (Polish), faster cache purge, WAF rules. Worth adding when monthly Vercel bandwidth savings exceed $20/mo (around 50,000 users).

### When to Consider Self-Hosting (Leave Vercel)

**Trigger:** When Vercel costs exceed $200/mo consistently AND the team has DevOps capacity.

**Alternative:** Deploy Next.js static export to a $5/mo VPS (Hetzner, DigitalOcean) behind Cloudflare. Total cost: ~$25/mo for essentially unlimited bandwidth. But this loses: Vercel's deploy previews, automatic SSL, edge functions, and zero-config CI/CD.

**Recommendation:** Stay on Vercel until at least 50,000 users. The developer experience and reliability are worth $20-75/mo. At 100,000+ users, evaluate self-hosting or Vercel Enterprise pricing.

**Action item:** Add Cloudflare DNS immediately (free tier). Even at low traffic, the DDoS protection and SSL benefits are worth it. Configure cache headers for static assets to maximize CDN hit rate.

---

## RunPod Serverless Scaling Analysis

### GPU Options for ConstructionAI

| GPU | VRAM | Per-Second Cost | Est. Inference Time | Cost Per Estimate |
|-----|------|----------------|--------------------|--------------------|
| RTX 3090 | 24GB | $0.000056 | 5-10 sec | $0.0003-$0.0006 |
| RTX 4090 | 24GB | $0.000097 | 3-7 sec | $0.0003-$0.0007 |
| A100 80GB | 80GB | $0.000603 | 2-5 sec | $0.001-$0.003 |

ConstructionAI (Llama 3.1 8B, Q4_K_M quantized, 4.9GB model file) fits comfortably on an RTX 3090 or 4090. A100 is overkill for inference — only useful for training or serving larger models.

### Cold Start Analysis

**Cold start = time to load the model from disk to GPU VRAM before first inference.**

| GPU | Cold Start Time | Impact |
|-----|----------------|--------|
| RTX 3090 | 15-30 seconds | First user waits 15-30s. Unacceptable for real-time UX. |
| RTX 4090 | 10-20 seconds | Slightly better. Still too slow for on-demand. |
| A100 | 5-10 seconds | Faster NVLink, but still noticeable. |

**Mitigation strategies:**
1. **Min workers = 1:** Keep one GPU warm at all times. Cost: ~$0.20/hr x 24hr x 30 days = **$144/mo** for an always-on RTX 3090. Eliminates cold starts for the first concurrent user.
2. **Async estimation:** User submits estimate request, sees "Generating your estimate..." with a progress indicator. Estimate is delivered via push notification or email when ready (30-60 seconds later). This makes cold starts invisible.
3. **Hybrid approach:** Keep 1 warm worker during business hours (8am-8pm CT = 12 hours/day). Cost: ~$72/mo. Off-hours requests use async delivery.

### Autoscaling Configuration

| Setting | Recommended Value | Rationale |
|---------|------------------|-----------|
| Min workers | 0 (launch) or 1 (growth) | Start with 0 to minimize cost. Switch to 1 when daily estimate volume exceeds 20/day. |
| Max workers | 3 | Prevents runaway costs. 3 workers can handle ~50 concurrent estimates. |
| Scale-up threshold | Queue depth > 2 | Add a worker when 2+ requests are waiting. |
| Scale-down delay | 5 minutes | Keep worker warm for 5 min after last request before shutting down. Handles burst traffic. |
| Idle timeout | 5 minutes | Same as scale-down delay. |

### Volume-Based Cost Projections

| Monthly Estimates | Workers Needed | Cold Start Strategy | Monthly Cost |
|-------------------|---------------|--------------------|----|
| 100 | 0 min workers | Async delivery (30s wait OK) | $0.03-$0.06 |
| 500 | 0 min workers | Async delivery | $0.15-$0.30 |
| 1,000 | 0-1 min workers | Hybrid (warm during business hours) | $1-$72 |
| 5,000 | 1 min worker | Always warm | $144 + $1.50 burst |
| 10,000 | 1 min worker | Always warm | $144 + $3.00 burst |
| 50,000 | 1 min + autoscale to 3 | Always warm + burst capacity | $144 + $15 burst |
| 100,000 | 2 min workers + autoscale to 5 | Always warm | $288 + $30 burst |

### When to Move to Dedicated GPU

**Trigger:** When monthly RunPod Serverless costs consistently exceed $300/mo (~2,000+ estimates/day with warm workers).

**Alternative:** Rent a dedicated RTX 4090 on RunPod ($0.35/hr = $252/mo) or a bare-metal GPU server from Hetzner (~$150-250/mo for an RTX 4000 Ada). Dedicated GPU provides consistent latency and eliminates cold starts entirely.

**Cost crossover:** Dedicated GPU becomes cheaper than serverless when you are running warm workers 18+ hours/day consistently.

**Action item:** Start with 0 min workers and async estimate delivery. Monitor average cold start times and user complaints. When daily estimate volume exceeds 20/day consistently, switch to 1 min worker during business hours ($72/mo).

---

## Database Schema Size Projections

### Core Tables and Growth Rates

| Table | Row Size (avg) | Rows at 1K Contractors | Rows at 10K Homeowners | Rows at 100K Estimates |
|-------|---------------|----------------------|----------------------|----------------------|
| contractors | ~2KB | 1,000 | — | — |
| homeowners | ~1KB | — | 10,000 | — |
| estimates | ~5KB (with line items JSON) | — | — | 100,000 |
| estimate_line_items | ~200B | — | — | 2,000,000 (20 lines/estimate avg) |
| jobs | ~3KB | — | 30,000 | — |
| bids | ~1KB | — | 90,000 (3 bids/job avg) | — |
| reviews | ~500B | — | 15,000 | — |
| messages | ~300B | — | 500,000 | — |
| transactions | ~1KB | — | 50,000 | — |
| contractor_licenses | ~500B | 2,000 (2/contractor avg) | — | — |
| contractor_insurance | ~500B | 1,500 | — | — |
| background_checks | ~1KB | 1,000 | — | — |
| media/photos | ~200B (metadata, files in storage) | 50,000 | — | — |

### Total Database Size Projections

| Scale Point | Total Rows | Estimated DB Size | Supabase Pro Status |
|-------------|-----------|-------------------|---------------------|
| Launch (50 contractors, 500 homeowners) | ~25K | ~100MB | 1.25% of 8GB limit |
| Early growth (200 contractors, 2K homeowners) | ~200K | ~600MB | 7.5% of limit |
| Traction (500 contractors, 5K homeowners, 20K estimates) | ~800K | ~2.5GB | 31% of limit |
| Scale (1K contractors, 10K homeowners, 100K estimates) | ~3M | ~6GB | 75% of limit |
| Growth (2K contractors, 20K homeowners, 250K estimates) | ~8M | ~14GB | Over limit, ~$0.75/mo overage |
| At scale (5K contractors, 50K homeowners, 1M estimates) | ~25M | ~45GB | ~$4.63/mo overage |

**Key insight:** Database row storage is NOT the bottleneck. Even at 5,000 contractors and 1M estimates, Supabase Pro overages are under $5/mo. File storage (contractor photos, estimate PDFs, documents) is the real cost driver.

### File Storage Projections

| Scale Point | Estimated Files | Estimated Storage | Supabase Storage Status |
|-------------|----------------|-------------------|------------------------|
| 200 contractors | 10K photos, 4K docs | ~25GB | 25% of 100GB included |
| 500 contractors | 25K photos, 10K docs | ~60GB | 60% of included |
| 1,000 contractors | 50K photos, 20K docs | ~120GB | $0.42/mo overage |
| 2,000 contractors | 100K photos, 40K docs | ~240GB | $2.94/mo overage |

**Action item:** Implement client-side image compression (max 1MB per photo, 1920px max dimension) to cut storage growth in half. Consider moving file storage to Cloudflare R2 (free egress, $0.015/GB/mo storage) when Supabase storage overages exceed $10/mo.

---

## Backup and Disaster Recovery Costs

### Supabase Built-in Backups

| Tier | Backup Frequency | Retention | Point-in-Time Recovery |
|------|-----------------|-----------|----------------------|
| Pro | Daily | 7 days | No (available on Team tier) |
| Team | Daily | 28 days | Yes |

### Additional Backup Strategy

| Approach | Cost | Frequency | Notes |
|----------|------|-----------|-------|
| pg_dump to Cloudflare R2 | ~$1-5/mo | Daily | Automated via cron job or Supabase webhook. R2 has free egress — restores cost nothing. |
| pg_dump to local/S3 | ~$1-5/mo | Daily | Standard Postgres backup. Encrypt before uploading. |
| Supabase branching (dev/staging) | $0.32/hr active | On-demand | Useful for testing migrations, not for DR. |

### Disaster Recovery Scenarios

| Scenario | Recovery Method | RTO (Recovery Time) | RPO (Data Loss Window) |
|----------|----------------|--------------------|-----------------------|
| Accidental data deletion | Restore from daily backup | 1-4 hours | Up to 24 hours of data |
| Supabase outage | Wait for Supabase recovery | Depends on Supabase | None (data is safe) |
| Supabase permanent failure | Restore pg_dump to new Postgres host | 4-12 hours | Up to 24 hours |
| Account compromise | Restore from encrypted off-site backup | 2-6 hours | Up to 24 hours |

**Total DR cost:** ~$5-10/mo for daily encrypted backups to Cloudflare R2 + monitoring.

**Action item:** Set up automated daily pg_dump to Cloudflare R2 before launching with real user data. Test the restore process at least once before launch — a backup you have never tested is not a backup.

---

## Monitoring and Observability

### Recommended Stack

| Tool | Purpose | Cost | When to Add |
|------|---------|------|-------------|
| Vercel Analytics | Page views, Web Vitals, traffic sources | Included in Pro | Day 1 |
| Supabase Dashboard | Database metrics, auth stats, API usage | Included in Pro | Day 1 |
| Sentry | Error tracking, performance monitoring | Free tier (5K events/mo) | Day 1 |
| Uptime Robot | Uptime monitoring, downtime alerts | Free (50 monitors) | Day 1 |
| PostHog | Product analytics, feature flags, session replay | Free tier (1M events/mo) | When tracking user behavior matters (launch) |
| Better Stack (Logtail) | Log aggregation, search, alerting | Free tier (1GB/mo) | When debugging production issues |
| Checkly | Synthetic monitoring (test critical flows every 5 min) | Free tier (10 checks) | When uptime SLA matters (paying customers) |
| Grafana Cloud | Custom dashboards, alerting | Free tier (10K metrics) | At scale (500+ users), for infrastructure dashboards |

### Cost at Each Stage

| Stage | Tools | Monthly Cost |
|-------|-------|-------------|
| Pre-launch | Vercel Analytics + Supabase Dashboard + Sentry Free + Uptime Robot Free | $0 |
| Launch | Add PostHog Free + Better Stack Free | $0 |
| Growth (200+ contractors) | Upgrade Sentry ($26/mo) + add Checkly Free | $26/mo |
| Scale (1,000+ contractors) | Add Grafana Cloud Free + upgrade PostHog ($0 until >1M events) | $26/mo |
| At scale (5,000+ contractors) | Upgrade PostHog ($450/mo) + Grafana paid ($29/mo) | ~$505/mo |

**Action item:** Set up Sentry (free), Uptime Robot (free), and Vercel Analytics (included) before launch. These three provide error tracking, uptime alerts, and basic traffic data at zero cost.

---

## Domain and Email Costs

### Domain

| Item | Cost | Notes |
|------|------|-------|
| fairtradeworker.com (renewal) | ~$12/year | Already registered. Renew annually. |
| Additional domains (optional) | $12-15/year each | ftw.app, fairtradeworker.io — consider for brand protection. |

### Email

| Option | Cost | What You Get |
|--------|------|-------------|
| Google Workspace (Starter) | $7.20/user/mo | support@fairtradeworker.com, 30GB storage, Google Docs/Sheets/Drive. Professional email. |
| Zoho Mail (Free) | $0 | Up to 5 users, 5GB/user. Basic but functional. Custom domain email. |
| Cloudflare Email Routing (Free) | $0 | Forward support@fairtradeworker.com to personal Gmail. No sending from custom domain without additional setup. |
| Resend (transactional email) | $0-$20/mo | For automated emails (signup confirmation, estimate delivery, notifications). Free tier: 3,000 emails/mo. |

**Recommended setup:**
1. **Cloudflare Email Routing** (free) for receiving email at support@fairtradeworker.com — forwards to personal Gmail.
2. **Resend** (free tier) for transactional emails — signup confirmations, estimate PDFs, notification digests.
3. **Upgrade to Google Workspace** ($7.20/mo) when you need to send FROM support@fairtradeworker.com (looks more professional for customer support, investor correspondence, SBIR communication).

**Total email cost:** $0 at launch, $7.20/mo when professional outbound email is needed, + $0-20/mo for transactional email at scale.

**Action item:** Set up Cloudflare Email Routing this week (free, takes 10 minutes). Set up Resend account for transactional email before launch.

---

## Comparison Table: Current Stack vs Alternatives at Each Scale Tier

### At Launch (< 500 users)

| Component | Current Choice | Cost | Alternative | Alt Cost | Verdict |
|-----------|---------------|------|-------------|----------|---------|
| Database | Supabase Pro | $25/mo | PlanetScale Free | $0 | Supabase wins — auth + storage + realtime included. PlanetScale is MySQL (not Postgres). |
| Frontend Hosting | Vercel Pro | $20/mo | Cloudflare Pages Free | $0 | Vercel wins — better DX, deploy previews, Next.js native. Switch to Cloudflare only if budget is critical. |
| AI Inference | RunPod Serverless | ~$5/mo | Ollama on VPS | $5-10/mo | RunPod wins — no server management, auto-scaling. Ollama VPS requires DevOps. |
| Auth | Supabase Auth | Included | Clerk | $25/mo | Supabase wins — already included, one less vendor. |
| File Storage | Supabase Storage | Included | Cloudflare R2 | $0-5/mo | Supabase wins — integrated. R2 is better at scale (free egress). |
| **Total** | | **~$50/mo** | | **~$30-40/mo** | Current stack is optimal for DX and simplicity. |

### At Growth (500-5,000 users)

| Component | Current Choice | Cost | Alternative | Alt Cost | Switch When? |
|-----------|---------------|------|-------------|----------|-------------|
| Database | Supabase Pro + overages | $25-50/mo | Self-hosted Postgres on Hetzner | $10-20/mo | Only if Supabase overages exceed $100/mo AND you have DevOps capacity. |
| Frontend Hosting | Vercel Pro | $20-75/mo | Cloudflare Pages Pro | $20/mo | If Vercel bandwidth costs exceed $50/mo consistently. |
| AI Inference | RunPod Serverless + warm worker | $72-150/mo | Dedicated GPU (RunPod or Hetzner) | $150-250/mo | When running warm workers 18+ hrs/day. Dedicated is simpler at that point. |
| File Storage | Supabase Storage | $25 + overages | Cloudflare R2 | $5-15/mo | When storage overages exceed $10/mo. R2 has zero egress fees. |
| **Total** | | **~$140-300/mo** | | **~$185-305/mo** | Current stack still competitive. Migrate file storage to R2 first. |

### At Scale (5,000-50,000 users)

| Component | Recommended | Cost | Why |
|-----------|-------------|------|-----|
| Database | Supabase Pro + read replicas OR self-hosted Postgres (Hetzner) | $50-200/mo | Read replicas handle query load. Self-host if team has Postgres expertise. |
| Frontend Hosting | Vercel Pro + Cloudflare CDN | $20 + Cloudflare Pro ($20) | Cloudflare handles 80% of traffic. Vercel serves dynamic content. |
| AI Inference | Dedicated GPU (RunPod or Hetzner) | $250-500/mo | Consistent latency, no cold starts, predictable costs. |
| File Storage | Cloudflare R2 | $15-50/mo | Zero egress fees. Supabase Storage becomes expensive at this scale. |
| Realtime | Elixir/Phoenix on Render or Fly.io | $25-100/mo | Already planned. Scales well for WebSocket connections. |
| **Total** | | **~$380-890/mo** | |

---

## Total Infrastructure Cost Summary

| Scale Point | Users | Monthly Infra | Monthly Revenue (est.) | Infra as % of Revenue |
|-------------|-------|--------------|----------------------|----------------------|
| Launch | 50 contractors, 500 homeowners | ~$351/mo | $2,450 (50 Pro x $49) | 14.3% |
| Early growth | 200 contractors, 2K homeowners | ~$400/mo | $12,780 | 3.1% |
| Traction | 500 contractors, 5K homeowners | ~$600/mo | $29,000 | 2.1% |
| Scale | 1,000 contractors, 10K homeowners | ~$1,600/mo | $55,000 | 2.9% |
| Growth | 5,000 contractors, 50K homeowners | ~$2,500/mo | $275,000 | 0.9% |

**Key insight:** Infrastructure costs grow sub-linearly while revenue grows linearly (or super-linearly with ancillary revenue). At every scale point, infrastructure is less than 15% of revenue — and drops below 3% by 200 contractors. The Checkr background check cost ($30/contractor) is the single largest variable cost, not cloud infrastructure.

**Action item:** Review this cost model quarterly. Update with actual costs vs. projections. The biggest risk is not infrastructure cost — it is premature optimization. Do not migrate away from Supabase/Vercel until actual costs justify the engineering time.
