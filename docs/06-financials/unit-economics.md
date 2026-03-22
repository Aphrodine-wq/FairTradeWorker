# Unit Economics Model

## Customer Acquisition Cost (CAC) by Channel

### Channel-by-Channel Breakdown

| Channel | Estimated CAC | Volume Potential | Notes |
|---------|--------------|-----------------|-------|
| Personal Outreach (James) | $15-30 | 10-20 contractors | Gas, lunch meetings, time cost. Oxford is small — James knows people. Highest conversion rate (~60-70%). |
| Facebook Ads | $40-80 | 50-200 contractors/mo | Local targeting (Oxford + Lafayette County). Construction-related interests. CPM ~$8-12 in MS market. Expect 1-3% CTR, 5-10% landing page conversion. |
| Google Local Service Ads (LSA) | $80-150 | 20-50 contractors/mo | "Contractors near me" intent is high. Cost per lead in construction runs $20-50 in MS. Conversion to signup ~30-40%. Best for quality leads. |
| NextDoor | $10-25 | 10-30 contractors/mo | Neighborhood-level targeting. Sponsored posts run $1-3 CPM. Very low cost but limited scale. Good for homeowner acquisition too. |
| Field Rep (Future) | $100-200 | 30-60 contractors/mo | Part-time local rep visiting job sites, dropping flyers at supply houses. Salary + commission model. Only viable after proving product-market fit. |
| Referral Program | $25-50 | 15-40 contractors/mo | Offer existing contractors $25 credit for each referred contractor who signs up for Pro. Effective CAC = referral bonus + background check cost split. |
| Trade Shows (HBAM, local) | $150-300 | 5-15 contractors/event | Booth cost ($500-2,000) + materials + travel, amortized across signups. Low volume but high credibility. Good for Business tier prospects. |

### Blended CAC Projections

| Phase | Primary Channels | Blended CAC (Contractor) | Blended CAC (Homeowner) |
|-------|-----------------|-------------------------|------------------------|
| Pre-launch (0-50 contractors) | Personal outreach, NextDoor | $25-40 | $5-10 |
| Early growth (50-200 contractors) | Facebook, referral, NextDoor | $50-80 | $10-15 |
| Scaling (200-1,000 contractors) | Google LSA, Facebook, field rep, referral | $80-120 | $15-25 |
| At scale (1,000+ contractors) | All channels, paid dominant | $100-150 | $20-30 |

Background check cost ($29.99-$79.99 via Checkr) is included in contractor CAC for all channels since FTW absorbs this cost. At the Basic package ($29.99), this adds ~$30 to every contractor CAC calculation.

**Action item:** Track CAC by channel from day one. Use UTM parameters on every link, ask "how did you hear about us" at signup, and tag each contractor in Supabase with their acquisition source.

---

## Lifetime Value (LTV) Model

### Base LTV by Tier

| Tier | Monthly | Annual | 12-mo LTV | 24-mo LTV | 36-mo LTV | 48-mo LTV |
|------|---------|--------|-----------|-----------|-----------|-----------|
| Free | $0 | $0 | $0 | $0 | $0 | $0 |
| Pro | $49 | $588 | $588 | $1,176 | $1,764 | $2,352 |
| Business | $149 | $1,788 | $1,788 | $3,576 | $5,364 | $7,152 |

### Churn Sensitivity Analysis

Monthly churn rate directly determines average customer lifetime: Average Lifetime (months) = 1 / Monthly Churn Rate.

| Monthly Churn | Annual Churn | Avg Lifetime | Pro LTV | Business LTV | Risk Level |
|--------------|-------------|-------------|---------|-------------|------------|
| 2% | 21.5% | 50 months | $2,450 | $7,450 | Excellent — best-in-class SaaS retention |
| 3% | 30.6% | 33 months | $1,617 | $4,917 | Strong — typical for sticky vertical SaaS |
| 5% | 46.0% | 20 months | $980 | $2,980 | Acceptable — common for SMB SaaS |
| 8% | 63.2% | 12.5 months | $613 | $1,863 | Warning — need to investigate churn drivers |
| 10% | 71.8% | 10 months | $490 | $1,490 | Critical — product or pricing problem |

