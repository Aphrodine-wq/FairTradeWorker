# Strategic Questions to Resolve

## 1. Supply Seeding

**Question:** Can James personally recruit 10-15 Oxford contractors before launch? What is the pitch in one sentence?

**Why it matters:** The marketplace does not work without contractors. Supply must come first because homeowners will not use an empty marketplace. The first 10-15 contractors determine whether FTW has a viable product or a landing page.

**Options:**
- (A) James recruits personally through existing relationships and job site visits. Pitch: "Free tool that generates estimates in 2 minutes instead of 2 hours — and connects you directly to homeowners looking for your exact trade."
- (B) Partner with Josh Harris (MHP Construction) to recruit his subcontractor network. Josh introduces FTW to 5-10 subs he already works with.
- (C) Post in HBAM groups or local trade association channels. Lower conversion but broader reach.
- (D) Offer a "founding contractor" incentive — first 15 contractors get lifetime Pro tier at $29/mo (locked in, never increases).

**Recommended answer:** Combine (A) + (B). James does personal outreach to 10 contractors he knows or can find on active job sites. Josh Harris introduces FTW to 5+ subcontractors. This gets to 15 without spending a dollar on marketing.

**One-sentence pitch:** "I built a free tool that writes your estimates in 2 minutes — and it connects you to homeowners who are ready to hire, no per-lead fees."

**Additional information needed:** List of specific contractors James knows or can reach in Oxford. Which trade categories are most in demand (check local NextDoor/Facebook for common homeowner requests).

**Decision deadline:** 2 weeks before launch. Contractors must be onboarded and have complete profiles before homeowner marketing begins.

**Action item:** Write out a list of 20 target contractors by name, trade, and how to reach them. Start outreach this week.

---

## 2. Demand Seeding

**Question:** How do homeowners in Oxford find out about FTW? Facebook? NextDoor? Ole Miss parent groups? Local real estate agents?

**Why it matters:** Without homeowners posting jobs, contractors have no reason to stay on the platform. Demand seeding must start within 1-2 weeks of supply seeding to close the loop.

**Options:**
- (A) **Facebook Groups** — Oxford MS Community (~15K members), Oxford Moms, Ole Miss Parents. Post helpful content (not ads): "Looking for a reliable contractor? Here's a free tool that shows verified, insured contractors in Oxford."
- (B) **NextDoor** — Hyper-local, homeowner-heavy demographics. Sponsored posts ($1-3 CPM) or organic community posts.
- (C) **Ole Miss partnerships** — University housing office, parent orientation, off-campus housing resources. Students and parents renting/buying near campus need contractors.
- (D) **Real estate agent partnerships** — Agents give FTW flyers to homebuyers. "Just bought a home? Here's where to find trusted contractors for renovations."
- (E) **Church and community bulletin boards** — Low-tech but effective in a small town. $0 cost.
- (F) **Local print/radio** — Oxford Eagle newspaper, local radio. Higher cost, harder to measure.

**Recommended answer:** Start with (A) Facebook + (B) NextDoor — free, measurable, and where Oxford homeowners already are. Add (D) real estate agent partnerships within 30 days. Skip (F) print/radio until there is budget and a reason to go broad.

**Additional information needed:** Which Facebook groups allow business/service posts without getting banned? Is James already a member of these groups? Which real estate agents in Oxford are most active and open to partnerships?

**Decision deadline:** 1 week after first 10 contractors are onboarded.

**Action item:** Join the top 3 Oxford Facebook groups and NextDoor this week. Draft 3 organic posts (not salesy — helpful, informational) to test engagement.

---

## 3. Minimum Viable Verification

**Question:** Can we launch with license + insurance verification only, adding background checks after? Faster to market, lower upfront cost.

**Why it matters:** Background checks cost $30/contractor and require Checkr API integration. If the first 15 contractors can be verified with just license + insurance (both free to check), FTW can launch weeks earlier and save $450+ on initial verification costs.

