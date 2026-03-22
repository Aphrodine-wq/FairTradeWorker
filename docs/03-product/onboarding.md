# Onboarding Strategy

## Benchmark Statistics

- **74%** of potential customers switch to alternatives if onboarding is complicated
- **70%** abandon completely if digital onboarding takes longer than **20 minutes**
- Every extra form field is a conversion leak
- Social login (Google/Apple) = **60% higher** onboarding completion rates
- Industry average onboarding completion rate for B2B SaaS: 25-40%. FTW target: 65%+.

## What Makes Contractors Join

- "Are people like me succeeding here?" — testimonials, real income snapshots, success stories
- Time-to-first-value must be short — contractor needs to feel the tool is useful within minutes
- The "aha moment" (when value becomes personally obvious) determines retention
- Contractors trust other contractors. Peer endorsement outweighs marketing copy 10:1.

## The Aha Moment

The aha moment for FTW is **the first AI estimate**. When a contractor describes a job in plain English and gets back a detailed, line-item estimate in under 30 seconds, that is the moment they understand the platform's value. Every onboarding decision should be oriented toward getting the user to this moment as fast as possible.

- **Contractors:** First AI estimate generated (target: within 5 minutes of signup)
- **Homeowners:** First contractor match returned with verified badges and AI price range (target: within 3 minutes of posting a job)

## Contractor Onboarding Flow (Screen by Screen)

### Screen 1: Welcome + Social Login
- Headline: "Join 200+ Mississippi contractors already using FTW"
- Google/Apple sign-in buttons (primary), email/password (secondary)
- Single tap to create account. No forms on this screen.

### Screen 2: Basic Profile
- Business name (text field)
- Primary trade (dropdown: General, Electrical, Plumbing, HVAC, Roofing, etc.)
- Years of experience (slider: 1-30+)
- Service area (zip code entry, radius selector)
- Skip button visible — they can fill this in later

### Screen 3: Try the AI Estimate (The Aha Moment)
- Headline: "See what FTW can do — describe any job"
- Voice or text input: "2,000 sq ft kitchen remodel, granite countertops, new cabinets"
- AI estimate generates in real time, line items appear as they stream in
- Show the estimate value, material breakdown, labor hours
- This is the hook. Everything before this screen is just clearing the path.

### Screen 4: Subscription Selection
- Show Free, Pro ($49/mo), and Enterprise tiers
- Free tier gives limited access (3 estimates/month, basic profile)
- Pro tier highlighted as "Most Popular" — unlimited estimates, QuickBooks sync, priority matching
- 14-day free trial on Pro. No credit card required to start trial.

### Screen 5: Verification Prompt (Not Required)
- Headline: "Get the Verified badge — homeowners hire verified contractors 3x more"
- Show what the verified badge looks like next to their profile
- Three verification steps listed: ID verification, license upload, insurance upload
- "Do this later" button is prominent. No gates here.
- Background check happens after first real tool usage (see verification-stack.md)

### Screen 6: Dashboard
- Contractor lands on their dashboard with:
  - The estimate they just generated, saved to their account
  - A "Complete your profile" progress bar (60% complete at this point)
  - Nearby job feed showing real (or seeded) jobs in their area
  - Quick action buttons: "Create Estimate," "Browse Jobs," "Set Up QuickBooks"

## Homeowner Onboarding Flow (Screen by Screen)

### Screen 1: Welcome + Social Login
- Headline: "Find trusted, verified contractors in your area"
- Google/Apple sign-in buttons (primary), email/password (secondary)

### Screen 2: Describe Your Project
- Skip the profile setup entirely. Go straight to value.
- Project type dropdown (Kitchen, Bathroom, Roofing, etc.)
- Brief description text area
- Property zip code
- Budget range (optional slider)

### Screen 3: Instant Matches
- Show 3-5 matched contractors with verification badges, star ratings, and AI price estimate range
- Each contractor card shows: trade, years experience, verified status, estimated price range
- "Get Detailed Quotes" CTA to request bids from selected contractors

### Screen 4: Complete Profile (Deferred)
- Now that they see value, prompt for:
  - Full name
  - Property address
  - Phone number (for contractor communication)
- Framed as "Complete your profile so contractors can reach you"

## Progressive Disclosure Strategy

Not everything needs to be shown on day one. Reveal features as the user demonstrates readiness.

