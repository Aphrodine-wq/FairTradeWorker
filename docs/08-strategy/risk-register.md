# Risk Register

## Risk Scoring Framework

Each risk is rated on two dimensions:
- **Probability:** High (>60%), Medium (30-60%), Low (<30%)
- **Impact:** High (threatens viability), Medium (significant setback), Low (manageable disruption)
- **Risk Score:** Probability x Impact (H/H = Critical, H/M or M/H = High, M/M = Moderate, anything with Low = Low-Moderate)

---

## 1. Two-Sided Marketplace Cold Start

**Probability:** Medium (40%)
**Impact:** High (no marketplace without both sides)
**Risk Score:** HIGH

**Risk:** Need contractors AND homeowners simultaneously. Neither shows up without the other. Classic chicken-and-egg problem that kills most marketplace startups.

**Trigger indicators:**
- Fewer than 10 contractors signed up after 30 days of outreach
- Homeowners visit but leave because there are not enough contractors in their area
- Contractors sign up but churn within 60 days because there are no homeowner leads
- Ratio of contractors to homeowners exceeds 1:5 (too few homeowners) or falls below 1:50 (too few contractors)

**Mitigation actions:**
1. Seed supply side first — James personally recruits 10-15 Oxford contractors before any homeowner marketing begins. Target: 3 per trade category (plumbing, electrical, general remodel, roofing, painting).
2. Use MHP Construction as the anchor tenant. Josh Harris's presence gives immediate credibility.
3. Create contractor profiles with portfolio photos and reviews (from their existing Google/Facebook reviews, with permission) so the marketplace looks populated from Day 1.
4. Delay homeowner marketing until at least 10 contractors are active and have complete profiles.
5. Seed demand side through hyper-local channels: Oxford Facebook groups (Oxford MS Community, Oxford Moms, Ole Miss Parent Groups), NextDoor neighborhoods, church bulletin boards, local real estate agents.
6. Offer first 20 homeowners a free AI estimate ($15 value) to incentivize signup.

**Contingency if mitigation fails:**
- If supply seeding fails (< 10 contractors after 60 days): Pivot to single-sided model — launch as an estimation tool for contractors only (like MHP Estimate). Add the marketplace later when there is a critical mass of paying contractors.
- If demand seeding fails (< 50 homeowners after 90 days): Partner with local real estate agents who can recommend FTW to homebuyers needing renovation work. Offer agents a referral fee ($25/successful match).

**Owner:** James

---

## 2. Contractor Willingness to Pay

**Probability:** Medium (35%)
**Impact:** Medium (delays revenue, does not kill the business)
**Risk Score:** MODERATE

**Risk:** Contractors will not pay $49-149/mo for a tool when they can get leads from Thumbtack, Facebook, or word-of-mouth for free/cheaper.

**Trigger indicators:**
- Free-to-Pro conversion rate below 5% after 90 days
- Contractors cite "too expensive" as the primary reason for not upgrading
- Contractors use the free tier extensively but refuse to pay (value is proven but price is wrong)
- Competitors drop pricing or offer free alternatives in the Oxford market

**Mitigation actions:**
1. Free tier must be genuinely useful (3 estimates/month, basic profile) — not a crippled demo. Contractors need to experience value before paying.
2. Pro tier ($49/mo) must deliver clear, measurable ROI: "If the Estimate Agent saves you 2 hours per estimate, and you do 4 estimates/month, that's 8 hours saved. At $50/hour, that's $400/month of time saved for $49/month."
3. Offer a 30-day free Pro trial to every new contractor. Require credit card on file (reduces tire-kickers).
4. Bundle QuickBooks integration as a Pro-only feature. For contractors already using QuickBooks, this is a compelling lock-in.
5. Get 3-5 contractor testimonials within the first 90 days. Peer validation matters more than marketing copy.
6. Publish a "FTW ROI Calculator" page where contractors input their hourly rate and estimation volume to see projected savings.

**Contingency if mitigation fails:**
- If $49/mo is too high for Oxford market: Drop to $29/mo and compensate with higher volume. Test $39/mo as a midpoint.
- If SaaS model fails entirely: Pivot to transactional pricing (per-estimate or per-lead) like Thumbtack. $5-15/estimate or $15-30/lead. Lower revenue per user but eliminates subscription resistance.

**Owner:** James

---

## 3. QuickBooks Integration Timeline