**Options:**
- (A) **Launch with license + insurance only.** Display "License Verified" and "Insured" badges. Add "Background Checked" badge later.
- (B) **Launch with full verification** (license + insurance + background check). Higher trust from day one, but slower and more expensive.
- (C) **Tiered verification:** Free tier gets license check only. Pro tier includes background check. This makes background checks a Pro feature, not a platform cost.

**Recommended answer:** Option (A) — launch with license + insurance verification only. Reasons: (1) MSBOC license verification is free and instant (online lookup). (2) Insurance verification can be done by requesting a Certificate of Insurance (COI) upload. (3) Background checks can be added within 60 days of launch. (4) This saves $450-$1,200 in pre-launch costs. (5) No competitor in the Oxford market requires background checks — it is a differentiator when added, not a requirement to launch.

**Additional information needed:** Can MSBOC license lookup be automated via API, or is it manual-only (web scraping required)? What insurance minimums should FTW require (GL: $500K? $1M?)?

**Decision deadline:** Before launch. This determines the onboarding flow and UI design for contractor profiles.

**Action item:** Test the MSBOC license lookup process manually for 3 contractors. Time it. Determine if it can be automated. Draft the COI upload requirements (minimum coverage, acceptable insurers, expiration handling).

---

## 4. QuickBooks Marketplace Deadline

**Question:** Is May 1, 2026 a hard requirement for API access, or just for revenue share? This changes the timeline significantly.

**Why it matters:** If API access requires marketplace listing, and the deadline is May 1, FTW has ~40 days to build, submit, and get approved for the Intuit App Marketplace. This is extremely aggressive. If the deadline is only for revenue share eligibility, FTW can use the API now and list on the marketplace later — much less pressure.

**Options:**
- (A) The deadline is for revenue share only. FTW can use the Payments API with a standard developer account and list on the marketplace when ready. Revenue share begins after listing.
- (B) The deadline is for API access. FTW must be on the marketplace to use the Payments API at all. This is urgent.
- (C) The deadline has passed or been extended. Intuit changes these deadlines periodically.

**Recommended answer:** Likely (A) based on Intuit's documentation, but this MUST be confirmed directly with Intuit Developer Relations. Do not assume.

**Additional information needed:** Direct confirmation from Intuit. Options: (1) Email Intuit Developer Relations (developer.intuit.com/contact). (2) Ask during Innovate MS call if they have an Intuit contact. (3) Post in the Intuit Developer Community forum.

**Decision deadline:** This week. The answer determines whether QuickBooks integration is on the critical path for launch or a post-launch enhancement.

**Action item:** Contact Intuit Developer Relations today. Ask three specific questions: (1) Is marketplace listing required for Payments API access? (2) What is the current timeline for marketplace listing review? (3) Is the ProAdvisor revenue share program still accepting new partners?

---

## 5. Legal Entity

**Question:** Does FTW have an LLC/Corp yet? Required for SBIR, Innovate MS, contractor agreements, insurance, and QB marketplace listing.

**Why it matters:** Almost every next step requires a legal entity: SBIR application (must be a U.S. small business), SAM.gov registration, Innovate MS programs, contractor agreements (need a counterparty), insurance policies (need a named insured), QuickBooks marketplace listing (need a business entity), and opening a business bank account.

**Options:**
- (A) **Mississippi LLC.** Filing cost: $50 online. Annual report: $25. Simple, fast, flexible. Recommended for launch.
- (B) **Mississippi Corporation (C-Corp).** Filing cost: $50. More complex. Only needed if seeking VC funding (VCs prefer C-Corps for tax reasons). Not recommended at this stage.
- (C) **Wyoming or Delaware LLC.** Common for privacy or legal advantages, but adds complexity for a Mississippi-based business. Not recommended.

**Recommended answer:** File a Mississippi LLC this week. It takes 10 minutes online and costs $50. Name it "FairTradeWorker LLC" or "FTW Technologies LLC." This unlocks every downstream requirement.

**Additional information needed:** Does James already have a personal LLC that could be used, or should FTW be a separate entity? (Separate entity is recommended for liability isolation.) Does James have a CPA who can advise on tax elections?

