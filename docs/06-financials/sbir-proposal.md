# SBIR Proposal Strategy

## Agency Selection: NSF vs USDA vs DOE

### NSF (National Science Foundation) — Best Fit

**Why NSF is the primary target:**
- NSF SBIR Topic Area: "Information Technologies" (IT) covers AI/ML platforms, marketplace technology, and domain-specific language models.
- ConstructionAI is a genuinely novel technical contribution — a fine-tuned domain-specific LLM for construction estimation, not a wrapper around a commercial API. NSF values this distinction.
- NSF Phase 1 awards up to **$275,000** for 12 months. Phase 2 awards up to **$1,000,000** for 24 months.
- NSF explicitly encourages applications from underrepresented geographies. Mississippi ranks near the bottom for SBIR awards — this is an advantage.
- NSF does NOT require a university partnership (unlike some NIH mechanisms), which fits FTW's small team structure.
- Solicitation: NSF 24-559 (or current year equivalent). Open submission windows typically in June and November.

**Relevant NSF keywords to use:** domain-specific AI, vertical SaaS, construction technology (ConTech), workforce marketplace, AI-assisted cost estimation, small business digitization.

### USDA — Secondary Target

**Why USDA could work:**
- USDA SBIR has a "Rural Development" topic area. Oxford, MS (population ~28,000) and surrounding Lafayette County qualify as rural.
- FTW connects rural homeowners with local contractors — keeping construction dollars in rural economies. This narrative aligns with USDA's mission.
- USDA Phase 1 awards are smaller: typically **$100,000-$175,000** for 8 months.
- Less competition than NSF (fewer applicants), but reviewers may not have deep AI/ML expertise.

**Drawback:** The technical innovation narrative is harder to frame for USDA. They care more about rural economic impact than novel AI architecture.

### DOE (Department of Energy) — Weak Fit

**Why DOE is not recommended:**
- DOE SBIR topics are highly specific (energy storage, grid modernization, nuclear, etc.). Construction estimation doesn't fit their current topic areas.
- Unless FTW pivots to energy-efficient construction estimation (e.g., estimating solar panel installations, insulation upgrades, HVAC efficiency), DOE is not a natural fit.
- DOE has the longest review timelines (6-9 months from submission to award).

**Verdict:** Apply to **NSF first** (larger award, better fit, stronger innovation narrative). If NSF is not successful, apply to **USDA second** (rural angle, less competition). Skip DOE unless FTW develops an energy-specific vertical.

**Action item:** Confirm current NSF solicitation number and submission deadline. Check if Innovate Mississippi has NSF SBIR application coaching (they usually do — free service).

---

## Phase 1 Technical Objectives

A strong Phase 1 proposal needs 3-4 clearly defined technical objectives that represent genuine research questions — not product development milestones. Reviewers want to see uncertainty: "We don't know if X will work at scale, and Phase 1 funding will let us find out."

### Objective 1: Validate ConstructionAI Accuracy Across Project Types and Markets

**Research question:** Can a fine-tuned Llama 3.1 8B model trained on 5,200 examples from a single Mississippi contractor (MHP Construction) generalize to other contractors, project types, and regional pricing without catastrophic accuracy loss?

**Approach:**
- Collect estimation data from 5 additional contractors across 3 Mississippi markets (Oxford, Tupelo, Jackson).
- Test ConstructionAI accuracy on 5 project types: kitchen remodel, bathroom remodel, room addition, deck/patio, full renovation.
- Measure accuracy as mean absolute percentage error (MAPE) vs. actual project cost.
- Success criteria: MAPE < 15% across all 5 project types in all 3 markets (current single-contractor MAPE to be established as baseline).

**Why this is R&D, not product development:** Domain-specific LLM generalization across geographic markets is an unsolved research problem. Regional labor rates, material costs, and code requirements vary significantly. Whether a small model (8B parameters) can capture this variance with limited training data is a genuine technical question.

### Objective 2: Develop Regional Pricing Adaptation Layer

**Research question:** Can ConstructionAI dynamically adjust estimates based on real-time regional pricing data without full model retraining?

