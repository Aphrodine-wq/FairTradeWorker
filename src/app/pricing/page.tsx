"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Minus,
  Shield,
  Zap,
  Users,
  Building2,
  Home,
  Star,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { cn } from "@shared/lib/utils";
import { CONTRACTOR_TIERS, HOMEOWNER_TIERS } from "@shared/lib/constants";

type Audience = "contractor" | "homeowner";

// --- Comparison data ---

const contractorComparison = [
  {
    category: "Finding and Winning Work",
    rows: [
      {
        feature: "Browse and bid on jobs",
        free: true,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Job posting",
        free: "Unlimited",
        solo: "Unlimited",
        team: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        feature: "Smart job matching by skills and service area",
        free: false,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Priority placement in homeowner feeds",
        free: false,
        solo: false,
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Estimation Tools",
    rows: [
      {
        feature: "Manual estimate builder",
        free: "Unlimited",
        solo: "Unlimited",
        team: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        feature: "AI-powered estimates (ConstructionAI)",
        free: false,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Voice AI estimator (Hunter) for on-site walkthroughs",
        free: false,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Estimate history and reusable templates",
        free: false,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "PDF estimate generation and sharing",
        free: false,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Bulk estimate generation",
        free: false,
        solo: false,
        team: false,
        enterprise: true,
      },
      {
        feature: "Custom branding on estimates",
        free: false,
        solo: true,
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Project Management",
    rows: [
      {
        feature: "Active projects",
        free: "3",
        solo: "Unlimited",
        team: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        feature: "Real-time project status tracking",
        free: true,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Shared project dashboard for team",
        free: false,
        solo: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Team activity feed and assignment tracking",
        free: false,
        solo: false,
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Payments and Billing",
    rows: [
      {
        feature: "Secure escrow payments",
        free: true,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Direct messaging with homeowners",
        free: true,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Homeowner reviews and ratings",
        free: true,
        solo: true,
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Analytics and Reporting",
    rows: [
      {
        feature: "Job performance and revenue analytics",
        free: false,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Advanced analytics with job costing breakdowns",
        free: false,
        solo: false,
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Team and Users",
    rows: [
      {
        feature: "Team member accounts",
        free: "1 user",
        solo: "1 user",
        team: "Up to 5",
        enterprise: "Unlimited",
      },
      {
        feature: "White-label client portal",
        free: false,
        solo: false,
        team: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Integrations",
    rows: [
      {
        feature: "REST API access",
        free: false,
        solo: false,
        team: false,
        enterprise: true,
      },
      {
        feature: "Custom third-party integrations",
        free: false,
        solo: false,
        team: false,
        enterprise: true,
      },
      {
        feature: "Zapier and webhook support",
        free: false,
        solo: false,
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support",
    rows: [
      {
        feature: "Community forum access",
        free: true,
        solo: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Email support",
        free: "48-hour",
        solo: "24-hour",
        team: "12-hour",
        enterprise: "4-hour",
      },
      {
        feature: "Priority support",
        free: false,
        solo: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Dedicated account manager",
        free: false,
        solo: false,
        team: false,
        enterprise: true,
      },
      {
        feature: "Custom onboarding and training",
        free: false,
        solo: false,
        team: false,
        enterprise: true,
      },
      {
        feature: "SLA guarantee (99.9% uptime)",
        free: false,
        solo: false,
        team: false,
        enterprise: true,
      },
    ],
  },
] as const;

const homeownerComparison = [
  {
    category: "Posting and Hiring",
    rows: [
      {
        feature: "Post jobs and receive bids",
        free: true,
        plus: true,
      },
      {
        feature: "Active jobs at a time",
        free: "3",
        plus: "Unlimited",
      },
      {
        feature: "Priority matching with top-rated contractors",
        free: false,
        plus: true,
      },
      {
        feature: "Side-by-side bid comparison dashboard",
        free: false,
        plus: true,
      },
      {
        feature: "Detailed contractor history and verification reports",
        free: false,
        plus: true,
      },
    ],
  },
  {
    category: "Communication",
    rows: [
      {
        feature: "Direct messaging with contractors",
        free: true,
        plus: true,
      },
      {
        feature: "Leave and read contractor reviews",
        free: true,
        plus: true,
      },
    ],
  },
  {
    category: "Payments",
    rows: [
      {
        feature: "Secure escrow payments on every job",
        free: true,
        plus: true,
      },
    ],
  },
  {
    category: "Project Management",
    rows: [
      {
        feature: "Basic project milestone tracking",
        free: true,
        plus: true,
      },
      {
        feature: "Inspection scheduling and reminders",
        free: false,
        plus: true,
      },
      {
        feature: "Warranty tracking across all projects",
        free: false,
        plus: true,
      },
    ],
  },
  {
    category: "Support",
    rows: [
      {
        feature: "Community forum access",
        free: true,
        plus: true,
      },
      {
        feature: "Email support",
        free: "48-hour",
        plus: "12-hour",
      },
      {
        feature: "Priority support",
        free: false,
        plus: true,
      },
    ],
  },
] as const;

// --- Tier icons ---

const contractorIcons = [Shield, Zap, Users, Building2] as const;
const homeownerIcons = [Home, Star] as const;

// --- FAQ data ---

const contractorFaqs = [
  {
    q: "What happens when my 14-day trial ends?",
    a: "You'll automatically move to the Free plan. No charges, no surprises. You keep all your data, active projects, and message history. You just lose access to paid features like AI estimation and smart matching until you subscribe.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrade, downgrade, or cancel whenever you want. When you upgrade, you get immediate access to new features. When you downgrade, your current billing cycle finishes before the change takes effect.",
  },
  {
    q: "Are there any lead fees or percentage cuts on jobs?",
    a: "Never. Every plan is a flat-rate subscription. We don't charge per lead, per bid, or take a percentage of your job revenue. A 3% service fee applies to escrow payments to cover payment processing, but that's it.",
  },
  {
    q: "What is ConstructionAI and how does it work?",
    a: "ConstructionAI is our custom-trained estimation model. Enter the project type, description, location, and square footage, and it generates a detailed cost breakdown with material, labor, and equipment costs, CSI division breakdowns, and confidence ranges. It's trained on real construction data, not generic AI.",
  },
  {
    q: "What's the difference between Solo and Team?",
    a: "Solo is for one contractor using the platform independently. Team adds multi-user accounts so your crew or office staff can access shared projects, see team-wide analytics, and coordinate through the platform. Team also includes Zapier/webhook integrations and priority support.",
  },
  {
    q: "Do I need Enterprise if I just want API access?",
    a: "Yes, API access is Enterprise-only. This is because API usage requires dedicated support, rate limit management, and custom onboarding to integrate properly with your existing systems. If you need it, reach out and we'll walk through your use case.",
  },
] as const;

const homeownerFaqs = [
  {
    q: "Is FairTradeWorker really free for homeowners?",
    a: "Yes. You can post jobs, receive bids, message contractors, and pay through escrow on the Free plan with no subscription cost. A 3% service fee applies to escrow payments to cover payment processing. Plus is optional for homeowners who want advanced tools.",
  },
  {
    q: "What does priority contractor matching actually do?",
    a: "With Plus, your job postings are surfaced first to the highest-rated, most responsive contractors in your area. Free users still get bids, but Plus users typically see faster response times and more bids from top-tier contractors.",
  },
  {
    q: "How does escrow protect me?",
    a: "When you accept a bid, your payment is held in escrow. The contractor only gets paid after you confirm the work is done. If there's a dispute, our resolution team steps in. Your money is protected at every step.",
  },
  {
    q: "Can I cancel Plus at any time?",
    a: "Yes. Cancel anytime and you'll keep Plus features through the end of your billing cycle. After that, you move to Free. All your project data, messages, and history stay intact.",
  },
] as const;

// --- Shared components ---

type CellValue = boolean | string;

function Cell({ value, featured }: { value: CellValue; featured?: boolean }) {
  if (typeof value === "boolean") {
    if (value) {
      return (
        <div className="flex justify-center">
          <Check
            className={cn(
              "w-5 h-5",
              featured ? "text-brand-600" : "text-gray-600"
            )}
            strokeWidth={2.5}
          />
        </div>
      );
    }
    return (
      <div className="flex justify-center">
        <Minus className="w-4 h-4 text-gray-200" strokeWidth={2} />
      </div>
    );
  }
  return (
    <span
      className={cn(
        "text-sm font-medium",
        featured ? "text-brand-700" : "text-gray-800"
      )}
    >
      {value}
    </span>
  );
}

function BillingToggle({
  yearly,
  onToggle,
}: {
  yearly: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className={cn(
          "text-sm font-medium",
          !yearly ? "text-gray-900" : "text-gray-600"
        )}
      >
        Monthly
      </span>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-sm transition-colors",
          yearly ? "bg-brand-600" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-sm bg-white transition-transform",
            yearly ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      <span
        className={cn(
          "text-sm font-medium",
          yearly ? "text-gray-900" : "text-gray-600"
        )}
      >
        Yearly
      </span>
      {yearly && (
        <Badge variant="success" className="text-xs px-2 py-0.5">
          Save 2 months
        </Badge>
      )}
    </div>
  );
}

function AudienceToggle({
  audience,
  onChange,
}: {
  audience: Audience;
  onChange: (a: Audience) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-sm p-1 w-fit mx-auto">
      <button
        type="button"
        onClick={() => onChange("contractor")}
        className={cn(
          "px-5 py-2 text-sm font-medium rounded-sm transition-colors",
          audience === "contractor"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-700 hover:text-gray-900"
        )}
      >
        Contractors
      </button>
      <button
        type="button"
        onClick={() => onChange("homeowner")}
        className={cn(
          "px-5 py-2 text-sm font-medium rounded-sm transition-colors",
          audience === "homeowner"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-700 hover:text-gray-900"
        )}
      >
        Homeowners
      </button>
    </div>
  );
}

function PricingCard({
  tier,
  yearly,
  icon: Icon,
}: {
  tier: (typeof CONTRACTOR_TIERS)[number] | (typeof HOMEOWNER_TIERS)[number];
  yearly: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const price = yearly ? tier.yearlyPrice : tier.monthlyPrice;
  const isFree = tier.monthlyPrice === 0;

  return (
    <div
      className={cn(
        "relative bg-white rounded-sm border p-8 flex flex-col",
        tier.featured
          ? "border-brand-600 shadow-lg ring-1 ring-brand-600 lg:scale-[1.03] lg:z-10"
          : "border-border shadow-sm"
      )}
    >
      {tier.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge className="px-4 py-1 text-xs font-bold uppercase tracking-wide shadow-sm">
            {tier.badge}
          </Badge>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={cn(
              "w-10 h-10 rounded-sm flex items-center justify-center",
              tier.featured ? "bg-brand-50" : "bg-gray-50"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                tier.featured ? "text-brand-600" : "text-gray-700"
              )}
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {tier.description}
        </p>
      </div>

      <div className="mb-2">
        <div className="flex items-end gap-1">
          <span className="text-5xl font-bold text-gray-900 tabular-nums">
            {isFree ? "Free" : `$${price}`}
          </span>
          {!isFree && (
            <span className="text-gray-600 text-sm mb-1.5">
              /{yearly ? "year" : "month"}
            </span>
          )}
        </div>
        {isFree && <p className="text-sm text-gray-600 mt-0.5">forever</p>}
        {!isFree && yearly && (
          <p className="text-sm text-brand-600 mt-1">
            ${Math.round((price / 12) * 100) / 100}/mo effective
          </p>
        )}
        {!isFree && !yearly && (
          <p className="text-xs text-gray-600 mt-1">
            or ${tier.yearlyPrice}/yr (save $
            {tier.monthlyPrice * 12 - tier.yearlyPrice})
          </p>
        )}
      </div>

      <p className="text-xs text-gray-600 mb-6 italic">
        Best for: {tier.idealFor}
      </p>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((feature) => {
          const isHeader = feature.endsWith(":");
          return (
            <li
              key={feature}
              className={cn(
                "flex items-start gap-3",
                isHeader && "mt-1 mb-0"
              )}
            >
              {!isHeader && (
                <Check
                  className={cn(
                    "w-4 h-4 mt-0.5 flex-shrink-0",
                    tier.featured ? "text-brand-600" : "text-gray-600"
                  )}
                  strokeWidth={2.5}
                />
              )}
              <span
                className={cn(
                  "text-sm",
                  isHeader
                    ? "font-semibold text-gray-900"
                    : "text-gray-800"
                )}
              >
                {feature}
              </span>
            </li>
          );
        })}
      </ul>

      <Button
        variant={tier.featured ? "default" : "outline"}
        size="lg"
        className="w-full"
        asChild
      >
        <Link href={tier.href}>{tier.cta}</Link>
      </Button>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 px-1 text-left group"
      >
        <span className="text-sm font-medium text-gray-900 pr-4">{q}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-600 flex-shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="pb-5 px-1">
          <p className="text-sm text-gray-700 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// --- Page ---

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [audience, setAudience] = useState<Audience>("contractor");

  const tiers =
    audience === "contractor" ? CONTRACTOR_TIERS : HOMEOWNER_TIERS;
  const icons =
    audience === "contractor" ? contractorIcons : homeownerIcons;
  const comparison =
    audience === "contractor" ? contractorComparison : homeownerComparison;
  const faqs =
    audience === "contractor" ? contractorFaqs : homeownerFaqs;
  const colCount = audience === "contractor" ? 5 : 3;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="pt-24">
        {/* Hero section — untouched */}
        <section className="bg-white py-16 sm:py-20 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Choose Your Plan
            </h1>
            <p className="mt-5 text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Simple, flat-rate subscriptions. No lead fees, no percentage cuts,
              no surprises. Upgrade, downgrade, or cancel anytime.
            </p>
            <div className="mt-8 space-y-5">
              <AudienceToggle audience={audience} onChange={setAudience} />
              <BillingToggle
                yearly={yearly}
                onToggle={() => setYearly(!yearly)}
              />
            </div>
          </div>
        </section>

        {/* Value proposition banner */}
        <section className="bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {audience === "contractor" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">$0</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Lead fees, always. Every plan.
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    Most tools free
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Bidding, messaging, escrow, project tracking, and reviews.
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    AI is the upgrade
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Only pay when you want AI estimation and smart matching.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    Free to hire
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Post jobs, get bids, and pay through escrow at no cost.
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    Every contractor verified
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Licensed, insured, and background-checked before they bid.
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    Your money protected
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Escrow holds payment until you confirm the work is done.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Pricing cards */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={cn(
                "grid grid-cols-1 gap-8 items-start",
                audience === "contractor"
                  ? "sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
                  : "sm:grid-cols-2 max-w-3xl mx-auto"
              )}
            >
              {tiers.map((tier, i) => (
                <PricingCard
                  key={tier.name}
                  tier={tier}
                  yearly={yearly}
                  icon={icons[i]}
                />
              ))}
            </div>

            <p className="text-center text-sm text-gray-600 mt-10">
              {audience === "contractor"
                ? "All paid plans include a 14-day free trial. No credit card required to start."
                : "Plus includes a 14-day free trial. No credit card required to start."}
            </p>
          </div>
        </section>

        {/* What every plan includes */}
        <section className="bg-white py-16 sm:py-20 border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {audience === "contractor"
                  ? "Included on Every Contractor Plan"
                  : "Included on Every Homeowner Plan"}
              </h2>
              <p className="mt-3 text-gray-700 max-w-xl mx-auto">
                {audience === "contractor"
                  ? "These aren't locked behind a paywall. They're yours from day one, on every plan, including Free."
                  : "The essentials are always free. No hidden costs to get your project started."}
              </p>
            </div>
            {audience === "contractor" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
                {[
                  {
                    title: "Unlimited job posting and bidding",
                    desc: "Post your services and bid on as many jobs as you want. No caps.",
                  },
                  {
                    title: "Unlimited manual estimates",
                    desc: "Build line-item estimates by hand with no limits on how many you send.",
                  },
                  {
                    title: "Direct messaging",
                    desc: "Communicate with homeowners directly through the platform. No phone tag.",
                  },
                  {
                    title: "Secure escrow payments",
                    desc: "Every payment goes through escrow. You get paid when the job is done.",
                  },
                  {
                    title: "Project tracking",
                    desc: "Track milestones, status updates, and completion on every active project.",
                  },
                  {
                    title: "Reviews and ratings",
                    desc: "Build your reputation with verified homeowner reviews on completed work.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <Check
                      className="w-5 h-5 mt-0.5 text-brand-600 flex-shrink-0"
                      strokeWidth={2.5}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
                {[
                  {
                    title: "Post jobs and receive bids",
                    desc: "Describe your project once and let qualified contractors come to you.",
                  },
                  {
                    title: "Direct messaging",
                    desc: "Ask questions, negotiate scope, and coordinate directly with your contractor.",
                  },
                  {
                    title: "Secure escrow payments",
                    desc: "Your money is held safely until you confirm the work meets your expectations.",
                  },
                  {
                    title: "Project milestone tracking",
                    desc: "See where your project stands at every stage from kickoff to completion.",
                  },
                  {
                    title: "Contractor reviews",
                    desc: "Read verified reviews from other homeowners before you hire.",
                  },
                  {
                    title: "Community forum",
                    desc: "Get advice from other homeowners and contractors on your project.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <Check
                      className="w-5 h-5 mt-0.5 text-brand-600 flex-shrink-0"
                      strokeWidth={2.5}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Full comparison table */}
        <section className="py-20 sm:py-28">
          <div
            className={cn(
              "mx-auto px-4 sm:px-6 lg:px-8",
              audience === "contractor" ? "max-w-6xl" : "max-w-3xl"
            )}
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Full Feature Comparison
              </h2>
              <p className="mt-3 text-gray-700">
                Every feature, every plan. See exactly what you get.
              </p>
            </div>

            <div className="bg-white rounded-sm border border-border overflow-hidden shadow-sm">
              {/* Table header */}
              <div
                className="border-b border-border"
                style={{
                  display: "grid",
                  gridTemplateColumns: `1.4fr repeat(${colCount - 1}, minmax(0, 1fr))`,
                }}
              >
                <div className="p-5">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                    Feature
                  </span>
                </div>
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "p-5 text-center",
                      tier.featured && "bg-brand-50"
                    )}
                  >
                    <p className="text-sm font-bold text-gray-900">
                      {tier.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {tier.monthlyPrice === 0
                        ? "Free"
                        : yearly
                        ? `$${tier.yearlyPrice}/yr`
                        : `$${tier.monthlyPrice}/mo`}
                    </p>
                    {tier.featured && (
                      <Badge className="mt-1.5 text-[10px] px-2 py-0.5">
                        Popular
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Category rows */}
              {comparison.map((cat, catIndex) => (
                <div key={cat.category}>
                  <div
                    className={cn(
                      "bg-gray-50 border-b border-border px-5 py-3",
                      catIndex > 0 && "border-t border-border"
                    )}
                  >
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                      {cat.category}
                    </span>
                  </div>

                  {cat.rows.map((row, rowIndex) => {
                    const values =
                      audience === "contractor"
                        ? [
                            {
                              value: (
                                row as (typeof contractorComparison)[number]["rows"][number]
                              ).free,
                              featured: false,
                            },
                            {
                              value: (
                                row as (typeof contractorComparison)[number]["rows"][number]
                              ).solo,
                              featured: true,
                            },
                            {
                              value: (
                                row as (typeof contractorComparison)[number]["rows"][number]
                              ).team,
                              featured: false,
                            },
                            {
                              value: (
                                row as (typeof contractorComparison)[number]["rows"][number]
                              ).enterprise,
                              featured: false,
                            },
                          ]
                        : [
                            {
                              value: (
                                row as (typeof homeownerComparison)[number]["rows"][number]
                              ).free,
                              featured: false,
                            },
                            {
                              value: (
                                row as (typeof homeownerComparison)[number]["rows"][number]
                              ).plus,
                              featured: true,
                            },
                          ];

                    return (
                      <div
                        key={row.feature}
                        className={cn(
                          "border-b border-border last:border-b-0",
                          rowIndex % 2 === 1 && "bg-gray-50/40"
                        )}
                        style={{
                          display: "grid",
                          gridTemplateColumns: `1.4fr repeat(${colCount - 1}, minmax(0, 1fr))`,
                        }}
                      >
                        <div className="px-5 py-4 flex items-center">
                          <span className="text-sm text-gray-900">
                            {row.feature}
                          </span>
                        </div>
                        {values.map((v, i) => (
                          <div
                            key={i}
                            className={cn(
                              "px-5 py-4 flex items-center justify-center",
                              v.featured && "bg-brand-50/30"
                            )}
                          >
                            <Cell
                              value={v.value as CellValue}
                              featured={v.featured}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Table footer CTAs */}
              <div
                className="border-t border-border bg-gray-50"
                style={{
                  display: "grid",
                  gridTemplateColumns: `1.4fr repeat(${colCount - 1}, minmax(0, 1fr))`,
                }}
              >
                <div className="px-5 py-5" />
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "px-3 py-5 flex justify-center",
                      tier.featured && "bg-brand-50/50"
                    )}
                  >
                    <Button
                      variant={tier.featured ? "default" : "outline"}
                      size="sm"
                      className="w-full max-w-[140px]"
                      asChild
                    >
                      <Link href={tier.href}>{tier.cta}</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section className="bg-white py-16 sm:py-20 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-gray-700">
                {audience === "contractor"
                  ? "Common questions from contractors about plans and billing."
                  : "Common questions from homeowners about how FairTradeWorker works."}
              </p>
            </div>

            <div className="border-t border-border">
              {faqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA footer */}
        <section className="bg-dark py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {audience === "contractor"
                ? "Ready to start winning more work?"
                : "Ready to find the right contractor?"}
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              {audience === "contractor"
                ? "Join thousands of contractors already using FairTradeWorker. Most features are free. Start building your reputation today."
                : "Post your first job in minutes. Verified contractors will start bidding, and your payment is protected by escrow every step of the way."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500"
                asChild
              >
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
