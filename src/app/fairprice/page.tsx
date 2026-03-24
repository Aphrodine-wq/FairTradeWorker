"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  MapPin,
  Ruler,
  ArrowRight,
  TrendingUp,
  Shield,
  BarChart3,
  Zap,
  Users,
  Check,
} from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Badge } from "@shared/ui/badge";
import { cn } from "@shared/lib/utils";
import { JOB_CATEGORIES } from "@shared/lib/constants";

const PROJECT_SIZES = [
  { label: "Small — under $5K", value: "small", multiplier: 1 },
  { label: "Medium — $5K to $15K", value: "medium", multiplier: 2.5 },
  { label: "Large — $15K to $50K", value: "large", multiplier: 6 },
  { label: "Major — $50K+", value: "major", multiplier: 15 },
] as const;

// Mock estimation data keyed by category
const BASE_ESTIMATES: Record<string, { low: number; high: number; materials: number; labor: number }> = {
  "General Contracting": { low: 3200, high: 5800, materials: 0.35, labor: 0.50 },
  "Plumbing": { low: 1800, high: 3400, materials: 0.30, labor: 0.55 },
  "Electrical": { low: 2000, high: 3800, materials: 0.25, labor: 0.60 },
  "HVAC": { low: 3500, high: 6200, materials: 0.40, labor: 0.45 },
  "Roofing": { low: 4000, high: 7500, materials: 0.45, labor: 0.40 },
  "Painting": { low: 1200, high: 2400, materials: 0.30, labor: 0.55 },
  "Flooring": { low: 2200, high: 4000, materials: 0.45, labor: 0.40 },
  "Landscaping": { low: 1500, high: 3200, materials: 0.35, labor: 0.50 },
  "Remodeling": { low: 5000, high: 9000, materials: 0.40, labor: 0.45 },
  "Concrete": { low: 2800, high: 5200, materials: 0.40, labor: 0.45 },
  "Fencing": { low: 1800, high: 3600, materials: 0.45, labor: 0.40 },
  "Drywall": { low: 1500, high: 2800, materials: 0.30, labor: 0.55 },
};

interface EstimateResult {
  low: number;
  high: number;
  materials: number;
  labor: number;
  overhead: number;
  confidence: "high" | "medium" | "low";
  category: string;
  zip: string;
  size: string;
}