**Target:** 3-5% monthly churn. Construction businesses are seasonal, so expect higher churn in winter months (Nov-Feb) in Mississippi. Annual plans with a discount (e.g., $39/mo billed annually) can smooth this.

**Why churn matters exponentially:** At 3% monthly churn, a Pro subscriber generates $1,617 in LTV. At 8% churn, that same subscriber generates only $613 — a 62% drop in LTV from a 5-point churn increase. Every percentage point of churn reduction is worth ~$200 in Pro LTV.

### Churn Mitigation Strategies

1. **Sticky integrations:** QuickBooks sync means leaving FTW means re-doing accounting setup. Switching cost = retention.
2. **Data lock-in (ethical):** Historical estimates, client history, reviews — all valuable data the contractor loses if they leave.
3. **Annual billing discount:** Offer 2 months free on annual plans ($39/mo x 12 = $468 vs $588). Locks in 12-month commitment.
4. **Seasonal pause:** Allow contractors to "pause" subscription for $10/mo during slow months instead of canceling. Preserves their data and profile.

**Action item:** Define churn as "no active subscription AND no login in 30 days." Track monthly churn starting from Month 1. Set up automated churn risk alerts (no login in 14 days = send re-engagement email).

---

## LTV/CAC Ratio Analysis

Industry standard minimum: **3.0x** (per David Skok / SaaStr benchmarks). Venture-scale businesses target **5.0x+**.

| Scenario | CAC | LTV (at 5% churn) | LTV/CAC | Verdict |
|----------|-----|-------------------|---------|---------|
| Pro, personal outreach | $40 | $980 | 24.5x | Outstanding — only works at small scale |
| Pro, Facebook ads | $70 | $980 | 14.0x | Excellent — scalable |
| Pro, Google LSA | $120 | $980 | 8.2x | Strong — good for high-intent leads |
| Pro, field rep | $175 | $980 | 5.6x | Acceptable — worth it if conversion is high |
| Pro, trade show | $250 | $980 | 3.9x | Marginal — only if leads are Business tier |
| Business, Google LSA | $120 | $2,980 | 24.8x | Outstanding — Business tier justifies paid channels |
| Business, field rep | $175 | $2,980 | 17.0x | Excellent — field reps pay for themselves fast |

**Key insight:** Even the most expensive acquisition channel (trade shows at $250 CAC) delivers a 3.9x ratio on Pro subscribers — above the 3.0x minimum. The math works across all channels. The strategic question is which channels scale while maintaining quality.

---

## Payback Period by Tier

Payback period = CAC / Monthly Revenue Per User. This tells you how many months until the acquisition cost is recovered.

| Tier | Blended CAC | Monthly Revenue | Payback Period | Verdict |
|------|-------------|----------------|----------------|---------|
| Pro (personal outreach) | $40 | $49 | 0.8 months | Instant payback — cash flow positive on first invoice |
| Pro (blended early) | $70 | $49 | 1.4 months | Outstanding — under 2 months |
| Pro (blended scaling) | $100 | $49 | 2.0 months | Excellent — well under 12-month benchmark |
| Pro (worst case) | $150 | $49 | 3.1 months | Still strong |
| Business (blended) | $120 | $149 | 0.8 months | Instant payback |
| Business (worst case) | $200 | $149 | 1.3 months | Outstanding |

Industry benchmark for SaaS payback period is **12-18 months**. FTW's payback period is **1-3 months** across all realistic scenarios. This means FTW can grow aggressively without needing external capital to fund customer acquisition — revenue from Month 2 funds the next cohort's acquisition.

**Action item:** Calculate actual payback period monthly. If it exceeds 6 months on any channel, pause spend on that channel and investigate.

---

## Cohort Analysis Framework

Track retention and revenue by signup month to identify trends before they become problems.

### Monthly Cohort Tracking Table

