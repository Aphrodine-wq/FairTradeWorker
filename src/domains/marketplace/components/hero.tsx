import Link from "next/link";
import { Button } from "@shared/ui/button";

export function Hero() {
  return (
    <section className="bg-white pt-28 pb-12 lg:pt-40 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

          {/* Left — 60% */}
          <div className="lg:w-[60%]">
            <p className="text-sm font-semibold text-brand-600 mb-4">FairTradeWorker</p>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              <span className="text-gray-900">Stop paying</span>
              <br />
              <span className="text-brand-600">for leads.</span>
            </h1>

            <p className="mt-6 text-lg text-gray-500 max-w-lg leading-relaxed">
              Flat monthly subscription. Zero per-lead fees. Every dollar you earn is yours.
              We built this because we were tired of getting ripped off too.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">Post a Job</Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/signup?role=contractor">Find Work</Link>
              </Button>
            </div>
          </div>

          {/* Right — 40% */}
          <div className="mt-14 lg:mt-0 lg:w-[40%] lg:text-right">
            <div
              className="font-bold text-brand-600 leading-none tabular-nums"
              style={{ fontSize: "clamp(100px, 15vw, 180px)" }}
            >
              $0
            </div>
            <p className="text-lg text-gray-400 mt-2">per lead. ever.</p>
          </div>

        </div>
      </div>

      <div className="mt-12 lg:mt-16 h-px bg-border" />
    </section>
  );
}