function generateEstimate(
  category: string,
  zip: string,
  size: string
): EstimateResult {
  const base = BASE_ESTIMATES[category] ?? { low: 2500, high: 5000, materials: 0.35, labor: 0.50 };
  const sizeConfig = PROJECT_SIZES.find((s) => s.value === size);
  const multiplier = sizeConfig?.multiplier ?? 1;

  // Zip-based regional adjustment (mock — southern states cheaper, coasts more expensive)
  const zipPrefix = parseInt(zip.slice(0, 3), 10);
  let regionMultiplier = 1.0;
  if (zipPrefix >= 700 && zipPrefix <= 799) regionMultiplier = 0.88; // TX/South
  else if (zipPrefix >= 900 && zipPrefix <= 961) regionMultiplier = 1.25; // CA
  else if (zipPrefix >= 100 && zipPrefix <= 119) regionMultiplier = 1.30; // NYC area
  else if (zipPrefix >= 200 && zipPrefix <= 219) regionMultiplier = 1.15; // DC area

  const low = Math.round(base.low * multiplier * regionMultiplier / 100) * 100;
  const high = Math.round(base.high * multiplier * regionMultiplier / 100) * 100;

  const midpoint = (low + high) / 2;
  const materials = Math.round(midpoint * base.materials);
  const labor = Math.round(midpoint * base.labor);
  const overhead = Math.round(midpoint * (1 - base.materials - base.labor));

  return {
    low,
    high,
    materials,
    labor,
    overhead,
    confidence: multiplier <= 2.5 ? "high" : multiplier <= 6 ? "medium" : "low",
    category,
    zip,
    size: sizeConfig?.label ?? size,
  };
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function FairPricePage() {
  const [category, setCategory] = useState("");
  const [zip, setZip] = useState("");
  const [size, setSize] = useState("");
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = category && zip.length === 5 && size;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    // Simulate AI inference latency
    setTimeout(() => {
      setResult(generateEstimate(category, zip, size));
      setLoading(false);
    }, 1200);
  }

  function handleReset() {
    setResult(null);
    setCategory("");
    setZip("");
    setSize("");
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="bg-white py-16 sm:py-20 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
              FairPrice
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              What Should Your Project Cost?
            </h1>
            <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Get an instant AI-powered cost estimate for your project.
              Localized to your area, calibrated to your scope. Know
              what&apos;s fair before the first bid comes in.
            </p>
          </div>
        </section>

        {/* Estimator form */}
        <section className="py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {!result ? (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Get Your Estimate
                    </h2>
                    <p className="text-sm text-gray-500">
                      Three questions. Instant result.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      <span className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-gray-400" />
                        What type of work?
                      </span>
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                    >
                      <option value="">Select a trade category</option>
                      {JOB_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Zip */}
                  <div>
                    <label
                      htmlFor="zip"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        Where is the project?
                      </span>
                    </label>
                    <Input
                      id="zip"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                      placeholder="Enter zip code"
                      value={zip}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                        setZip(v);
                      }}
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <label
                      htmlFor="size"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        How big is the project?
                      </span>
                    </label>
                    <select
                      id="size"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                    >
                      <option value="">Select project size</option>
                      {PROJECT_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!canSubmit || loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Get FairPrice Estimate
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Powered by ConstructionAI — trained on thousands of real
                  construction estimates.
                </p>
              </div>
            ) : (
              /* Results */
              <div className="space-y-6 animate-fade-in">
                {/* Main result card */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="bg-brand-600 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-brand-100 text-sm font-medium">
                          FairPrice Estimate
                        </p>
                        <p className="text-white text-sm mt-0.5">
                          {result.category} &middot; {result.zip}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs font-bold uppercase tracking-wide",
                          result.confidence === "high"
                            ? "bg-white/20 text-white border-white/30"
                            : result.confidence === "medium"
                            ? "bg-white/15 text-white/90 border-white/20"
                            : "bg-white/10 text-white/80 border-white/15"
                        )}
                      >
                        {result.confidence} confidence
                      </Badge>
                    </div>
                  </div>

                  <div className="px-8 py-8">
                    <p className="text-sm text-gray-500 mb-2">
                      Estimated cost range for {result.size.toLowerCase()}
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-gray-900 tabular-nums">
                        {formatUSD(result.low)}
                      </span>
                      <span className="text-2xl text-gray-300">&ndash;</span>
                      <span className="text-5xl font-bold text-gray-900 tabular-nums">
                        {formatUSD(result.high)}
                      </span>
                    </div>

                    {/* Breakdown */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                          Materials
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1 tabular-nums">
                          {formatUSD(result.materials)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                          Labor
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1 tabular-nums">
                          {formatUSD(result.labor)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                          Overhead
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1 tabular-nums">
                          {formatUSD(result.overhead)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                      Estimates reflect typical costs in your region. Actual
                      prices depend on scope, materials, site conditions, and
                      contractor availability.
                    </p>
                  </div>
                </div>

                {/* CTA card */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    Now get real bids from verified contractors
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                    Post your project on FairTradeWorker and receive competitive
                    bids from licensed, insured contractors in your area. Compare
                    each bid against your FairPrice estimate.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                    <Button size="lg" asChild>
                      <Link href="/signup">
                        Post Your Project Free
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleReset}>
                      Estimate Another Project
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* How FairPrice works */}
        <section className="bg-white py-16 sm:py-20 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                How FairPrice Works
              </h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                Instant cost intelligence powered by a construction-trained AI,
                calibrated with real market data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "AI-Powered Estimates",
                  description:
                    "ConstructionAI is trained on thousands of real construction estimates across every trade. Not a national average — a real estimate.",
                },
                {
                  icon: MapPin,
                  title: "Localized to Your Area",
                  description:
                    "Labor rates, material costs, and permitting fees vary by zip code. FairPrice adjusts for your specific market.",
                },
                {
                  icon: TrendingUp,
                  title: "Gets Smarter Over Time",
                  description:
                    "Every bid on the FairTradeWorker marketplace feeds back into the model. More data means better estimates for everyone.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <section className="py-16 sm:py-20 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Know What&apos;s Fair Before You Hire
                </h2>
                <p className="mt-4 text-gray-500 leading-relaxed">
                  The biggest mistake homeowners make is hiring without a
                  baseline. A fair price looks expensive when you&apos;re
                  comparing it to nothing. FairPrice gives you that baseline —
                  so when bids come in, you know exactly where they stand.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "See how each bid compares to market rate",
                    "Stop overpaying for basic work",
                    "Stop underpaying and getting cut corners",
                    "Make confident hiring decisions",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check
                        className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-600"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: "Verified contractors only", value: "3,200+" },
                  { icon: BarChart3, label: "Estimates analyzed", value: "12,800+" },
                  { icon: Users, label: "Homeowner satisfaction", value: "98%" },
                  { icon: DollarSign, label: "Average savings", value: "23%" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white border border-border rounded-xl p-5"
                  >
                    <stat.icon className="w-5 h-5 text-brand-600 mb-3" />
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-dark py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready for Real Bids?
            </h2>
            <p className="text-gray-400 mb-8">
              FairPrice gives you the baseline. FairTradeWorker gives you
              verified contractors competing for your business — no lead fees,
              no games.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Post a Project Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500"
                asChild
              >
                <Link href="/pricing">View Contractor Plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
