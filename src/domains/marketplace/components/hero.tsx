import Link from "next/link";
import Image from "next/image";
import { Button } from "@shared/ui/button";

export function Hero() {
  return (
    <section className="bg-[#FAFAFA] pt-28 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

          {/* Left — copy */}
          <div className="lg:w-[55%] relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              <span className="text-gray-900">$0 Lead Fee</span>
              <br />
              <span className="text-brand-600">Marketplace.</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-lg leading-relaxed">
              Post your project. Get bids from licensed contractors.
              Pick the best one. No lead fees. No chasing checks.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href="/signup?role=homeowner">Post a Job Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signup?role=contractor">Join as Contractor</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Free to post. Free to bid. No credit card needed.
            </p>
          </div>

          {/* Right — logo visual */}
          <div className="mt-14 lg:mt-0 lg:w-[45%] flex items-center justify-center relative">
            <div className="relative z-10">
              <Image
                src="/logo-512.png"
                alt="FairTradeWorker"
                width={280}
                height={280}
                priority
                className="drop-shadow-lg"
              />
            </div>
            <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 bg-white border border-border rounded-sm px-5 py-3 shadow-sm z-20 text-center">
              <div className="text-2xl font-bold text-gray-900 tabular-nums">$0</div>
              <div className="text-xs text-gray-600">per lead. ever.</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
