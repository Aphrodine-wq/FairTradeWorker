import type { Metadata } from "next";
import Link from "next/link";
/* Geometric inline SVG icons — no lucide */
const GeoMic = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="2" width="4" height="10" fill="currentColor" />
    <rect x="5" y="8" width="10" height="2" fill="currentColor" opacity="0.5" />
    <circle cx="10" cy="15" r="2" fill="currentColor" />
    <rect x="9" y="13" width="2" height="4" fill="currentColor" />
  </svg>
);

const GeoDollar = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="2" width="2" height="16" fill="currentColor" />
    <rect x="6" y="5" width="8" height="2" fill="currentColor" />
    <rect x="6" y="9" width="8" height="2" fill="currentColor" />
    <rect x="6" y="13" width="8" height="2" fill="currentColor" />
  </svg>
);

const GeoShield = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,1 18,5 18,11 10,19 2,11 2,5" fill="currentColor" opacity="0.15" />
    <polygon points="10,3 16,6 16,11 10,17 4,11 4,6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="9" y="7" width="2" height="5" fill="currentColor" />
    <rect x="9" y="13" width="2" height="2" fill="currentColor" />
  </svg>
);

const GeoBarChart = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="12" width="3" height="6" fill="currentColor" opacity="0.4" />
    <rect x="7" y="8" width="3" height="10" fill="currentColor" opacity="0.6" />
    <rect x="12" y="4" width="3" height="14" fill="currentColor" opacity="0.8" />
    <rect x="17" y="2" width="1" height="16" fill="currentColor" />
  </svg>
);

const GeoUsers = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="6" r="3" fill="currentColor" opacity="0.7" />
    <circle cx="13" cy="6" r="3" fill="currentColor" opacity="0.4" />
    <rect x="2" y="12" width="10" height="4" fill="currentColor" opacity="0.7" />
    <rect x="8" y="12" width="10" height="4" fill="currentColor" opacity="0.4" />
  </svg>
);

const GeoFileText = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="1" width="14" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <polygon points="12,1 17,6 12,6" fill="currentColor" opacity="0.3" />
    <rect x="6" y="9" width="8" height="1.5" fill="currentColor" />
    <rect x="6" y="12" width="6" height="1.5" fill="currentColor" />
    <rect x="6" y="15" width="4" height="1.5" fill="currentColor" opacity="0.5" />
  </svg>
);

const GeoCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="2" y1="6.5" x2="5" y2="9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    <line x1="5" y1="9.5" x2="10" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

const GeoArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="2" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="2" />
    <line x1="9" y1="4" x2="13" y2="8" stroke="currentColor" strokeWidth="2" />
    <line x1="9" y1="12" x2="13" y2="8" stroke="currentColor" strokeWidth="2" />
  </svg>
);
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
    icon: GeoMic,
    title: "Hunter Voice AI",
    description: "Walk the job site. Describe the scope out loud. Hunter builds a line-item estimate in three minutes — materials, labor, markup.",
    points: ["Works on your phone, no laptop", "CSI-division breakdowns", "Learns your pricing over time", "Edit before sending"],
    stat: { value: "3 min", label: "average estimate time" },
  },
  {
    icon: GeoDollar,
    title: "Zero Lead Fees",
    description: "Other platforms charge $50\u2013$100 per lead, win or lose. We charge a flat subscription. No commissions, no per-lead charges.",
    points: ["Save $6,000+/year on average", "No percentage cut on revenue", "No caps on core features", "Lower bids \u2014 no lead cost to pad"],
    stat: { value: "$0", label: "per lead, every plan" },
  },
  {
    icon: GeoShield,
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
                            <GeoCheck className="w-3 h-3 text-brand-600" />
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
                  <GeoBarChart className="w-5 h-5 text-brand-600" />
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
                        <GeoCheck className="w-3 h-3 text-brand-600" />
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
                  icon: GeoUsers,
                  title: "Built for crews.",
                  description: "Shared projects, assignments, and status updates from the field. No more group texts. Team plans support up to 5 members, Enterprise is unlimited.",
                  points: ["Shared project dashboard", "Assignment and scope tracking", "Team activity feed", "Role-based access for field and office"],
                },
                {
                  icon: GeoFileText,
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
                            <GeoCheck className="w-3 h-3 text-brand-600" />
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
                <GeoArrowRight className="w-4 h-4" />
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
