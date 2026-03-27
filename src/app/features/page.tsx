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
};

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
            <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              Built for contractors who want to win more work and homeowners who
              want honest pricing. No bloat, no gimmicks.
            </p>
          </div>
        </section>

        {/* Top 3 features — card grid */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Hunter Voice AI */}
              <div className="bg-white rounded-2xl border border-border p-7 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <Mic className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Hunter Voice AI
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">
                  Walk the job site. Describe the scope out loud. Hunter builds a
                  line-item estimate in three minutes — materials, labor, markup.
                </p>
                <ul className="space-y-2">
                  {[
                    "Works on your phone, no laptop",
                    "CSI-division breakdowns",
                    "Learns your pricing over time",
                    "Edit before sending",
                  ].map((d) => (
                    <li key={d} className="flex items-start gap-2 text-xs text-gray-500">
                      <Check className="w-3.5 h-3.5 text-brand-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">3 min</p>
                  <p className="text-xs text-gray-400">average estimate time</p>
                </div>
              </div>

              {/* Zero Lead Fees */}
              <div className="bg-white rounded-2xl border border-border p-7 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <DollarSign className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Zero Lead Fees
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">
                  Other platforms charge $50–$100 per lead, win or lose. We charge
                  a flat subscription. No commissions, no per-lead charges.
                </p>
                <ul className="space-y-2">
                  {[
                    "Save $6,000+/year on average",
                    "No percentage cut on revenue",
                    "No caps on core features",
                    "Lower bids — no lead cost to pad",
                  ].map((d) => (
                    <li key={d} className="flex items-start gap-2 text-xs text-gray-500">
                      <Check className="w-3.5 h-3.5 text-brand-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">$0</p>
                  <p className="text-xs text-gray-400">per lead, every plan</p>
                </div>
              </div>

              {/* Escrow */}
              <div className="bg-white rounded-2xl border border-border p-7 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <Shield className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Escrow on Every Job
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">
                  Homeowners fund milestones upfront. Contractors get paid when
                  work is verified. No chasing invoices, no bounced checks.
                </p>
                <ul className="space-y-2">
                  {[
                    "Milestone-based payments",
                    "Contractors paid when verified",
                    "5-day dispute resolution",
                    "Full payment history + receipts",
                  ].map((d) => (
                    <li key={d} className="flex items-start gap-2 text-xs text-gray-500">
                      <Check className="w-3.5 h-3.5 text-brand-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics — split layout */}
        <section className="bg-white border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <BarChart3 className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                  Know your numbers.
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6">
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
                    <li key={d} className="flex items-start gap-3 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stat preview */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Win Rate", value: "34%", sub: "+8% this month" },
                  { label: "Avg Job Size", value: "$12,400", sub: "across 14 jobs" },
                  { label: "Response Time", value: "2.1 hr", sub: "faster than 90%" },
                  { label: "Revenue MTD", value: "$47,200", sub: "+23% vs last month" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#FAFAFA] rounded-xl border border-border p-5">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums mt-1">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
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

              {/* Team */}
              <div className="bg-white rounded-2xl border border-border p-7">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <Users className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Built for crews.
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  Shared projects, assignments, and status updates from the field.
                  No more group texts. Team plans support up to 5 members,
                  Enterprise is unlimited.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Shared project dashboard",
                    "Assignment and scope tracking",
                    "Team activity feed",
                    "Role-based access for field and office",
                  ].map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Branded Estimates */}
              <div className="bg-white rounded-2xl border border-border p-7">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <FileText className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Estimates that close.
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  Branded PDF estimates with your logo and line-item breakdowns.
                  Build manually, generate with AI, or reuse templates from past jobs.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Your branding on every estimate",
                    "Reusable templates from past jobs",
                    "PDF generation and direct sharing",
                    "Materials, labor, and markup detail",
                  ].map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-white border-t border-border py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
              Ready to see it in action?
            </h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              Start free. No credit card required. See why contractors are switching
              from lead-based platforms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
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
