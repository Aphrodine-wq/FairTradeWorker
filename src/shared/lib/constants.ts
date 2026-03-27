export const BRAND = {
  name: "FairTradeWorker",
  tagline: "The fair way to find and hire contractors",
  description:
    "Two-sided marketplace connecting homeowners with verified contractors. No lead fees. Fair pricing. Transparent estimates.",
  colors: {
    primary: "#C41E3A",
    primaryHover: "#A5182F",
    dark: "#0F1419",
    bgSoft: "#FAFAFA",
    bgCard: "#FFFFFF",
    textPrimary: "#111318",
    textSecondary: "#4B5563",
    textMuted: "#9CA3AF",
    border: "#E5E1DB",
  },
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const CONTRACTOR_TIERS = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    badge: null,
    idealFor: "New contractors exploring the platform",
    description:
      "Start finding work and building your reputation. Most of the tools you need are right here, completely free.",
    features: [
      "Unlimited job posting and bidding",
      "Unlimited manual estimates",
      "Direct messaging with homeowners",
      "Secure escrow payments on every job",
      "Up to 3 active projects at a time",
      "Real-time project status tracking",
      "Homeowner reviews and ratings",
      "Community forum access",
      "Email support with 48-hour response",
    ],
    cta: "Get Started Free",
    href: "/signup?role=contractor",
    featured: false,
  },
  {
    name: "Solo",
    monthlyPrice: 29,
    yearlyPrice: 290,
    badge: "Most Popular",
    idealFor: "Independent contractors ready to grow",
    description:
      "Unlock AI-powered estimation and smart matching to win more jobs and price them right, every time.",
    features: [
      "Everything in Free, plus:",
      "AI-powered estimates via ConstructionAI",
      "Voice AI estimator (Hunter) for on-site walkthroughs",
      "Unlimited active projects",
      "Smart job matching based on your skills and area",
      "Job performance and revenue analytics",
      "Your logo and branding on all estimates",
      "Estimate history and reusable templates",
      "PDF estimate generation and sharing",
    ],
    cta: "Start 14-Day Free Trial",
    href: "/signup?role=contractor&plan=solo",
    featured: true,
  },
  {
    name: "Team",
    monthlyPrice: 79,
    yearlyPrice: 790,
    badge: null,
    idealFor: "Crews and growing contracting businesses",
    description:
      "Bring your crew onto the platform. Shared projects, team-level analytics, and automation to keep everyone coordinated.",
    features: [
      "Everything in Solo, plus:",
      "Up to 5 team member accounts",
      "Shared project dashboard across your team",
      "Advanced analytics with job costing breakdowns",
      "Zapier and webhook integrations",
      "Team activity feed and assignment tracking",
      "Priority support with 12-hour response",
    ],
    cta: "Start 14-Day Free Trial",
    href: "/signup?role=contractor&plan=team",
    featured: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    badge: null,
    idealFor: "Multi-location and high-volume operations",
    description:
      "Full platform access with no limits. API integrations, white-labeling, and a dedicated account manager for your business.",
    features: [
      "Everything in Team, plus:",
      "Unlimited team member accounts",
      "Full REST API access for custom workflows",
      "Custom third-party integrations",
      "White-label estimates and client portal",
      "Dedicated account manager",
      "99.9% uptime SLA guarantee",
      "Bulk estimate generation tools",
      "Custom onboarding and training",
    ],
    cta: "Contact Sales",
    href: "/contact",
    featured: false,
  },
] as const;

export const HOMEOWNER_TIERS = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    badge: null,
    idealFor: "Homeowners with a project to get done",
    description:
      "Post your job, get bids from verified contractors, and pay securely through escrow. Everything you need to hire with confidence.",
    features: [
      "Post jobs and receive competitive bids",
      "Direct messaging with contractors",
      "Secure escrow payments on every job",
      "Up to 3 active jobs at a time",
      "Basic project milestone tracking",
      "Leave and read contractor reviews",
      "Community forum access",
      "Email support with 48-hour response",
    ],
    cta: "Get Started Free",
    href: "/signup?role=homeowner",
    featured: false,
  },
  {
    name: "Plus",
    monthlyPrice: 9,
    yearlyPrice: 90,
    badge: "Best Value",
    idealFor: "Homeowners managing renovations or multiple projects",
    description:
      "Get matched with top contractors faster, compare bids side-by-side, and stay on top of inspections and warranties across all your projects.",
    features: [
      "Everything in Free, plus:",
      "Unlimited active jobs at a time",
      "Priority matching with top-rated contractors",
      "Side-by-side bid comparison dashboard",
      "Inspection scheduling and reminders",
      "Warranty tracking across all projects",
      "Detailed contractor history and verification reports",
      "Priority support with 12-hour response",
    ],
    cta: "Start 14-Day Free Trial",
    href: "/signup?role=homeowner&plan=plus",
    featured: true,
  },
] as const;

export const STATS = [
  { label: "Jobs Completed", value: 12847, suffix: "+" },
  { label: "Verified Contractors", value: 3200, suffix: "+" },
  { label: "Homeowner Satisfaction", value: 98, suffix: "%" },
  { label: "Average Savings", value: 23, suffix: "%" },
] as const;

export const JOB_CATEGORIES = [
  "General Contracting",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Roofing",
  "Painting",
  "Flooring",
  "Landscaping",
  "Remodeling",
  "Concrete",
  "Fencing",
  "Drywall",
] as const;

export const ESTIMATE_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "declined",
  "expired",
] as const;

export const JOB_STATUSES = [
  "open",
  "in_progress",
  "completed",
  "cancelled",
] as const;
