# White-Label Strategy

## Current Model

MHP is the first white-label client at $200-500/mo. This is the FairEstimator --> MHPEstimate path. MHP proves the concept: take FTW's estimation engine and contractor tools, rebrand them, deploy them under a client's domain, and charge a monthly subscription.

## Industry Benchmarks

- White-label SaaS typically priced at monthly subscription (most common)
- Construction-specific white-label solutions: $50K-$300K for custom builds
- FTW's model (pre-built, configure-and-deploy) is dramatically cheaper than custom development
- Comparable platforms: Jobber white-label ($200-800/mo), Buildertrend custom instances ($500-2000/mo)
- FTW undercuts everyone because the platform already exists — white-label is configuration, not development

## Pricing Tiers

| Tier | Monthly | Includes |
|------|---------|---------|
| Starter | $200/mo | Branded estimation platform, 1 user, standard templates |
| Professional | $350/mo | + ConstructionAI integration, 5 users, custom templates |
| Enterprise | $500/mo | + API access, unlimited users, custom domain, priority support |

## Scaling White-Label Revenue

- Each white-label client = recurring revenue with near-zero marginal cost
- Target: 10 white-label clients at $350/mo avg = $3,500/mo ($42K/year)
- Mississippi alone has ~47,500 construction workers across thousands of firms
- After Oxford proof, pitch to contractors in Memphis, Nashville, Jackson, Birmingham
- White-label is the **most scalable** revenue stream — no marketplace cold-start needed, each client is independent

---

## Ideal White-Label Client Profile

### Who Is the Buyer?

**Primary target:** Mid-size residential contractors (5-25 employees) who:
- Do $500K-$5M in annual revenue
- Already have a brand but no custom software
- Are currently using spreadsheets, paper, or generic tools (Jobber, Housecall Pro) for estimation
- Want to look more professional to homeowners
- Are tech-curious but don't have in-house developers

**Secondary target:** Construction companies that want to offer estimation as a client-facing tool:
- General contractors who want to give homeowners instant ballpark estimates on their website
- Remodeling companies that want branded proposal/estimate PDFs
- Roofing companies that want AI-powered roof estimates tied to their brand

**What they care about:**
- Their company name and logo on everything — not FTW's branding
- Estimates that use their pricing, their labor rates, their markup percentages
- Looking like a bigger, more tech-forward company than they are
- Not paying $50K+ for custom software development

**Red flags (not a good fit):**
- Solo operators with no brand — they should use FTW's marketplace, not white-label
- Companies that want heavy custom features — white-label is configuration, not custom dev
- Companies that can't commit to $200+/mo — too small to service profitably

---

## Sales Process for White-Label Clients

### Step 1: Finding Prospects

- **Referrals from Josh/MHP:** "Who else do you know that would want this?"
- **MSBOC license database:** Filter for companies with 5+ employees in target geographies
- **LinkedIn Sales Navigator:** Search for "owner" + "construction" + target city
- **Local trade associations:** Mississippi Home Builders Association, Associated Builders and Contractors (ABC) Mississippi chapter
- **Conferences:** Mississippi Construction Expo, regional home shows
- **Inbound from FTW marketplace:** Contractors who sign up for FTW and say "I wish this had my branding"

### Step 2: The Pitch

**Opening (30 seconds):**
> "You know how your customers always ask 'how much will this cost?' before you can even get out there to measure? What if your website could answer that question instantly — with your logo, your pricing, your brand — using AI?"

**Demo flow (15 minutes):**
1. Show MHPEstimate.cloud as a live example: "This is what Josh Harris at MHP Construction has. Same estimation engine, his brand."
2. Enter a real address in the prospect's service area and generate an estimate in real time
3. Show the branded PDF output — their logo would go here, their company info here
4. Show the dashboard — project tracking, client management, estimate history
5. Show the mobile experience — works on their phone, their crew's phones
6. End with pricing: "This is $200-500/month depending on the tier. No setup fees. We handle everything."

**Closing:**
> "I can have your branded version live within 2 weeks. Want to start with a 30-day trial at the Starter tier?"

### Step 3: Handling Objections

