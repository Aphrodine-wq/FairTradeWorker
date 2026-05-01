import Link from "next/link";
import { Button } from "@shared/ui/button";

export function CTASection() {
  return (
    <section className="bg-surface py-20 lg:py-28 overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Left — content */}
          <div className="lg:max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Your next job is waiting.
            </h2>
            <p className="mt-4 text-base text-gray-600 leading-relaxed max-w-lg">
              3,200+ verified contractors. 12,800+ jobs completed. Zero lead
              fees on every plan. Whether you&apos;re a contractor looking for work or
              a homeowner with a project, the platform is free to start and takes
              less than two minutes to set up.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">Post a Job</Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/signup?role=contractor">Find Work</Link>
              </Button>
            </div>

            <p className="mt-5 text-sm text-gray-500">
              No credit card required. Cancel anytime.
            </p>
          </div>

          {/* Right — atmospheric large text */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 font-bold text-gray-100 leading-none select-none pointer-events-none hidden lg:block"
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