**Decision deadline:** This week. It is a prerequisite for SAM.gov registration (2-4 weeks lead time), which is a prerequisite for SBIR application.

**Action item:** File the Mississippi LLC today at sos.ms.gov. Get an EIN from the IRS (free, online, same day). Open a business bank account within 1 week.

---

## 6. Insurance Procurement

**Question:** Who writes platform liability policies for construction marketplaces? Need quotes for GL, E&O, and cyber liability.

**Why it matters:** FTW needs insurance before launch to protect against lawsuits from contractor work quality issues, AI estimation errors, and data breaches. Without insurance, a single lawsuit could be existential.

**Options:**
- (A) **Hartford / Hiscox / Next Insurance** — Online business insurance platforms that can quote GL + E&O + cyber in one policy. Fast, often same-day coverage. May not understand marketplace-specific risks.
- (B) **Technology-specific broker** — Brokers like Embroker or Founder Shield specialize in tech startup insurance. Understand marketplace liability. Higher premiums but better coverage.
- (C) **Local Mississippi insurance agent** — Personal relationship, understands local market. May not have experience with tech platform liability.

**Recommended answer:** Get quotes from both (A) Next Insurance (fast, cheap, online) and (B) Embroker (tech-specific). Compare coverage terms, not just price. A policy that excludes "AI-generated professional advice" (which some do) is useless for FTW.

**Additional information needed:** What is FTW's expected annual revenue? (Affects premium.) What is the entity structure? (LLC required for most policies.) What specific coverage limits do SBIR, Innovate MS, or QuickBooks marketplace require?

**Decision deadline:** Before launch — ideally 2 weeks before, to allow time for policy review and any needed adjustments.

**Action item:** Get quotes from Next Insurance and Embroker this month. Ask specifically about: (1) coverage for AI-generated estimation errors (E&O), (2) marketplace platform liability (GL), (3) data breach / cyber liability, (4) minimum premiums for a pre-revenue startup.

---

## 7. Pricing Validation

**Question:** Is $49/mo the right Pro tier price for Oxford, MS contractors? What is their current monthly spend on tools/leads?

**Why it matters:** If $49/mo is too high for the Oxford market, conversion will suffer. If it is too low, FTW leaves money on the table and cannot fund growth. The right price balances contractor willingness to pay with FTW's revenue needs.

**Options:**
- (A) **$49/mo** — Current plan. Competitive with Jobber ($49/mo starter). Requires saving ~1 hour of estimation time to justify ROI.
- (B) **$29/mo** — Lower barrier to entry. Better for price-sensitive small contractors in Mississippi. But requires 70% more subscribers to match $49/mo revenue.
- (C) **$39/mo** — Compromise. Still affordable, higher revenue than $29.
- (D) **$49/mo with annual discount** — $39/mo billed annually ($468/year). Monthly option at $49/mo. Incentivizes commitment.
- (E) **Usage-based pricing** — $5-15 per AI estimate instead of subscription. Lower commitment, but unpredictable revenue.

**Recommended answer:** Launch at $49/mo with an annual discount to $39/mo (Option D). This tests the higher price point while giving price-sensitive contractors an affordable annual option. If conversion is below 5% after 90 days, drop to $39/mo monthly / $29/mo annual.

**Additional information needed:** What do Oxford contractors currently spend monthly on: Thumbtack leads ($50-200/mo typical), QuickBooks subscription ($30-80/mo), other tools? Interview 5 contractors and ask directly: "Would you pay $49/month for a tool that writes your estimates and connects you to homeowners?" Their reaction tells you everything.

**Decision deadline:** Before launch. Pricing must be set before onboarding the first paying contractor.

**Action item:** During the supply seeding outreach (Question 1), ask every contractor about their current monthly tool/lead spend. Document responses. Adjust pricing if the data says $49 is too high.

---

## 8. Entity Structure: LLC vs S-Corp for SBIR

**Question:** Should FTW elect S-Corp tax treatment, and when? This affects how SBIR salary is structured and self-employment tax obligations.