| Metric | Month 0 | Month 1 | Month 2 | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|---------|---------|----------|
| Signups (all tiers) | 100% | — | — | — | — | — |
| Active (logged in) | 100% | Target: 80% | Target: 70% | Target: 65% | Target: 55% | Target: 40% |
| Paying (Pro+Business) | X% | Target: 90% of paying | Target: 85% | Target: 80% | Target: 70% | Target: 55% |
| Revenue per cohort | $X | $X * 0.90 | $X * 0.85 | $X * 0.80 | $X * 0.70 | $X * 0.55 |

### What to Track Per Cohort

1. **Signup-to-paid conversion rate:** What % of free signups upgrade to Pro within 30/60/90 days?
2. **Time-to-first-estimate:** How quickly do new contractors use the Estimate Agent? If >7 days, activation is broken.
3. **Monthly retention curve:** Plot the % of each cohort still active at Month 1, 2, 3, 6, 12. Look for the "flattening" — the point where churn stabilizes.
4. **Revenue retention (net dollar retention):** Are existing customers expanding (Free to Pro, Pro to Business)? Target: 100%+ net dollar retention.
5. **Churn reason tagging:** When a contractor cancels, require a reason. Categories: too expensive, not enough leads, switched to competitor, went out of business, seasonal pause, other.

### Cohort Red Flags

