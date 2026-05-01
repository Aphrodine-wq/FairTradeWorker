import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@shared/components/brand-mark";
import {
  DollarSign,
  Brain,
  Shield,
  Clock,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Building2,
  Hammer,
  Receipt,
  Globe,
  Target,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "FairTradeWorker — Investor Deck",
  description:
    "The zero-fee construction marketplace powered by proprietary AI estimation. Saving contractors $25K+/year.",
  robots: { index: false, follow: false },
};

/* ─────────────────────────── HERO ─────────────────────────── */

function HeroSection() {
  return (
    <section className="bg-dark min-h-[90vh] flex items-center relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10 w-full">
        <div className="flex items-center gap-3 mb-12">
          <BrandMark className="w-10 h-10" />
          <span className="text-white text-xl font-semibold tracking-tight">
            FairTradeWorker
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] max-w-4xl">
          The zero-fee marketplace
          <br />
          <span className="text-brand-600">contractors actually want.</span>
        </h1>

        <p className="mt-8 text-xl text-gray-400 max-w-2xl leading-relaxed">
          Construction&apos;s first AI-powered platform where homeowners post projects,
          contractors bid with AI-generated estimates, and everyone gets paid
          through QuickBooks. No lead fees. No middleman markup.
        </p>

        <div className="mt-12 flex flex-wrap gap-8">
          <Stat value="$450B" label="Home improvement market" />
          <Stat value="$0" label="Cost per lead" accent />
          <Stat value="$25K+" label="Annual savings per contractor" />
          <Stat value="6-10hrs" label="Saved per estimate" />
        </div>
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        className={`text-3xl sm:text-4xl font-bold tabular-nums ${accent ? "text-brand-500" : "text-white"}`}
      >
        {value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

/* ─────────────────────────── PROBLEM ─────────────────────────── */

function ProblemSection() {
  return (
    <section className="bg-[#FAFAFA] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-4">
          The Problem
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 max-w-3xl">
          Lead-gen platforms punish good contractors. Homeowners still
          can&apos;t find ones they trust.
        </h2>

        <div className="mt-14 grid md:grid-cols-3 gap-8">
          <ProblemCard
            icon={<DollarSign className="w-6 h-6" />}
            stat="$135"
            statLabel="per lead on Angi"
            description="Contractors pay $48-310 per lead, shared with 2-4 competitors. A 40-job-per-year contractor spends $8K-21K annually just to get phone calls."
          />
          <ProblemCard
            icon={<Clock className="w-6 h-6" />}
            stat="8-15 hrs"
            statLabel="per manual estimate"
            description="Contractors spend more time estimating than building. 320-600 hours per year on paperwork that could be automated."
          />
          <ProblemCard
            icon={<Shield className="w-6 h-6" />}
            stat="30%"
            statLabel="of homeowners delay projects"
            description="Average delay: 4.7 months. 34% of homeowners report being ghosted by contractors. Trust is the bottleneck."
          />
        </div>
      </div>
    </section>
  );
}

function ProblemCard({
  icon,
  stat,
  statLabel,
  description,
}: {
  icon: React.ReactNode;
  stat: string;
  statLabel: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-border p-8 rounded-sm">
      <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-sm flex items-center justify-center mb-6">
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900">{stat}</div>
      <div className="text-sm text-gray-500 mb-4">{statLabel}</div>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

/* ─────────────────────────── SOLUTION ─────────────────────────── */

function SolutionSection() {
  return (
    <section className="bg-dark py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-4">
          The Solution
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-3xl">
          Free tools that make contractors money. A marketplace that treats
          them fairly.
        </h2>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <SolutionCard
            icon={<Zap className="w-5 h-5" />}
            title="Zero Lead Fees"
            description="Contractors pay a flat $49/mo — not $135 per lead. Post a job, get bids, hire. No per-lead charges, no credit packs, no hidden fees."
          />
          <SolutionCard
            icon={<Brain className="w-5 h-5" />}
            title="AI-Powered Estimation"
            description="ConstructionAI generates detailed estimates in minutes, not hours. Trained on 5,200+ real construction projects with 28,941 line items."
          />
          <SolutionCard
            icon={<Receipt className="w-5 h-5" />}
            title="QuickBooks-Native Payments"
            description="Money flows directly to the contractor's QuickBooks. No escrow float, no platform holding funds. Invoices, payouts, and receipts sync automatically."
          />
          <SolutionCard
            icon={<Layers className="w-5 h-5" />}
            title="Three-Sided Marketplace"
            description="Homeowners hire contractors. Contractors sub out specialized work. Subcontractors bid on sub-jobs. The full construction workflow, one platform."
          />
        </div>
      </div>
    </section>
  );
}

function SolutionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-gray-700 rounded-sm p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-brand-600/10 text-brand-500 rounded-sm flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */

function HowItWorksSection() {
  return (
    <section className="bg-[#FAFAFA] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-4">
          How It Works
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 max-w-2xl">
          Three sides. One platform. Zero friction.
        </h2>

        <div className="mt-14 grid md:grid-cols-3 gap-8">
          <Step
            number="01"
            title="Homeowner Posts"
            description="Describe your project, set your budget, upload photos. Free to post, always."
          />
          <Step
            number="02"
            title="Contractors Bid"
            description="AI-powered estimates in minutes. Contractors submit competitive bids with detailed breakdowns. No lead fees."
          />
          <Step
            number="03"
            title="Everyone Gets Paid"
            description="Accept a bid, work gets done, payment flows through QuickBooks. Contractors sub out work, subs get paid too."
          />
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="text-5xl font-bold text-brand-100 mb-4">{number}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

/* ─────────────────────────── MARKET ─────────────────────────── */

function MarketSection() {
  return (
    <section className="bg-dark py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-4">
          Market Opportunity
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-3xl">
          A trillion-dollar industry running on handshakes and spreadsheets.
        </h2>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MarketStat value="$1.8T" label="US construction market" />
          <MarketStat value="$450B" label="Home improvement annually" />
          <MarketStat value="$2.8B" label="ConTech software (12% CAGR)" />
          <MarketStat value="10,600" label="Licensed MS contractors" />
        </div>

        <div className="mt-16 border border-gray-700 rounded-sm p-8">
          <h3 className="text-lg font-semibold text-white mb-6">
            Why Mississippi First
          </h3>
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="text-brand-500 font-semibold mb-2">
                Low Competition
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Thumbtack and Angi have minimal penetration in rural markets.
                No incumbent to displace — just underserved contractors.
              </p>
            </div>
            <div>
              <div className="text-brand-500 font-semibold mb-2">
                Personal Network
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Founder is embedded in the Oxford, MS construction community.
                First 15 contractors recruited face-to-face, not cold-emailed.
              </p>
            </div>
            <div>
              <div className="text-brand-500 font-semibold mb-2">
                Grant Advantage
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Mississippi ranks near bottom for SBIR awards. NSF explicitly
                encourages underrepresented geographies. $275K Phase I eligible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-gray-700 rounded-sm p-6">
      <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-sm text-gray-500 mt-2">{label}</div>
    </div>
  );
}

/* ─────────────────────────── BUSINESS MODEL ─────────────────────────── */

function BusinessModelSection() {
  return (
    <section className="bg-[#FAFAFA] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-4">
          Business Model
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 max-w-3xl">
          Six revenue streams. Tools first, marketplace second.
        </h2>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          <RevenueCard
            title="Contractor Subscriptions"
            pricing="$49/mo Pro — $149/mo Enterprise"
            description="AI estimation, unlimited projects, smart matching, team management, API access."
          />
          <RevenueCard
            title="QuickBooks Revenue Share"
            pricing="20% of processing fees"
            description="Every payment through QB generates recurring revenue. 3-year revenue share per connected contractor."
          />
          <RevenueCard
            title="White-Label Licensing"
            pricing="$200-500/mo per client"
            description="FairEstimator powers other platforms. Already live with first customer at mhpestimate.cloud."
          />
          <RevenueCard
            title="Homeowner Convenience"
            pricing="$9/mo Plus tier"
            description="Priority matching, unlimited jobs, bid comparison dashboard, warranty tracking."
          />
          <RevenueCard
            title="API Access"
            pricing="$0.05-0.50/estimate"
            description="ConstructionAI estimation for external platforms, proptech companies, and insurance providers."
          />
          <RevenueCard
            title="Featured Placement"
            pricing="$10-30/mo per contractor"
            description="Promoted contractor profiles in marketplace search and homeowner recommendations."
          />
        </div>

        {/* Projections */}
        <div className="mt-16 bg-white border border-border rounded-sm p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-8">
            Revenue Trajectory
          </h3>
          <div className="grid sm:grid-cols-4 gap-8">
            <ProjectionCol year="Year 1" arr="$60K" contractors="50" note="Pro contractors + white-label" />
            <ProjectionCol year="Year 2" arr="$420K" contractors="300" note="+ 25 white-label clients" />
            <ProjectionCol year="Year 3" arr="$1.2M" contractors="1,000" note="+ 50 white-label clients" />
            <ProjectionCol year="Year 5" arr="$6M+" contractors="10,000" note="+ 200 white-label + API" />
          </div>
        </div>
      </div>
    </section>
  );
}

function RevenueCard({
  title,
  pricing,
  description,
}: {
  title: string;
  pricing: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-border rounded-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <div className="text-sm text-brand-600 font-medium mb-3">{pricing}</div>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ProjectionCol({
  year,
  arr,
  contractors,
  note,
}: {
  year: string;
  arr: string;
  contractors: string;
  note: string;
}) {
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">{year}</div>
      <div className="text-2xl font-bold text-gray-900">{arr}</div>
      <div className="text-sm text-brand-600 font-medium">
        {contractors} contractors
      </div>
      <div className="text-xs text-gray-500 mt-1">{note}</div>
    </div>
  );
}

/* ─────────────────────────── COMPETITIVE EDGE ─────────────────────────── */

function CompetitiveSection() {
  return (
    <section className="bg-dark py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-4">
          Competitive Advantage
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-3xl">
          Head-to-head: a contractor doing 40 jobs/year in Oxford, MS.
        </h2>

        {/* Comparison table */}
        <div className="mt-14 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-4 text-sm text-gray-500 font-medium w-1/3">
                  Metric
                </th>
                <th className="pb-4 text-sm text-gray-500 font-medium">Angi</th>
                <th className="pb-4 text-sm text-gray-500 font-medium">
                  Thumbtack
                </th>
                <th className="pb-4 text-sm text-brand-500 font-semibold">
                  FairTradeWorker
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <CompRow
                metric="Annual lead cost"
                angi="$21,600"
                thumbtack="$8,000-15,000"
                ftw="$0"
                ftwHighlight
              />
              <CompRow
                metric="Annual platform cost"
                angi="$0-4,200"
                thumbtack="Variable"
                ftw="$588"
                ftwHighlight
              />
              <CompRow
                metric="Total annual spend"
                angi="$21,600-25,800"
                thumbtack="$8,000-15,000"
                ftw="$588"
                ftwHighlight
              />
              <CompRow
                metric="Estimation time/job"
                angi="8-15 hrs"
                thumbtack="8-15 hrs"
                ftw="2-5 hrs"
                ftwHighlight
              />
              <CompRow
                metric="Construction AI"
                angi="No"
                thumbtack="No"
                ftw="Yes"
                ftwHighlight
              />
              <CompRow
                metric="QuickBooks integration"
                angi="No"
                thumbtack="No"
                ftw="Native"
                ftwHighlight
              />
              <CompRow
                metric="Annual value advantage"
                angi="--"
                thumbtack="--"
                ftw="$25K-65K"
                ftwHighlight
              />
            </tbody>
          </table>
        </div>

        {/* Moats */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          <MoatCard
            title="Proprietary Data Moat"
            description="ConstructionAI trained on 5,200+ real estimates. 18-24 months and significant capital for any competitor to replicate."
          />
          <MoatCard
            title="QuickBooks Lock-In"
            description="Direct payment integration creates switching costs. Contractors won't rewire their accounting to leave."
          />
          <MoatCard
            title="Network Effects"
            description="Every estimate improves the AI. Every contractor attracts homeowners. Every sub-job deepens the marketplace."
          />
        </div>
      </div>
    </section>
  );
}

function CompRow({
  metric,
  angi,
  thumbtack,
  ftw,
  ftwHighlight,
}: {
  metric: string;
  angi: string;
  thumbtack: string;
  ftw: string;
  ftwHighlight?: boolean;
}) {
  return (
    <tr className="border-b border-gray-800">
      <td className="py-4 text-gray-400">{metric}</td>
      <td className="py-4 text-gray-500">{angi}</td>
      <td className="py-4 text-gray-500">{thumbtack}</td>
      <td
        className={`py-4 font-semibold ${ftwHighlight ? "text-brand-500" : "text-white"}`}
      >
        {ftw}
      </td>
    </tr>
  );
}

function MoatCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-gray-700 rounded-sm p-6">
      <h3 className="font-semibold text-white mb-3">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

/* ─────────────────────────── TECHNOLOGY ─────────────────────────── */

function TechnologySection() {
  return (
    <section className="bg-[#FAFAFA] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-4">
          Technology
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 max-w-3xl">
          ConstructionAI: the only estimation model trained on real
          contractor data.
        </h2>

        <div className="mt-14 grid md:grid-cols-2 gap-12">
          <div>
            <div className="space-y-6">
              <TechDetail
                label="Model"
                value="Fine-tuned Llama 3.1 8B"
              />
              <TechDetail
                label="Training Data"
                value="5,200+ real construction estimates, 28,941 line items"
              />
              <TechDetail
                label="Accuracy"
                value="Within 20% of final actual costs (vs. 30-40% manual variance)"
              />
              <TechDetail
                label="Speed"
                value="Full detailed estimate in under 60 seconds"
              />
              <TechDetail
                label="Cost"
                value="$0.002 per estimate (RunPod Serverless)"
              />
              <TechDetail
                label="Output"
                value="CSI division breakdown, line items, material takeoff, labor/material/equipment, timeline, PDF"
              />
            </div>
          </div>

          <div className="bg-white border border-border rounded-sm p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              The Data Flywheel
            </h3>
            <div className="space-y-6">
              <FlywheelStep
                number="1"
                text="Contractors use free estimation tools"
              />
              <FlywheelStep
                number="2"
                text="Every estimate generates training data"
              />
              <FlywheelStep
                number="3"
                text="Model accuracy improves with volume"
              />
              <FlywheelStep
                number="4"
                text="Better estimates attract more contractors"
              />
              <FlywheelStep
                number="5"
                text="White-label clients multiply the data input"
              />
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  Already proven:
                </span>{" "}
                MHP Construction (Oxford, MS) — first white-label customer,
                live at mhpestimate.cloud
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  );
}

function FlywheelStep({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-sm flex items-center justify-center text-sm font-bold flex-shrink-0">
        {number}
      </div>
      <p className="text-gray-700 pt-1">{text}</p>
    </div>
  );
}

/* ─────────────────────────── TRACTION ─────────────────────────── */

function TractionSection() {
  return (
    <section className="bg-dark py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-4">
          Traction
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-3xl">
          Built and shipping. Not a deck and a dream.
        </h2>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TractionCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            title="Full MVP Live"
            description="Three-role marketplace (homeowner, contractor, subcontractor) with 30+ screens, deployed and functional."
          />
          <TractionCard
            icon={<Brain className="w-5 h-5" />}
            title="ConstructionAI Trained"
            description="Custom model fine-tuned on 5,200+ real estimates. Production-ready on RunPod Serverless at $0.002/estimate."
          />
          <TractionCard
            icon={<Building2 className="w-5 h-5" />}
            title="First Customer Live"
            description="MHP Construction (Oxford, MS) running FairEstimator white-label at mhpestimate.cloud. Revenue from day one."
          />
          <TractionCard
            icon={<Receipt className="w-5 h-5" />}
            title="QuickBooks Integration"
            description="Full OAuth2 flow, invoice creation, payment sync, webhook handling. ProAdvisor program active."
          />
          <TractionCard
            icon={<Globe className="w-5 h-5" />}
            title="Mobile App"
            description="React Native Expo app with 30+ screens across all three roles. ConstructionAI and STOMP realtime built in."
          />
          <TractionCard
            icon={<Hammer className="w-5 h-5" />}
            title="Founder in Market"
            description="Oxford, MS — personal contractor relationships, construction background, embedded in the community we serve."
          />
        </div>
      </div>
    </section>
  );
}

function TractionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-gray-700 rounded-sm p-6">
      <div className="text-brand-500 mb-4">{icon}</div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

/* ─────────────────────────── GO-TO-MARKET ─────────────────────────── */

function GTMSection() {
  return (
    <section className="bg-[#FAFAFA] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-4">
          Go-To-Market
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 max-w-3xl">
          Tools first. Marketplace second. Mississippi to the nation.
        </h2>

        <div className="mt-14 space-y-8">
          <PhaseBlock
            phase="Phase 1"
            timeline="Months 1-6"
            title="Vertical SaaS"
            items={[
              "Recruit first 50 contractors with free estimation tools",
              "Personal outreach in Oxford, MS — coffee meetings, not cold emails",
              "Build daily usage habits before adding marketplace features",
              "Follows the ServiceTitan playbook ($961M revenue at IPO)",
            ]}
          />
          <PhaseBlock
            phase="Phase 2"
            timeline="Months 3-12"
            title="Data & API"
            items={[
              "Scale white-label licensing (FairEstimator) to additional contractors",
              "Launch ConstructionAI API for external platforms and proptech",
              "B2B revenue stream independent of marketplace network effects",
              "Every client generates data that improves the model",
            ]}
          />
          <PhaseBlock
            phase="Phase 3"
            timeline="Months 6-18"
            title="Full Marketplace"
            items={[
              "Layer homeowner demand onto established contractor base",
              "Zero cold-start problem — supply side already active",
              "Expand across all trades per market, not one trade nationally",
              "Replicate the Mississippi playbook in adjacent Southern markets",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function PhaseBlock({
  phase,
  timeline,
  title,
  items,
}: {
  phase: string;
  timeline: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="bg-white border border-border rounded-sm p-8 flex flex-col md:flex-row md:gap-12">
      <div className="md:w-48 flex-shrink-0 mb-4 md:mb-0">
        <div className="text-sm text-brand-600 font-semibold">{phase}</div>
        <div className="text-2xl font-bold text-gray-900">{title}</div>
        <div className="text-sm text-gray-500 mt-1">{timeline}</div>
      </div>
      <ul className="space-y-3 flex-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <ArrowRight className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────── TEAM ─────────────────────────── */

function TeamSection() {
  return (
    <section className="bg-dark py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-4">
          Team
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-3xl">
          Built by the people who understand the job site.
        </h2>

        <div className="mt-14 grid md:grid-cols-2 gap-8">
          <div className="border border-gray-700 rounded-sm p-8">
            <h3 className="text-xl font-bold text-white">James Walton</h3>
            <div className="text-brand-500 text-sm font-medium mt-1 mb-4">
              Co-Founder / CEO
            </div>
            <p className="text-gray-400 leading-relaxed">
              Construction background turned full-stack developer. Built the
              entire FTW platform, ConstructionAI model, and supporting
              infrastructure in 7 months. Embedded in the Oxford, MS
              contractor community. Understands the industry because he
              lived it.
            </p>
          </div>
          <div className="border border-gray-700 rounded-sm p-8">
            <h3 className="text-xl font-bold text-white">Mason Glen</h3>
            <div className="text-brand-500 text-sm font-medium mt-1 mb-4">
              Co-Founder / CTO
            </div>
            <p className="text-gray-400 leading-relaxed">
              Government backend developer specializing in database
              architecture, compliance systems, and secure infrastructure.
              Brings enterprise-grade rigor to a platform handling contractor
              payments and sensitive business data. 50/50 equity partnership.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FUNDING ─────────────────────────── */

function FundingSection() {
  return (
    <section className="bg-[#FAFAFA] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-4">
          Funding Strategy
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 max-w-3xl">
          Non-dilutive capital to validate. Strategic capital to scale.
        </h2>

        <div className="mt-14 grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-border rounded-sm p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Near-Term: Grant Funding
            </h3>
            <div className="space-y-4">
              <FundingRow
                source="NSF SBIR Phase I"
                amount="$275K"
                note="AI research validation — 25% success rate, MS geography advantage"
              />
              <FundingRow
                source="USDA SBIR Phase I"
                amount="$275K"
                note="Rural development angle — Oxford qualifies, 30-35% success rate"
              />
              <FundingRow
                source="Innovate MS / MS-FAST"
                amount="$3K"
                note="Phase 0 — fund SBIR proposal writing"
              />
              <FundingRow
                source="Microsoft for Startups"
                amount="$150K"
                note="Azure credits — 60-70% probability"
              />
            </div>
          </div>

          <div className="bg-white border border-border rounded-sm p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Growth: Strategic Capital
            </h3>
            <div className="space-y-4">
              <FundingRow
                source="InvestMS / SSBCI 2.0"
                amount="Up to $500K"
                note="Equity co-investment — 40-50% probability"
              />
              <FundingRow
                source="NSF SBIR Phase II"
                amount="$2M"
                note="Post-validation scale — contingent on Phase I"
              />
              <FundingRow
                source="Pre-Series A"
                amount="$1.8M"
                note="Team + aggressive Mississippi expansion"
              />
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <div className="text-sm text-gray-500">Expected value (18 mo)</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                $350K-400K
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Best case: $1M+ (stacked grants + co-investment)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FundingRow({
  source,
  amount,
  note,
}: {
  source: string;
  amount: string;
  note: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-medium text-gray-900 text-sm">{source}</div>
        <div className="text-xs text-gray-500 mt-0.5">{note}</div>
      </div>
      <div className="text-brand-600 font-semibold text-sm whitespace-nowrap">
        {amount}
      </div>
    </div>
  );
}

/* ─────────────────────────── CTA ─────────────────────────── */

function CtaSection() {
  return (
    <section className="bg-dark py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <BrandMark className="w-14 h-14 mx-auto mb-8" />
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          The fair way to build.
        </h2>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Contractors save $25K+ per year. Homeowners find people they trust.
          AI makes estimation instant. Payments flow through QuickBooks.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="mailto:james@fairtradeworker.com"
            className="inline-flex items-center justify-center h-12 px-8 bg-brand-600 text-white font-semibold rounded-sm hover:bg-brand-700 transition-colors text-base"
          >
            Get in Touch
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-8 border border-gray-600 text-gray-300 font-semibold rounded-sm hover:bg-gray-800 transition-colors text-base"
          >
            Visit FairTradeWorker
          </Link>
        </div>
        <p className="mt-16 text-sm text-gray-600">
          Strata Software Group — Oxford, Mississippi
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function PitchDeckPage() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <MarketSection />
      <BusinessModelSection />
      <CompetitiveSection />
      <TechnologySection />
      <TractionSection />
      <GTMSection />
      <TeamSection />
      <FundingSection />
      <CtaSection />
    </main>
  );
}