**Why it matters:** An LLC with S-Corp election can save $5,000-15,000/year in self-employment taxes once revenue exceeds ~$40K/year. But it adds complexity: requires W-2 salary to the owner, quarterly payroll filings, and reasonable compensation requirements. For SBIR, the PI salary must be a W-2 if the entity is an S-Corp.

**Options:**
- (A) **Stay as LLC (default).** Simple. All income is self-employment income (subject to 15.3% SE tax). SBIR PI salary is reported on Schedule C.
- (B) **Elect S-Corp (Form 2553).** Pay James a "reasonable salary" via W-2 (subject to payroll taxes). Remaining profit is distributed as dividends (no SE tax). SBIR PI salary must be a W-2, which S-Corp naturally requires.
- (C) **Wait until revenue exceeds $50K/year.** Below $50K, the S-Corp compliance cost (~$1,000-2,000/year for payroll service + CPA) may exceed the tax savings.

**Recommended answer:** Option (C) — File as LLC now, elect S-Corp when annual revenue (including SBIR funds) exceeds $50K. If FTW receives a $275K SBIR Phase 1, that triggers the S-Corp election immediately (PI salary of $80K saves ~$7,000 in SE tax with S-Corp vs. LLC).

**Additional information needed:** Does James have a CPA? If not, find one who understands SBIR grant accounting (this is specialized — not every CPA handles federal grants). What is a "reasonable salary" for a tech founder/PI in Mississippi? ($60K-$80K is typical for SBIR Phase 1.)

**Decision deadline:** Before SBIR application (entity structure must be established). S-Corp election can be made after the LLC is filed, retroactive to the beginning of the tax year if filed within 75 days.

**Action item:** File the LLC now (Question 5). Consult a CPA about S-Corp election timing. If SBIR funding is likely within 12 months, plan for the S-Corp election.

---

## 9. Hiring Timeline

**Question:** When should FTW hire its first employee vs. using contractors? What role is most needed first?

**Why it matters:** James is currently doing everything: development, design, sales, customer support, strategy. This is unsustainable beyond ~50 paying customers. The wrong hire wastes limited capital. The right hire 10x's James's output.

**Options:**
- (A) **First hire: Part-time developer (contractor).** $3,000-5,000/mo for 20 hrs/week. Handles backend development, bug fixes, and DevOps while James focuses on sales and customer relationships.
- (B) **First hire: Part-time customer success / sales (contractor).** $2,000-3,000/mo for 15-20 hrs/week. Handles contractor onboarding, support tickets, and follow-up calls while James focuses on development.
- (C) **First hire: Full-time developer (W-2).** $60,000-80,000/year in Mississippi. Only viable with SBIR funding or $10K+/mo in revenue.
- (D) **No hires until $15K+/mo in revenue.** James does everything. Use AI tools (Claude, Cursor) to multiply development speed. Outsource specific tasks to freelancers (Upwork) as needed.

**Recommended answer:** Option (D) until revenue reaches $10K/mo or SBIR funding is received. Then Option (A) — part-time developer contractor to handle backend while James handles sales and customer relationships. Customer success (Option B) can be partially automated (help docs, canned responses, chatbot) until 200+ customers.

**Additional information needed:** What is James's biggest time bottleneck right now — development, sales, or support? Where does hiring have the highest leverage? Is there someone in James's network (Ole Miss CS grad, local developer) who could be the part-time contractor?

**Decision deadline:** When monthly revenue exceeds $10K/mo OR when SBIR Phase 1 is awarded (whichever comes first).

**Action item:** Start building a candidate pipeline now, even before hiring. Identify 2-3 potential part-time developers (local or remote) who could start within 2 weeks when the time comes.

---

## 10. Patent Strategy

**Question:** Is ConstructionAI patentable? Should FTW file a provisional patent application?

**Why it matters:** If ConstructionAI's estimation methodology is patentable, a provisional patent ($1,500-3,000 with attorney, $150 if self-filed) provides 12 months of "patent pending" protection. This strengthens the SBIR application (reviewers like IP strategy), deters competitors, and increases company valuation. If it is not patentable, spending money on a patent application is wasteful.