**Probability:** Medium (45%)
**Impact:** High (blocks payment processing and revenue share — two core revenue streams)
**Risk Score:** HIGH

**Risk:** Intuit's App Partner Program requires app listed on Intuit App Marketplace. Unclear whether this is required for API access or just for revenue share eligibility. May 1, 2026 deadline (~40 days from current date) may apply.

**Trigger indicators:**
- Intuit rejects marketplace listing application
- API access requires marketplace approval (not just developer account)
- Revenue share terms change or Intuit discontinues the ProAdvisor program
- Integration development takes longer than estimated (Intuit APIs are notoriously poorly documented)

**Mitigation actions:**
1. Contact Intuit Developer Relations directly this week to clarify: (a) Is marketplace listing required for Payments API access? (b) What is the actual timeline for marketplace review? (c) Is the ProAdvisor revenue share program still active?
2. Begin marketplace listing application immediately — even if not technically required, having it in process removes ambiguity.
3. Build the QuickBooks integration using the node-quickbooks npm package against the sandbox environment. Do not wait for marketplace approval to start development.
4. Prepare fallback: If QB integration is delayed, launch with manual invoicing (contractor creates invoice in QB, marks job as paid in FTW). Less elegant but functional.
5. Attend Innovate MS meeting to ask about QB partnership — they may have contacts at Intuit.

**Contingency if mitigation fails:**
- If QB marketplace listing is rejected: Use QuickBooks API with standard developer access (no revenue share). Lose the 20% rev share (~$5-15/contractor/month) but retain the integration.
- If QB integration is fundamentally blocked: Integrate with Stripe Connect as fallback payment processor. Higher fees for contractors but zero dependency on Intuit's approval process. Note: this contradicts the current project spec (QuickBooks, not Stripe), so this is a last resort.

**Owner:** James

---

## 4. Platform Liability

**Probability:** Low (20%)
**Impact:** High (lawsuit could be existential for a startup)
**Risk Score:** HIGH (because impact is existential even at low probability)

**Risk:** If a "verified" contractor does bad work, causes property damage, or injures someone, FTW could be named in a lawsuit. The "FairTrade Promise" could be construed as a guarantee.

**Trigger indicators:**
- A homeowner complains about a verified contractor's work quality
- A contractor causes property damage or personal injury on a job sourced through FTW
- A lawyer sends a demand letter naming FTW
- A verified contractor turns out to have a fraudulent license or expired insurance

**Mitigation actions:**
1. **Legal review of TOS** before launch. TOS must clearly state: FTW is a marketplace/platform, not an employer, general contractor, or guarantor of work quality. FTW does not hire, supervise, or control contractors.
2. **Rewrite "FairTrade Promise"** to be marketing language, not a legal guarantee. Use phrases like "we strive to connect you with qualified professionals" — not "we guarantee quality work."
3. **Obtain insurance before launch:**
   - General Liability (GL): $500K-$1M coverage. Estimated cost: $500-1,500/year for a technology platform.
   - Errors & Omissions (E&O): Covers claims that AI estimates were inaccurate and caused financial harm. Estimated cost: $1,000-3,000/year.
   - Cyber Liability: Covers data breaches. Estimated cost: $500-1,500/year.
4. **Require contractors to maintain their own insurance** and verify coverage amounts during onboarding. Minimum: $500K GL per contractor.
5. **Add contractor indemnification clause** to contractor agreement: contractor indemnifies FTW for claims arising from their work.
6. **Build a dispute resolution process** that resolves homeowner complaints before they become lawsuits. Mediation first, then arbitration (per TOS).

**Contingency if mitigation fails:**
- If sued: Engage insurance carrier (that is what E&O and GL policies are for). Retain a Mississippi attorney familiar with marketplace liability. Do NOT settle without legal advice.
- If insurance is denied or too expensive: Consider operating as an "information only" platform (like Angi/Yelp) rather than a marketplace with booking/payments. Reduces liability exposure significantly.

**Owner:** James (with attorney for legal review)

---

## 5. Mississippi Licensing Compliance

**Probability:** Low (25%)
**Impact:** Medium (fines, loss of credibility, contractor churn)
**Risk Score:** LOW-MODERATE

**Risk:** Verifying contractor licenses incorrectly could expose the platform to liability. Displaying a contractor as "verified" when their license is expired, wrong category, or fraudulent damages trust and creates legal exposure.