**Approach:**
- Build a Retrieval-Augmented Generation (RAG) layer that pulls current RS Means data, local supplier pricing, and Bureau of Labor Statistics wage data for the target region.
- Test whether RAG-augmented estimation outperforms the base fine-tuned model on out-of-distribution markets.
- Compare three approaches: (a) base model only, (b) model + RAG, (c) model fine-tuned on regional data. Measure MAPE for each.
- Success criteria: RAG-augmented model achieves MAPE < 20% on new markets without retraining.

**Why this is R&D:** RAG for quantitative estimation (not just text generation) is underexplored in the literature. Construction pricing is highly local — national averages are often 20-40% off from local reality.

### Objective 3: Build Contractor Trust Calibration System

**Research question:** How do you calibrate contractor trust signals (license verification, insurance status, background check, review history, platform behavior) into a reliable composite score that homeowners can use to make informed hiring decisions?

**Approach:**
- Define a trust scoring framework with weighted inputs: license verification (binary), insurance status (binary + coverage amount), background check (pass/fail + detail), review average (1-5 scale), response time (hours), job completion rate (%), dispute history.
- Survey 100+ homeowners on which trust signals matter most. Weight the composite score accordingly.
- Test whether composite trust scores correlate with actual job satisfaction outcomes (measured via post-project surveys).
- Success criteria: Trust score has a statistically significant positive correlation (p < 0.05) with homeowner satisfaction.

**Why this is R&D:** Trust systems in two-sided marketplaces are well-studied (eBay, Airbnb), but construction marketplaces have unique challenges: high-stakes transactions ($5K-$100K+), long project timelines (weeks to months), and information asymmetry about contractor quality.

### Objective 4: Evaluate Marketplace Matching Algorithm

**Research question:** What matching algorithm best connects homeowners with qualified contractors while optimizing for homeowner satisfaction, contractor utilization, and platform revenue?