**Options:**
- (A) **File a provisional patent application.** Covers: the method of fine-tuning a domain-specific LLM on construction estimation data, the RAG-augmented regional pricing adaptation system, and the composite trust scoring system for contractor verification. Cost: $1,500-3,000 with a patent attorney. Provides 12 months to decide on a full utility patent ($8,000-15,000).
- (B) **Do not file.** Save the money. Rely on trade secrets (training data, model weights, prompt engineering) and speed-to-market as competitive advantages.
- (C) **Defer until SBIR Phase 1.** Budget $5K for patent review in the SBIR proposal. Let SBIR fund the patent search and provisional filing.

**Recommended answer:** Option (C) — defer patent filing until SBIR Phase 1 funding. Include $5K for "IP protection / patent landscape search" in the SBIR budget. Reasons: (1) saves cash now, (2) the SBIR proposal is strengthened by including IP strategy, (3) a patent attorney's landscape search will tell you whether filing is worth it before spending $3K on a provisional.

**Caveat:** If James publicly discloses the ConstructionAI methodology in detail (conference talk, published paper, open-source release) before filing a provisional, he loses the right to patent it (in most countries). The U.S. has a 1-year grace period from first public disclosure, but international rights are lost immediately. Be cautious about what is shared publicly.

**Additional information needed:** Has ConstructionAI's methodology been publicly disclosed in enough detail to enable someone to replicate it? If so, the 1-year U.S. grace period clock is ticking. What does the patent landscape look like for construction estimation AI? (A patent attorney can do a landscape search for $2,000-3,000.)

**Decision deadline:** Before SBIR application (include IP strategy in proposal). If not pursuing SBIR, decide within 6 months of first public disclosure.

**Action item:** Do NOT publish detailed ConstructionAI methodology publicly until patent strategy is decided. Include IP protection line item in SBIR budget. Identify a patent attorney with AI/ML experience (Innovate MS may have referrals).

---

## 11. Exit Strategy

**Question:** What does success look like in 3, 5, and 10 years? Acquisition, IPO, or lifestyle business?

**Why it matters:** The exit strategy determines every major decision: how much to raise, how fast to grow, whether to take VC money, and what metrics to optimize. A lifestyle business optimizes for profit margin and founder quality of life. A VC-backed exit optimizes for growth rate and market share.

**Options:**
- (A) **Lifestyle business.** Target: $500K-$2M annual revenue, 2-5 employees, profitable from year 2. James owns 100%, takes home $150K-$500K/year. No investors, no board, no exit pressure. Grows at a sustainable pace.
- (B) **Strategic acquisition.** Target: Build to $5M-$20M ARR, then sell to a larger player (ServiceTitan, Buildertrend, Intuit, Angi). Typical acquisition multiple for vertical SaaS: 5-10x ARR = $25M-$200M exit. Timeline: 5-7 years.
- (C) **VC-funded growth to IPO.** Target: Raise $5M-$50M in venture capital, scale to $50M+ ARR, IPO or SPAC. Requires giving up 40-70% ownership. Timeline: 7-10 years. Very rare outcome.
- (D) **Hybrid.** Start as lifestyle business (A). If traction warrants it, raise a strategic round and pursue (B) acquisition. Never raise VC money — use SBIR and revenue to fund growth.

**Recommended answer:** Option (D) — Hybrid. Start as a profitable lifestyle business. Use SBIR funding and revenue (not VC) to grow. If FTW reaches $2M+ ARR and a strategic acquirer comes knocking, evaluate the offer. Never raise venture capital unless the opportunity is so large that speed is more important than ownership.

**Rationale:** James has no interest in a 10-year VC grind. SBIR is non-dilutive (James keeps 100% ownership). A profitable $2M ARR business with 80%+ gross margins is worth $10M-$20M to an acquirer — life-changing money without giving up control.

**Additional information needed:** What is James's personal financial target? (This determines when "enough" is enough.) Would James sell FTW if offered $10M? $20M? $50M? The answer shapes growth strategy.

