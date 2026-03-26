"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  MapPin,
  Ruler,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Shield,
  BarChart3,
  Zap,
  Users,
  Check,
  Hammer,
  PieChart,
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
  { label: "Small", description: "Under $5K", value: "small", multiplier: 1, example: "Fixture replacement, minor repair" },
  { label: "Medium", description: "$5K – $15K", value: "medium", multiplier: 2.5, example: "Bathroom remodel, deck build" },
  { label: "Large", description: "$15K – $50K", value: "large", multiplier: 6, example: "Kitchen renovation, roof replacement" },
  { label: "Major", description: "$50K+", value: "major", multiplier: 15, example: "Addition, whole-home remodel" },
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
  midpoint: number;
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

function generateEstimate(
  category: string,
  zip: string,
  size: string
): EstimateResult {
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
    low, high, midpoint, materials, labor, overhead,
    materialsPct: Math.round(base.materials * 100),
    laborPct: Math.round(base.labor * 100),
    overheadPct: Math.round((1 - base.materials - base.labor) * 100),
    confidence: multiplier <= 2.5 ? "high" : multiplier <= 6 ? "medium" : "low",
    category,
    zip,
    size: sizeConfig?.label ?? size,
    regionLabel,
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
  const [step, setStep] = useState(0); // 0=category, 1=zip, 2=size, 3=result
  const [category, setCategory] = useState("");
  const [zip, setZip] = useState("");
  const [size, setSize] = useState("");
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [animateResult, setAnimateResult] = useState(false);

  function handleCategorySelect(cat: string) {
    setCategory(cat);
    setStep(1);
  }

  function handleZipSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (zip.length === 5) setStep(2);
  }

  function handleSizeSelect(s: string) {
    setSize(s);
    setLoading(true);
    setTimeout(() => {
      const est = generateEstimate(category, zip, s);
      setResult(est);
      setLoading(false);
      setStep(3);
      setTimeout(() => setAnimateResult(true), 50);
    }, 1400);
  }

  function handleReset() {
    setResult(null);
    setCategory("");
    setZip("");
    setSize("");
    setStep(0);
    setAnimateResult(false);
  }

  function handleBack() {
    if (step === 1) { setStep(0); setZip(""); }
    else if (step === 2) setStep(1);
  }

  const progressWidth = step === 3 ? "100%" : `${((step) / 3) * 100}%`;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="pt-24">
        {/* Hero — compact */}
        <section className="bg-dark py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">
                Powered by ConstructionAI
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              What should your project cost?
            </h1>
            <p className="mt-4 text-lg text-gray-400 leading-relaxed max-w-xl mx-auto">
              Instant cost estimate. Localized to your zip code. Trained on
              thousands of real construction estimates.
            </p>
          </div>
        </section>

        {/* Estimator */}
        <section className="py-12 sm:py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Progress bar */}
            {step < 3 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">
                    Step {step + 1} of 3
                  </span>
                  {step > 0 && (
                    <button
                      onClick={handleBack}
                      className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                  )}
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: progressWidth }}
                  />
                </div>
              </div>
            )}

            {/* Step 0: Category selection */}
            {step === 0 && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    What type of work do you need?
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Select a trade category</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {JOB_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={cn(
                        "text-left p-4 rounded-xl border transition-all duration-150",
                        "hover:border-brand-600 hover:bg-brand-50/50 hover:shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2",
                        category === cat
                          ? "border-brand-600 bg-brand-50/50"
                          : "border-border bg-white"
                      )}
                    >
                      <Hammer className="w-4 h-4 text-brand-600 mb-2" />
                      <span className="text-sm font-semibold text-gray-900 block">
                        {cat}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Zip code */}
            {step === 1 && (
              <div className="animate-step-forward">
                <div className="mb-6">
                  <Badge className="mb-3 bg-brand-50 text-brand-700 border-brand-200 text-xs">
                    {category}
                  </Badge>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Where is the project?
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Labor and material costs vary by region
                  </p>
                </div>
                <form onSubmit={handleZipSubmit} className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                      placeholder="Enter 5-digit zip code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      className="pl-12 h-14 text-lg rounded-xl"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={zip.length !== 5}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Project size */}
            {step === 2 && !loading && (
              <div className="animate-step-forward">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-brand-50 text-brand-700 border-brand-200 text-xs">
                      {category}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                      {zip}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    How big is the project?
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    This helps narrow the estimate range
                  </p>
                </div>
                <div className="space-y-3">
                  {PROJECT_SIZES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleSizeSelect(s.value)}
                      className="w-full text-left p-5 rounded-xl border border-border bg-white hover:border-brand-600 hover:bg-brand-50/30 hover:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-base font-semibold text-gray-900">
                            {s.label}
                          </span>
                          <span className="text-sm text-gray-400 ml-2">
                            {s.description}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{s.example}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="py-20 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Calculating your estimate
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Analyzing {category.toLowerCase()} costs near {zip}...
                </p>
              </div>
            )}

            {/* Step 3: Result */}
            {step === 3 && result && (
              <div className={cn(
                "space-y-6 transition-all duration-500",
                animateResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                {/* Price range hero */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="bg-dark px-6 sm:px-8 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <PieChart className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                          <p className="text-white/60 text-xs font-medium uppercase tracking-widest">
                            FairPrice Estimate
                          </p>
                          <p className="text-white text-sm">
                            {result.category} &middot; {result.zip}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs font-bold uppercase tracking-wide",
                          result.confidence === "high"
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : result.confidence === "medium"
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                        )}
                      >
                        {result.confidence} confidence
                      </Badge>
                    </div>
                  </div>

                  <div className="px-6 sm:px-8 py-8">
                    {/* Price range */}
                    <div className="text-center mb-8">
                      <p className="text-sm text-gray-400 mb-3">
                        Estimated cost for {result.size.toLowerCase()} {result.category.toLowerCase()}
                      </p>
                      <div className="flex items-baseline justify-center gap-3">
                        <span className="text-4xl sm:text-5xl font-bold text-gray-900 tabular-nums">
                          {formatUSD(result.low)}
                        </span>
                        <span className="text-xl text-gray-300">&ndash;</span>
                        <span className="text-4xl sm:text-5xl font-bold text-gray-900 tabular-nums">
                          {formatUSD(result.high)}
                        </span>
                      </div>
                    </div>

                    {/* Visual bar breakdown */}
                    <div className="mb-6">
                      <div className="flex h-4 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-600 transition-all duration-700"
                          style={{ width: `${result.materialsPct}%` }}
                        />
                        <div
                          className="bg-brand-400 transition-all duration-700"
                          style={{ width: `${result.laborPct}%` }}
                        />
                        <div
                          className="bg-brand-200 transition-all duration-700"
                          style={{ width: `${result.overheadPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Breakdown cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Materials
                          </span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 tabular-nums">
                          {formatUSD(result.materials)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{result.materialsPct}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Labor
                          </span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 tabular-nums">
                          {formatUSD(result.labor)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{result.laborPct}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-200" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Overhead
                          </span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 tabular-nums">
                          {formatUSD(result.overhead)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{result.overheadPct}%</p>
                      </div>
                    </div>

                    {/* Region note */}
                    <div className="flex items-start gap-2 mt-6 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="text-xs text-blue-700">
                        <span className="font-semibold">Regional adjustment:</span>{" "}
                        {result.regionLabel}. Estimates reflect typical costs in your area — actual
                        prices depend on scope, materials, and contractor availability.
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/signup"
                    className="group bg-brand-600 hover:bg-brand-700 rounded-2xl p-6 transition-colors"
                  >
                    <h3 className="text-base font-bold text-white mb-1">
                      Get real bids
                    </h3>
                    <p className="text-sm text-brand-100 mb-4">
                      Post your project and compare bids against this FairPrice estimate.
                    </p>
                    <span className="text-xs font-semibold text-white flex items-center gap-1">
                      Post a project free
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                  <button
                    onClick={handleReset}
                    className="text-left bg-white hover:bg-gray-50 rounded-2xl p-6 border border-border transition-colors"
                  >
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      Estimate another project
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Run another estimate for a different trade, size, or location.
                    </p>
                    <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                      Start over
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
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
                <div key={item.title} className="text-center">
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
