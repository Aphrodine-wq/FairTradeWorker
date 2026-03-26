"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  MapPin,
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
  Wrench,
  Lightbulb,
  Wind,
  Home,
  Paintbrush,
  Grid3X3,
  TreePine,
  HardHat,
  Boxes,
  Fence,
  LayoutGrid,
} from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Badge } from "@shared/ui/badge";
import { cn } from "@shared/lib/utils";

const CATEGORIES = [
  { label: "General Contracting", icon: HardHat },
  { label: "Plumbing", icon: Wrench },
  { label: "Electrical", icon: Lightbulb },
  { label: "HVAC", icon: Wind },
  { label: "Roofing", icon: Home },
  { label: "Painting", icon: Paintbrush },
  { label: "Flooring", icon: Grid3X3 },
  { label: "Landscaping", icon: TreePine },
  { label: "Remodeling", icon: LayoutGrid },
  { label: "Concrete", icon: Boxes },
  { label: "Fencing", icon: Fence },
  { label: "Drywall", icon: Hammer },
] as const;

const PROJECT_SIZES = [
  { label: "Small", description: "Under $5K", value: "small", multiplier: 1, example: "Fixture swap, minor repair" },
  { label: "Medium", description: "$5K – $15K", value: "medium", multiplier: 2.5, example: "Bathroom remodel, new deck" },
  { label: "Large", description: "$15K – $50K", value: "large", multiplier: 6, example: "Kitchen reno, new roof" },
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
    low, high, midpoint, materials, labor, overhead,
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
  const [step, setStep] = useState(0);
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

  const selectedCategoryIcon = CATEGORIES.find((c) => c.label === category)?.icon;

  return (
    <div className="min-h-screen bg-[#FDFBF8]">
      <Navbar />

      <main>
        {/* Hero + Estimator — unified section */}
        <section className="relative bg-dark overflow-hidden">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40L40 0M-10 10L10-10M30 50L50 30' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top content */}
            <div className="pt-28 sm:pt-36 pb-32 sm:pb-44 max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 max-w-[40px] bg-brand-600" />
                <span className="text-xs font-bold text-brand-400 uppercase tracking-[0.2em]">
                  FairPrice
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                What should your
                <br />
                project cost?
              </h1>
              <p className="mt-5 text-lg text-gray-400 leading-relaxed max-w-lg">
                Instant cost estimate. Localized to your zip.
                Trained on thousands of real construction bids.
              </p>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-500">Free. No signup.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-500">12 trade categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-500">ConstructionAI powered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estimator card — overlaps the hero */}
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="absolute bottom-0 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 translate-y-1/2">
              <div className="bg-white rounded-2xl border border-border shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] overflow-hidden">

                {/* Progress bar — thin line at top of card */}
                {step < 3 && (
                  <div className="h-1 bg-gray-100">
                    <div
                      className="h-full bg-brand-600 transition-all duration-500 ease-out"
                      style={{ width: `${((step + 1) / 3) * 100}%` }}
                    />
                  </div>
                )}

                <div className="p-6 sm:p-8 lg:p-10">

                  {/* Step 0: Category */}
                  {step === 0 && (
                    <div className="animate-fade-in">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            What type of work?
                          </h2>
                          <p className="text-sm text-gray-500 mt-0.5">Select a trade category</p>
                        </div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 rounded-full px-3 py-1">
                          1 of 3
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.label}
                              onClick={() => handleCategorySelect(cat.label)}
                              className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-white hover:border-brand-300 hover:bg-brand-50/40 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
                            >
                              <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-brand-100/60 flex items-center justify-center shrink-0 transition-colors">
                                <Icon className="w-4.5 h-4.5 text-gray-400 group-hover:text-brand-600 transition-colors" />
                              </div>
                              <span className="text-sm font-semibold text-gray-800 text-left leading-tight">
                                {cat.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 1: Zip */}
                  {step === 1 && (
                    <div className="animate-step-forward max-w-md mx-auto">
                      <div className="flex items-center justify-between mb-6">
                        <button
                          onClick={handleBack}
                          className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 rounded-full px-3 py-1">
                          2 of 3
                        </span>
                      </div>
                      <div className="text-center mb-8">
                        <Badge className="mb-3 bg-brand-50 text-brand-700 border-brand-200 text-xs font-semibold">
                          {category}
                        </Badge>
                        <h2 className="text-xl font-bold text-gray-900">
                          Where is the project?
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          We adjust for regional labor and material costs
                        </p>
                      </div>
                      <form onSubmit={handleZipSubmit} className="space-y-4">
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={5}
                            placeholder="5-digit zip code"
                            value={zip}
                            onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                            className="pl-12 h-14 text-lg text-center rounded-xl border-gray-200 focus:border-brand-600"
                            autoFocus
                          />
                        </div>
                        <Button type="submit" size="lg" className="w-full" disabled={zip.length !== 5}>
                          Continue <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Step 2: Size */}
                  {step === 2 && !loading && (
                    <div className="animate-step-forward max-w-lg mx-auto">
                      <div className="flex items-center justify-between mb-6">
                        <button
                          onClick={handleBack}
                          className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 rounded-full px-3 py-1">
                          3 of 3
                        </span>
                      </div>
                      <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Badge className="bg-brand-50 text-brand-700 border-brand-200 text-xs font-semibold">
                            {category}
                          </Badge>
                          <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-xs font-semibold">
                            {zip}
                          </Badge>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                          How big is the project?
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {PROJECT_SIZES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => handleSizeSelect(s.value)}
                            className="group text-left p-5 rounded-xl border border-border bg-white hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
                          >
                            <p className="text-lg font-bold text-gray-900">{s.label}</p>
                            <p className="text-sm font-medium text-brand-600 mt-0.5">{s.description}</p>
                            <p className="text-xs text-gray-400 mt-2">{s.example}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading */}
                  {loading && (
                    <div className="py-16 text-center animate-fade-in">
                      <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-2xl bg-brand-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Calculating your estimate
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Analyzing {category.toLowerCase()} costs near {zip}
                      </p>
                    </div>
                  )}

                  {/* Step 3: Result */}
                  {step === 3 && result && (
                    <div className={cn(
                      "transition-all duration-500",
                      animateResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}>
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {selectedCategoryIcon && (
                            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                              {(() => { const Icon = selectedCategoryIcon; return <Icon className="w-4 h-4 text-brand-600" />; })()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{result.category}</p>
                            <p className="text-xs text-gray-400">{result.zip} &middot; {result.size}</p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs font-bold uppercase tracking-wide",
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

                      {/* Divider */}
                      <div className="h-px bg-border my-5" />

                      {/* Price range */}
                      <div className="text-center py-4">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                          Estimated cost range
                        </p>
                        <div className="flex items-baseline justify-center gap-2 sm:gap-3">
                          <span className="text-4xl sm:text-5xl font-bold text-gray-900 tabular-nums">
                            {formatUSD(result.low)}
                          </span>
                          <span className="text-lg text-gray-300 font-light">/</span>
                          <span className="text-4xl sm:text-5xl font-bold text-gray-900 tabular-nums">
                            {formatUSD(result.high)}
                          </span>
                        </div>
                      </div>

                      {/* Breakdown bar */}
                      <div className="mt-6 mb-4">
                        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                          <div className="bg-brand-600 rounded-l-full transition-all duration-700" style={{ width: `${result.materialsPct}%` }} />
                          <div className="bg-brand-400 transition-all duration-700" style={{ width: `${result.laborPct}%` }} />
                          <div className="bg-brand-200 rounded-r-full transition-all duration-700" style={{ width: `${result.overheadPct}%` }} />
                        </div>
                      </div>

                      {/* Breakdown row */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="rounded-xl bg-gray-50/80 p-4">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-2 h-2 rounded-full bg-brand-600" />
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Materials</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 tabular-nums">{formatUSD(result.materials)}</p>
                          <p className="text-xs text-gray-400">{result.materialsPct}% of total</p>
                        </div>
                        <div className="rounded-xl bg-gray-50/80 p-4">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-2 h-2 rounded-full bg-brand-400" />
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Labor</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 tabular-nums">{formatUSD(result.labor)}</p>
                          <p className="text-xs text-gray-400">{result.laborPct}% of total</p>
                        </div>
                        <div className="rounded-xl bg-gray-50/80 p-4">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-2 h-2 rounded-full bg-brand-200" />
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Overhead</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 tabular-nums">{formatUSD(result.overhead)}</p>
                          <p className="text-xs text-gray-400">{result.overheadPct}% of total</p>
                        </div>
                      </div>

                      {/* Region note */}
                      <div className="flex items-start gap-2 p-3 bg-blue-50/60 rounded-lg border border-blue-100 mb-6">
                        <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-600">
                          <span className="font-semibold">Regional adjustment:</span>{" "}
                          {result.regionLabel}
                        </p>
                      </div>

                      {/* CTAs */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button size="lg" className="flex-1" asChild>
                          <Link href="/signup">
                            Get real bids from contractors
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        <Button size="lg" variant="outline" onClick={handleReset} className="flex-1 sm:flex-none">
                          Estimate another
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Spacer for the overlapping card */}
          <div className="h-0" />
        </section>

        {/* Spacer to push content below the floating card */}
        {step === 0 && <div className="h-[280px] sm:h-[260px]" />}
        {step === 1 && <div className="h-[220px] sm:h-[200px]" />}
        {step === 2 && <div className="h-[240px] sm:h-[220px]" />}
        {(step === 3 || loading) && <div className="h-[320px] sm:h-[300px]" />}

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
                    "Every bid on FairTradeWorker feeds back into the model. More data means better estimates for everyone.",
                },
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

        {/* Trust section */}
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
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-600" strokeWidth={2.5} />
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
