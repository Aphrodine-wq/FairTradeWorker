export const BRAND = {
  name: "FairTradeWorker",
  tagline: "The fair way to find and hire contractors",
  description:
    "Two-sided marketplace connecting homeowners with verified contractors. No lead fees. Fair pricing. Transparent estimates.",
  colors: {
    primary: "#059669",
    primaryHover: "#047857",
    dark: "#0F1419",
    bgSoft: "#F7F8FA",
    bgCard: "#FFFFFF",
    textPrimary: "#111318",
    textSecondary: "#4B5563",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
  },
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const PLAN_TIERS = [
  {
    name: "Starter",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 5 estimates per month",
      "Basic job posting",
      "Standard support",
      "Community access",
    ],
    cta: "Get Started Free",
    featured: false,
  },
  {
    name: "Pro",
    price: 49,
    period: "per month",
    description: "For serious contractors",
    features: [
      "Unlimited estimates",
      "Voice AI estimator",
      "Priority job matching",
      "Advanced analytics",
      "Escrow payments",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start Pro Trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: 149,
    period: "per month",
    description: "For established businesses",
    features: [
      "Everything in Pro",
      "Multi-user accounts",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
      "Bulk estimate tools",
    ],
    cta: "Contact Sales",
    featured: false,
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
