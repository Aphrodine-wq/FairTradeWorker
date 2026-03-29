"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { cn } from "@shared/lib/utils";
import { CONTRACTOR_TIERS, HOMEOWNER_TIERS } from "@shared/lib/constants";

type Audience = "contractor" | "homeowner";

export function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const [audience, setAudience] = useState<Audience>("contractor");

  const tiers =
    audience === "contractor" ? CONTRACTOR_TIERS : HOMEOWNER_TIERS;

  return (
    <section id="pricing" className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 inline">
              Pricing{" "}
            </h2>
            <span className="text-3xl font-normal text-gray-600">
              No surprises.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Audience toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-none p-1">
              <button
                type="button"
                onClick={() => setAudience("contractor")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-none transition-colors",
                  audience === "contractor"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                )}
              >
                Contractors
              </button>
              <button
                type="button"
                onClick={() => setAudience("homeowner")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-none transition-colors",
                  audience === "homeowner"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                )}
              >
                Homeowners
              </button>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center gap-3">
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
                onClick={() => setYearly(!yearly)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-none transition-colors",
                  yearly ? "bg-brand-600" : "bg-gray-200"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-none bg-white transition-transform",
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
          </div>
        </div>

        <div
          className={cn(
            "grid grid-cols-1 gap-6 items-stretch",
            audience === "contractor"
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : "sm:grid-cols-2 max-w-3xl"
          )}
        >
          {tiers.map((tier) => {
            const price = yearly ? tier.yearlyPrice : tier.monthlyPrice;
            const isFree = tier.monthlyPrice === 0;

            return (
              <div
                key={tier.name}
                className={cn(
                  "bg-white border rounded-none flex flex-col p-8",
                  tier.featured
                    ? "border-brand-600 border-t-4"
                    : "border-border"
                )}
              >
                {tier.featured && (
                  <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">
                    Popular
                  </p>
                )}

                <h3 className="text-lg font-bold text-gray-900">
                  {tier.name}
                </h3>
                <p className="text-sm text-gray-700 mt-1 mb-6">
                  {tier.description}
                </p>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900 tabular-nums">
                    {isFree ? "Free" : `$${price}`}
                  </span>
                  {!isFree && (
                    <span className="text-sm text-gray-700 ml-1">
                      /{yearly ? "year" : "month"}
                    </span>
                  )}
                  {isFree && (
                    <p className="text-sm text-gray-600 mt-1">forever</p>
                  )}
                  {!isFree && yearly && (
                    <p className="text-sm text-brand-600 mt-1">
                      ${price > 0 ? Math.round((price / 12) * 100) / 100 : 0}/mo effective
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-gray-800"
                    >
                      <span className="text-brand-600 font-bold flex-shrink-0">
                        &#10003;
                      </span>
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
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-gray-700 mt-8">
          Zero lead fees on every plan.
        </p>
      </div>
    </section>
  );
}
