# Platform Insurance (Mississippi)

## What FTW Needs

| Policy | Monthly | Annual | Purpose |
|--------|---------|--------|---------|
| General Liability | ~$42 | ~$500 | Basic business operations, slip-and-fall at office |
| Professional Liability (E&O) | ~$51 | ~$612 | AI estimation errors, bad recommendations, data mistakes |
| Cyber Liability | ~$30-50 | ~$360-600 | Data breach, user data protection, platform security |
| **BOP (bundled)** | **~$71** | **~$852** | GL + property in one policy, saves 16-25% vs separate |

## Recommended Approach

- Start with a **Business Owner's Policy (BOP)** at ~$71/mo — bundles GL + property
- Add **E&O** separately at ~$51/mo — critical because ConstructionAI provides estimates that contractors rely on for bids
- Add **Cyber liability** at ~$30-50/mo — you're handling contractor PII, background check data, financial info
- **Total: ~$150-170/month** for full platform coverage
- Get quotes from: TechInsurance, Insureon, NEXT Insurance, Progressive Commercial

## When to Get Insurance

- **Before launch.** Required for SBIR application, contractor agreements, and Intuit marketplace listing.
- E&O is especially important — if ConstructionAI generates a bad estimate and a contractor loses money bidding with it, E&O covers that exposure.

---

## Detailed Coverage Analysis

### General Liability (GL)

