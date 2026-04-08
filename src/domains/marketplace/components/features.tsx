import { Mic, DollarSign, Shield, BarChart3, Users, FileText } from "lucide-react";
import { cn } from "@shared/lib/utils";

const features = [
  {
    icon: Mic,
    title: "Talk to Hunter.",
    subtitle: "Voice AI estimation, built for job sites.",
    description:
      "Describe the scope out loud. Hunter builds a line-item estimate in real time — materials, labor, markup. Three minutes from walkthrough to proposal.",
    details: [
      "Works on your phone, no laptop required",
      "CSI-division cost breakdowns",
      "Learns your pricing over time",
      "Edit any line item before sending",
    ],
    callout: { value: "3 min", label: "average estimate time" },
    bg: "bg-[#FAFAFA]",
  },
  {
    icon: DollarSign,
    title: "Your money stays your money.",
    subtitle: "Zero lead fees. Flat subscription.",
    description:
      "Other platforms charge $50 to $100 per lead, win or lose. We charge a flat monthly subscription. No commissions, no per-lead charges, no hidden fees.",
    details: [
      "Contractors save $6,000+/year on average",
      "No percentage cut on job revenue",
      "No caps on core features",
      "Lower bids for homeowners because there's no lead cost to pad",
    ],
    callout: { value: "$0", label: "per lead, every plan" },
    bg: "bg-surface",
  },
  {
    icon: Shield,
    title: "Escrow on every job.",
    subtitle: "No chasing invoices. No bounced checks.",
    description:
      "Homeowners fund escrow upfront. Money moves when work is verified. You set the milestones.",
    details: [
      "Homeowners fund milestones before work begins",
      "Contractors get paid when verified",
      "5-business-day dispute resolution",
      "Full payment history and receipts",
    ],
    callout: null,
    bg: "bg-[#FAFAFA]",
  },
  {
    icon: BarChart3,
    title: "Know your numbers.",
    subtitle: "Real analytics for your business.",
    description:
      "See which jobs are profitable, track your win rate, and export reports. Team plans add job costing and crew productivity metrics.",
    details: [
      "Revenue and job-level profitability",
      "Bid win rate and conversion tracking",
      "Team productivity on Team plans",
      "QuickBooks-ready report exports",
    ],
    callout: null,
    bg: "bg-surface",
  },
  {
    icon: Users,
    title: "Built for crews.",
    subtitle: "One dashboard for the whole team.",
    description:
      "Shared projects, assignments, and status updates from the field. No more group texts. Team plans support up to 5 members, Enterprise is unlimited.",
    details: [
      "Shared project dashboard",
      "Assignment and scope tracking",
      "Team activity feed",
      "Role-based access for field and office",
    ],
    callout: null,
    bg: "bg-[#FAFAFA]",
  },
  {
    icon: FileText,
    title: "Estimates that close.",
    subtitle: "Your brand. Your numbers.",
    description:
      "Branded PDF estimates with your logo and line-item breakdowns. Build manually, generate with AI, or reuse templates.",
    details: [
      "Your branding on every estimate",
      "Reusable templates from past jobs",
      "PDF generation and direct sharing",
      "Materials, labor, and markup detail",
    ],
    callout: null,
    bg: "bg-surface",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="divide-y divide-border">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div key={feature.title} className={feature.bg}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
                {/* Left — content */}
                <div className="lg:flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-sm bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <p className="text-sm font-bold text-brand-600 uppercase tracking-widest">
                      {feature.subtitle}
                    </p>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-5">
                    {feature.title}
                  </h2>

                  <p className="text-lg text-gray-700 max-w-2xl leading-relaxed mb-8">
                    {feature.description}
                  </p>

                  <ul className="space-y-3 max-w-2xl">
                    {feature.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-3 text-sm text-gray-800"
                      >
                        <span className="w-1.5 h-1.5 rounded-sm bg-brand-600 mt-1.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right — callout (if present) */}
                {feature.callout && (
                  <div
                    className="mt-10 lg:mt-0 lg:flex-shrink-0 lg:text-right"
                    aria-hidden="true"
                  >
                    <div className="text-7xl font-bold text-gray-200 leading-none tabular-nums select-none">
                      {feature.callout.value}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {feature.callout.label}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