**Approach:**
- Implement and compare 3 matching approaches: (a) simple geographic + category filter, (b) weighted scoring with trust score + proximity + availability + price, (c) collaborative filtering based on similar homeowner preferences.
- Measure match quality via acceptance rate (% of matches that result in a hired contractor) and satisfaction score.
- Success criteria: Best algorithm achieves > 30% match-to-hire conversion rate (vs. Thumbtack's reported ~10-15%).

**Action item:** Draft these four objectives as a 2-page summary. Share with Innovate MS advisor for feedback before writing the full proposal.

---

## Commercialization Plan Section

The commercialization plan is **the section most Phase 1 applicants underestimate**. NSF reviewers explicitly score on commercial potential. They want to see a clear path from "funded research" to "revenue-generating product."

### What Reviewers Want to See

1. **Market size with citations.** U.S. residential construction: $500B+ annually (Census Bureau). Home improvement/remodeling: $450B (Harvard JCHS). ConTech software: $2.8B and growing 12% YoY (Mordor Intelligence). Serviceable addressable market for FTW: Mississippi residential remodeling = ~$3.2B annually.

2. **Customer validation.** MHP Construction (Oxford, MS) is already using the platform. License R21909. Josh Harris can provide a testimonial letter. 240 historical projects, 28,941 line items of real training data — this is not hypothetical.

3. **Revenue model.** SaaS subscriptions ($49-$149/mo), QuickBooks revenue share (20% of payment processing fees for 3 years per client), homeowner convenience fees ($5-10/job), AI estimate sales ($5-15/estimate), white-label licensing ($299-$999/mo), featured placement ($10-30/mo).

4. **Go-to-market strategy.** Phase 1 validates technology in Oxford, MS. Phase 2 expands to 3 Mississippi markets. Post-SBIR: expand to neighboring states (Alabama, Tennessee, Louisiana). White-label licensing (FairEstimator) provides a second growth vector that doesn't require market-by-market expansion.

5. **Competitive landscape.** ServiceTitan ($9.5B valuation, targets enterprise). Jobber (targets SMB but not construction-specific). Thumbtack (lead-gen, not SaaS). Buildertrend (project management, not marketplace). None combine marketplace + AI estimation + QuickBooks-native payments for the small contractor segment ($100K-$2M revenue).

6. **Financial projections.** Year 1: $50K ARR (50 paid contractors). Year 2: $250K ARR (250 paid contractors). Year 3: $1M+ ARR (500+ paid contractors + white-label). Show that Phase 1 funding bridges to revenue, not to another fundraise.

**Action item:** Write a 3-page commercialization plan draft. Include market size table, competitive matrix, and 3-year revenue projection. Get feedback from Innovate MS.

---

## Team Qualifications Section

### How to Present James + Partner

NSF expects a small team for Phase 1 — typically 1-2 people. What matters is demonstrating relevant expertise and the ability to execute the proposed R&D.

**James Walton — Principal Investigator (PI)**
- Frame as: construction industry practitioner turned technology developer. This dual expertise is rare and valuable.
- Emphasize: hands-on construction experience (understands the domain deeply), self-taught software development (built FTW frontend, ConstructionAI training pipeline, MHP Estimate delivery platform), direct client relationships (MHP Construction).
- Construction background provides domain expertise that PhD computer scientists typically lack. Reviewers value practitioners-turned-founders.
- Quantify: built a 5,200-example training dataset from 240 real construction projects. Trained and deployed a domain-specific LLM. Shipped a working product to a real client.

**Technical Advisor / Co-PI (if applicable)**
- If a technical co-founder or advisor is identified, include them. An ML/AI background would complement James's construction/product expertise.
- Options: Ole Miss CS faculty member as advisor (even part-time/unfunded adds credibility), Innovate MS technical mentor, or a contracted ML engineer.
- If no co-PI, address this directly: "The PI has demonstrated the ability to independently develop and deploy the ConstructionAI model. Phase 1 budget includes funds for a contracted developer to support engineering tasks."

**Consultants / Subcontractors**
- Legal counsel for TOS/compliance (budgeted at $20K).
- Construction industry advisors — Josh Harris (MHP Construction) as industry advisor adds credibility at zero cost.
- If using a university subcontract (e.g., Ole Miss CS department for model evaluation), this strengthens the proposal significantly. NSF likes academic validation of industry innovation.

**Action item:** Reach out to Ole Miss CS department to explore an advisory or subcontract relationship. Even a letter of collaboration (not a full subcontract) adds credibility. Contact Innovate MS to ask about their SBIR mentoring program and technical advisor matching.

---

## Letters of Support Strategy

Letters of support are **not scored directly** but significantly influence reviewer perception. They validate that real customers/partners want this technology.

### Priority Letters (Must Have)

| Source | What They Should Say | Why It Matters |
|--------|---------------------|---------------|
| Josh Harris, MHP Construction | "We have been using ConstructionAI for estimation. It reduces our estimation time by X hours per project. We would pay for continued access." | Proves real customer demand. First-hand industry validation. |
| Home Builders Association of Mississippi (HBAM) | "Construction estimation is a significant challenge for our members. AI-assisted estimation tools could improve accuracy and efficiency across the industry." | Industry body endorsement. Shows the problem is widely recognized. |
| Innovate Mississippi | "We have been working with FairTradeWorker through our entrepreneurship programs. The technology shows promise for Mississippi's construction industry." | State innovation ecosystem support. Shows institutional backing. |

### Nice-to-Have Letters

| Source | What They Should Say | Why It Matters |
|--------|---------------------|---------------|
| Ole Miss CS Department | "The technical approach is sound. We would be interested in collaborating on model evaluation." | Academic credibility for the AI component. |
| Additional contractors (2-3) | "We would use this tool. Current estimation methods are time-consuming and inaccurate." | Validates demand beyond a single customer. |
| Local real estate agent or homeowner | "Finding reliable contractors is a major pain point. A verified marketplace would be valuable." | Validates the demand side of the marketplace. |
| Intuit / QuickBooks developer relations | "We welcome FairTradeWorker's integration with the QuickBooks ecosystem." | Validates the payment/integration strategy. |

### Letter Format

Each letter should be 1 page, on organizational letterhead, and include:
1. Who they are and their relationship to the applicant.
2. What problem they experience that FTW addresses.
3. Specific statement of support (would use, would purchase, would collaborate).
4. Signature and contact information.

**Action item:** Request letters from Josh Harris and HBAM within 60 days. Draft template letters for each source to make it easy for them — people are 3x more likely to provide a support letter if you write the draft.

---

## Phase 2 Vision: What Would $1M-$2M Fund?

Phase 2 is 24 months and up to $1,000,000 (NSF) or $600,000 (USDA). The Phase 1 proposal should include a brief (1 paragraph) Phase 2 vision. Here is what Phase 2 would fund:

### Year 1 of Phase 2 ($500K)

| Activity | Budget | Deliverable |
|----------|--------|-------------|
| Multi-market model training | $100K | ConstructionAI trained on data from 20+ contractors across 5 Mississippi markets. MAPE < 12% across all markets. |
| Marketplace scaling | $80K | FTW marketplace live in 3 Mississippi markets (Oxford, Tupelo, Jackson) with 200+ contractors and 2,000+ homeowners. |
| Engineering team (2 developers) | $200K | Full backend build: Supabase integration, QuickBooks Payments, real-time bidding (Elixir/Phoenix), mobile-responsive homeowner experience. |
| Customer acquisition | $50K | Paid marketing, field reps, trade show presence in target markets. |
| Legal and compliance | $50K | Multi-state licensing compliance, contractor agreement templates, E&O insurance, data privacy framework. |
| IP protection | $20K | Provisional patent filing for ConstructionAI estimation methodology. |

### Year 2 of Phase 2 ($500K)

| Activity | Budget | Deliverable |
|----------|--------|-------------|
| Multi-state expansion | $100K | Expand to Alabama, Tennessee, Louisiana. Adapt regional pricing layer to new markets. |
| White-label platform (FairEstimator) | $150K | Template system for client-branded estimation platforms. MHP Estimate as first instance, 5+ white-label clients by end of Phase 2. |
| Advanced AI features | $100K | Voice-to-estimate (contractor describes project, AI generates estimate). Photo-to-estimate (upload project photos, AI identifies scope). |
| Data infrastructure | $50K | Data pipeline for continuous model improvement. Feedback loop from actual project costs vs. estimates. |
| Team expansion | $100K | Customer success hire, part-time data analyst, marketing coordinator. |

### Phase 2 Success Metrics

- 500+ paying contractors across 5+ markets
- $500K+ ARR
- ConstructionAI MAPE < 10% in trained markets
- 5+ white-label clients generating licensing revenue
- At least 1 follow-on funding offer (VC or strategic investor) OR profitability

**Action item:** Keep Phase 2 vision brief in the Phase 1 proposal (1 paragraph max). Save the detailed plan for the Phase 2 application. But have this detail ready — reviewers sometimes ask about it in Q&A.

---

## Application Timeline

### NSF SBIR Timeline (Typical)

| Milestone | Target Date | Notes |
|-----------|------------|-------|
| Identify solicitation number | Immediately | Check nsf.gov/SBIR for current solicitation (NSF 24-559 or successor). |
| Register on Research.gov | Week 1 | Required for submission. Also register DUNS number and SAM.gov (takes 2-4 weeks). |
| Contact Innovate MS SBIR advisor | Week 1-2 | Free coaching. They review drafts, connect to mentors, and sometimes fund application costs. |
| Outline proposal | Week 2-4 | 1-page outline of technical objectives, team, budget. Get advisor feedback. |
| Request letters of support | Week 2-4 | Give signers 30+ days. Provide draft letters. |
| Write full proposal | Week 4-10 | 15-page project description + budget justification + biographical sketches + facilities description. |
| Internal review | Week 10-11 | Have 2-3 people read it. One should be a non-technical reader (tests clarity). |
| Submit | Week 12 | Submit 48+ hours before deadline. Research.gov has submission issues near deadlines. |
| Review period | 4-6 months | NSF uses mail review (3-5 reviewers read independently, no panel). |
| Award notification | 6-8 months after submission | If awarded, negotiate budget and start date. Typical start: 2-3 months after award. |

### Key Dates to Track

- **NSF submission windows:** Typically June and November each year. Check current solicitation for exact dates.
- **USDA submission window:** Typically one window per year, around June-August.
- **SAM.gov registration:** Start NOW. This alone takes 2-4 weeks and is required for any federal funding.
- **DUNS number:** Free, takes 1-2 business days. Required for SAM.gov.

### Total Timeline: Application to First Dollar

Best case: ~9-12 months from starting the application to receiving Phase 1 funds.
- Writing: 3 months
- Review: 5-6 months
- Negotiation and start: 1-2 months

**Action item:** Register on SAM.gov and get a DUNS number this week. These are required for any federal funding application and have the longest lead time. Contact Innovate MS to schedule an SBIR coaching session within 2 weeks.

---

## Phase 1 Budget Template (Expanded, ~$275K)

| Category | Amount | Detailed Justification |
|----------|--------|----------------------|
| Senior Personnel (PI - James) | $80,000 | 12 months at 100% effort. PI leads all technical objectives, manages contractor relationships, conducts market research. Based on Mississippi salary benchmarks for technology entrepreneurs. |
| Other Personnel (Developer) | $40,000 | 12 months at 50% effort (contracted). Frontend/backend development for data collection interfaces, model evaluation dashboards, and marketplace MVP enhancements. |
| AI Infrastructure | $30,000 | RunPod GPU hours for model training iterations ($15K). Cloud compute for RAG pipeline development ($5K). Data storage and processing ($5K). Model evaluation infrastructure ($5K). |
| Data Acquisition | $25,000 | Purchase RS Means regional pricing database license ($10K). Contractor data collection incentives — $200/contractor x 50 contractors for sharing historical project data ($10K). BLS wage data API access ($2K). Miscellaneous data sources ($3K). |
| Legal/Compliance | $20,000 | Attorney review of Terms of Service ($5K). Contractor agreement templates ($3K). FCRA compliance review for background check workflow ($5K). Patent landscape search and provisional filing assessment ($5K). Data privacy policy (CCPA/state requirements) ($2K). |
| Verification Stack | $15,000 | Checkr background check API integration and testing ($8K — ~200 checks at $30-40 each). Persona identity verification integration ($4K). Insurance verification API evaluation ($3K). |
| Cloud/Hosting | $15,000 | Supabase Pro ($300/yr). Vercel Pro ($240/yr). Domain and email ($200/yr). Monitoring tools ($500/yr). Remaining ($13,760) covers scaling headroom and evaluation of production infrastructure options. |
| Market Research | $10,000 | Homeowner survey ($3K — SurveyMonkey Audience or similar for 500+ responses in target markets). Contractor interviews ($2K — 30 interviews at $50 incentive + recording/transcription). Competitive analysis report ($2K). Industry conference attendance for research ($3K). |
| Travel | $10,000 | Contractor site visits in Oxford, Tupelo, Jackson ($3K — mileage, meals). Innovate MS meetings in Jackson ($2K). NSF SBIR Boot Camp or conference ($3K — flight, hotel, registration). Industry events — HBAM conference, local builder meetups ($2K). |
| Indirect Costs | $30,000 | 12% of total direct costs. Covers: office/workspace, internet, phone, insurance (GL for company), accounting, administrative costs. NSF allows negotiated indirect cost rate; 12% is conservative and defensible for a small company. |
| **Total** | **$275,000** | |

**Action item:** Confirm NSF's current indirect cost rate policy for small businesses. If FTW does not have a negotiated rate with a federal agency, the de minimis rate of 10% applies unless a higher rate is justified and approved.

---

## Entity Structure Note for SBIR

SBIR requires the applicant to be a U.S. small business (< 500 employees, for-profit, majority U.S.-owned). FTW needs:

1. **Legal entity:** LLC or Corporation. Must be formed before submission. Mississippi LLC filing: ~$50 + $25 annual report. Timeline: same-day online filing.
2. **EIN:** Required for SAM.gov registration. Free from IRS, takes 1 business day online.
3. **SAM.gov registration:** Required. Takes 2-4 weeks. Cannot submit SBIR without an active SAM registration.
4. **DUNS/UEI number:** Replaced by SAM UEI. Obtained during SAM.gov registration.

**Note on LLC vs S-Corp for SBIR:** Either works for the application. S-Corp election can save on self-employment taxes once revenue exceeds ~$40K/year. Consult CPA before making the election — it affects how PI salary is structured in the SBIR budget (S-Corp requires W-2 salary, LLC uses self-employment income). See strategic-questions.md for full entity structure analysis.

**Action item:** If FTW does not have a legal entity yet, file the Mississippi LLC this week. It is a prerequisite for every other step (SAM.gov, bank account, SBIR application, QuickBooks marketplace listing, insurance procurement).
