import Link from "next/link";
import { Button } from "@shared/ui/button";
import { cn } from "@shared/lib/utils";
import { PLAN_TIERS } from "@shared/lib/constants";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 inline">Pricing </h2>
          <span className="text-3xl font-normal text-gray-400">No surprises.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLAN_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "bg-white border flex flex-col p-8",
                tier.featured ? "border-brand-600 border-t-4" : "border-border"
              )}
            >
              {tier.featured && (
                <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">
                  Popular
                </p>
              )}

              <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">{tier.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900 tabular-nums">
                  {tier.price === 0 ? "Free" : `$${tier.price}`}
                </span>
                {tier.price > 0 && (
                  <span className="text-sm text-gray-500 ml-1">/{tier.period}</span>
                )}
                {tier.price === 0 && (
                  <p className="text-sm text-gray-400 mt-1">{tier.period}</p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="text-brand-600 font-bold flex-shrink-0">&#10003;</span>
                    {feature}
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

        <p className="text-sm text-gray-500 mt-8">Zero lead fees on every plan.</p>
      </div>
    </section>
  );
}
