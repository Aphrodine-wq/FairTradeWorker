import type { Metadata } from "next";
import Link from "next/link";
import {
  Mic,
  DollarSign,
  Shield,
  BarChart3,
  Users,
  FileText,
  Check,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Discover how FairTradeWorker helps homeowners find verified contractors and helps contractors grow their business with AI-powered tools.",
  openGraph: {
    title: "Features | FairTradeWorker",
    description: "Discover how FairTradeWorker helps homeowners find verified contractors and helps contractors grow their business with AI-powered tools.",
  },
  alternates: {
    canonical: "/features",
  },
};

const TOP_FEATURES = [
  {
    icon: Mic,
    title: "Hunter Voice AI",
    description: "Walk the job site. Describe the scope out loud. Hunter builds a line-item estimate in three minutes — materials, labor, markup.",
    points: ["Works on your phone, no laptop", "CSI-division breakdowns", "Learns your pricing over time", "Edit before sending"],
    stat: { value: "3 min", label: "average estimate time" },
  },
  {
    icon: DollarSign,
    title: "Zero Lead Fees",
    description: "Other platforms charge $50\u2013$100 per lead, win or lose. We charge a flat subscription. No commissions, no per-lead charges.",
    points: ["Save $6,000+/year on average", "No percentage cut on revenue", "No caps on core features", "Lower bids \u2014 no lead cost to pad"],
    stat: { value: "$0", label: "per lead, every plan" },
  },
  {
    icon: Shield,
    title: "Escrow on Every Job",
    description: "Homeowners fund milestones upfront. Contractors get paid when work is verified. No chasing invoices, no bounced checks.",
    points: ["Milestone-based payments", "Contractors paid when verified", "5-day dispute resolution", "Full payment history + receipts"],
    stat: null,
  },
] as const;

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <main className="pt-16">
        {/* Hero */}
        <section className="bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-[0.2em] mb-4">
              Platform Features
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Everything you need.
              <br />
              Nothing you don&apos;t.
            </h1>
            <p className="mt-5 text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
              Built for contractors who want to win more work and homeowners who
              want honest pricing. No bloat, no gimmicks.
            </p>
          </div>
        </section>

        {/* Top 3 features — centered card grid */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TOP_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="bg-white rounded-sm border border-border p-8 flex flex-col text-center">
                    <div className="w-12 h-12 rounded-sm bg-brand-50 flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-6 flex-1">
                      {feature.description}
                    </p>
                    <ul className="space-y-2.5 text-left mx-auto">
                      {feature.points.map((d) => (
                        <li key={d} className="flex items-center gap-2.5 text-sm text-gray-800">
                          <div className="w-5 h-5 rounded-sm bg-brand-50 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-brand-600" strokeWidth={3} />
                          </div>
                          {d}
                        </li>
                      ))}
                    </ul>
                    {feature.stat && (
                      <div className="mt-6 pt-5 border-t border-border text-center">
                        <p className="text-3xl font-bold text-gray-900 tabular-nums">{feature.stat.value}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{feature.stat.label}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Analytics — split layout */}
        <section className="bg-white border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="w-12 h-12 rounded-sm bg-brand-50 flex items-center justify-center mb-5">
                  <BarChart3 className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                  Know your numbers.
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  See which jobs are profitable, track your win rate, and export
                  reports. Team plans add job costing and crew productivity metrics.
                </p>
                <ul className="space-y-3">
                  {[
                    "Revenue and job-level profitability",
                    "Bid win rate and conversion tracking",
                    "Team productivity on Team plans",
                    "QuickBooks-ready report exports",
                  ].map((d) => (
                    <li key={d} className="flex items-center gap-2.5 text-sm text-gray-800">
                      <div className="w-5 h-5 rounded-sm bg-brand-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-brand-600" strokeWidth={3} />
                      </div>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Win Rate", value: "34%", sub: "+8% this month" },
                  { label: "Avg Job Size", value: "$12,400", sub: "across 14 jobs" },
                  { label: "Response Time", value: "2.1 hr", sub: "faster than 90%" },
                  { label: "Revenue MTD", value: "$47,200", sub: "+23% vs last month" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#FAFAFA] rounded-sm border border-border p-5 text-center">
                    <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</p>
                    <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team + Estimates — two-column cards */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  icon: Users,
                  title: "Built for crews.",
                  description: "Shared projects, assignments, and status updates from the field. No more group texts. Team plans support up to 5 members, Enterprise is unlimited.",
                  points: ["Shared project dashboard", "Assignment and scope tracking", "Team activity feed", "Role-based access for field and office"],
                },
                {
                  icon: FileText,
                  title: "Estimates that close.",
                  description: "Branded PDF estimates with your logo and line-item breakdowns. Build manually, generate with AI, or reuse templates from past jobs.",
                  points: ["Your branding on every estimate", "Reusable templates from past jobs", "PDF generation and direct sharing", "Materials, labor, and markup detail"],
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="bg-white rounded-sm border border-border p-8">
                    <div className="w-12 h-12 rounded-sm bg-brand-50 flex items-center justify-center mb-5">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-2.5">
                      {feature.points.map((d) => (
                        <li key={d} className="flex items-center gap-2.5 text-sm text-gray-800">
                          <div className="w-5 h-5 rounded-sm bg-brand-50 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-brand-600" strokeWidth={3} />
                          </div>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-white border-t border-border py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
              Ready to see it in action?
            </h2>
            <p className="text-gray-700 mb-8 max-w-lg mx-auto">
              Start free. No credit card required. See why contractors are switching
              from lead-based platforms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-sm bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
