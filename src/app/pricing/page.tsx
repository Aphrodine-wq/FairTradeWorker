import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { cn } from "@shared/lib/utils";
import { PLAN_TIERS } from "@shared/lib/constants";

// Full feature comparison table data
const comparisonCategories = [
  {
    category: "Core Features",
    rows: [
      {
        feature: "Monthly estimates",
        starter: "Up to 5",
        pro: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        feature: "Job postings",
        starter: "Basic",
        pro: "Priority",
        enterprise: "Priority",
      },
      {
        feature: "Voice AI estimator (Hunter)",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Escrow payments",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Smart job matching",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Real-time project tracking",
        starter: true,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Business Tools",
    rows: [
      {
        feature: "Advanced analytics",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Custom branding on estimates",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Bulk estimate tools",
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        feature: "Multi-user accounts",
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        feature: "White-label options",
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Integrations",
    rows: [
      {
        feature: "API access",
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        feature: "Custom integrations",
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        feature: "Zapier / webhook support",
        starter: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support",
    rows: [
      {
        feature: "Community access",
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Email support",
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Priority support",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Dedicated account manager",
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        feature: "SLA guarantee",
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
] as const;

type CellValue = boolean | string;

function Cell({ value, featured }: { value: CellValue; featured?: boolean }) {
  if (typeof value === "boolean") {
    if (value) {
      return (
        <div className="flex justify-center">
          <Check
            className={cn(
              "w-5 h-5",
              featured ? "text-brand-600" : "text-gray-400"
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
        featured ? "text-brand-700" : "text-gray-600"
      )}
    >
      {value}
    </span>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="pt-24">
        {/* Hero section */}
        <section className="bg-white py-16 sm:py-20 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Choose Your Plan
            </h1>
            <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Simple, flat-rate subscriptions. No lead fees, no percentage cuts,
              no surprises. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
              {PLAN_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    "relative bg-white rounded-xl border p-8 flex flex-col",
                    tier.featured
                      ? "border-brand-600 shadow-lg ring-1 ring-brand-600 md:scale-105 md:z-10"
                      : "border-border shadow-sm"
                  )}
                >
                  {tier.featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="px-4 py-1 text-xs font-bold uppercase tracking-wide shadow-sm">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {tier.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-bold text-gray-900 tabular-nums">
                        {tier.price === 0 ? "Free" : `$${tier.price}`}
                      </span>
                      {tier.price > 0 && (
                        <span className="text-gray-400 text-sm mb-1.5">
                          /{tier.period}
                        </span>
                      )}
                    </div>
                    {tier.price === 0 && (
                      <p className="text-sm text-gray-400 mt-0.5">
                        {tier.period}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className={cn(
                            "w-4 h-4 mt-0.5 flex-shrink-0",
                            tier.featured ? "text-brand-600" : "text-gray-400"
                          )}
                          strokeWidth={2.5}
                        />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.featured ? "default" : "outline"}
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link
                      href={
                        tier.price === 0
                          ? "/signup"
                          : tier.name === "Enterprise"
                          ? "/contact"
                          : "/signup?plan=pro"
                      }
                    >
                      {tier.cta}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-400 mt-10">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </section>

        {/* Full comparison table */}
        <section className="pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Full Feature Comparison
              </h2>
              <p className="mt-3 text-gray-500">
                See exactly what&apos;s included in every plan.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              {/* Table header */}
              <div className="grid grid-cols-4 border-b border-border">
                <div className="p-5 col-span-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Feature
                  </span>
                </div>
                {PLAN_TIERS.map((tier) => (
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
                    <p className="text-xs text-gray-400 mt-0.5">
                      {tier.price === 0
                        ? "Free"
                        : `$${tier.price}/${tier.period.split(" ")[1] ?? tier.period}`}
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
              {comparisonCategories.map((cat, catIndex) => (
                <div key={cat.category}>
                  {/* Category divider */}
                  <div
                    className={cn(
                      "grid grid-cols-4 bg-gray-50 border-b border-border",
                      catIndex > 0 && "border-t border-border"
                    )}
                  >
                    <div className="col-span-4 px-5 py-3">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {cat.category}
                      </span>
                    </div>
                  </div>

                  {/* Feature rows */}
                  {cat.rows.map((row, rowIndex) => (
                    <div
                      key={row.feature}
                      className={cn(
                        "grid grid-cols-4 border-b border-border last:border-b-0",
                        rowIndex % 2 === 1 && "bg-gray-50/40"
                      )}
                    >
                      <div className="px-5 py-4 flex items-center">
                        <span className="text-sm text-gray-700">
                          {row.feature}
                        </span>
                      </div>
                      <div className="px-5 py-4 flex items-center justify-center">
                        <Cell value={row.starter} />
                      </div>
                      <div className="px-5 py-4 flex items-center justify-center bg-brand-50/30">
                        <Cell value={row.pro} featured />
                      </div>
                      <div className="px-5 py-4 flex items-center justify-center">
                        <Cell value={row.enterprise} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Table footer CTAs */}
              <div className="grid grid-cols-4 border-t border-border bg-gray-50">
                <div className="px-5 py-5" />
                {PLAN_TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "px-4 py-5 flex justify-center",
                      tier.featured && "bg-brand-50/50"
                    )}
                  >
                    <Button
                      variant={tier.featured ? "default" : "outline"}
                      size="sm"
                      className="w-full max-w-[140px]"
                      asChild
                    >
                      <Link
                        href={
                          tier.price === 0
                            ? "/signup"
                            : tier.name === "Enterprise"
                            ? "/contact"
                            : "/signup?plan=pro"
                        }
                      >
                        {tier.cta}
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ teaser */}
        <section className="bg-dark py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-400 mb-8">
              Our team is happy to walk you through what plan makes sense for
              your business.
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