| Objection | Response |
|-----------|----------|
| "I can't afford $200/month" | "How much time do you spend on estimates each week? At $50/hour, if this saves you 5 hours a month, it pays for itself." |
| "I don't need software" | "Your competitors are using it. When a homeowner gets an instant estimate from them and a 'I'll get back to you' from you, who do they call?" |
| "Will it really have MY brand?" | "100%. Your logo, your colors, your domain. Your clients will never see FairTradeWorker's name." |
| "What if the AI estimates are wrong?" | "The AI gives ballpark ranges based on local data. You review and adjust before anything goes to a client. It's a starting point, not a final bid." |
| "Can I try it first?" | "Absolutely. 30 days free on the Starter tier. If you don't see value, cancel with no charge." |

---

## White-Label Onboarding Process

### What Gets Customized

| Element | Customization | Timeline |
|---------|---------------|----------|
| Logo | Client uploads their logo, appears on all screens and PDFs | Day 1 |
| Colors | Primary brand color, secondary color, text color | Day 1 |
| Domain | Custom subdomain (e.g., estimates.mhpconstruction.com) or full custom domain | Day 1-3 |
| Company Info | Business name, address, phone, license number on all outputs | Day 1 |
| Estimate Templates | Choose from standard templates or request custom layout | Day 1-5 |
| Pricing/Markup | Set default labor rates, material markup %, overhead percentages | Day 2-3 |
| Service Categories | Enable only the trades the client offers (roofing only, full remodel, etc.) | Day 1 |
| PDF Header/Footer | Custom header with logo, footer with license info and disclaimers | Day 3-5 |

### Onboarding Timeline

| Day | Activity |
|-----|----------|
| Day 1 | Client provides: logo (SVG/PNG), brand colors (hex codes), company info, desired domain |
| Day 2 | FTW configures tenant: brand theming applied, domain pointed, estimate templates set |
| Day 3 | Client reviews staging environment, provides feedback |
| Day 5 | DNS propagation complete, SSL certificate issued, custom domain live |
| Day 7 | Training call with client: how to use dashboard, run estimates, manage projects |
| Day 10 | Client goes live. First estimate generated on their branded platform. |
| Day 14 | Follow-up call: "How's it going? Any adjustments needed?" |
| Day 30 | End of trial (if applicable). Convert to paid or gather feedback on why not. |

---

## Technical Architecture: How White-Labeling Works

### Tenant Configuration

Each white-label client is a **tenant** in a multi-tenant architecture. The codebase is shared — one deployment serves all tenants.

**Tenant config object (stored per client):**
```
{
  tenantId: "mhp-construction",
  companyName: "MHP Construction",
  domain: "mhpestimate.cloud",
  logo: "/tenants/mhp/logo.svg",
  colors: {
    primary: "#1a365d",      // MHP's brand blue
    secondary: "#2d3748",
    accent: "#059669",       // Can keep FTW green or change
    surface: "#F7F8FA",
    text: "#0F1419"
  },
  features: {
    estimation: true,
    projectManagement: true,
    clientPortal: false,     // Enterprise only
    apiAccess: false         // Enterprise only
  },
  estimateConfig: {
    defaultMarkup: 0.20,
    laborRateOverride: null, // Uses ConstructionAI defaults if null
    customTemplateId: "mhp-standard"
  },
  license: "R21909",
  tier: "professional"
}
```

### Subdomain Routing

- Each tenant gets a subdomain: `mhp.fairestimator.com` or a custom domain: `mhpestimate.cloud`
- Incoming requests are routed by hostname --> tenant lookup --> config loaded
- The FairEstimator codebase at `~/Projects/fairestimator/` is the template
- All theming is applied via CSS custom properties injected from the tenant config
- No separate deployments per client — one app, many tenants

### Brand Theming

- CSS custom properties (`--color-primary`, `--color-accent`, etc.) are set dynamically based on tenant config
- Logo is swapped via the tenant config — stored in a tenant-specific asset path
- PDF generation uses the tenant's branding: logo in header, company info in footer, colors in styling
- Email templates (if applicable) also pull from tenant config

### Data Isolation

- Each tenant's data is logically isolated — tenants cannot see each other's estimates, projects, or clients
- ConstructionAI model is shared (no per-tenant fine-tuning at Starter/Pro tiers)
- Enterprise tier can request custom model adjustments (e.g., regional pricing data specific to their market)

---

## Support Model for White-Label Clients

