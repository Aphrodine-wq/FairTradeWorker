import Link from "next/link";
import { Button } from "@shared/ui/button";

function HammerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Handle — drawn first so head renders on top */}
      <rect x="96" y="110" width="22" height="220" rx="6" fill="#A0784C" />
      <rect x="104" y="120" width="6" height="200" rx="3" fill="#8B6840" opacity="0.25" />

      {/* Metal collar — between handle and head */}
      <rect x="86" y="88" width="42" height="28" rx="5" fill="#888888" />
      <rect x="86" y="88" width="42" height="8" rx="4" fill="#AAAAAA" opacity="0.4" />

      {/* Head — drawn last so it's in front */}
      <rect x="18" y="12" width="178" height="80" rx="8" fill="#6B7280" />
      {/* Top bevel highlight */}
      <rect x="18" y="12" width="178" height="14" rx="8" fill="#9CA3AF" opacity="0.4" />
      {/* Striking face — right end darker */}
      <rect x="178" y="12" width="18" height="80" rx="6" fill="#4B5563" />
      {/* Left face */}
      <rect x="18" y="12" width="14" height="80" rx="6" fill="#5B6370" />
      {/* Bottom edge shadow */}
      <rect x="18" y="78" width="178" height="14" rx="6" fill="#4B5563" opacity="0.3" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="bg-[#FAFAFA] pt-28 pb-12 lg:pt-40 lg:pb-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

          {/* Left — copy */}
          <div className="lg:w-[55%] relative z-10">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              <span className="text-gray-900">Built for</span>
              <br />
              <span className="text-brand-600">the trades.</span>
            </h1>

            <p className="mt-6 text-lg text-gray-500 max-w-lg leading-relaxed">
              Flat monthly subscription. Zero per-lead fees. Every dollar you earn is yours.
              We built this because we were tired of getting ripped off too.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">Post a Job</Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/signup?role=contractor">Find Work</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-400">
              No credit card required. Free to start.
            </p>
          </div>

          {/* Right — hammer visual */}
          <div className="mt-14 lg:mt-0 lg:w-[45%] flex items-center justify-center relative">
            <div className="absolute w-72 h-72 lg:w-[22rem] lg:h-[22rem] rounded-full bg-brand-600/[0.04]" />
            <div className="relative z-10" style={{ transform: "rotate(-30deg)" }}>
              <HammerIcon className="w-48 h-auto lg:w-60" />
            </div>
            <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 bg-white border border-border rounded-xl px-5 py-3 shadow-sm z-20 text-center">
              <div className="text-2xl font-bold text-gray-900 tabular-nums">$0</div>
              <div className="text-xs text-gray-400">per lead. ever.</div>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-12 lg:mt-16 h-px bg-border" />
    </section>
  );
}
