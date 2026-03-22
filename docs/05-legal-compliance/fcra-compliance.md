# FCRA Compliance (Background Checks)

FTW runs background checks on contractors via Checkr. The Fair Credit Reporting Act (FCRA) applies to FTW even though contractors aren't employees. Any entity that uses consumer reports to make decisions about a person — including granting platform access or displaying verification badges — must comply with FCRA.

---

## Key Requirements

1. **Disclosure:** Must provide clear written disclosure BEFORE running a background check. Must be a standalone document (not buried in TOS).
2. **Authorization:** Must obtain written consent from the contractor. Digital signature counts.
3. **FCRA applies to contractors.** Not just employees — anyone being vetted for a position, including independent contractors, freelancers, and platform participants.
4. **Adverse action process:** If FTW denies verification based on background check results:
   - Must send pre-adverse action notice with copy of the report
   - Must allow time for contractor to review/dispute
   - Must send final adverse action notice if decision stands
5. **State-specific rules:** Mississippi may have additional reporting limitations beyond federal FCRA.
6. **FTW as a CRA:** If FTW is providing contractor verification information to homeowners (even via badges), FTW may qualify as a Consumer Reporting Agency under FCRA.

---

## Disclosure Template (Standalone Document)

This must be presented as its own page/screen in the contractor onboarding flow — NOT part of the Terms of Service, NOT combined with any other agreements.

> **DISCLOSURE REGARDING BACKGROUND INVESTIGATION**
>
> FairTradeWorker, LLC ("FTW") may obtain a consumer report and/or investigative consumer report about you from a consumer reporting agency in connection with your application for verification on the FairTradeWorker platform. This report may include information about your criminal history, motor vehicle records, civil court records, and other background information.
>
> Under the Fair Credit Reporting Act (15 U.S.C. Section 1681 et seq.), you have the right to:
>
> - Be informed that a consumer report may be obtained for platform verification purposes;
> - Request a complete and accurate disclosure of the nature and scope of the investigation;
> - Request a written summary of your rights under the FCRA (provided with this disclosure);
> - Dispute the accuracy or completeness of any information in your consumer report.
>
> A summary of your rights under the Fair Credit Reporting Act is attached to this disclosure.

**Important:** The "Summary of Your Rights Under the FCRA" is a standardized document provided by the CFPB. It must be attached or provided alongside the disclosure. Checkr typically provides this automatically.

---

## Authorization Form Requirements

The authorization must be obtained AFTER the disclosure is presented and BEFORE the background check is initiated.

> **AUTHORIZATION FOR BACKGROUND INVESTIGATION**
>
> I, [Contractor Full Legal Name], hereby authorize FairTradeWorker, LLC to obtain a consumer report and/or investigative consumer report about me from Checkr, Inc. or another consumer reporting agency. I understand this report may include information about my criminal history, motor vehicle records, civil court records, and other background information.
>
> I acknowledge that I have received and reviewed the Disclosure Regarding Background Investigation and the Summary of My Rights Under the Fair Credit Reporting Act.
>
> I understand that I may request a copy of the consumer report obtained about me.
>
> Signature: _________________________ (digital signature accepted)
> Date: _________________________
> Full Legal Name: _________________________
> Date of Birth: _________________________
> Social Security Number (last 4): _________________________

**Technical implementation:** The onboarding flow must:
1. Display the disclosure as a standalone screen (no other content on the page)
2. Require the contractor to scroll through / acknowledge reading it
3. Present the authorization form as the next screen
4. Collect a digital signature (typed name + checkbox + timestamp counts under E-SIGN Act)
5. Store the signed authorization with timestamp, IP address, and the version of disclosure presented
6. Only AFTER authorization is completed, submit the background check request to Checkr

---

## Adverse Action Process and Timing

If FTW denies platform verification (or removes a verification badge) based on background check results:

### Step 1: Pre-Adverse Action Notice (Before Final Decision)

**Timing:** Must be sent BEFORE the final denial decision is made. The contractor must have a reasonable opportunity to review and dispute.

> **PRE-ADVERSE ACTION NOTICE**
>
> Dear [Contractor Name],
>
> FairTradeWorker, LLC is considering taking adverse action regarding your verification status on our platform based, in whole or in part, on information contained in a consumer report obtained from:
>
> Checkr, Inc.
> 2880 Lakeside Drive, Suite 200
> Santa Clara, CA 95054
> (844) 824-3257
>
> Please find enclosed:
> - A copy of the consumer report used in this evaluation
> - A copy of "A Summary of Your Rights Under the Fair Credit Reporting Act"
>
> Checkr, Inc. did not make this decision and cannot explain why it was made. You have the right to dispute the accuracy or completeness of any information in the report directly with Checkr.
>
> You have [5 business days] from receipt of this notice to contact us or dispute the report before a final decision is made.
>
> Sincerely,
> FairTradeWorker, LLC

### Step 2: Waiting Period

**Federal minimum:** The FCRA does not specify an exact number of days, but the FTC has indicated that 5 business days is a "reasonable" waiting period. Some courts have accepted less (3 business days).

**Recommendation for FTW:** 5 business days. This is the safest defensible period.

### Step 3: Final Adverse Action Notice (After Waiting Period Expires)

If the contractor does not dispute, or if the dispute does not change the results:

> **ADVERSE ACTION NOTICE**
>
> Dear [Contractor Name],
>
> FairTradeWorker, LLC has made a final decision to [deny your verification / revoke your verification badge / restrict your platform access] based, in whole or in part, on information contained in a consumer report obtained from:
>
> Checkr, Inc.
> 2880 Lakeside Drive, Suite 200
> Santa Clara, CA 95054
> (844) 824-3257
>
> Checkr, Inc. did not make this decision and cannot explain why it was made.
>
> Under the Fair Credit Reporting Act, you have the right to:
> - Obtain a free copy of your consumer report from Checkr within 60 days of this notice
> - Dispute the accuracy or completeness of any information in the report with Checkr
> - Submit a statement of dispute to be included in your file
>
> If you believe the information in the report is inaccurate, you may contact Checkr directly at (844) 824-3257 or support@checkr.com.
>
> Sincerely,
> FairTradeWorker, LLC