**What's covered:**
- Third-party bodily injury (someone slips and falls at your office or a business event)
- Third-party property damage (you accidentally damage someone's property during business operations)
- Personal and advertising injury (defamation, copyright infringement in marketing materials)
- Medical payments for minor injuries (covers small medical bills without a lawsuit)
- Legal defense costs (even if the claim is frivolous, GL pays for lawyers)

**What's excluded:**
- Your own injuries (that's workers' comp)
- Damage to your own property (that's property insurance, included in a BOP)
- Professional errors and omissions (that's E&O — critical gap for FTW)
- Intentional acts (you can't insure against fraud)
- Auto-related incidents (need commercial auto if applicable)
- Employment practices claims (need EPLI if hiring employees)

**Typical limits:**
- $1,000,000 per occurrence / $2,000,000 aggregate — standard for a tech startup
- $5,000-$10,000 deductible
- Higher limits available but cost more — increase when revenue justifies it

**FTW-specific considerations:**
- GL covers the business operations side, not the platform/AI side
- If James attends trade shows, meets contractors at their offices, or hosts any events, GL is essential
- MSBOC may require FTW to carry GL to be listed as a service provider or marketplace

### Professional Liability / Errors & Omissions (E&O)

**What's covered:**
- Claims that FTW's services caused financial harm due to errors, omissions, or negligence
- ConstructionAI estimation errors — if a contractor bids based on an AI estimate that's significantly wrong and loses money
- Bad recommendations — if FTW's matching algorithm connects a homeowner with an inappropriate contractor
- Data errors — if FTW displays incorrect license or verification information
- Failure to perform — if the platform goes down during a critical bidding period and a contractor loses an opportunity
- Legal defense costs for all of the above

**What's excluded:**
- Intentional misconduct or fraud
- Claims arising from bodily injury or property damage (that's GL)
- Claims from criminal acts
- Claims from prior known incidents (things you knew about before buying the policy)
- Contractual liability beyond what the policy specifically covers

**Typical limits:**
- $1,000,000 per claim / $1,000,000 aggregate — standard for a tech company
- $2,500-$5,000 deductible
- "Claims-made" basis — covers claims made during the policy period, regardless of when the error occurred (as long as it's after the retroactive date)

**FTW-specific considerations:**
- This is the most important policy for FTW. ConstructionAI is the core risk — AI-generated estimates that contractors rely on for real bids.
- The TOS should disclaim that estimates are "approximations" and "not professional advice" — but E&O covers you if that disclaimer isn't enough.
- If FTW displays verification badges and a "verified" contractor turns out to have a lapsed license, E&O covers claims from that error.
- Make sure the policy covers "technology services" and "AI-generated content" — some E&O policies are designed for traditional professional services and might exclude tech.

### Cyber Liability

**What's covered:**
- Data breach response costs (forensic investigation, notification of affected users, credit monitoring for affected individuals)
- Regulatory fines and penalties (if a data breach triggers FCRA violations or state notification laws)
- Business interruption from a cyber event (if the platform is taken down by a hack, covers lost revenue)
- Cyber extortion / ransomware payments
- Legal defense costs for privacy-related lawsuits
- Media liability (if user-generated content on the platform causes a defamation claim)
- Third-party claims from customers whose data was compromised

**What's excluded:**
- Loss of intellectual property (trade secrets, proprietary algorithms — not typically covered)
- Infrastructure failures that aren't caused by a cyber event (normal server downtime)
- War and terrorism (standard exclusion)
- Prior known breaches
- Bodily injury or property damage resulting from a cyber event

**Typical limits:**
- $1,000,000 per incident / $1,000,000 aggregate — adequate for launch
- $2,500-$5,000 deductible
- Some policies offer "breach coach" services — a hotline to call immediately when you discover a breach

**FTW-specific considerations:**
- FTW handles highly sensitive data: contractor SSNs (for background checks), financial information (QuickBooks integration), home addresses, license numbers
- A data breach affecting contractor PII could trigger FCRA violation penalties ON TOP of the breach costs
- Mississippi's Data Breach Notification Act (MS Code 75-24-29) requires notification to affected individuals and the Attorney General within a "reasonable time" — cyber insurance covers the cost of compliance
- As FTW scales and handles more data, cyber limits should increase proportionally

### Business Owner's Policy (BOP)

**What's included:**
- General liability (same as standalone GL — see above)
- Commercial property insurance (covers business equipment — laptops, office furniture, servers if applicable)
- Business interruption insurance (covers lost income if your business location becomes unusable due to a covered event — fire, storm, etc.)
- Some BOPs include limited cyber coverage (typically $50K-$100K — not enough for FTW, need standalone cyber on top)

**Why BOP over standalone GL:**
- 16-25% cheaper than buying GL and property insurance separately
- One policy, one bill, one renewal date
- Most insurers recommend BOP for small businesses

---

## Claims Scenarios

### Scenario 1: Contractor Sues FTW

**Situation:** A contractor uses a ConstructionAI estimate to bid on a $50K kitchen remodel. The AI estimate was $35K. The contractor wins the bid at $38K. Actual project cost turns out to be $52K. The contractor loses $14K and sues FTW for providing a negligently inaccurate estimate.

**Insurance response:**
- E&O policy responds. FTW's insurer provides legal defense.
- The TOS disclaimer ("estimates are approximations, not professional advice") is the first line of defense.
- If the court finds FTW negligent despite the disclaimer, E&O covers the settlement or judgment up to policy limits.
- **Prevention:** Strong disclaimer language in TOS and on every estimate output. "This estimate is generated by AI and is an approximation. Always verify with on-site measurements and professional judgment before bidding."

### Scenario 2: Homeowner Sues FTW

**Situation:** A homeowner hires a "verified" contractor through FTW. The contractor does substandard work and causes $20K in property damage. The homeowner sues both the contractor and FTW, arguing that FTW's verification badge constituted a guarantee of quality.

**Insurance response:**
- GL policy responds for the property damage claim against FTW.
- E&O policy responds for the "negligent verification" claim.
- FTW's defense: the TOS explicitly states that verification badges are point-in-time and do not constitute a warranty of contractor quality. FTW is a marketplace, not a guarantor.
- **Prevention:** Verification disclaimer on every contractor profile. TOS section 10 (Verification Disclaimer) is critical.

### Scenario 3: Data Breach

**Situation:** A hacker compromises FTW's database and steals contractor PII — SSNs, driver's license numbers, home addresses, and Checkr background check data for 200 contractors.

**Insurance response:**
- Cyber liability policy responds immediately.
- Covers: forensic investigation ($20K-$50K), legal counsel ($10K-$30K), notification to all 200 affected contractors ($5K-$10K), credit monitoring for affected individuals ($50-$100/person for 12 months = $10K-$20K), regulatory defense if Mississippi AG investigates ($20K+), business interruption if the platform goes offline during remediation.
- Total potential cost: $80K-$200K+ for a breach of this size.
- **Prevention:** Strong security practices, encryption at rest and in transit, regular security audits, AEON scans before launch.

### Scenario 4: Contractor Injury at a FTW Event

**Situation:** FTW hosts a contractor meetup in Oxford. A contractor trips on a cable at the venue and breaks their wrist.

**Insurance response:**
- GL policy responds. Covers medical payments (up to the policy's medical payment limit, typically $5K-$10K without a lawsuit) and legal defense if the contractor sues.
- This is straightforward GL territory.
- **Prevention:** Event liability awareness. Consider requiring venue insurance if hosting events.

---

## Insurance Broker Recommendations

For a tech platform with AI and marketplace components, a specialized tech insurance broker will get better coverage and rates than a generic small business broker.

**Recommended brokers/platforms:**

| Broker | Specialization | How to Get a Quote |
|--------|---------------|-------------------|
| TechInsurance (by Embroker) | Tech companies, SaaS, AI platforms | Online quote in minutes |
| Insureon | Small business + tech, multi-carrier marketplace | Online quote, compares multiple carriers |
| NEXT Insurance | Small business, fast online binding | Online quote, can bind same-day |
| Embroker | Tech startups, AI companies, VC-backed | Online application, advisor follow-up |
| Founder Shield | Startup-focused, understands marketplace models | Custom quote, dedicated advisor |
| Progressive Commercial | General small business, competitive pricing | Online quote |

**What to tell the broker:**
- "We're a two-sided marketplace connecting homeowners with contractors"
- "We use AI to generate construction cost estimates that contractors use for bidding"
- "We run background checks on contractors and display verification badges"
- "We handle contractor PII including SSN data"
- "We process payments through QuickBooks — we don't hold funds"
- "We're launching in Mississippi with plans to expand regionally"

**Get quotes from at least 3 providers.** Coverage terms vary significantly between carriers, especially for AI-related E&O.

---

## How Insurance Requirements Change as FTW Scales

### Phase 1: Launch (0-100 users)

| Policy | Limits | Monthly Cost |
|--------|--------|-------------|
| BOP (GL + Property) | $1M/$2M | ~$71 |
| E&O | $1M/$1M | ~$51 |
| Cyber | $1M/$1M | ~$40 |
| **Total** | | **~$162/month** |

### Phase 2: Growth (100-1,000 users)

| Policy | Limits | Monthly Cost |
|--------|--------|-------------|
| BOP (GL + Property) | $1M/$2M | ~$100 |
| E&O | $2M/$2M | ~$100 |
| Cyber | $2M/$2M | ~$80 |
| Umbrella | $1M | ~$50 |
| **Total** | | **~$330/month** |

**Why costs increase:** More users = more data = more exposure. Insurers price based on revenue, user count, and data volume.

**New coverage needed:**
- Umbrella policy — extends limits on GL and E&O. Relatively cheap for the extra protection.
- Consider Employment Practices Liability Insurance (EPLI) if FTW hires employees.

### Phase 3: Scale (1,000-10,000 users)

| Policy | Limits | Monthly Cost |
|--------|--------|-------------|
| BOP (GL + Property) | $2M/$4M | ~$150 |
| E&O | $5M/$5M | ~$250 |
| Cyber | $5M/$5M | ~$200 |
| Umbrella | $5M | ~$150 |
| EPLI | $1M | ~$100 |
| **Total** | | **~$850/month** |

**Why limits increase:** At 10K users, a single class-action (e.g., data breach affecting all contractors) could exceed $1M easily. Higher limits are necessary.

### Phase 4: National (10,000+ users)

At this scale, insurance becomes a significant line item ($2K-$5K/month). FTW should have a dedicated insurance broker relationship, annual policy reviews, and possibly a risk management function.

---

## D&O Insurance Considerations

**What it is:** Directors & Officers insurance protects the personal assets of company leadership (James, any future co-founders, board members, advisors) from lawsuits alleging wrongful acts in their capacity as company leaders.

**When FTW needs D&O:**
- **Not at launch.** Single-member LLC — James IS the company. GL/E&O cover the business.
- **When FTW takes investment.** Investors (especially VCs and angel investors) will require D&O as a condition of investment. They need to know that if the company is sued, the board members (including investor-appointed board seats) are personally protected.
- **When FTW has a board.** If FTW converts to a C-Corp and establishes a formal board of directors, D&O is standard.
- **When FTW has advisors.** Formal advisors with fiduciary responsibilities should be covered.

**Typical D&O costs for a startup:**
- $2,000-$5,000/year for $1M in coverage
- $5,000-$15,000/year for $5M in coverage
- Pricing depends heavily on industry, revenue, and claims history

**What D&O covers:**
- Allegations of mismanagement, breach of fiduciary duty, failure to comply with regulations
- Securities claims (if FTW raises money and investors allege misrepresentation)
- Employment claims (wrongful termination, discrimination — overlaps with EPLI)
- Regulatory investigations
- Legal defense costs for all of the above

**What D&O does NOT cover:**
- Fraud or intentional illegal acts
- Bodily injury or property damage (that's GL)
- Professional errors (that's E&O)
- Known prior claims

---

## Insurance Checklist Before Launch

- [ ] Get BOP quotes from 3+ providers
- [ ] Get E&O quotes — confirm the policy covers "AI-generated professional services" and "technology platform errors"
- [ ] Get cyber liability quotes — confirm coverage for FCRA-related data (SSN, background check data)
- [ ] Bind BOP + E&O + Cyber before any contractor signs up
- [ ] Add MSBOC as certificate holder on GL (if required for marketplace listing)
- [ ] Add Intuit/QuickBooks as additional insured (if required for marketplace partnership)
- [ ] Save all policy documents in a secure, backed-up location
- [ ] Set calendar reminders for renewal dates (policies are typically annual)
- [ ] Review coverage limits annually as user count and revenue grow
