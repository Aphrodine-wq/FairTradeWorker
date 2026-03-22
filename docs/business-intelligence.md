# FairTradeWorker — Business Intelligence Brief
**Last updated: March 22, 2026**

---

## Competitive Landscape

### Major Players (2026 Status)

**Angi (formerly HomeAdvisor + Angie's List)**
- Revenue down 30% from peak. Split from IAC, now independent.
- Hybrid model: $0-$350/mo subscription + per-lead charges on top.
- Average lead cost: ~$135, sent to 2-4 competing contractors.
- Most negative contractor sentiment of any platform. Common complaints: subscription fees when leads are scarce, difficulty canceling, declining lead quality.
- The math doesn't work for most small/mid-size contractors anymore.

**Thumbtack**
- $400M revenue, up 33% YoY. The strongest competitor.
- Partnerships with ChatGPT, Amazon Alexa, Zillow, Redfin.
- Growing aggressively while others shrink. Watch closely.

**Houzz**
- Pivoted away from lead gen entirely. Now a construction management SaaS tool (Houzz Pro).
- Lead gen is a secondary add-on, not the core product.
- Flat monthly rate, not pay-per-lead.

**Porch**
- Completely abandoned contractor lead business.
- Now an insurance company — insurance is 67% of revenue.
- Validates the thesis that pure lead-gen is dying.

### Market Direction

The pure lead-gen model is dying. Angi is shrinking. Porch ran from it. Houzz pivoted to SaaS. The market is moving toward tools-first, leads-second — which is exactly FTW's model. We are positioned on the right side of this trend.

### Where FTW Fits

| Platform | Model | Contractor Cost | FTW Difference |
|----------|-------|-----------------|----------------|
| Angi | Subscription + per-lead | $135/lead avg | Zero lead fees |
| Thumbtack | Per-project bidding | $48-310/lead | Free tools + subscription |
| Houzz Pro | SaaS + lead add-on | Flat monthly | AI estimation engine |
| FTW | Free tools, paid Pro tier | $0-149/mo, zero lead fees | QuickBooks-native, ConstructionAI |

---

## Market Numbers

### Lead Generation Economics
- 63% of contractors struggle to find quality leads
- Cost-per-lead by channel:
  - Referrals: $52 (cheapest, highest quality)
  - SEO: $74
  - Google Local Services Ads: $92
  - Lead aggregators (Angi/HomeAdvisor): $135+
- Global lead generation market: ~$295B, growing ~17% CAGR

### US Construction Industry
- Total market: $1.8 trillion
- Mississippi construction GDP: $4.7 billion
- Mississippi construction workers: ~47,500

### Oxford, Mississippi (Launch Market)
- Population: 27,448 (2026), growing 1.19% annually
- University of Mississippi (Ole Miss) drives steady demand
- Small enough for density — fewer contractors needed to cover the area
- James has personal contractor relationships in this market

---

## FTW Competitive Advantages

1. **Zero lead fees.** Genuinely differentiated in a market where contractors pay $135/lead to Angi. FTW charges subscriptions, not per-lead.

2. **ConstructionAI.** Purpose-built fine-tuned AI model (Llama 3.1 8B) for construction estimation. 5,200+ training examples on real construction data. No competitor has anything like this — they use generic AI or no AI at all.

3. **QuickBooks-native payments.** Money goes directly to contractors' QuickBooks — no escrow, no middleman, no platform holding funds. This builds trust that Angi/Thumbtack can't match.

4. **Founder is the market.** James is in Oxford, knows contractors, dad runs MHP Construction. Authenticity that no Silicon Valley startup can fake.

5. **White-label proven.** MHP is already running the estimation platform. Revenue stream exists before marketplace launch.

6. **Free tier that's actually useful.** Contractors get real tools (estimation, project management, scheduling) for free. Pro tier ($49/mo) adds AI estimation — the hook.

---

## Risk Register

### 1. Two-Sided Marketplace Cold Start
**Risk:** Need contractors AND homeowners simultaneously. Neither shows up without the other.
**Mitigation:** Oxford's small size helps — fewer of each needed for critical mass. Seed supply side through personal relationships (10-15 contractors). Seed demand side through local channels (Facebook groups, NextDoor, church boards, Ole Miss community).

### 2. Contractor Willingness to Pay
**Risk:** Contractors won't pay for tools they can get free elsewhere.
**Mitigation:** Free tier is generous. Pro tier ($49/mo) must deliver obvious, measurable value. The Estimate Agent is the hook — if it saves 2-3 hours per estimate, it pays for itself on the first job.

### 3. QuickBooks Integration Timeline
**Risk:** Intuit's App Partner Program requires app listed on Intuit App Marketplace by May 1, 2026 (~40 days). Unknown whether this is required to use Payments API or just for revenue share eligibility.
**Action:** Clarify during Innovate MS call or directly with Intuit developer relations. Understand the distinction between API access and marketplace listing.
**Details:** ProAdvisor revenue share = 20% of payment processing fees for 3 years per client. API pricing: write calls are free at every tier, read calls are usage-based.

### 4. Platform Liability
**Risk:** If a "verified" contractor does bad work or causes injury, FTW could be named in lawsuit.
**Required:**
- General liability insurance for the platform entity
- Clear TOS: FTW is a marketplace, not an employer or contractor
- "FairTrade Promise" must be marketing language, not a legal guarantee
- Errors & omissions (E&O) insurance for AI estimation tool
- Cyber liability insurance for user data
**Action:** Lawyer review of TOS and FairTrade Promise language before launch.

### 5. Mississippi Licensing Compliance
**Risk:** Verifying contractor licenses incorrectly could expose platform to liability.
**Requirements:**
- Residential remodeling over $10K: MSBOC Residential Remodeling license required
- Residential building over $50K: MSBOC Residential Builder license required
- MSBOC has a license lookup — verification flow must check this
- Application fee: $50, exam: $120/section
- Low barrier = more contractors but also more unqualified ones
**Action:** Build MSBOC license verification into contractor onboarding.

### 6. Background Check Costs
**Risk:** Checkr at ~$30/contractor is FTW's cost, not the contractor's. At 100 contractors = $3,000 before revenue.
**Mitigation:** Budget as customer acquisition cost. Consider phasing: license + insurance verification at signup, background check before "Verified" badge. Factor into SBIR budget ask.

### 7. Thumbtack Competition
**Risk:** Thumbtack is growing fast (33% YoY), has ChatGPT/Zillow/Redfin partnerships, and strong brand.
**Mitigation:** Thumbtack doesn't have construction-specific AI, doesn't integrate with QuickBooks, and charges per-project fees. FTW's differentiation is depth in construction, not breadth across all services.

---

## Strategic Questions to Resolve

1. **Supply seeding:** Can James personally recruit 10-15 Oxford contractors before launch? What's the pitch in one sentence?

2. **Demand seeding:** How do homeowners in Oxford find out about FTW? Facebook? NextDoor? Ole Miss parent groups? Local real estate agents?

3. **Minimum viable verification:** Can we launch with license + insurance verification only, adding background checks after? Faster to market, lower upfront cost.

4. **QuickBooks marketplace deadline:** Is May 1, 2026 a hard requirement for API access, or just for revenue share? This changes the timeline significantly.

5. **Legal entity:** Does FTW have an LLC/Corp yet? Required for SBIR, Innovate MS, contractor agreements, insurance, and QB marketplace listing.

6. **Insurance procurement:** Who writes platform liability policies for construction marketplaces? Need quotes for GL, E&O, and cyber liability.

7. **Pricing validation:** Is $49/mo the right Pro tier price for Oxford, MS contractors? What's their current monthly spend on tools/leads?

---

## Intuit App Partner Program Details

- **Launched:** May 15, 2025 (live July 28, 2025)
- **Requirements:** App assessment questionnaire, updated TOS, active App Marketplace listing
- **Marketplace listing deadline:** May 1, 2026
- **API pricing:** Write (create/update) calls are FREE at every tier. Read calls are usage-based by tier.
- **Revenue share (ProAdvisor):** 20% of payment processing fees for 3 years per client signup
- **Eligibility:** Client must not have previously used QB Payments, must be US-based, must remain in good standing

---

## Mississippi Contractor Licensing (MSBOC)

- **Authority:** Mississippi State Board of Contractors (msboc.us)
- **Residential remodeling > $10K:** Requires Residential Remodeling or Roofing license
- **Residential building > $50K:** Requires Residential Builder license
- **Application requirements:**
  - Notarized application
  - LLC/Corp registered with MS Secretary of State
  - MS income tax ID or federal tax ID
  - Certificate of general liability insurance (MSBOC must be notified if coverage lapses)
  - Workers' comp if employing 5+ people
  - 3 reference letters (1 bank, 2 construction references)
  - 3 project examples in the relevant field
- **Fees:** $50 application, $120/exam section
- **Timeline:** 7-10 days after exam to receive license
- **2026 change:** Renewal notices now sent by email only

---

## Thumbtack Deep Dive (Primary Competitor)

- **Revenue:** $1B+ annually, $400M from marketplace fees
- **Growth:** 33% YoY
- **Professionals on platform:** ~500,000
- **Business model:** Pay-per-lead. Contractors pay for each lead regardless of whether the customer hires them.
- **Lead pricing:** Varies by service type, location, and demand. Most leads under $50-60, larger jobs (kitchen remodels, additions) cost more.
- **Payment system:** Thumbtack credits — pay-as-you-go, prepaid bundles, or monthly subscriptions.
- **Promote feature:** Contractors pay for enhanced visibility. Get 20% discount on lead credits but pay higher lead fees due to increased exposure.
- **Partnerships:** ChatGPT, Amazon Alexa, Zillow, Redfin — massive distribution advantages.
- **FTW vs Thumbtack:** Thumbtack is a generalist (plumbers, DJs, tutors, everything). FTW is construction-specific with AI estimation, QuickBooks integration, and zero per-lead fees. Thumbtack can't match construction depth.

---

## Disintermediation Risk (Platform Leakage)

The biggest threat to any marketplace: users going around the platform to avoid fees.

### Why It Happens
- Contractor and homeowner meet through FTW, then exchange phone numbers and do future jobs directly.
- Recurring relationships (e.g., homeowner uses same contractor for multiple projects) bypass the platform after first connection.
- If platform fees feel high relative to value, users are incentivized to leave.

### Why FTW Is Naturally Protected
FTW's model has built-in disintermediation protection because revenue comes from **subscriptions and tools**, not transaction fees:
1. **No transaction fee to avoid.** Contractors pay $49/mo for tools, not a cut of each job. There's no financial incentive to go off-platform.
2. **QuickBooks integration is the lock-in.** If contractors' estimates, invoices, and payments all flow through FTW → QuickBooks, leaving the platform means rebuilding their financial workflow.
3. **AI estimation only works on-platform.** ConstructionAI Estimate Agent is the Pro tier differentiator. Can't use it off-platform.
4. **Reviews are platform-exclusive.** Contractors' reputation (reviews, verification badges, ratings) only exists on FTW. Going off-platform means starting over.
5. **Verification is platform-exclusive.** The "Verified Contractor" badge (background check + license + insurance) only shows up on FTW.

### Additional Prevention Tactics
- Homeowner protection (dispute resolution, payment protection) only applies to on-platform jobs
- Communication history and project documentation stored on-platform
- Keep subscription fees reasonable — the moment fees feel extractive, leakage starts

---

## FCRA Compliance (Background Checks)

FTW runs background checks on contractors via Checkr. The Fair Credit Reporting Act (FCRA) applies to FTW even though contractors aren't employees.

### Key Requirements
1. **Disclosure:** Must provide clear written disclosure BEFORE running a background check. Must be a standalone document (not buried in TOS).
2. **Authorization:** Must obtain written consent from the contractor. Digital signature counts.
3. **FCRA applies to contractors.** Not just employees — anyone being vetted for a position, including independent contractors, freelancers, and platform participants.
4. **Adverse action process:** If FTW denies verification based on background check results:
   - Must send pre-adverse action notice with copy of the report
   - Must allow time for contractor to review/dispute
   - Must send final adverse action notice if decision stands
5. **State-specific rules:** Mississippi may have additional reporting limitations beyond federal FCRA. Check state law.
6. **FTW as a CRA:** If FTW is providing contractor verification information to homeowners (even via badges), FTW may qualify as a Consumer Reporting Agency under FCRA. This adds compliance obligations around accuracy, dispute resolution, and permissible purpose.

### What This Means for FTW
- The onboarding flow needs a standalone FCRA disclosure + authorization step before background check
- Need an adverse action workflow (pre-notice → waiting period → final notice) for denied contractors
- Contractor profiles must have a dispute mechanism if verification info is wrong
- Talk to a lawyer about whether FTW's verification badges make it a CRA

---

## Construction SaaS Market Dynamics

### Adoption Trends
- Construction management software growing at 2x the rate of generic productivity tools
- Industry shifting from paper/manual processes to cloud-based SaaS
- Vertical SaaS (industry-specific) commands 30-50% price premium over horizontal tools
- Buyers in construction willing to pay more for software that understands their industry natively

### Churn Benchmarks
- Average B2B SaaS monthly churn: 3.5%
- Enterprise software: 0.25%/month (best)
- SMB tools: 5-7%/month (typical)
- Construction-specific data is limited, but vertical SaaS generally churns lower than horizontal because switching costs are higher (data lock-in, workflow integration)

### Implication for FTW
- $49/mo Pro tier is well within willingness-to-pay range for construction-specific tools
- QuickBooks integration creates high switching cost (data lives in both systems)
- AI estimation creates workflow dependency (contractors rely on it for bids)
- Expected annual churn target: under 5% monthly = under 45% annual (SMB reality)

---

## Two-Sided Marketplace Lessons

### What Kills Construction Marketplaces
1. **Chicken-and-egg.** Both sides are interdependent. Can't attract homeowners without contractors, can't attract contractors without homeowners.
2. **Disintermediation.** Users go around the platform to avoid fees (mitigated by FTW's subscription model).
3. **Failing vendors.** Marketplaces that only optimize for buyers (homeowners) at the expense of sellers (contractors) enter a death spiral. Contractors leave, supply drops, homeowner experience degrades, homeowners leave.
4. **Over-building before validation.** 90% of two-sided marketplace apps fail within their first year, not from bad tech, but from building too much before finding product-market fit.
5. **Construction-specific complexity.** Some argue construction needs a THREE-sided marketplace (homeowner, contractor, materials/suppliers). FTW's materials partnership revenue stream may evolve into this.

### FTW's Cold Start Strategy (Oxford, MS)
- **Supply first.** Recruit 10-15 contractors through personal relationships before any homeowner marketing.
- **Constrain geography.** Oxford only. Don't expand until density is proven.
- **Contractor tools are the wedge.** Contractors join for the free tools (estimation, project management). Homeowner marketplace is the second-order benefit.
- **Social proof.** MHP Construction is already on the platform. Use Josh as a reference/testimonial for other contractors.

---

## Mississippi LLC Formation

If FTW doesn't have a legal entity yet, it needs one immediately for: SBIR application, Innovate MS engagement, contractor agreements, platform insurance, and QuickBooks marketplace listing.

### Formation Details
- **Filing:** Certificate of Formation with MS Secretary of State
- **Cost:** $50 filing fee ($53.14 with processing)
- **Timeline:** Online filing only. Often approved same day or within 24 hours. Max 3-5 business days.
- **Name requirement:** Must include "LLC" or "Limited Liability Company." Must be distinguishable from existing businesses on file.
- **Annual report:** Free, due April 15th each year
- **Total first-year cost:** $75-$374 depending on registered agent choice
- **File at:** [Mississippi Secretary of State Business Portal](https://www.sos.ms.gov/business-services-regulation)

---

## Construction Estimating Software Landscape

### Market Size
- Construction estimating software market: **$3.57B in 2026**, growing 13.01% CAGR
- Construction management software market: **$11.58B in 2026**, growing 8.88% CAGR to $17.72B by 2031
- Market is moderately fragmented — enterprise incumbents (Oracle, Autodesk, Trimble, Procore) vs. niche AI challengers

### Direct Competitors to ConstructionAI

**Handoff** — Most direct competitor. AI-driven suite for residential contractors. Claims to replace 5+ separate software subscriptions. Full business solution, not just estimation.

**Togal.AI** — AI takeoff from floor plans. Completed full architectural takeoff in 12 minutes in testing. Focused on commercial, not residential.

**Kreo** — Cloud software for quantity surveyors. Extracts material quantities from 2D/3D drawings. More commercial/enterprise focused.

**MeltPlan** — AI estimation with regional pricing data covering all 50 states. Suite of tools for estimating and project analysis.

**CostToConstruct** — Free AI tool for conceptual estimates. Lower-end market.

### FTW's AI Differentiation
- These tools are **standalone estimation products**. FTW bundles estimation INTO a marketplace.
- ConstructionAI is trained on **real Mississippi contractor data** (5,200 examples, 28,941 line items). Competitors use generic datasets.
- AI estimation improves accuracy by 20%+ and cuts completion time in half. Users report saving 6-10 hours per estimate.
- AI estimation is the **Pro tier hook** ($49/mo) — not a separate product, but a feature that drives subscription revenue.

### Existing Construction SaaS Competitors

| Platform | Focus | Price Range | FTW Overlap |
|----------|-------|-------------|-------------|
| Buildertrend | Residential project management | $99-499/mo | Project management features |
| Procore | Commercial construction management | $375+/mo | Too expensive/complex for FTW's market |
| Jobber | Field service management | $39-199/mo | Residential contractor tools |
| CoConstruct | Custom home builders | $99+/mo | Estimation + project management |
| CompanyCam | Photo documentation | $24-49/mo | Job site documentation |

**Key insight:** Buildertrend is $99-499/mo. FTW Pro is $49/mo. FTW targets smaller residential contractors that Buildertrend prices out, and bundles a marketplace that none of these have.

---

## Homeowner Behavior (Survey Data)

### How Homeowners Find Contractors (2026)
1. **Word of mouth:** 74% (still dominant)
2. **Repeat business:** 62% (already know a contractor)
3. **Online search engines:** 54%
4. **Social media:** 25% (growing, especially younger buyers)
5. **AI search results:** 11% (new and growing)

### What Homeowners Care About
- **65%** more likely to call a contractor with **transparent pricing** on their website
- **70%+** would pay more for a contractor with better service reputation
- **Speed and transparent pricing** are the top factors in hiring decisions
- Homeowners expect work to start within **2 weeks** of accepting a quote

### The Trust Gap
- **30% of homeowners delay renovation projects** because they can't find trusted professionals
- This is FTW's core value prop — verified, background-checked, reviewed contractors with transparent AI-powered estimates

### Implications for FTW
- Word of mouth (74%) means FTW needs to be the digital version of "my neighbor recommended this guy"
- Transparent pricing (65%) = ConstructionAI estimates visible to homeowners. Huge advantage.
- Trust gap (30% delay) = FTW's verification badges directly address this pain
- Social media growing (25%) = marketing channel for homeowner acquisition
- AI search (11%) = early mover advantage if FTW content ranks in AI results

---

## Home Improvement Spending Forecast

### 2026
- Total homeowner remodeling spending: **$524 billion** (record high)
- Year-over-year growth: **2.4%** early 2026, easing to **1.9%** by Q3
- Professional market growing **2.7%**, consumer market growing **3.9%** to **$400B**
- **91% of homeowners** plan to begin renovations in 2026
- **67%** expect to keep or expand project scope

### 2027-2029
- If housing market gains momentum, remodeling poised for stronger growth
- Average growth rate of **4% expected from 2027-2029**

### Homeowner Concerns
- **63%** cite rising material costs as top concern
- **31%** cite labor costs
- **25%** cite access to skilled professionals
- Tighter budgets pushing homeowners toward essential maintenance over discretionary remodels

### What This Means for FTW
- $524B market with 91% planning renovations = massive addressable demand
- Cost concerns drive demand for transparent pricing (ConstructionAI advantage)
- "Access to skilled pros" concern (25%) = exactly what FTW's marketplace solves
- Growth trajectory through 2029 means FTW has a multi-year runway of increasing demand

---

## Construction Labor Shortage

### National Numbers (2026)
- Industry needs **349,000 net new workers** in 2026
- Rising to **456,000 in 2027**
- **92% of construction firms** report difficulty finding workers
- **88%** of firms hiring craft workers have unfilled openings
- Labor costs projected to rise **6-8% annually**

### Root Causes
- Aging workforce + accelerated retirements (structural, not cyclical)
- "Experience cliff" — older workers departing takes institutional knowledge with them
- Immigration uncertainty reducing labor supply
- Younger workers not entering trades

### Mississippi Specific
- Mississippi average construction worker pay: **$37,180** (near bottom nationally)
- Low wages make attracting workers harder in MS vs. higher-paying states
- AWS data center project in Madison County will absorb 4,000-6,000 construction workers — potential labor squeeze that ripples across the state

### Why This Matters for FTW
- Labor shortage makes efficient contractor matching MORE valuable, not less
- Contractors who are busy need better tools (estimation, scheduling, invoicing) to handle volume
- Homeowners struggling to find available contractors (25% cite this as a concern) need a marketplace to discover who has capacity
- FTW can surface "availability" as a marketplace feature — show which contractors can start soonest
- The AWS mega-project in Madison County could pull workers away from residential work in Oxford — something to monitor

---

## Onboarding Conversion Data

### Benchmark Statistics
- **74%** of potential customers switch to alternatives if onboarding is complicated
- **70%** abandon completely if digital onboarding takes longer than **20 minutes**
- Every extra form field is a conversion leak
- Social login (Google/Apple) = **60% higher** onboarding completion rates

### What Makes Contractors Join
- "Are people like me succeeding here?" — testimonials, real income snapshots, success stories
- Time-to-first-value must be short — contractor needs to feel the tool is useful within minutes
- The "aha moment" (when value becomes personally obvious) determines retention

### FTW Onboarding Implications
- Contractor signup must be under 10 minutes for initial account (full verification can happen after)
- Offer Google/Apple social login — don't force email/password
- Show MHP Construction as a success story during onboarding ("contractors like you are already here")
- Get contractors to their first estimate within the onboarding flow — that's the aha moment
- Verification steps (license, insurance, background check) should happen AFTER the contractor has used the tools, not before — let them feel the value first, then invest in verification

---

## Oxford, MS Real Estate Market

### Home Prices (2026)
- Average home value: **$400,674** (up 10.8% YoY)
- Median home price: **$495,000**
- Single-family homes average: **$540,000**
- Condos average: **$529,900**
- Days on market: ~23 days (seller's market)
- Inventory: 133 homes available (tight supply)
- Months of supply: 3.1 (anything under 4 = seller's market)

### Building Permits (Lafayette County)
- Residential building permits: base fee **$150 + $0.30/sqft** living area
- Lafayette County requires permits for ALL residential construction work (since 2022)
- Building code: 2012 International Building Code
- Enforced by Lafayette County Building & Planning Department

### What This Means for FTW
- Strong seller's market = homeowners investing in existing homes (remodeling over buying new)
- High home values ($400K+) justify professional contractor work, not DIY
- Active permit activity = contractors are busy and need efficiency tools
- Tight inventory means more renovation work as people improve rather than move

---

## Unit Economics Model

### Customer Acquisition Cost (CAC) Benchmarks
- B2B SaaS average CAC: **$702**
- Construction-specific CAC likely lower because:
  - Personal relationships (Oxford is small)
  - Word-of-mouth from MHP/Josh Harris
  - Local Facebook/NextDoor marketing (cheap)
- Background check cost per contractor: **$29.99-$79.99** (Checkr, varies by package)
- Target CAC for FTW contractors: **$50-150** (personal outreach + background check)
- Target CAC for FTW homeowners: **$5-20** (social media + word of mouth)

### Lifetime Value (LTV) Model
| Tier | Monthly | Annual | 24-mo LTV | 36-mo LTV |
|------|---------|--------|-----------|-----------|
| Free | $0 | $0 | $0 | $0 |
| Pro | $49 | $588 | $1,176 | $1,764 |
| Business | $149 | $1,788 | $3,576 | $5,364 |

### LTV/CAC Ratio Target
- Industry standard: **3.0x minimum** (VC David Skok benchmark)
- FTW Pro at $100 CAC, 24-month retention: LTV/CAC = **11.7x** (excellent)
- FTW Pro at $150 CAC, 12-month retention: LTV/CAC = **3.9x** (healthy)
- Even with high churn, the math works because CAC is low (personal relationships, not paid ads)

### Revenue Per User Breakdown
For a Pro contractor ($49/mo):
- SaaS subscription: $49/mo
- Intuit rev share (20% of payment processing for 3 years): ~$5-15/mo per active contractor (depends on volume)
- Homeowner convenience fee (if applicable): ~$5-10/job
- **Blended ARPU estimate: $55-75/mo per Pro contractor**

---

## Verification Stack: Costs and APIs

### Background Checks (Checkr)
- **Basic+ plan:** $29.99/check (SSN trace, sex offender registry, global coverage)
- **Federal criminal add-on:** $10/check
- **MVR (motor vehicle):** $9.50/check
- **Volume pricing:** Custom rates at 300+ checks/year
- **API:** RESTful with webhooks. Only needs candidate email to send invitation. Integrates with 100+ platforms.
- **Turnaround:** Typically 24-48 hours

### Identity Verification (Persona)
- **Free tier:** 500 government ID + selfie verifications/month (enough for launch)
- **Essential plan:** $250/month
- **Per-check:** Historically $0.30-$1.00 per verification
- **Use case:** Verify contractor identity, confirm 1099 eligibility, AML compliance
- **Strategy:** Start on free tier (500/mo is plenty for Oxford launch), upgrade when volume demands it

### License Verification
- **TrustLayer:** Automated compliance collection and verification. Developer API available. Tracks insurance status ongoing.
- **Contractor-Verify:** API access to 365K+ Florida licenses. TX, CA, NY coming. Mississippi not yet available — may need manual MSBOC lookup initially.
- **Evident ID:** Automated evidence collection for subcontractor evaluation. Ongoing insurance tracking.
- **MSBOC lookup:** Manual for now (msboc.us). Build scraper or check if they have an API.

### Recommended Verification Stack for Launch
| Step | Tool | Cost | Timing |
|------|------|------|--------|
| Identity | Persona (free tier) | $0 | At signup |
| License | MSBOC manual lookup | $0 (labor only) | At signup |
| Insurance | TrustLayer or manual upload | TBD | At signup |
| Background check | Checkr Basic+ | $29.99/contractor | After first tool usage |

Total verification cost per contractor: **~$30-40**

---

## SBIR Proposal Strategy

### What Makes a Strong Phase 1 Proposal
1. **Technical innovation must be clear.** ConstructionAI is a fine-tuned domain-specific LLM — not a ChatGPT wrapper. Emphasize the 5,200 training examples, 8 specialized tools, and real-world performance data.
2. **Show uncertainty.** SBIR wants R&D, not finished products. Frame it as: "We have a working prototype. Phase 1 funding tests whether it can scale to multi-state regional pricing, handle diverse project types, and maintain accuracy across contractor specializations."
3. **Address innovation, capability, AND impact equally.** DOE/NSF grade evenly across all three.
4. **Use recognized methods.** Reference standard estimation frameworks (RS Means, CSI divisions) that ConstructionAI builds on.
5. **Include diagrams.** Architecture diagram of ConstructionAI + FTW + QuickBooks pipeline. Reviewers are visual.
6. **Follow the FOA headings exactly.** Background, Innovation, Technical Objectives, R&D Approach, Expected Results. Reviewers use the FOA as a checklist.

### What FTW Has for a Strong Application
- Working prototype (not vaporware)
- Real client using the platform (MHP Construction)
- 240 historical projects, 28,941 line items of real training data
- Quantifiable accuracy improvement (AI vs manual estimation)
- Clear commercialization path (marketplace + white-label licensing)
- Small team (expected for Phase 1)
- Mississippi-based (rural/underrepresented = priority for some agencies)

### Phase 1 Budget Template (~$275K)
| Category | Amount | Purpose |
|----------|--------|---------|
| Personnel | $120K | James + 1 developer (12 months) |
| AI Infrastructure | $30K | GPU training, RunPod, model iteration |
| Data Acquisition | $25K | Additional contractor data, regional pricing databases |
| Legal/Compliance | $20K | TOS, contractor agreements, FCRA compliance, patent review |
| Verification Stack | $15K | Checkr, Persona, insurance verification tooling |
| Cloud/Hosting | $15K | Vercel, Supabase, infrastructure |
| Market Research | $10K | Homeowner surveys, contractor interviews, pricing validation |
| Travel | $10K | Contractor demos, Innovate MS meetings, industry conferences |
| Indirect Costs | $30K | ~12% overhead |

---

## Terms of Service: Key Sections Needed

### Required Sections for FTW
1. **Platform Role** — FTW is a marketplace, NOT an employer, general contractor, or party to the construction contract. FTW facilitates connections only.
2. **Registration and Accounts** — Contractor requirements (license, insurance, background check). Homeowner requirements (address, identity).
3. **Contractor Obligations** — Maintain valid license, insurance, and verification status. Complete work as bid. Respond to disputes.
4. **Homeowner Obligations** — Accurate project descriptions. Timely payment through QuickBooks. Good-faith dispute engagement.
5. **Payment Terms** — Payments flow through QuickBooks to contractor directly. FTW does not hold, escrow, or process construction payments. FTW charges subscription fees separately.
6. **FairTrade Promise** — Marketing language describing platform standards. MUST NOT create legal guarantees or warranties about contractor quality.
7. **Dispute Resolution** — Platform-mediated first, then binding arbitration. FTW is a mediator, not a guarantor.
8. **Liability Limitations** — FTW not liable for contractor work quality, project outcomes, injuries, or property damage. Maximum liability capped at subscription fees paid.
9. **Intellectual Property** — FTW owns platform content, AI models, and aggregated data. Contractors own their business data and estimates.
10. **Verification Disclaimer** — Background checks and license verification are point-in-time. FTW does not guarantee ongoing compliance.
11. **Termination** — Either party can terminate. Contractor data export available. Active projects must be completed.
12. **Privacy / Data** — FCRA compliance statement. How contractor and homeowner data is used. No selling personal data to third parties.

### Priority: Get a Lawyer to Review
Draft with AI, but **lawyer must review** before launch. Key legal risks:
- FairTrade Promise language creating implied warranties
- FCRA compliance in verification flow
- Platform liability if "verified" contractor causes harm
- Arbitration clause enforceability in Mississippi

---

## Southeast US Construction Market

### Regional Dominance
- Southeast held **41.12%** of US residential construction market share in 2025 — the dominant region
- Characterized by robust civil infrastructure, healthcare expansion, military projects
- Remodeling Market Index (RMI) above break-even (50) for **24 consecutive quarters**

### Market Drivers
- **Aging housing stock** — older homes need renovation (structural tailwind)
- **Lock-in effect** — homeowners with low mortgage rates renovate instead of moving
- **Aging-in-place** — older homeowners modifying homes rather than relocating
- **Population growth** — Southeast continues to attract domestic migration

### Expansion Markets (After Oxford)
- **Memphis, TN** — 90 miles north of Oxford. Large market, established contractor base
- **Tupelo, MS** — 80 miles east. Mid-size market, growing
- **Nashville, TN** — Top-5 real estate market. 1.5-2% annual population growth. Oracle campus bringing 8,500 jobs. Hot market.
- **Jackson, MS** — State capital. Larger contractor base, more competition
- **Birmingham, AL** — Growing Southeast hub

### Expansion Strategy
1. Prove Oxford (10-15 contractors, 50+ homeowner jobs)
2. Tupelo/Memphis (similar market dynamics, driveable from Oxford)
3. Nashville (large market, requires paid acquisition — different CAC model)
4. Broader Mississippi/Tennessee/Alabama

---

## Sources

- [Angi vs Thumbtack vs Houzz — 2026 Contractor's Guide](https://adaptdigitalsolutions.com/articles/homeadvisor-vs-angieslist-vs-houzz-vs-porch-vs-thumbtack-vs-yelp-vs-bark/)
- [Angi vs HomeAdvisor Real Lead Cost Data](https://earnifyhub.com/blog/angi-vs-homeadvisor-contractor.php)
- [LSA vs Thumbtack vs Angi — Real CPL Data](https://bluegridmedia.com/lsa-vs-thumbtack-vs-angi-contractors)
- [AllBetter vs HomeAdvisor vs Thumbtack vs Angi](https://allbetterapp.com/allbetter-vs-homeadvisor-vs-thumbtack-vs-angi/)
- [Contractor Lead Generation CPL Data](https://www.zioadvertising.com/articles/contractor-lead-generation)
- [Mississippi Contractor Licensing — Procore](https://www.procore.com/library/mississippi-contractors-license)
- [MSBOC — Apply for a License](https://www.msboc.us/contractors/licenses/)
- [Construction Industry in Mississippi's Economy](https://magnoliatribune.com/?p=120411)
- [Oxford, Mississippi Population 2026](https://worldpopulationreview.com/us-cities/mississippi/oxford)
- [Intuit App Partner Program Guide](https://static.developer.intuit.com/resources/Intuit_App_Partner_Program_Guide.pdf)
- [Intuit App Partner Program FAQ](https://developer.intuit.com/app/developer/qbo/docs/get-started/partner-faq)
- [QB Payments Revenue Share](https://www.firmofthefuture.com/product-update/revenue-share-payments/)
- [Thumbtack Business Model — Contrary Research](https://research.contrary.com/company/thumbtack)
- [Thumbtack Business Model — FourWeekMBA](https://fourweekmba.com/how-does-thumbtack-make-money-thumbtack-business-model/)
- [How to Prevent Marketplace Leakage — Sharetribe](https://www.sharetribe.com/academy/how-to-discourage-people-from-going-around-your-payment-system/)
- [Preventing Disintermediation — Appico](https://www.applicoinc.com/blog/5-ways-two-sided-marketplace-ceos-can-prevent-platform-leakage/)
- [Two-Sided Marketplace Challenges — Medium](https://medium.com/@startupsmeet/7-challenges-faced-by-two-sided-marketplace-entrepreneurs-cecafacb3fed)
- [Construction Needs Three-Sided Marketplace — LinkedIn](https://www.linkedin.com/pulse/why-construction-needs-three-sided-marketplace-jiyan-naghshineh-wei)
- [FCRA Compliance for Background Checks — DISA](https://disa.com/background-checks/fcra-compliance/)
- [FCRA Background Screening — FTC](https://www.ftc.gov/business-guidance/resources/what-employment-background-screening-companies-need-know-about-fair-credit-reporting-act)
- [SaaS Churn Rates by Industry 2026](https://www.wearefounders.uk/saas-churn-rates-and-customer-acquisition-costs-by-industry-2025-data/)
- [Construction SaaS Market Trends 2026](https://voxturr.com/saas-market-analysis-2026/)
- [Mississippi LLC Formation Guide](https://www.llc.org/form-llc/mississippi/)
- [MS Secretary of State Business Services](https://www.sos.ms.gov/business-services-regulation)
- [Construction Estimating Software Market — Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/construction-estimating-software-market)
- [Construction Management Software Market Size](https://www.mordorintelligence.com/industry-reports/construction-management-software-market)
- [AI Construction Estimating Software 2026 — Handoff](https://www.handoff.ai/blog/6-best-ai-construction-estimating-software-2026-picks-compared)
- [Homeowner Survey: Roofing Customer Journey 2026](https://www.roofingcontractor.com/articles/101774-homeowners-survey-the-roofing-customers-journey-in-2026)
- [What Matters to Homeowners Choosing a Contractor](https://blog.servicedirect.com/survey-what-matters-homeowners-choosing-contractor)
- [Where Homeowners Look Before Hiring — TrueFuture Media](https://www.truefuturemedia.com/articles/google-vs-social-media-where-homeowners-actually-look-before-hiring-a-contractor)
- [2026 State of American Home Renovation](https://www.greatdayimprovements.com/home-advice/american-home-renovation-report/2026/)
- [Remodeling Growth Forecast — Harvard JCHS](https://www.jchs.harvard.edu/blog/remodeling-expected-continue-slow-steady-growth-next-year)
- [Home Improvement Spending Trends 2026 — HIRI](https://www.hiri.org/blog/homeowner-readiness-to-spend)
- [Why Remodeling Will Lead 2026 — Builder Magazine](https://www.builderonline.com/data-analysis/why-remodeling-will-lead-building-product-spending-in-2026/)
- [Construction Labor Demand 2026 — Construction Dive](https://www.constructiondive.com/news/labor-demand-gap-shrinks-abc-construction-staff/810681/)
- [Labor Shortage Threatens 2026 Rebound](https://www.buildwcg.com/blog-posts/labor-shortage-construction-rebound-dpr-2026)
- [Construction Labor Shortage 2026 — Blue Collar Recruiter](https://thebluecollarrecruiter.com/the-construction-labor-shortage-in-2026-what-every-employer-needs-to-know/)
## Contractor Pain Points (Survey Data)

### Top Frustrations (Trimble 2026 Survey, ~1,800 contractors)
1. **Skilled labor shortages / workforce development:** 42% cite as biggest financial struggle
2. **Disconnected software systems:** Growing concern over fragmented tools that don't share data
3. **Payment delays:** 70% of contractors experience payment delays beyond 30 days, inflating bids by 8%
4. **Communication failures:** Poor communication causes 52% of rework, costing the industry $31.3B/year in labor and materials
5. **Underutilized software:** Contractors spend average $58,000/year on digital tools but waste $11,000 of that on tools they don't fully use

### Key Stat
93% of contractors agree technology can significantly increase productivity — but they're frustrated by fragmented, disconnected tools.

### FTW Implications
- **All-in-one platform** eliminates the fragmentation problem. Estimation + project management + invoicing + marketplace in one login.
- **QuickBooks integration** solves the payment delay problem — estimates become invoices become payments in one pipeline.
- **$49/mo Pro tier** is a fraction of the $58K/year contractors already spend. Easy sell if the value is clear.
- **The $11K waste on underutilized tools** = contractors are already paying for software they don't use. FTW needs to nail onboarding and time-to-value to avoid being another wasted subscription.

---

## Marketplace Cold Start Playbook

### How the Giants Solved It

**Uber:** Called limo companies with 10-12 cars. Paid them to have drivers respond to the app. Didn't need 10,000 cars day one — just enough to prove the model in one city.

**Airbnb:** Scraped Craigslist for property owners. Sent personal pitches. First 30 days of in-person user engagement made the difference between success and failure.

**Thumbtack:** Focused on high-demand, high-volume categories first (handyman, cleaning, moving). Built liquidity in specific categories before expanding.

### FTW's Playbook for Oxford

**Supply side (contractors):**
1. James personally recruits 10-15 contractors he knows. Phone calls, coffee meetings, not cold emails.
2. MHP Construction (Josh) as the anchor tenant. "Your competitor is already on here."
3. Pitch: "Free tools — estimation, project management, invoicing. No lead fees ever."
4. Let contractors use the tools for 2-4 weeks before pushing them toward marketplace participation.

**Demand side (homeowners):**
1. Don't launch homeowner marketing until 10+ contractors are active and using tools.
2. Start with Facebook groups (Oxford community groups, Ole Miss parent groups).
3. NextDoor is powerful for local home services.
4. Real estate agents as referral partners — agents constantly get asked "know a good contractor?"
5. Local church networks (Oxford is church-heavy — real word of mouth).

**Liquidity strategy:**
- Focus on 3-4 high-demand categories first: kitchen/bath remodel, roofing, painting, general handyman
- Don't try to cover every trade at launch
- Better to have 3 great roofers than 1 mediocre roofer + 1 plumber + 1 electrician + 1 HVAC

### Key Principle
"Get the supply side first — if you get the right suppliers, the customers will experience their high quality service and then do the marketing for you." (Andrew Chen / Lenny Rachitsky)

---

## Infrastructure Cost Model

### Supabase
| Tier | Monthly | What You Get |
|------|---------|-------------|
| Free | $0 | 500MB database, 50K MAU auth, unlimited API requests, 2 projects. **Pauses after 7 days inactivity.** |
| Pro | $25 | 8GB database, 100K MAU, daily backups, no pause. **Start here for production.** |
| Team | $599 | SSO, SOC 2, 28-day logs. Overkill for now. |

- Auth beyond 100K MAU: $0.00325/user
- Free tier good for development. **Pro required for production** (auto-pause kills a real app).

### Vercel
| Tier | Monthly | Key Limits |
|------|---------|-----------|
| Hobby | $0 | Personal, non-commercial. Not suitable for FTW. |
| Pro | $20/seat | 1TB bandwidth, 10M edge requests. **Use this.** |

- Overage: $0.15/GB beyond 1TB
- Static export (FTW's current mode): ~200K-500K page views/month within 1TB
- At Oxford scale (< 10K users), well within Pro limits for years
- **Cost optimization:** Put images behind Cloudflare free CDN to reduce Vercel bandwidth 50-80%

### RunPod Serverless (ConstructionAI)
| GPU | Per Hour | Per Second |
|-----|----------|------------|
| RTX 3090 | ~$0.20 | ~$0.000056 |
| RTX 4090 | ~$0.35 | ~$0.000097 |
| A100 80GB | ~$2.17 | ~$0.000603 |

- ConstructionAI (Llama 3.1 8B quantized) runs on RTX 3090/4090
- Estimated inference time per estimate: 5-15 seconds
- **Cost per estimate: $0.0003 - $0.0015** (fractions of a penny)
- At 1,000 estimates/month: **~$0.30-$1.50/month** in GPU costs
- At 100,000 estimates/month: **~$30-$150/month** in GPU costs
- This is why the $5-15 per AI estimate pricing (or bundled in Pro) has enormous margins

### Total Infrastructure Cost at Launch
| Service | Monthly |
|---------|---------|
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| RunPod Serverless | ~$5 |
| Checkr (10 contractors/mo) | ~$300 |
| Domain (fairtradeworker.com) | ~$1 |
| **Total** | **~$351/mo** |

### At 1,000 Contractors / 10,000 Homeowners
| Service | Monthly |
|---------|---------|
| Supabase Pro | $25-50 |
| Vercel Pro | $20-40 |
| RunPod Serverless | ~$30 |
| Checkr (50 contractors/mo) | ~$1,500 |
| **Total** | **~$1,600/mo** |

With 200 Pro contractors ($49/mo), revenue = $9,800/mo. Margin is massive.

---

## Construction Payment Disputes

### Most Common Disputes (Ranked)
1. Defective workmanship
2. Unreasonable delays
3. Failure to provide project accounting
4. Change order disputes (most litigated aspect of residential construction)
5. Failure to honor warranty
6. Project abandonment after receiving payment
7. Contractor failure to pay subcontractors
8. Invalid/fraudulent lien filing
9. Design defects
10. Misunderstanding of lump sum vs. cost-plus contracts

### Fraud Statistics
- ~83,000 home improvement scam complaints in 2023
- 1 in 10 Americans report experiencing a contractor scam
- Average victim loss: $2,426 (typically upfront payment for work never started)

### How FTW Mitigates Disputes
- **Verification reduces fraud:** Background checks + license verification + insurance proof eliminates most scammers before they can bid
- **QuickBooks milestone payments:** Progress invoicing means homeowners pay in stages, not all upfront. If contractor abandons, loss is limited.
- **Review system:** Bad actors get identified by previous homeowners. Reputation is visible.
- **AI estimates as baseline:** ConstructionAI provides an independent price estimate. If a contractor's bid is 3x the AI estimate, that's a red flag the platform can surface.
- **Platform mediation:** FTW offers dispute resolution before either party goes to court
- **No escrow needed:** QuickBooks handles the money directly. FTW doesn't hold funds, which reduces platform liability significantly.

---

## White-Label Pricing Strategy

### Current Model
MHP is the first white-label client at $200-500/mo. This is the FairEstimator → MHPEstimate path.

### Industry Benchmarks
- White-label SaaS typically priced at monthly subscription (most common)
- Construction-specific white-label solutions: $50K-$300K for custom builds
- FTW's model (pre-built, configure-and-deploy) is dramatically cheaper than custom development

### Pricing Tiers to Consider
| Tier | Monthly | Includes |
|------|---------|---------|
| Starter | $200/mo | Branded estimation platform, 1 user, standard templates |
| Professional | $350/mo | + ConstructionAI integration, 5 users, custom templates |
| Enterprise | $500/mo | + API access, unlimited users, custom domain, priority support |

### Scaling White-Label Revenue
- Each white-label client = recurring revenue with near-zero marginal cost
- Target: 10 white-label clients at $350/mo avg = $3,500/mo ($42K/year)
- Mississippi alone has ~47,500 construction workers across thousands of firms
- After Oxford proof, pitch to contractors in Memphis, Nashville, Jackson, Birmingham
- White-label is the **most scalable** revenue stream — no marketplace cold-start needed, each client is independent

---

## Contractor Demographics & Persona

### Who Is the FTW Contractor?
- **Total US general contractors:** 35,625+
- **Construction workforce:** 8.3 million (2025)
- **Age:** Skews older. Industry faces an "experience cliff" as senior workers retire, taking institutional knowledge with them.
- **Mindset:** 42% describe their business as a "calling or life's passion." 61% are first-generation entrepreneurs. These are people who care deeply about their work.
- **Income:** Mississippi average construction pay: $37,180 (bottom nationally). Small residential contractors in Oxford likely $50-80K.
- **QuickBooks adoption:** Construction is the #1 industry for QuickBooks at 17.22% of all QB users. 62% market share overall. FTW's QuickBooks-native strategy hits the exact tool most contractors already use.

### Mobile/Tech Adoption
- **93% of contractors use smartphones** on the job
- **65% use tablets** on-site
- **Frontline workers use 5+ work apps** on average (80% increase in last 2 years)
- **BYOD is standard** — contractors use their personal phones for work
- Construction is now **mobile-first**, not desktop-first. FTW must be responsive and fast on phones.

### Implication
FTW's target user is a 30-55 year old residential contractor in Oxford who:
- Already uses QuickBooks
- Has a smartphone and uses 5+ apps for work
- Spends $58K/year on tools but wastes $11K of it
- Is frustrated by fragmented systems and payment delays
- Considers their work a calling, not just a job
- Will adopt new tools IF the value is obvious and onboarding is fast

---

## Marketing Playbook

### Contractor Acquisition (Supply Side)

**Phase 1: Personal Outreach (Oxford launch)**
- James personally recruits first 10-15 contractors
- Coffee meetings, not cold emails
- Pitch: "Free estimation tools. No lead fees. Ever."
- MHP/Josh as proof: "Your competitor is already using this."

**Phase 2: Local Digital (Post-launch)**
- Facebook: Before/after project photos, job proof posts tagged to Oxford
- Instagram: Time-lapse videos, project transformations. Construction gets **4.4% engagement rate** on Instagram (highest of any industry)
- Content that works: Job proof > education posts > team spotlights > testimonials
- What doesn't work: Ads that look like ads. "Contractors don't want ads — they want proof, people, and expertise."

**Phase 3: SEO & Discovery**
- Google Business Profile for FTW Oxford (map pack appears first for "contractor near me")
- Review signals = volume, recency, and rating quality drive local rankings
- Real project photos are critical — competitors lose rankings when they use stock images
- Each service category needs its own page (roofing, kitchen remodel, etc.)
- Generative Engine Optimization (GEO) — optimize for AI answers (ChatGPT, Claude, Gemini), not just Google

### Homeowner Acquisition (Demand Side)

**Phase 1: Community Seeding**
- Oxford Facebook community groups
- NextDoor (powerful for local home services)
- Ole Miss parent/alumni groups
- Real estate agent partnerships ("know a good contractor?" → "check FTW")
- Church networks

**Phase 2: Content Marketing**
- Homeowner education: "3 signs your roof needs attention," "What a kitchen remodel actually costs in Oxford"
- These posts are shareable in local Facebook groups — free distribution
- AI-generated estimates as content: "What does a bathroom remodel cost in Oxford, MS? Here's what ConstructionAI says."

**Phase 3: Paid (Only After Organic Works)**
- Facebook/Instagram ads targeting Oxford homeowners
- Google Local Services Ads ($92/lead average — but FTW is the destination, not a competing lead-gen)
- Don't spend on paid until organic channels are validated

---

## Platform Insurance Costs (Mississippi)

### What FTW Needs
| Policy | Monthly | Annual | Purpose |
|--------|---------|--------|---------|
| General Liability | ~$42 | ~$500 | Basic business operations, slip-and-fall at office |
| Professional Liability (E&O) | ~$51 | ~$612 | AI estimation errors, bad recommendations, data mistakes |
| Cyber Liability | ~$30-50 | ~$360-600 | Data breach, user data protection, platform security |
| **BOP (bundled)** | **~$71** | **~$852** | GL + property in one policy, saves 16-25% vs separate |

### Recommended Approach
- Start with a **Business Owner's Policy (BOP)** at ~$71/mo — bundles GL + property
- Add **E&O** separately at ~$51/mo — critical because ConstructionAI provides estimates that contractors rely on for bids
- Add **Cyber liability** at ~$30-50/mo — you're handling contractor PII, background check data, financial info
- **Total: ~$150-170/month** for full platform coverage
- Get quotes from: TechInsurance, Insureon, NEXT Insurance, Progressive Commercial

### When to Get Insurance
- **Before launch.** Required for SBIR application, contractor agreements, and Intuit marketplace listing.
- E&O is especially important — if ConstructionAI generates a bad estimate and a contractor loses money bidding with it, E&O covers that exposure.

---

## QuickBooks Market Position

### Why QB-Native Is the Right Call
- QuickBooks has **62.23% market share** in small business accounting
- Construction is **#1 industry** for QB adoption at **17.22%** of all QB users
- 62% of QB users are SMBs, 31% mid-market
- QB offers contractor-specific payroll (1099 contractor version)
- Most Oxford contractors already use QuickBooks — FTW integrating with it means zero learning curve on the financial side

### Strategic Advantage
Every competitor (Angi, Thumbtack, Buildertrend) forces contractors to use a separate payment system. FTW pushes estimates and invoices directly into the contractor's existing QuickBooks. This is:
1. **Zero friction** — no new financial system to learn
2. **Trust** — money goes to their books, not a platform escrow
3. **Lock-in** — once financial data flows through FTW→QB, switching cost is high
4. **Revenue share** — Intuit pays FTW 20% of payment processing fees for 3 years per contractor

---

- [User Onboarding Statistics 2026](https://userguiding.com/blog/user-onboarding-statistics)
- [How to Prevent Marketplace Leakage — Sharetribe](https://www.sharetribe.com/academy/how-to-discourage-people-from-going-around-your-payment-system/)
- [Oxford MS Home Values — Zillow](https://www.zillow.com/home-values/13149/oxford-ms/)
- [Oxford MS Housing Market — Houzeo](https://www.houzeo.com/housing-market/mississippi/oxford)
- [Lafayette County Building Permits](https://www.lafayettems.com/how-do-i/how-much-do-building-permits-cost/)
- [CAC Benchmarks by Industry — Phoenix Strategy Group](https://www.phoenixstrategy.group/blog/how-to-compare-cac-benchmarks-by-industry)
- [LTV/CAC Ratio — Wall Street Prep](https://www.wallstreetprep.com/knowledge/ltv-cac-ratio/)
- [Checkr Pricing 2026](https://checkr.com/pricing)
- [Persona Pricing](https://withpersona.com/pricing)
- [TrustLayer — Contractor License Tracking](https://www.trustlayer.io/pages/contractor-license)
- [Evident ID — Construction License Verification](https://www.evidentid.com/solutions/construction-license-verification/)
- [How to Win SBIR Phase 1 — Forward Edge AI](https://support.forwardedge.ai/en/articles/8855617-how-to-win-a-phase-i-sbir-version-1-0)
- [DOE SBIR Phase 1 Proposal Tips](https://sbir.org/doe/phase-i-proposal-writing-tips/)
- [Marketplace Terms and Conditions — ContractsCounsel](https://www.contractscounsel.com/t/us/marketplace-terms-and-conditions)
- [Legal Agreements for Marketplaces — TermsFeed](https://www.termsfeed.com/blog/legal-agreements-marketplaces/)
- [Southeast Construction Market — Cumming Insights](https://insights.cumming-group.com/southeast-construction-market/)
- [Southern US Construction Gains Through 2027](https://news.constructconnect.com/southern-us-construction-market-set-for-steady-gains-through-2027)
- [NAHB Remodeling Growth 2026](https://www.nahb.org/news-and-economics/press-releases/2026/02/nahb-expects-remodeling-growth-2026)
- [AI Construction Estimating Software Tested — Robotics & Automation News](https://roboticsandautomationnews.com/2026/02/19/6-ai-construction-estimating-software-tested-on-complex-project-accuracy/98967/)
- [Handoff AI — Best Estimating Software for Remodelers](https://www.handoff.ai/blog/best-construction-estimating-software-for-remodelers-backed-by-data)
- [Trimble 2026 Contractor Survey](https://www.trimble.com/blog/trimble/en-US/article/future-construction-technology-trends-contractor-survey)
- [Construction Pain Points — Teletrac Navman](https://www.teletracnavman.com/resources/blog/top-construction-pain-points-and-what-they-have-in-common)
- [28 Ways to Grow Marketplace Supply — Andrew Chen](https://andrewchen.com/grow-marketplace-supply/)
- [How Uber/Airbnb/Etsy Got First 1000 Customers — HBS](https://hbswk.hbs.edu/item/how-uber-airbnb-and-etsy-attracted-their-first-1-000-customers)
- [How to Kickstart a Marketplace — Lenny Rachitsky](https://www.lennysnewsletter.com/p/how-to-kickstart-and-scale-a-marketplace)
- [Supabase Pricing 2026](https://supabase.com/pricing)
- [Supabase True Cost Breakdown](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
- [Vercel Pricing 2026](https://vercel.com/pricing)
- [Vercel Hidden Costs Explained](https://schematichq.com/blog/vercel-pricing)
- [RunPod Serverless Pricing](https://www.runpod.io/pricing)
- [RunPod Serverless GPU Cost Guide](https://www.runpod.io/articles/guides/serverless-gpu-pricing)
- [QuickBooks API Rate Limits](https://coefficient.io/quickbooks-api/quickbooks-api-rate-limits)
- [QuickBooks API Integration Guide 2026](https://unified.to/blog/quickbooks_api_integration_a_step_by_step_guide_for_b2b_saas_teams_2026)
- [Construction Payment Disputes — Texas](https://loveinribman.com/construction-law/residential-construction-disputes/)
- [White-Label Construction Software Costs](https://www.hyperlinkinfosystem.com/blog/cost-to-build-a-white-label-construction-bidding-software)
- [White-Label SaaS Pricing Models](https://getchipbot.com/blog/white-label-saas-pricing-model)
- [General Contractor Demographics — Zippia](https://www.zippia.com/general-contractor-jobs/demographics/)
- [Construction Worker Demographics — CEA](https://www.ceacisp.org/news/construction-worker-demographics-us)
- [2026 Business Owner Report — QuickBooks](https://quickbooks.intuit.com/r/small-business-data/business-owernship-in-2026/)
- [Smartphone Adoption in Construction — MindForge](https://www.mindforgeapp.com/blog-posts/smartphone-app-usage-among-construction-workers-adoption-preferences-and-barriers)
- [Mobile Construction Software Evolution](https://www.forconstructionpros.com/construction-technology/apps/article/22871999/mobile-construction-software-evolution)
- [Local SEO for Contractors 2026](https://www.localmighty.com/blog/local-seo-for-contractors/)
- [SEO for Contractors — Ranking in Google Maps](https://leadadvisors.com/blog/seo-for-contractors/)
- [QuickBooks Market Share 2026](https://www.acecloudhosting.com/blog/quickbooks-market-share/)
- [QuickBooks Statistics — Fit Small Business](https://fitsmallbusiness.com/quickbooks-statistics/)
- [Social Media for Contractors 2026](https://www.socialchamp.com/blog/social-media-for-contractors/)
- [Construction Social Media — Buildertrend](https://buildertrend.com/blog/social-media-ideas/)
- [Mississippi Business Insurance — TechInsurance](https://www.techinsurance.com/small-business-insurance/states/mississippi)
- [Mississippi E&O Insurance — Insureon](https://www.insureon.com/small-business-insurance/professional-liability/mississippi)
- [Best GL Insurance Mississippi — MoneyGeek](https://www.moneygeek.com/insurance/business/best-general-liability-insurance-mississippi/)