---

## Penalties for FCRA Violations

FCRA violations carry serious financial exposure:

| Violation Type | Statutory Damages | Punitive Damages | Attorney's Fees |
|---------------|-------------------|-------------------|-----------------|
| Negligent violation | $100 - $1,000 per violation | Not available | Awarded to prevailing plaintiff |
| Willful violation | $100 - $1,000 per violation | Uncapped (jury discretion) | Awarded to prevailing plaintiff |
| Class action (negligent) | Lesser of $500K or 1% of net worth | Not available | Awarded |
| Class action (willful) | Same statutory range per person | Uncapped | Awarded |

**Real-world examples of FCRA settlements:**
- Uber paid $7.5M for FCRA violations in background check process (2018)
- Dollar General paid $6M for failing to provide pre-adverse action notices (2019)
- Amazon paid $8.2M for background check process violations (2020)

**The most common violations** that trigger lawsuits:
- Disclosure was not a standalone document (it was buried in the application or TOS)
- Pre-adverse action notice was not sent before denial
- Waiting period was too short between pre-adverse and final adverse action
- Authorization form included extraneous information (waivers, liability releases mixed in)

---

## Mississippi-Specific Additions

Mississippi does not have a comprehensive state-level FCRA equivalent, but the following apply:

- **Mississippi Code 79-13-1 (Consumer Protection):** General consumer protection statutes apply to background check practices
- **Ban-the-box:** Mississippi does NOT have a statewide ban-the-box law. FTW can ask about criminal history during onboarding. However, individual municipalities may have local ordinances — check Oxford specifically.
- **Expungement:** Mississippi allows expungement of certain misdemeanor and felony records (Mississippi Code 99-19-71). If a contractor's record has been expunged, it should not appear on a Checkr report. If it does, FTW should not use it.
- **Reporting limitations:** Mississippi follows federal FCRA reporting limits — most criminal convictions can be reported for 7 years. Arrests that did not result in conviction cannot be reported after 7 years.

---

## Does FTW Qualify as a Consumer Reporting Agency (CRA)?

### The Analysis

Under FCRA (15 U.S.C. 1681a(f)), a CRA is any entity that "regularly engages in whole or in part in the practice of assembling or evaluating consumer credit information or other information on consumers for the purpose of furnishing consumer reports to third parties."

**Arguments that FTW IS a CRA:**
- FTW collects background check data and license verification data on contractors
- FTW displays verification badges, ratings, and reviews to homeowners (third parties)
- Homeowners use this information to make hiring decisions
- FTW is effectively "assembling information on consumers and furnishing it to third parties"

**Arguments that FTW is NOT a CRA:**
- FTW does not sell consumer reports to anyone
- Verification badges are binary (verified/not verified) — not detailed reports
- FTW's primary purpose is marketplace facilitation, not data assembly
- Homeowners are not "requesting reports" — they're browsing a marketplace

**Most likely answer:** FTW is in a gray area. Platforms like Uber and Airbnb have been challenged on this question. The safest approach is to behave AS IF FTW is a CRA — maintain accuracy, provide dispute mechanisms, follow FCRA fully — even if a court might ultimately rule otherwise.

### What CRA Status Would Require (If Applicable)

- Maintain "reasonable procedures to assure maximum possible accuracy" of all contractor verification data
- Provide a formal dispute resolution process — contractors must be able to dispute any information displayed about them
- Only share verification information for "permissible purposes" under FCRA
- Respond to disputes within 30 days
- Delete or correct inaccurate information promptly

---

## Recommended Compliance Workflow

### Onboarding Flow (Technical Implementation)

```
Contractor creates account
         |
         v
Step 1: Profile information (name, trade, service area)
         |
         v
Step 2: FCRA Disclosure (standalone screen, no other content)
         |
         v
Step 3: FCRA Authorization (digital signature + timestamp + IP)
         |
         v
Step 4: Checkr background check initiated
         |
    [3-7 days processing]
         |
         v
Step 5a: Check passes --> Verification badge applied, profile goes live
         |
Step 5b: Check has findings --> Pre-adverse action notice sent
         |
    [5 business days waiting period]
         |
         v
Step 6a: Contractor disputes --> Checkr reinvestigates (30 days)
         |
Step 6b: No dispute --> Final adverse action notice sent, verification denied
         |
         v
Step 7: Contractor can still use FTW tools (estimation, project management)
        but does not receive verification badge and may have restricted
        marketplace visibility
```

### Ongoing Compliance

- Re-run background checks annually for verified contractors (or when license renewal is due)
- Monitor for changes in FCRA case law — this area evolves
- Maintain an audit log of every disclosure, authorization, adverse action notice, and dispute
- Store all FCRA-related documents for at least 5 years after the contractor's last activity on the platform

### Lawyer Checklist

Before launch, a lawyer needs to:
- [ ] Review and approve the disclosure document
- [ ] Review and approve the authorization form
- [ ] Review and approve the pre-adverse action notice template
- [ ] Review and approve the final adverse action notice template
- [ ] Confirm whether FTW qualifies as a CRA under current case law
- [ ] Review the technical onboarding flow for compliance
- [ ] Confirm Mississippi-specific requirements are met
- [ ] Advise on dispute resolution procedures
- [ ] Confirm E-SIGN Act compliance for digital signatures
