# Verification Stack

## Overview

FTW's verification system establishes trust between contractors and homeowners. The stack combines identity verification, background checks, license confirmation, and insurance validation into a unified "Verified Contractor" badge. The system is designed to be thorough without creating onboarding friction — verification happens progressively, not as a gate.

## Complete Verification Flow

```
Signup
  |
  v
[Screen 1] Account created (Google/Apple/email)
  |
  v
[Screen 2] Basic profile (name, trade, service area)
  |
  v
[Screen 3] AI estimate demo (aha moment — no verification needed)
  |
  v
[Screen 5] Verification prompt (optional, can skip)
  |
  |--- If user starts verification:
  |      |
  |      v
  |    [Step A] Persona ID verification (60 seconds)
  |      |--- Upload government-issued ID (front + back)
  |      |--- Selfie capture with liveness check
  |      |--- Automated matching: selfie vs ID photo
  |      |--- Result: PASS / FAIL / NEEDS_REVIEW (webhook within seconds)
  |      |
  |      v
  |    [Step B] License upload
  |      |--- Contractor uploads license photo or enters license number
  |      |--- FTW team does MSBOC lookup (manual at launch)
  |      |--- Result: VERIFIED / UNVERIFIED / PENDING_REVIEW
  |      |
  |      v
  |    [Step C] Insurance upload
  |      |--- Upload certificate of insurance (COI)
  |      |--- Validate: policy active, coverage amounts, expiration date
  |      |--- Set expiration reminder for re-verification
  |      |
  |      v
  |    [Step D] Background check (triggered after first bid or job acceptance)
  |      |--- Checkr invitation sent via email
  |      |--- Candidate completes Checkr flow (SSN, consent)
  |      |--- Checkr processes and returns results via webhook
  |      |--- Result: CLEAR / CONSIDER / SUSPENDED
  |      |
  |      v
  |    All 4 steps complete = "Verified Contractor" badge
  |
  |--- If user skips:
         |
         v
       Dashboard shows "Complete Verification" progress bar
       Periodic prompts: "Verified contractors get 3x more jobs"
       Badge remains absent until all steps complete
```

## Checkr API Integration

### Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/candidates` | Create a candidate record (name, email, DOB, SSN) |
| `POST /v1/invitations` | Send background check invitation to candidate's email |
| `GET /v1/reports/{id}` | Retrieve completed report |
| `GET /v1/candidates/{id}` | Get candidate status |

### Webhook Flow

1. FTW creates a candidate via `POST /v1/candidates` with contractor's name, email, and DOB.
2. FTW creates an invitation via `POST /v1/invitations` with the candidate ID and package slug (`tasker_standard` for Basic+).
3. Checkr sends the contractor an email with a link to complete the check (SSN entry, consent form).
4. Contractor completes the Checkr flow (takes 2-5 minutes on their end).
5. Checkr processes the check (24-48 hours typical).
6. Checkr sends a webhook to FTW's endpoint (`POST /api/webhooks/checkr`) with the event type:
   - `report.completed` — check finished, results available
   - `report.upgraded` — initial result was "consider," now cleared after review
   - `report.suspended` — adverse information found, needs adjudication
7. FTW receives the webhook, fetches the full report via `GET /v1/reports/{id}`.
8. FTW updates the contractor's verification status in the database.

### Data Returned by Checkr

- **SSN Trace:** Validates SSN, returns associated addresses and aliases
- **National Criminal Search:** Multi-jurisdiction criminal records
- **Sex Offender Registry:** National sex offender registry check
- **Global Watchlist:** OFAC, FBI, Interpol, and other watchlists
- **County Criminal (if added):** County-level court records for addresses found in SSN trace
- **MVR (if added):** Driving record — relevant for contractors who drive to job sites

### Adjudication

When Checkr returns a `consider` status (records found but not necessarily disqualifying), FTW must make an adjudication decision. Policy:
- Misdemeanors older than 7 years: auto-clear
- Felonies: manual review by FTW team
- Sex offenses: automatic rejection
- DUI (recent, within 3 years): flag but don't reject — relevant for driving-related trades
- Follow FCRA adverse action process if rejecting based on background check results

## Persona Integration

### Document Types Accepted

- US Driver's License (all states)
- US State ID
- US Passport
- US Passport Card
- US Permanent Resident Card (Green Card)
- US Employment Authorization Document (EAD)

### Verification Process

1. **Document capture:** User photographs front and back of government ID using phone camera.
2. **OCR extraction:** Persona extracts name, DOB, address, expiration date, document number.
3. **Document authenticity:** AI checks for tampering, photoshop, reprints, and known fake templates.
4. **Selfie capture:** User takes a live selfie through the Persona SDK.
5. **Liveness detection:** Persona confirms the selfie is a live person (not a photo of a photo, not a screen recording, not a mask). Uses motion prompts (turn head, blink).
6. **Face matching:** AI compares selfie to ID photo. Returns a confidence score (threshold: 80%+).
7. **Result:** Webhook fires to FTW with `inquiry.completed` event containing verification status: `approved`, `declined`, or `needs_review`.

### Persona SDK Integration

- Use Persona's embedded flow (JavaScript SDK) for web, React Native SDK for mobile
- Branded with FTW colors and logo
- Average completion time: 60-90 seconds
- Free tier: 500 verifications/month (sufficient through first 500 contractors)