**Trigger indicators:**
- A contractor's license expires and FTW does not catch it
- MSBOC changes licensing categories or thresholds
- A homeowner discovers that a "verified" contractor on FTW does not actually hold the required license for their project type
- MSBOC contacts FTW about improper license representations

**Mitigation actions:**
1. Build MSBOC license verification into contractor onboarding. Use MSBOC's online license lookup to verify license number, status, and category.
2. Implement automated monthly re-verification: check all active contractor licenses against MSBOC database. Flag any that have expired, been suspended, or changed status.
3. Display license information clearly on contractor profiles: license number, category, expiration date, and a "Verified [Date]" timestamp.
4. Add disclaimer: "License information is verified against Mississippi State Board of Contractors records. FTW does not guarantee license validity between verification dates."
5. Build category-aware matching: a Residential Remodeling licensee should not be matched with projects requiring a Residential Builder license (different threshold).
6. Track MSBOC regulatory changes quarterly. Subscribe to MSBOC newsletter if available.

**Contingency if mitigation fails:**
- If a licensing verification error occurs: Immediately correct the contractor's profile, notify affected homeowners, and document the incident. If the error led to a homeowner hiring an unlicensed contractor, assist with resolution and file an incident report.
- If MSBOC changes requirements significantly: Update verification flow within 30 days. Notify affected contractors of new requirements.

**Owner:** James

---

## 6. Background Check Costs

**Probability:** High (80% — this cost is certain, only the magnitude is uncertain)
**Impact:** Low (manageable with planning)
**Risk Score:** LOW-MODERATE

**Risk:** Checkr at ~$30/contractor is FTW's cost, not the contractor's. At 100 contractors = $3,000 before revenue. At 500 contractors = $15,000. This is the single largest variable cost.

**Trigger indicators:**
- Background check costs exceed 10% of monthly revenue
- Contractor signup rate spikes (good problem) but background check budget cannot keep up
- Checkr raises prices or changes API terms
- Significant percentage of contractors fail background checks (wasted spend)

**Mitigation actions:**
1. Budget as customer acquisition cost, not operating expense. Each $30 background check is part of the $50-150 total CAC per contractor.
2. Phase verification: license + insurance verification at signup (free to verify), background check only when contractor requests "Verified" badge. This delays the cost until the contractor has demonstrated engagement.
3. Negotiate volume discounts with Checkr. At 50+ checks/month, discounts of 15-25% are typical. Target: $22-25/check at volume.
4. Factor background check costs into SBIR budget ($8K for ~200 checks during Phase 1).
5. Consider passing partial cost to contractors for Business tier: "Background check included with Business subscription." For Pro tier, absorb the cost as CAC.
6. Evaluate Checkr alternatives: Sterling ($25-40/check), GoodHire ($30-80/check), National Crime Search ($15-25/check, less comprehensive). Price vs. comprehensiveness tradeoff.

**Contingency if mitigation fails:**
- If background check costs become unsustainable: Pass the cost to contractors ($29.99 one-time "verification fee" at signup). Many competitors do this. May reduce signup conversion by 10-20% but eliminates the cost burden.
- If Checkr becomes unavailable: Switch to Sterling or GoodHire (similar API-first approach). Migration effort: ~1-2 weeks of development.

**Owner:** James

---

## 7. Thumbtack Competition

**Probability:** Medium (40%)
**Impact:** Medium (market share loss, pricing pressure)
**Risk Score:** MODERATE

**Risk:** Thumbtack is growing fast (33% YoY), has partnerships with ChatGPT, Zillow, and Redfin, and strong brand awareness. They could enter the Mississippi market more aggressively or launch construction-specific features that neutralize FTW's differentiation.

**Trigger indicators:**
- Thumbtack launches a construction-specific vertical or AI estimation feature
- Thumbtack begins aggressively marketing in Oxford/Mississippi (targeted ads, local partnerships)
- Contractors mention Thumbtack as the reason they are not signing up for FTW
- Thumbtack's pricing drops significantly (currently $15-50/lead)

