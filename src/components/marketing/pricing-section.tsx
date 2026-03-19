import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLAN_TIERS } from "@/lib/constants";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-surface py-20 sm:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            Flat subscription. No lead fees. No percentage of jobs. Pick the
            plan that fits where you are — upgrade when you&apos;re ready.
          </p>
        </div>

        {/* Pricing cards */}
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
              {/* Most Popular badge */}
              {tier.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="px-4 py-1 text-xs font-bold uppercase tracking-wide shadow-sm">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Tier name + description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
              </div>

              {/* Price */}
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
                  <p className="text-sm text-gray-400 mt-0.5">{tier.period}</p>
                )}
              </div>

              {/* Feature list */}
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

              {/* CTA */}
              <Button
                variant={tier.featured ? "default" : "outline"}
                size="lg"
                className="w-full"
                asChild
              >
                <Link href={tier.price === 0 ? "/signup" : tier.name === "Enterprise" ? "/contact" : "/signup?plan=pro"}>
                  {tier.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom disclaimer */}
        <p className="text-center text-sm text-gray-400 mt-10">
          All plans include a 14-day free trial. No credit card required to get
          started.
        </p>
      </div>
    </section>
  );
}