| Timing | Contractors See | Homeowners See |
|--------|----------------|----------------|
| Day 0 (signup) | AI estimate tool, job feed, basic profile | Post a job, browse contractors, AI price range |
| Day 1-3 | QuickBooks integration prompt, bid submission | Bid comparison view, contractor messaging |
| Week 1 | Team management, voice-to-estimate, advanced settings | Project timeline, milestone payment setup |
| Week 2+ | Analytics dashboard, featured placement upsell | Review prompts, repeat contractor booking |

## Verification Within Onboarding (No Friction)

Verification is critical for trust but lethal for conversion if forced too early. The strategy:

1. **Signup requires zero verification.** Create account, use tools, see value.
2. **Soft prompts after aha moment.** After first estimate, show: "Verified contractors get 3x more jobs."
3. **ID verification (Persona) is fast.** Takes 60 seconds. Offer it as a quick win.
4. **License and insurance upload can happen anytime.** Show a profile completeness bar to motivate.
5. **Background check (Checkr) triggers after first real engagement.** First bid submitted or first job accepted. Don't charge $30 for a user who hasn't demonstrated intent.

## Mobile-First Onboarding

93% of contractors access job platforms from smartphones. Every onboarding screen must be designed mobile-first.

- All form fields use appropriate mobile input types (tel, email, number)
- Voice input is a first-class option on the estimate screen (contractors are on job sites, not at desks)
- Tap targets are minimum 44x44px
- Social login eliminates keyboard entry entirely on Screen 1
- File upload for license/insurance uses native camera (photo of document) not file picker
- Progress indicator is a simple dot stepper, not a text-heavy sidebar
- Total onboarding is completable in under 4 minutes on a phone with one thumb

## A/B Test Ideas

| Test | Variant A | Variant B | Metric |
|------|-----------|-----------|--------|
| Aha moment timing | AI estimate on Screen 3 (before subscription) | AI estimate on Screen 4 (after subscription) | Trial conversion rate |
| Social login placement | Google/Apple only, email hidden behind "Other options" | All options visible equally | Signup completion rate |
| Verification prompt | Show verification on Screen 5 | Skip verification entirely, prompt on dashboard after Day 1 | Day-7 verification rate |
| Subscription gate | 14-day free trial, no card | 7-day free trial, card required | Day-30 paid conversion |
| Onboarding length | 6 screens (full flow) | 3 screens (signup, estimate, dashboard) | Completion rate |
| Success stories | MHP Construction case study shown | No case study, just feature bullets | Signup rate from landing page |

## Metrics to Track

### Primary Metrics
- **Onboarding completion rate:** % of users who reach the dashboard. Target: 65%+.
- **Time to first estimate:** Minutes from signup to first AI estimate generated. Target: under 5 minutes.
- **Day-1 retention:** % of users who return within 24 hours of signup. Target: 40%+.
- **Day-7 retention:** % of users active 7 days after signup. Target: 25%+.

### Secondary Metrics
- **Screen-by-screen drop-off:** Where do users abandon? Fix the worst screen first.
- **Social login adoption rate:** What % use Google/Apple vs email? Higher social = less friction.
- **Verification completion rate:** What % of contractors complete full verification within 7 days?
- **Time to first bid:** For contractors, how long from signup to first bid submitted?
- **Time to first job posted:** For homeowners, how long from signup to first project posted?
- **Free-to-paid conversion:** What % of free trial users convert to Pro within 30 days? Target: 15%+.

## Lessons from Great SaaS Onboarding

### Slack
- **What they do:** Slack creates a workspace and drops you into it immediately. You are using the product before you realize onboarding is happening.
- **What FTW steals:** Get the contractor into the estimate tool immediately. The tool IS the onboarding. Don't make them watch a tutorial first.

### Calendly
- **What they do:** Calendly asks one question ("What's your availability?"), generates a scheduling link, and shows it working in real time.
- **What FTW steals:** Ask one question ("Describe a recent job"), generate an estimate in real time, show it working. Same pattern — immediate, tangible output from minimal input.

### Canva
- **What they do:** Canva shows templates instantly and lets you start editing before you even finish your profile. The creation IS the hook.
- **What FTW steals:** The AI estimate IS the creation moment. Let contractors generate estimates before completing their profile, before choosing a plan, before verifying. Remove every gate between signup and that first estimate.

### Common Thread
All three companies share one principle: **the product is the onboarding.** They don't explain what the product does — they let you use it. FTW must do the same. The AI estimate tool is compelling enough to sell itself. Get out of its way.