**Decision deadline:** No immediate deadline, but the answer should inform the SBIR commercialization plan and any conversations with Innovate MS mentors.

**Action item:** Write a 1-paragraph "vision statement" for FTW that articulates the 5-year goal. This does not need to be shared externally — it is for James's own clarity when making strategic decisions.

---

## 12. Competitor Response

**Question:** What if Thumbtack launches a construction-specific vertical in the Southeast?

**Why it matters:** Thumbtack has $700M+ in funding, partnerships with ChatGPT/Zillow/Redfin, and 33% YoY growth. If they decide to build construction-specific features (AI estimation, QuickBooks integration, contractor verification), they could replicate FTW's feature set in 6-12 months with 100x the resources.

**Options:**
- (A) **Compete on depth.** Thumbtack will always be a generalist. FTW's construction-specific AI, deep QuickBooks integration, and Mississippi licensing compliance create a moat that is hard to replicate at Thumbtack's scale (they serve 500+ service categories).
- (B) **Compete on price.** Thumbtack charges $15-50 per lead. FTW charges $49/mo flat. For any contractor doing 3+ jobs/month via the platform, FTW is dramatically cheaper. This pricing advantage is structural — Thumbtack's per-lead model is more profitable for them, so they are unlikely to switch to flat-rate SaaS.
- (C) **Compete on trust.** FTW verifies licenses, insurance, and background checks. Thumbtack's verification is weaker (self-reported in many categories). The "FairTrade Promise" (once properly lawyered) creates a brand identity around trust.
- (D) **Pivot to white-label.** If Thumbtack wins the marketplace battle, FTW pivots to selling the ConstructionAI estimation engine and white-label platform (FairEstimator) to other contractors, franchises, and construction companies. The marketplace becomes one distribution channel, not the whole business.

**Recommended answer:** Combine (A) + (B) + (D). Compete on depth and price in the near term. Build the white-label business (FairEstimator) as a hedge. Thumbtack entering construction validates the market — it does not kill FTW. A $500B market has room for a $2M niche player.

**The Craigslist lesson:** Craigslist was the dominant generalist marketplace. It was disrupted not by another generalist but by dozens of vertical specialists: Indeed (jobs), Airbnb (rentals), Turo (cars), Thumbtack (services). The same pattern applies here — Thumbtack is the generalist, and FTW is the construction-specific vertical.

**Additional information needed:** Is Thumbtack already active in Oxford, MS? What do local contractors think of Thumbtack? (Ask during supply seeding outreach.) Are there any signals that Thumbtack is building construction-specific features? (Monitor their product changelog, engineering blog, and job postings.)

**Decision deadline:** Not immediate, but this should be a standing agenda item in quarterly strategy reviews.

**Action item:** Sign up for Thumbtack as a contractor in Oxford, MS. Observe their onboarding, pricing, and feature set firsthand. Track any changes quarterly.

---

## Decision Tracking

| # | Question | Decision | Date Decided | Notes |
|---|----------|----------|-------------|-------|
| 1 | Supply seeding | Pending | — | — |
| 2 | Demand seeding | Pending | — | — |
| 3 | Minimum viable verification | Pending | — | — |
| 4 | QuickBooks marketplace deadline | Pending | — | Contact Intuit this week |
| 5 | Legal entity | Pending | — | File this week |
| 6 | Insurance procurement | Pending | — | Get quotes this month |
| 7 | Pricing validation | Pending | — | Ask during outreach |
| 8 | Entity structure (LLC vs S-Corp) | Pending | — | Consult CPA |
| 9 | Hiring timeline | Pending | — | Revisit at $10K/mo revenue |
| 10 | Patent strategy | Pending | — | Include in SBIR budget |
| 11 | Exit strategy | Pending | — | Write vision statement |
| 12 | Competitor response | Pending | — | Sign up for Thumbtack |

**Action item:** Fill in this table as decisions are made. Revisit any "Pending" items that are past their decision deadline. A decision not made is a decision to do nothing — which is sometimes the worst option.