**Mitigation actions:**
1. **Differentiate on depth, not breadth.** Thumbtack is a generalist (plumbers, photographers, DJs, contractors). FTW is construction-only. Domain expertise in estimation, licensing, insurance verification, and QuickBooks integration creates defensibility.
2. **Build switching costs.** QuickBooks integration, historical estimate data, client relationships, and review history all create lock-in. The longer a contractor uses FTW, the harder it is to leave.
3. **Win on pricing model.** Thumbtack charges per-lead ($15-50 per lead, regardless of whether the contractor wins the job). FTW charges flat monthly subscription. For active contractors, FTW is dramatically cheaper per lead.
4. **Leverage local trust.** James is a local. Thumbtack is a San Francisco corporation. In Oxford, MS, personal relationships and local credibility matter more than brand awareness.
5. **Monitor Thumbtack's product roadmap.** Sign up for their contractor product, read their engineering blog, track press releases. Know what they are building before it launches.

**Contingency if mitigation fails:**
- If Thumbtack dominates the Oxford market: Focus on the estimation tool (ConstructionAI) as the primary value prop, with the marketplace as secondary. Contractors join for the estimation tool, stay for the marketplace.
- If Thumbtack acquires or copies FTW's AI estimation: Accelerate white-label licensing (FairEstimator) to diversify revenue away from a single marketplace.

**Owner:** James

---

## 8. Key Person Risk

**Probability:** Low (10%)
**Impact:** High (FTW currently depends entirely on James)
**Risk Score:** MODERATE (low probability but existential impact)

**Risk:** FTW is a single-founder company. If James is incapacitated (health emergency, personal crisis, burnout), all development, sales, customer support, and strategic direction stops.

**Trigger indicators:**
- James is the only person who can deploy code, respond to customer issues, or make business decisions
- No documentation exists for critical processes (deployment, Supabase admin, Checkr dashboard, QuickBooks integration)
- No one else has access to critical accounts (Vercel, Supabase, domain registrar, Checkr, bank account)
- Signs of burnout: declining code quality, missed deadlines, reduced communication