## MSBOC License Verification

### Current Process (Manual)

1. Contractor enters their Mississippi State Board of Contractors license number during onboarding.
2. FTW team member navigates to msboc.us and searches for the license number.
3. Verify: license holder name matches contractor's name, license is active (not expired/revoked), classification matches stated trade.
4. Record the license type, classification, and expiration date in FTW's database.
5. Mark verification status as VERIFIED or UNVERIFIED.

### Future Automation

- **Phase 1 (launch):** Manual lookup. Estimated time per verification: 3-5 minutes. Sustainable up to ~50 contractors/week.
- **Phase 2 (100+ contractors):** Build a scraper for msboc.us using Playwright or Puppeteer. Automate the lookup: input license number, parse results page, extract status and classification.
- **Phase 3 (scale):** Contact MSBOC about API access or data licensing. Some state boards offer bulk data exports. If no API exists, maintain the scraper with monitoring for site changes.

### Mississippi License Classifications

| Classification | Description |
|---------------|-------------|
| Residential Builder | General residential construction |
| Commercial Builder | Commercial construction |
| Residential Remodeler | Renovation and remodeling work |
| Heating & AC | HVAC installation and repair |
| Electrical | Electrical work |
| Plumbing | Plumbing installation and repair |
| Roofing | Roof installation and repair |

Note: Mississippi requires a license for any project over $10,000. Contractors working on smaller projects may be legitimate but unlicensed. FTW should accommodate both — verified-licensed and verified-identity-only — with different badge levels.

## Insurance Verification

### Documents Accepted

- Certificate of Insurance (COI) — the standard document. Shows carrier, policy number, coverage limits, effective/expiration dates.
- Policy declarations page — accepted as alternative if COI is not available.
- Insurance binder — accepted for new policies not yet fully issued.

### Validation Process

1. Contractor uploads COI photo or PDF.
2. OCR extracts: carrier name, policy number, effective date, expiration date, coverage amounts.
3. Verify coverage meets FTW minimums:
   - General liability: $500,000 minimum (recommended $1M)
   - Workers' compensation: required if contractor has employees (Mississippi law requires WC for 5+ employees)
4. Store expiration date and set automated reminder at 30 days before expiry.
5. Mark insurance as VERIFIED.

### Ongoing Monitoring

- 30-day pre-expiration email to contractor: "Your insurance expires on [date]. Upload your new COI to keep your Verified badge."
- 7-day pre-expiration: second reminder.
- On expiration date: badge downgraded to "Partially Verified." Contractor profile shows "Insurance expired."
- 30 days after expiration with no update: verification revoked entirely for the insurance component.

## Verification Badges and What They Mean

### Badge Levels

| Badge | Requirements | Display |
|-------|-------------|---------|
| **Identity Verified** | Persona ID check passed | Small shield icon, gray |
| **Licensed** | MSBOC license confirmed active | Small shield icon, blue |
| **Fully Verified** | All 4 checks complete (ID + license + insurance + background) | Large green shield with checkmark |

### What Homeowners See

- **Fully Verified** badge appears prominently on contractor cards in search results and on profile pages
- Hovering/tapping the badge shows: "This contractor has passed a background check, verified their identity, confirmed an active Mississippi contractor's license, and provided proof of insurance."
- Unverified contractors appear lower in search results (not hidden, just ranked lower)
- Homeowners can filter search results to show only Fully Verified contractors

## Cost Optimization Strategies

### Launch Phase (0-500 contractors)

| Step | Tool | Cost | Strategy |
|------|------|------|----------|
| Identity | Persona free tier | $0 | 500/month free. Sufficient for launch. |
| License | MSBOC manual lookup | $0 (labor) | James or team does manual lookups |
| Insurance | Manual upload + OCR | $0 | Manual review at launch |
| Background | Checkr Basic+ | $29.99/each | **Delay until first real engagement** |

**Key cost optimization:** Don't trigger the $30 Checkr background check at signup. Wait until the contractor submits their first bid or accepts their first job. This eliminates paying for background checks on users who sign up and never return. At a 40% Day-7 retention rate, this saves $18/abandoned-user.

### Growth Phase (500-5,000 contractors)

- Negotiate Checkr volume pricing at 300+ checks/year (typically 20-30% discount)
- Move to Persona Essential plan ($250/month) when exceeding 500 verifications/month
- Automate MSBOC lookup with scraper to eliminate manual labor
- Consider TrustLayer for automated insurance tracking ($TBD, volume-dependent)

### Scale Phase (5,000+ contractors)

- Checkr enterprise pricing (custom, significant volume discounts)
- Persona Growth plan with custom pricing
- Fully automated verification pipeline — no manual steps
- Re-verification automation: annual background check refresh, insurance monitoring, license expiration tracking

## Total Verification Cost Per Contractor

| Phase | Cost Per Contractor | Notes |
|-------|-------------------|-------|
| Launch | ~$30-40 | Persona free, Checkr $29.99, manual labor for license/insurance |
| Growth | ~$25-35 | Volume Checkr discount, automated license lookup |
| Scale | ~$15-25 | Enterprise pricing across all vendors |
