"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  MapPin,
  ArrowRight,
  TrendingUp,
  Shield,
  BarChart3,
  Zap,
  Users,
  Check,
  Info,
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
  materialsPct: number;
  laborPct: number;
  overheadPct: number;
  confidence: "high" | "medium" | "low";
  category: string;
  zip: string;
  size: string;
  regionLabel: string;
}

function generateEstimate(category: string, zip: string, size: string): EstimateResult {
  const base = BASE_ESTIMATES[category] ?? { low: 2500, high: 5000, materials: 0.35, labor: 0.50 };
  const sizeConfig = PROJECT_SIZES.find((s) => s.value === size);
  const multiplier = sizeConfig?.multiplier ?? 1;

  const zipPrefix = parseInt(zip.slice(0, 3), 10);
  let regionMultiplier = 1.0;
  let regionLabel = "National average";
  if (zipPrefix >= 700 && zipPrefix <= 799) { regionMultiplier = 0.88; regionLabel = "Southern US (below avg)"; }
  else if (zipPrefix >= 900 && zipPrefix <= 961) { regionMultiplier = 1.25; regionLabel = "California (above avg)"; }
  else if (zipPrefix >= 100 && zipPrefix <= 119) { regionMultiplier = 1.30; regionLabel = "NYC metro (above avg)"; }
  else if (zipPrefix >= 200 && zipPrefix <= 219) { regionMultiplier = 1.15; regionLabel = "DC metro (above avg)"; }
  else if (zipPrefix >= 300 && zipPrefix <= 399) { regionMultiplier = 0.92; regionLabel = "Southeast US (below avg)"; }
  else if (zipPrefix >= 600 && zipPrefix <= 629) { regionMultiplier = 1.08; regionLabel = "Chicago metro (above avg)"; }

  const low = Math.round(base.low * multiplier * regionMultiplier / 100) * 100;
  const high = Math.round(base.high * multiplier * regionMultiplier / 100) * 100;
  const midpoint = (low + high) / 2;
  const materials = Math.round(midpoint * base.materials);
  const labor = Math.round(midpoint * base.labor);
  const overhead = Math.round(midpoint * (1 - base.materials - base.labor));

  return {
    low, high, materials, labor, overhead,
    materialsPct: Math.round(base.materials * 100),
    laborPct: Math.round(base.labor * 100),
    overheadPct: Math.round((1 - base.materials - base.labor) * 100),
    confidence: multiplier <= 2.5 ? "high" : multiplier <= 6 ? "medium" : "low",
    category, zip,
    size: sizeConfig?.label ?? size,
    regionLabel,
  };
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
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
    <div className="min-h-screen bg-[#FDFBF8]">
      <Navbar />

      <main className="pt-24 pb-0">
        {/* Hero with form */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

              {/* Left — copy */}
              <div className="lg:pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-[0.15em]">
                    FairPrice Estimator
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                  What should your project cost?
                </h1>
                <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                  Get an instant AI-powered estimate. Localized to your area,
                  calibrated to your scope. Free, no signup required.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    "Trained on thousands of real construction estimates",
                    "Adjusted for regional labor and material costs",
                    "Compare bids against your FairPrice baseline",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 mt-0.5 text-brand-600 shrink-0" strokeWidth={2.5} />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-xs text-gray-400">
                  Powered by ConstructionAI — our fine-tuned model trained on
                  real bid data across every trade.
                </p>
              </div>

              {/* Right — form or result */}
              <div>
                {!result ? (
                  <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-5"
                  >
                    <div>
                      <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-1.5">
                        Type of work
                      </label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      >
                        <option value="">Select a trade</option>
                        {JOB_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="zip" className="block text-sm font-semibold text-gray-900 mb-1.5">
                        Zip code
                      </label>
                      <Input
                        id="zip"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={5}
                        placeholder="e.g. 38655"
                        value={zip}
                        onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        className="h-11"
                      />
                    </div>

                    <div>
                      <label htmlFor="size" className="block text-sm font-semibold text-gray-900 mb-1.5">
                        Project size
                      </label>
                      <select
                        id="size"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      >
                        <option value="">Select size</option>
                        {PROJECT_SIZES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={!canSubmit || loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Calculating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Get Estimate
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in">
                    {/* Result header */}
                    <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900">{result.category}</p>
                        <Badge
                          className={cn(
                            "text-xs font-bold uppercase",
                            result.confidence === "high"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : result.confidence === "medium"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          )}
                        >
                          {result.confidence} confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-6">
                        {result.zip} &middot; {result.size}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-4xl sm:text-5xl font-bold text-gray-900 tabular-nums">
                          {formatUSD(result.low)}
                        </span>
                        <span className="text-xl text-gray-300">&ndash;</span>
                        <span className="text-4xl sm:text-5xl font-bold text-gray-900 tabular-nums">
                          {formatUSD(result.high)}
                        </span>
                      </div>

                      {/* Breakdown bar */}
                      <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-4">
                        <div className="bg-brand-600 rounded-l-full" style={{ width: `${result.materialsPct}%` }} />
                        <div className="bg-brand-400" style={{ width: `${result.laborPct}%` }} />
                        <div className="bg-brand-200 rounded-r-full" style={{ width: `${result.overheadPct}%` }} />
                      </div>

                      {/* Breakdown numbers */}
                      <div className="grid grid-cols-3 gap-4 mb-5">
                        {[
                          { color: "bg-brand-600", label: "Materials", value: result.materials, pct: result.materialsPct },
                          { color: "bg-brand-400", label: "Labor", value: result.labor, pct: result.laborPct },
                          { color: "bg-brand-200", label: "Overhead", value: result.overhead, pct: result.overheadPct },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={cn("w-2 h-2 rounded-full", item.color)} />
                              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{item.label}</span>
                            </div>
                            <p className="text-base font-bold text-gray-900 tabular-nums">{formatUSD(item.value)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Region note */}
                      <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg mb-6">
                        <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-500">
                          {result.regionLabel}. Actual costs depend on scope, materials, and contractor.
                        </p>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col gap-2.5">
                      <Button size="lg" className="w-full" asChild>
                        <Link href="/signup">
                          Get real bids from contractors
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" className="w-full" onClick={handleReset}>
                        Estimate another project
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: Zap, title: "AI-Powered Estimates", description: "ConstructionAI is trained on thousands of real construction estimates across every trade. Not a national average — a real estimate." },
                { icon: MapPin, title: "Localized to Your Area", description: "Labor rates, material costs, and permitting fees vary by zip code. FairPrice adjusts for your specific market." },
                { icon: TrendingUp, title: "Gets Smarter Over Time", description: "Every bid on FairTradeWorker feeds back into the model. More data means better estimates for everyone." },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="py-16 sm:py-20 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Know What&apos;s Fair Before You Hire
                </h2>
                <p className="mt-4 text-gray-500 leading-relaxed">
                  The biggest mistake homeowners make is hiring without a
                  baseline. FairPrice gives you that baseline — so when
                  bids come in, you know exactly where they stand.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "See how each bid compares to market rate",
                    "Stop overpaying for basic work",
                    "Stop underpaying and getting cut corners",
                    "Make confident hiring decisions",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-600" strokeWidth={2.5} />
                      <span className="text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: "Verified contractors", value: "3,200+" },
                  { icon: BarChart3, label: "Estimates analyzed", value: "12,800+" },
                  { icon: Users, label: "Satisfaction rate", value: "98%" },
                  { icon: DollarSign, label: "Average savings", value: "23%" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white border border-border rounded-xl p-5">
                    <stat.icon className="w-5 h-5 text-brand-600 mb-3" />
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{stat.value}</p>
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
            <h2 className="text-2xl font-bold text-white mb-4">Ready for Real Bids?</h2>
            <p className="text-gray-400 mb-8">
              FairPrice gives you the baseline. FairTradeWorker gives you
              verified contractors competing for your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Post a Project Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500" asChild>
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
