import { Mic, DollarSign, Shield, BadgeCheck, Sparkles, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Mic,
    title: "Voice AI Estimates",
    description:
      "Hunter, our voice AI, walks contractors through every line item — generating professional estimates in minutes instead of hours. No spreadsheets required.",
  },
  {
    icon: DollarSign,
    title: "Zero Lead Fees",
    description:
      "We charge a flat subscription — never a fee per lead or percentage of your job. Every dollar you earn stays yours. Period.",
  },
  {
    icon: Shield,
    title: "Escrow Payments",
    description:
      "Funds are held in escrow and released at agreed milestones. Homeowners pay with confidence. Contractors get paid on time. No disputes, no drama.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Contractors",
    description:
      "Every contractor on the platform is license-verified, insurance-checked, and background-screened before their first job. Trust is built in.",
  },
  {
    icon: Sparkles,
    title: "Smart Matching",
    description:
      "Our matching engine analyzes your job scope, location, and timeline to surface the best-fit contractors — not just the cheapest or the fastest to respond.",
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description:
      "Track project milestones, payment releases, and contractor activity in real time. Homeowners always know what's happening on their project.",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="bg-surface py-20 sm:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
            Platform Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Everything You Need
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            Built from the ground up for the construction industry — not bolted
            on from a generic marketplace template.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={cn(
                  "bg-white rounded-xl border border-border p-7",
                  "hover:shadow-md hover:border-brand-200 transition-all duration-200"
                )}
              >
                {/* Icon container */}
                <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center mb-5 flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-600" strokeWidth={1.75} />
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
