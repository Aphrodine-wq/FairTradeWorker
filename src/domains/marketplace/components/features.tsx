import { cn } from "@shared/lib/utils";

function VoiceWaveIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Microphone body */}
      <rect x="35" y="10" width="10" height="30" fill="#059669" />
      <rect x="30" y="38" width="20" height="4" fill="#059669" />
      <rect x="38" y="42" width="4" height="10" fill="#0F1419" />
      <rect x="32" y="52" width="16" height="3" fill="#0F1419" />
      {/* Sound waves */}
      <rect x="18" y="20" width="3" height="16" fill="#D1D5DB" />
      <rect x="12" y="24" width="3" height="8" fill="#D1D5DB" />
      <rect x="59" y="20" width="3" height="16" fill="#D1D5DB" />
      <rect x="65" y="24" width="3" height="8" fill="#D1D5DB" />
      {/* Waveform bars at bottom */}
      <rect x="10" y="62" width="4" height="8" fill="#059669" />
      <rect x="18" y="58" width="4" height="12" fill="#059669" />
      <rect x="26" y="60" width="4" height="10" fill="#0F1419" />
      <rect x="34" y="55" width="4" height="15" fill="#059669" />
      <rect x="42" y="58" width="4" height="12" fill="#0F1419" />
      <rect x="50" y="56" width="4" height="14" fill="#059669" />
      <rect x="58" y="60" width="4" height="10" fill="#0F1419" />
      <rect x="66" y="58" width="4" height="12" fill="#059669" />
    </svg>
  );
}

function DollarBarsIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dollar sign made of geometric bars */}
      <rect x="38" y="8" width="4" height="64" fill="#D1D5DB" />
      {/* Top horizontal bar */}
      <rect x="24" y="18" width="32" height="6" fill="#059669" />
      {/* Upper left vertical */}
      <rect x="24" y="18" width="6" height="16" fill="#059669" />
      {/* Middle horizontal bar */}
      <rect x="24" y="34" width="32" height="6" fill="#0F1419" />
      {/* Lower right vertical */}
      <rect x="50" y="40" width="6" height="16" fill="#059669" />
      {/* Bottom horizontal bar */}
      <rect x="24" y="50" width="32" height="6" fill="#059669" />
      {/* Accent dots */}
      <circle cx="16" cy="40" r="3" fill="#D1D5DB" />
      <circle cx="66" cy="40" r="3" fill="#D1D5DB" />
    </svg>
  );
}

function EscrowShieldIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield outline from rectangles */}
      <rect x="16" y="10" width="48" height="6" fill="#059669" />
      <rect x="16" y="10" width="6" height="40" fill="#059669" />
      <rect x="58" y="10" width="6" height="40" fill="#059669" />
      {/* Shield bottom point */}
      <rect x="22" y="50" width="6" height="10" fill="#059669" />
      <rect x="52" y="50" width="6" height="10" fill="#059669" />
      <rect x="28" y="56" width="6" height="8" fill="#059669" />
      <rect x="46" y="56" width="6" height="8" fill="#059669" />
      <rect x="34" y="62" width="12" height="6" fill="#059669" />
      {/* Lock body */}
      <rect x="30" y="30" width="20" height="16" fill="#0F1419" />
      {/* Lock shackle */}
      <rect x="34" y="22" width="3" height="10" fill="#0F1419" />
      <rect x="43" y="22" width="3" height="10" fill="#0F1419" />
      <rect x="34" y="22" width="12" height="3" fill="#0F1419" />
      {/* Keyhole */}
      <circle cx="40" cy="37" r="3" fill="#059669" />
      <rect x="39" y="39" width="2" height="4" fill="#059669" />
    </svg>
  );
}

function BarChartIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Axis lines */}
      <rect x="14" y="10" width="3" height="56" fill="#D1D5DB" />
      <rect x="14" y="63" width="54" height="3" fill="#D1D5DB" />
      {/* Bars */}
      <rect x="22" y="44" width="8" height="19" fill="#059669" />
      <rect x="34" y="32" width="8" height="31" fill="#0F1419" />
      <rect x="46" y="38" width="8" height="25" fill="#059669" />
      <rect x="58" y="20" width="8" height="43" fill="#0F1419" />
      {/* Trend dots */}
      <circle cx="26" cy="40" r="2.5" fill="#059669" />
      <circle cx="38" cy="28" r="2.5" fill="#059669" />
      <circle cx="50" cy="34" r="2.5" fill="#059669" />
      <circle cx="62" cy="16" r="2.5" fill="#059669" />
      {/* Trend line segments */}
      <rect x="27" y="33" width="10" height="2" fill="#059669" transform="rotate(20 27 33)" />
      <rect x="39" y="29" width="10" height="2" fill="#059669" transform="rotate(12 39 29)" />
      <rect x="51" y="24" width="10" height="2" fill="#059669" transform="rotate(32 51 24)" />
    </svg>
  );
}

function CrewCirclesIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Overlapping circles representing people */}
      <circle cx="30" cy="32" r="14" fill="#059669" />
      <circle cx="50" cy="32" r="14" fill="#0F1419" />
      <circle cx="40" cy="48" r="14" fill="#059669" opacity="0.6" />
      {/* Small accent circles */}
      <circle cx="16" cy="54" r="4" fill="#D1D5DB" />
      <circle cx="64" cy="54" r="4" fill="#D1D5DB" />
      <circle cx="40" cy="14" r="3" fill="#D1D5DB" />
      {/* Connector dots */}
      <circle cx="40" cy="32" r="3" fill="white" />
      <circle cx="35" cy="42" r="2" fill="white" />
      <circle cx="45" cy="42" r="2" fill="white" />
    </svg>
  );
}

function DocumentStackIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back document */}
      <rect x="22" y="8" width="40" height="52" fill="#D1D5DB" />
      {/* Middle document */}
      <rect x="18" y="14" width="40" height="52" fill="#0F1419" />
      {/* Front document */}
      <rect x="14" y="20" width="40" height="52" fill="#059669" />
      {/* Text lines on front document */}
      <rect x="20" y="30" width="22" height="3" fill="white" />
      <rect x="20" y="37" width="28" height="2" fill="white" opacity="0.6" />
      <rect x="20" y="42" width="24" height="2" fill="white" opacity="0.6" />
      <rect x="20" y="47" width="26" height="2" fill="white" opacity="0.6" />
      <rect x="20" y="52" width="18" height="2" fill="white" opacity="0.6" />
      {/* Checkmark */}
      <rect x="20" y="60" width="8" height="3" fill="white" transform="rotate(-40 20 60)" />
      <rect x="25" y="61" width="14" height="3" fill="white" transform="rotate(30 25 61)" />
    </svg>
  );
}

const features = [
  {
    illustration: VoiceWaveIllustration,
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
    illustration: DollarBarsIllustration,
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
    illustration: EscrowShieldIllustration,
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
    illustration: BarChartIllustration,
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
    illustration: CrewCirclesIllustration,
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
    illustration: DocumentStackIllustration,
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
        const Illustration = feature.illustration;
        return (
          <div key={feature.title} className={feature.bg}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
                {/* Left — content */}
                <div className="lg:flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <Illustration />
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