- Month 1 retention below 70% = activation problem (onboarding is failing)
- Month 3 retention below 50% = value problem (product isn't delivering)
- Month 6 retention below 35% = market problem (wrong customer segment)
- Net dollar retention below 90% = expansion problem (no upgrade path)

**Action item:** Build a cohort dashboard in Supabase/Metabase before launching paid tiers. Track from the first paying customer.

---

## Revenue Per User Breakdown (Full ARPU)

### Pro Contractor ($49/mo base)

| Revenue Stream | Monthly Estimate | Assumptions |
|----------------|-----------------|-------------|
| SaaS subscription | $49.00 | Base Pro tier |
| QuickBooks rev share (Intuit ProAdvisor) | $5-15 | 20% of payment processing fees for 3 years. Assumes contractor processes $10K-$30K/mo through QB Payments at ~2.9% fee. FTW gets 20% of that fee. |
| Homeowner convenience fee pass-through | $3-8 | If homeowner pays $5-10 convenience fee per job, and contractor does 3-5 jobs/mo via FTW. Not direct contractor revenue but platform revenue attributed to the contractor relationship. |
| AI estimate upsell (if not bundled) | $2-5 | If estimates are $5-15 each and contractor uses 2-5/mo beyond the Pro bundle. |
| Featured placement (future) | $0-20 | Contractors can pay for featured spot in search results. $10-20/mo. Low initial adoption. |
| **Blended ARPU** | **$59-97/mo** | |

### Business Contractor ($149/mo base)

| Revenue Stream | Monthly Estimate | Assumptions |
|----------------|-----------------|-------------|
| SaaS subscription | $149.00 | Base Business tier |
| QuickBooks rev share | $15-40 | Higher volume contractors process more payments |
| Featured placement | $10-30 | Business tier contractors more likely to pay for visibility |
| White-label referral (future) | $5-15 | If Business contractor refers subcontractors who sign up |
| **Blended ARPU** | **$179-234/mo** | |

### Homeowner (Free to Use)

| Revenue Stream | Per-Job Estimate | Assumptions |
|----------------|-----------------|-------------|
| Convenience fee | $5-10 | Charged when homeowner books through platform |
| AI estimate purchase | $5-15 | Homeowner requests independent AI estimate before hiring |
| Materials referral commission (future) | $2-10 | Commission on materials purchased through FTW partner links (Home Depot Pro, etc.) |
| **Blended per-job revenue** | **$12-35** | |

### Revenue Mix Projection at 200 Pro + 20 Business Contractors

| Stream | Monthly Revenue | % of Total |
|--------|----------------|-----------|
| SaaS subscriptions | $12,780 | 65% |
| QuickBooks rev share | $1,500-3,500 | 12-18% |
| Homeowner fees | $1,000-2,500 | 8-13% |
| AI estimate sales | $500-1,500 | 4-8% |
| Featured placement | $300-800 | 2-4% |
| **Total** | **$16,080-21,080** | 100% |

**Key insight:** SaaS subscriptions are the foundation (65%), but ancillary revenue adds 35%+ on top. The QuickBooks rev share alone could cover infrastructure costs.

---

## Industry Benchmarks Comparison

| Metric | FTW (Projected) | ServiceTitan | Jobber | Buildertrend | Thumbtack |
|--------|-----------------|-------------|--------|-------------|-----------|
| ARPU | $59-97/mo (Pro) | $350-500/mo | $49-149/mo | $99-499/mo | $15-50/lead |
| CAC | $50-150 | $2,000-5,000 | $300-800 | $500-1,500 | $5-20/lead |
| LTV/CAC | 8-20x | 5-10x | 4-8x | 5-12x | N/A (transactional) |
| Monthly Churn | Target: 3-5% | ~2-3% | ~5-7% | ~3-5% | N/A |
| Payback Period | 1-3 months | 6-12 months | 3-6 months | 4-8 months | Instant |
| Net Dollar Retention | Target: 100%+ | 110-120% | 100-105% | 105-115% | N/A |

**Note:** ServiceTitan targets enterprise contractors ($5M+ revenue). Jobber targets SMB. Buildertrend targets mid-market builders. FTW targets the underserved small contractor segment ($100K-$2M revenue) that these platforms largely ignore. Thumbtack is lead-gen, not SaaS — different model entirely.

**Action item:** Revisit these benchmarks quarterly. As FTW collects real data, replace projections with actuals and track divergence.

---

## Gross Margin Analysis at Scale

| Scale Point | Monthly Revenue | COGS (Infrastructure + Checkr + Support) | Gross Margin | Gross Margin % |
|-------------|----------------|------------------------------------------|-------------|---------------|
| 50 contractors (launch) | $2,450 | $500 (infra) + $150 (Checkr) + $0 (James does support) = $650 | $1,800 | 73% |
| 200 contractors | $12,780 | $600 (infra) + $500 (Checkr) + $1,000 (part-time support) = $2,100 | $10,680 | 84% |
| 500 contractors | $29,000 | $900 (infra) + $1,200 (Checkr) + $3,000 (support hire) = $5,100 | $23,900 | 82% |
| 1,000 contractors | $55,000 | $1,600 (infra) + $2,000 (Checkr) + $5,000 (support team) = $8,600 | $46,400 | 84% |

**Key insight:** Gross margins stay above 80% at all scale points. This is characteristic of vertical SaaS — low marginal cost per additional customer. The main variable costs are Checkr (one-time per contractor) and customer support (scales with user count but can be partially automated).

Infrastructure costs (Supabase, Vercel, RunPod) are nearly flat from 50 to 500 contractors because the current tier pricing absorbs that growth. The step function happens at ~1,000 contractors when Supabase may need a tier upgrade.

**Action item:** Track gross margin monthly. If it drops below 75%, investigate which cost category is growing fastest and address it.

---

## Summary: Key Unit Economics Targets

| Metric | Target | Red Line |
|--------|--------|----------|
| Blended Contractor CAC | < $100 | > $200 = pause and reassess channels |
| Monthly Churn (Pro) | < 5% | > 8% = product/pricing emergency |
| LTV/CAC Ratio | > 5.0x | < 3.0x = unprofitable growth |
| Payback Period | < 3 months | > 6 months = cash flow risk |
| Gross Margin | > 80% | < 70% = cost structure problem |
| Net Dollar Retention | > 100% | < 90% = no expansion revenue |
| Free-to-Paid Conversion | > 10% | < 5% = free tier too generous or Pro value unclear |

**Decision point:** These targets should be validated against real data within the first 90 days of paid launch. If 3+ metrics are in the red line zone, the pricing model or go-to-market strategy needs a fundamental rethink before scaling.
