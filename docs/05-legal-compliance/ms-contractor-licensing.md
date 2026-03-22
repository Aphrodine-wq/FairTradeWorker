# Mississippi Contractor Licensing (MSBOC)

## Authority

Mississippi State Board of Contractors (msboc.us) — the sole licensing authority for contractors in Mississippi.

---

## License Types: Full Breakdown

### Residential Builder (RB)

- **What it covers:** New construction of residential structures (single-family homes, duplexes, townhomes)
- **Threshold:** Required for residential construction projects valued at $50,000 or more
- **Scope:** Includes all aspects of new home construction — foundation, framing, roofing, electrical, plumbing (if the builder's scope includes these), finishes
- **Who needs it:** General contractors building new homes, custom home builders, production home builders
- **Does NOT cover:** Commercial construction, remodeling/renovation of existing structures (that requires Residential Remodeling)

### Residential Remodeling (RR)

- **What it covers:** Renovation, remodeling, repair, or improvement of existing residential structures
- **Threshold:** Required for residential remodeling projects valued at $10,000 or more
- **Scope:** Kitchen and bath remodels, room additions, structural modifications, interior renovations, exterior improvements (siding, windows, doors)
- **Who needs it:** Remodeling contractors, renovation companies, addition builders
- **Does NOT cover:** New construction (requires Residential Builder), standalone roofing (requires Roofing license), commercial work

### Roofing (RF)

- **What it covers:** Installation, repair, or replacement of roofing systems on residential and commercial structures
- **Threshold:** Required for roofing projects valued at $10,000 or more
- **Scope:** All roofing work — shingles, metal roofing, flat roofing, tear-off, underlayment, flashing, gutters when performed as part of a roofing project
- **Who needs it:** Roofing contractors, roofing companies
- **Note:** A Residential Builder or Commercial contractor license does NOT automatically cover roofing — a separate Roofing license is required if roofing is the primary scope of work

### Commercial (Various Classifications)

- **What it covers:** Construction, renovation, and repair of commercial, industrial, and public structures
- **Threshold:** Required for commercial projects valued at $50,000 or more
- **Classifications:** Commercial contractors are classified by specialty (general building, highway/heavy, mechanical, electrical, plumbing, etc.)
- **Who needs it:** Commercial GCs, specialty subcontractors on commercial projects
- **Relevance to FTW:** Most FTW contractors at launch will be residential. Commercial licensing matters as FTW scales into commercial construction.

### Exemptions (No License Required)

- Residential remodeling projects under $10,000 in total value
- Owner-occupied homeowner performing work on their own property
- Regular employees of a licensed contractor (they work under the contractor's license)
- Specialty work covered by other state boards (electrical, plumbing, and HVAC have separate licensing through the Mississippi State Board of Contractors but under different classification requirements)

---

## Application Requirements

- Notarized application form (available on msboc.us)
- LLC or Corporation registered with the Mississippi Secretary of State
- Mississippi income tax ID or federal tax ID (EIN)
- Certificate of general liability insurance — MSBOC must be listed as certificate holder and notified if coverage lapses
- Workers' compensation insurance if employing 5 or more people
- 3 reference letters: 1 from a bank/financial institution, 2 from construction industry references
- 3 project examples in the relevant field (completed projects with scope, value, and client contact info)
- Financial statement showing adequate working capital for the license classification requested

## Exam Content and Preparation

- **Format:** Written exam administered at MSBOC offices in Jackson, MS or approved testing centers
- **Content areas:**
  - Business and financial management (contracts, estimating, accounting)
  - Mississippi construction law and regulations
  - Building codes (International Residential Code for residential licenses)
  - Safety and OSHA requirements
  - Trade-specific knowledge (varies by license type)
- **Preparation resources:**
  - MSBOC provides a study guide outline on their website
  - Contractor exam prep courses available through third parties (e.g., Contractor Training Center, PSI exam prep)
  - Mississippi-specific law sections are the most commonly failed portion — study MS Code Title 73, Chapter 59
- **Passing score:** 70% on each section
- **Retake policy:** If a section is failed, it can be retaken after 30 days

## Fees

| Item | Cost |
|------|------|
| Application fee | $50 |
| Exam fee (per section) | $120 |
| License issuance | Included in application |
| Annual renewal | $150 (due on anniversary of issuance) |
| Late renewal penalty | $50 + potential license suspension |
| Reinstatement (after lapse) | $200 + may require re-examination |

## Timeline

- Application review: 2-4 weeks after submission
- Exam scheduling: After application approval, scheduled at next available date
- License issuance: 7-10 days after passing exam
- 2026 change: Renewal notices are now sent by email only — contractors must keep their email current with MSBOC

---

## Reciprocity with Other States

Mississippi has **limited** reciprocity agreements:
- Mississippi does NOT have blanket reciprocity with any state for contractor licensing
- Some license classifications may have reciprocal agreements with specific states — check with MSBOC for current agreements
- Contractors licensed in other states must still apply through MSBOC but may be eligible for exam waivers on certain sections
- Alabama, Louisiana, Tennessee, and Arkansas contractors most commonly seek Mississippi licensure — none have automatic reciprocity
- **For FTW:** This means contractors moving into the Oxford market from Memphis or other border areas need to obtain a Mississippi license separately. FTW should flag this in the onboarding flow for out-of-state contractors.

---

## What Happens When a License Lapses

| Situation | Consequence |
|-----------|------------|
| License expired < 1 year | Can renew with late fee ($50 penalty). No re-examination required. |
| License expired 1-3 years | Must apply for reinstatement ($200). May require updated references and financial statement. Re-examination may be required at MSBOC discretion. |
| License expired > 3 years | Must apply as a new applicant. Full application, references, and examination required. |
| License revoked by MSBOC | Cannot reapply for a minimum period set by MSBOC (typically 1-5 years depending on violation). |
| Insurance lapse (notified by insurer) | MSBOC may suspend the license until proof of coverage is restored. Contractor must cease licensed work immediately. |

---

## How FTW Verifies Licenses

### Current Process (Manual)

1. Contractor enters their MSBOC license number during onboarding
2. FTW staff manually verifies the license against the MSBOC online lookup tool (msboc.us)
3. Verification checks: license number matches contractor name, license type covers their stated trade, license is current (not expired/suspended/revoked)
4. If verified, contractor receives a "Licensed" badge on their profile
5. Verification is point-in-time — badge reflects status at the time of check

### Future Automation

1. **MSBOC API integration (if available):** Query the MSBOC database programmatically during onboarding. Auto-verify in real time.
2. **Periodic re-verification:** Run an automated check monthly or quarterly against the MSBOC database. If a license has lapsed, auto-remove the badge and notify the contractor.
3. **Lapse alerts:** If MSBOC publishes a feed of lapsed/revoked licenses, integrate it for real-time badge removal.
4. **Multi-state support:** As FTW expands beyond Mississippi, build a verification layer that queries the appropriate state licensing board for each contractor's state.

### Verification Display on Platform

- "Licensed" badge on contractor profile — green checkmark icon
- License type shown (e.g., "Residential Remodeling - RR")
- License number displayed (e.g., "MSBOC #12345")
- "Verified [date]" timestamp
- Disclaimer: "License verified as of [date]. Verify independently at msboc.us for current status."

---

## Penalties for Unlicensed Work in Mississippi

Mississippi takes unlicensed contracting seriously:

| Violation | Penalty |
|-----------|---------|
| Performing work requiring a license without one | Misdemeanor: up to $5,000 fine and/or up to 6 months in county jail |
| Advertising services that require a license without holding one | Same as above |
| Aiding or abetting unlicensed work | Subject to MSBOC investigation and potential civil penalties |
| Repeat offense | Felony: up to $10,000 fine and/or up to 2 years in state prison |
| Contract enforceability | Contracts entered into by unlicensed contractors may be void and unenforceable — the contractor cannot sue for payment |

---

## How This Affects FTW's Marketplace

### Should FTW Allow Unlicensed Contractors for Sub-$10K Jobs?

Mississippi law does not require a license for residential remodeling projects under $10,000. This creates a policy decision for FTW:

**Arguments for allowing unlicensed contractors (sub-$10K):**
- It's legal in Mississippi — no license required for small jobs
- Many excellent handymen and small-job specialists don't have MSBOC licenses
- Excluding them reduces supply-side density, especially at launch
- High-volume, low-value jobs (painting a room, minor repairs, fence work) are a large segment of homeowner demand

**Arguments against allowing unlicensed contractors:**
- FTW's brand is built on trust and verification — "unlicensed" undermines the FairTrade Promise
- Homeowners may not understand the threshold — they might assume all FTW contractors are licensed
- Liability risk: if an unlicensed contractor causes damage, FTW's platform facilitated the connection
- It complicates the verification workflow — FTW would need a separate "Handyman" tier with different rules

**Recommended approach:**
- Allow unlicensed contractors for jobs where Mississippi law does not require a license (under $10K residential remodeling)
- Display them differently: "Verified Handyman" badge instead of "Licensed Contractor" badge
- Require: general liability insurance, background check, and references (even though MSBOC doesn't require a license)
- Clearly state on their profile: "Not MSBOC licensed — suitable for projects under $10,000"
- This preserves supply-side density while maintaining transparency
- **Get lawyer approval on this approach before implementing**
