import Link from "next/link";
import { Button } from "@shared/ui/button";

export function CTASection() {
  return (
    <section style={{ backgroundColor: "#0F1419" }} className="py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">

          {/* Left — content */}
          <div className="lg:max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Your next job is waiting.
            </h2>
            <p className="mt-4 text-base text-gray-400">
              3,200+ contractors. Zero lead fees. Free to start.
            </p>
            <div className="mt-8">
              <Button size="xl" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Right — atmospheric large text */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 font-bold text-white/5 leading-none select-none pointer-events-none hidden lg:block"
            style={{ fontSize: "clamp(80px, 12vw, 160px)" }}
            aria-hidden="true"
          >
            Free.
          </div>

        </div>
      </div>
    </section>
  );
}