| Tier | Support Level | Response Time | Channels |
|------|--------------|---------------|----------|
| Starter | Email only | 48 hours | Email |
| Professional | Email + chat | 24 hours | Email, in-app chat |
| Enterprise | Priority support | 4 hours (business hours) | Email, chat, phone, dedicated Slack channel |

### What's Included in Support

- Bug fixes and platform updates (all tiers — updates ship to everyone)
- Help with configuration changes (logo swap, color update, template change)
- Training for new users added to the client's account
- Quarterly check-in call (Professional and Enterprise)
- Feature requests considered but not guaranteed (logged in a shared roadmap)

### What's NOT Included

- Custom feature development (quoted separately if requested)
- SEO, marketing, or lead generation for the client's instance
- Hardware/device support for the client's team
- Integration with the client's existing software (unless via API on Enterprise tier)

---

## Contract Template Outline

A white-label agreement should cover:

1. **Service Description** — FTW provides a branded instance of the FairEstimator platform
2. **Term** — Month-to-month or annual (annual = 2 months free as incentive)
3. **Pricing** — Monthly fee per tier, payment due on the 1st, auto-renewal
4. **Customization Scope** — What's included (logo, colors, domain, templates) vs. what costs extra (custom dev)
5. **Intellectual Property** — FTW owns the platform, AI models, and codebase. Client owns their brand assets and business data. Client gets a license to use, not ownership.
6. **Data Ownership** — Client's estimates, projects, and client data belong to the client. If they cancel, they get a full data export (CSV/JSON) within 30 days.
7. **Uptime SLA** — 99.5% uptime target. No SLA penalties at current scale, but documented commitment.
8. **Termination** — Either party can cancel with 30 days notice. Data export provided within 30 days of cancellation.
9. **Liability** — FTW is not liable for estimation accuracy. The AI provides approximations. Client is responsible for reviewing all estimates before presenting to their customers.
10. **Confidentiality** — Both parties keep pricing and business terms confidential.
11. **Non-Compete** — FTW will not use the client's customer data to compete with them. Client cannot reverse-engineer or resell the platform.
12. **Governing Law** — State of Mississippi. Disputes resolved by arbitration in Lafayette County.

**Priority: Have a lawyer draft this based on the outline above. Do not use this outline as the actual contract.**

---

## Case Study Template: MHP Construction

### Background
MHP Construction, led by Josh Harris (License R21909), is a residential construction company in Oxford, MS. Before FairTradeWorker, Josh used spreadsheets and manual calculations for project estimation.

### Challenge
- Estimating projects took 2-4 hours per bid
- No standardized estimate format — each one looked different
- Clients often asked "how much will this cost?" before Josh could visit the site
- Wanted to appear more professional and tech-forward to win bids against larger competitors

### Solution
MHP became the first FairEstimator white-label client. Josh received:
- A fully branded estimation platform at mhpestimate.cloud
- ConstructionAI-powered instant estimates using local Oxford pricing data
- Professional PDF estimates with MHP's logo, license number, and company branding
- A dashboard to track all estimates and project history

### Results
- [To be filled with real metrics once available]
- Estimation time reduced from [X hours] to [X minutes]
- [X] estimates generated in the first month
- Client feedback: "[Quote from Josh]"
- Win rate on bids: [before vs. after, if trackable]

### Why It Works
MHP's clients see MHP's brand — not FairTradeWorker. Josh maintains his contractor-client relationship while leveraging AI estimation tools that would cost $50K+ to build independently.

---

## Target Client Pipeline (Post-Oxford Proof)

### Phase 1: Mississippi (Months 1-6)
- Oxford/Lafayette County contractors (5-10 clients)
- Jackson metro area contractors (target 5 clients)
- Hattiesburg/Gulf Coast contractors (target 3 clients)
- Source: MSBOC database, Josh referrals, LinkedIn outreach

### Phase 2: Adjacent States (Months 6-12)
- Memphis, TN contractors (natural Oxford extension — 80 miles away)
- Birmingham, AL contractors
- Nashville, TN contractors (growing market, lots of residential construction)
- Source: State licensing board databases, trade association directories, conference networking

### Phase 3: Regional Scale (Months 12-24)
- Target: 50 white-label clients across the Southeast
- At $350/mo average = $17,500/mo ($210K/year) from white-label alone
- Begin hiring a dedicated white-label sales rep at 20+ clients
- Develop self-serve onboarding so clients can configure their own instance without James's involvement