**Mitigation actions:**
1. **Document all critical processes** in a runbook: how to deploy, how to access Supabase admin, how to run background checks, how to handle customer complaints, how to restart RunPod endpoints. Store in a shared location (not just James's local machine).
2. **Set up a shared password manager** (1Password, Bitwarden) with emergency access. Designate a trusted person (family member, business partner, attorney) who can access critical accounts if James is unavailable for 72+ hours.
3. **Automate what can be automated:** CI/CD deployments (already on Vercel), automated license re-verification, automated backup scripts. Reduce the number of tasks that require James's manual intervention.
4. **Identify a technical backup person** — even a part-time contractor who is familiar with the codebase and could handle emergency fixes. Budget $500-1,000/mo for 5-10 hours of standby availability.
5. **Get key person insurance** once FTW has revenue or SBIR funding. Cost: $500-2,000/year for $250K-$500K coverage. Protects the business entity if James is permanently unable to work.

**Contingency if mitigation fails:**
- If James is incapacitated for < 2 weeks: Automated systems (Vercel, Supabase) keep the platform running. Customers experience no disruption unless they need support.
- If James is incapacitated for > 1 month: Trusted backup person handles critical issues. If no backup exists, the platform continues running but no new development, support, or sales occur. Revenue continues from existing subscriptions.
- If permanent: Key person insurance funds transition — either hire a replacement developer/CEO or wind down the business and return any SBIR funds per federal requirements.

**Owner:** James (designate a backup contact)

---

## 9. Technology Platform Risk

**Probability:** Low (15%)
**Impact:** Medium (temporary outage, data migration required)
**Risk Score:** LOW-MODERATE

**Risk:** FTW depends on third-party platforms (Supabase, Vercel, RunPod, Checkr). If any of these has a major outage, changes pricing dramatically, or shuts down, FTW is affected.

**Trigger indicators:**
- Supabase, Vercel, or RunPod announces significant pricing changes (>50% increase)
- Platform outage lasting >4 hours during business hours
- Platform announces end-of-life or acquisition by a company with conflicting interests
- Platform changes terms of service to restrict FTW's use case

**Mitigation actions:**
1. **Use standard, portable technologies:** Supabase is built on Postgres (can migrate to any Postgres host). Next.js can deploy anywhere (not locked to Vercel). RunPod Serverless uses standard Docker containers (can move to any GPU cloud).
2. **Maintain daily backups** independent of platform providers (pg_dump to Cloudflare R2). This ensures data is recoverable even if the platform disappears.
3. **Document migration paths:** How to move from Supabase to self-hosted Postgres (2-4 hour migration). How to move from Vercel to Cloudflare Pages or self-hosted (1-2 hour migration for static export). How to move from RunPod to a dedicated GPU server (4-8 hour migration).
4. **Monitor platform status pages:** Subscribe to status updates for Supabase, Vercel, and RunPod. Set up alerts for any degraded performance.
5. **Avoid proprietary features** where possible: use standard Postgres features over Supabase-specific features, use standard Next.js over Vercel-specific features (edge functions, etc.).

**Contingency if mitigation fails:**
- If Supabase has extended outage (>24 hours): Restore pg_dump to a DigitalOcean Managed Postgres instance ($15/mo). Update environment variables. Estimated migration time: 4-8 hours.
- If Vercel has extended outage: Deploy static export to Cloudflare Pages (free). Update DNS. Estimated migration time: 1-2 hours.
- If RunPod shuts down: Move ConstructionAI Docker container to Vast.ai, Lambda Labs, or a dedicated GPU server. Estimated migration time: 4-8 hours.

**Owner:** James

---

## 10. Regulatory Risk (Licensing Requirements Change)

**Probability:** Low (10%)
**Impact:** Medium (requires platform updates, possible contractor churn)
**Risk Score:** LOW

**Risk:** Mississippi could change contractor licensing requirements — raising thresholds, adding categories, requiring additional certifications, or changing the licensing board structure.

**Trigger indicators:**
- MSBOC announces proposed rule changes
- Mississippi legislature introduces bills affecting contractor licensing
- Other states pass contractor licensing reforms that Mississippi might follow
- MSBOC contacts FTW about platform compliance

**Mitigation actions:**
1. **Monitor MSBOC announcements** quarterly. Check msboc.us for rule changes, meeting minutes, and proposed regulations.
2. **Build the verification system to be configurable:** license categories, thresholds, and requirements should be stored in a configuration table (not hardcoded). This allows updating requirements without code changes.
3. **Join HBAM** (Home Builders Association of Mississippi) for $200-500/year. Members get advance notice of regulatory changes and lobbying updates.
4. **Design for multi-state from the start:** When FTW expands beyond Mississippi, each state has different licensing requirements. A configurable verification system now saves months of development later.

**Contingency if mitigation fails:**
- If licensing requirements change significantly: Update verification flow within 30 days. Notify affected contractors of new requirements. Offer assistance with compliance (links to MSBOC application, exam prep resources).
- If Mississippi eliminates contractor licensing (unlikely but possible): Shift verification emphasis to insurance, reviews, and background checks. The "Verified" badge criteria changes but the trust system remains.

**Owner:** James

---

## 11. AI Accuracy Risk (ConstructionAI Estimation Errors)

**Probability:** Medium (35%)
**Impact:** High (wrong estimates damage trust, could cause financial harm to contractors or homeowners)
**Risk Score:** HIGH

**Risk:** ConstructionAI estimates are consistently wrong — either too high (contractors lose bids) or too low (contractors lose money on jobs). The model was trained on data from one contractor (MHP Construction) in one market (Oxford, MS). Generalization is unproven.

**Trigger indicators:**
- Mean absolute percentage error (MAPE) exceeds 20% across 10+ estimates
- Contractors report that AI estimates are consistently higher or lower than their manual estimates
- A contractor loses money on a job because they relied on a FTW AI estimate
- Accuracy varies wildly by project type (good for kitchens, terrible for roofing)
- Homeowners compare AI estimates to actual contractor quotes and find large discrepancies

**Mitigation actions:**
1. **Launch with explicit disclaimer:** "AI estimates are preliminary and should be verified by a licensed contractor before use. Accuracy varies by project type and location."
2. **Collect feedback on every estimate:** After each AI estimate, ask the contractor "How accurate was this estimate?" with a 1-5 scale and optional comments. Use this feedback loop to identify systematic errors.
3. **Implement guardrails:** If the model's confidence is low (high token perplexity or wide variance in generated numbers), flag the estimate as "Low Confidence" and recommend manual review.
4. **Track accuracy metrics from Day 1:** Compare AI estimates to actual project costs (when available). Build a dashboard showing MAPE by project type, market, and time period.
5. **Plan for continuous improvement:** Use the feedback data to fine-tune ConstructionAI quarterly. Each iteration should reduce MAPE.
6. **Maintain the RS Means / manual estimation path** as a fallback. AI estimation is a feature, not the only estimation method.

**Contingency if mitigation fails:**
- If MAPE exceeds 25% consistently: Temporarily disable AI estimates for the affected project types. Fall back to template-based estimation (RS Means lookup tables) while retraining the model.
- If a contractor suffers financial loss due to an AI estimate: Review the specific case. If the estimate was clearly flawed, offer a Pro subscription credit (1-3 months). Document the failure mode and fix the model. The E&O insurance policy covers claims of financial harm from estimation errors.
- If the model cannot achieve <15% MAPE after multiple training iterations: Pivot ConstructionAI to an "estimation assistant" that helps contractors build estimates faster (pre-filling line items, suggesting prices) rather than generating complete estimates autonomously.

**Owner:** James

---

## 12. Data Privacy and Breach Risk

**Probability:** Low (15%)
**Impact:** High (regulatory fines, loss of trust, potential lawsuit)
**Risk Score:** MODERATE

**Risk:** FTW collects sensitive personal information: contractor SSNs (for background checks), financial data (through QuickBooks integration), home addresses, project details, and payment information. A data breach could be catastrophic for a startup.

**Trigger indicators:**
- Unauthorized access to Supabase database
- Checkr or QuickBooks API credentials are compromised
- A contractor reports receiving phishing emails using information only available on FTW
- Security audit reveals vulnerabilities in the application
- A data breach notification from a third-party provider (Supabase, Checkr, Vercel)

**Mitigation actions:**
1. **Minimize data retention:** Do NOT store SSNs in FTW's database. Pass SSNs directly to Checkr's API and store only the background check result (pass/fail + date). Never store what you do not need.
2. **Encrypt sensitive data at rest:** Supabase Pro includes encryption at rest for the database. Ensure file storage is also encrypted.
3. **Use Row Level Security (RLS)** in Supabase: contractors can only access their own data, homeowners can only access their own data, no cross-tenant data leakage.
4. **Secure API keys:** Store Checkr, QuickBooks, and RunPod API keys in environment variables (Vercel/Render), never in code. Rotate keys quarterly.
5. **Enable MFA** on all admin accounts: Supabase, Vercel, Checkr, QuickBooks, domain registrar, email, GitHub.
6. **Run AEON security scans** before integrating any backend (per project .aeonrc.yml configuration). Check for SQL injection, XSS, CSRF, and insecure API endpoints.
7. **Obtain cyber liability insurance** ($500-1,500/year). Covers breach notification costs, credit monitoring for affected users, legal fees, and regulatory fines.
8. **Create an incident response plan:** Who to contact, how to assess scope, when to notify users, when to notify regulators. Mississippi does not have a state-level data breach notification law as comprehensive as California's CCPA, but federal requirements may apply if financial data is involved.

**Contingency if mitigation fails:**
- If a breach is detected: Immediately revoke compromised credentials. Assess scope (what data was accessed, how many users affected). Notify affected users within 72 hours. Engage cyber liability insurance carrier. Retain a breach response attorney. Document everything.
- If contractor SSNs are compromised (worst case): This triggers federal notification requirements. Offer 12 months of free credit monitoring to affected contractors. Expect significant reputational damage — may need to rebrand the verification process.

**Owner:** James (with attorney for incident response plan)

---

## Risk Summary Matrix

| # | Risk | Probability | Impact | Score | Priority |
|---|------|------------|--------|-------|----------|
| 1 | Marketplace cold start | Medium | High | HIGH | Immediate |
| 3 | QuickBooks integration timeline | Medium | High | HIGH | Immediate |
| 11 | AI accuracy risk | Medium | High | HIGH | Pre-launch |
| 4 | Platform liability | Low | High | HIGH | Pre-launch |
| 2 | Contractor willingness to pay | Medium | Medium | MODERATE | Launch |
| 7 | Thumbtack competition | Medium | Medium | MODERATE | Ongoing |
| 8 | Key person risk | Low | High | MODERATE | Pre-launch |
| 12 | Data privacy / breach | Low | High | MODERATE | Pre-launch |
| 6 | Background check costs | High | Low | LOW-MOD | Ongoing |
| 9 | Technology platform risk | Low | Medium | LOW-MOD | Ongoing |
| 5 | Mississippi licensing compliance | Low | Medium | LOW-MOD | Pre-launch |
| 10 | Regulatory risk | Low | Medium | LOW | Monitor |

**Action item:** Review this risk register monthly. Update probability and impact ratings based on new information. Add new risks as they emerge. Remove risks that have been fully mitigated or are no longer relevant. The top 4 risks (marketplace cold start, QB integration, AI accuracy, platform liability) should each have an active mitigation workstream before launch.
