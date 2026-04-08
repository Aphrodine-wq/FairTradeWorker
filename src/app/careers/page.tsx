import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join FairTradeWorker and help build a fairer construction marketplace.",
  openGraph: {
    title: "Careers | FairTradeWorker",
    description: "Join FairTradeWorker and help build a fairer construction marketplace.",
  },
  alternates: {
    canonical: "/careers",
  },
};
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { Separator } from "@shared/ui/separator";

const OPENINGS = [
  {
    title: "Senior Full-Stack Engineer",
    location: "Oxford, MS (Remote OK)",
    type: "Full-time",
    description:
      "Own product features end-to-end. We're a Next.js + Node shop, but we care more about how you think than what stack you know.",
  },
  {
    title: "Head of Contractor Growth",
    location: "Oxford, MS",
    type: "Full-time",
    description:
      "Own contractor acquisition and retention in Mississippi. You know the trades industry, you're relentless, and you don't need a playbook to get started.",
  },
  {
    title: "Customer Success Lead",
    location: "Oxford, MS (Remote OK)",
    type: "Full-time",
    description:
      "Be the person contractors and homeowners call when something goes sideways. You fix problems fast and make people feel heard.",
  },
] as const;

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Headline */}
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Come build something real.
          </h1>

          <p className="mt-6 text-lg text-gray-800 leading-relaxed max-w-2xl">
            We&apos;re a small team in Oxford, MS building the marketplace the construction
            industry deserves. If you&apos;re tired of working on things that don&apos;t
            matter, let&apos;s talk.
          </p>

          <Separator className="my-12" />

          {/* Open positions */}
          <section>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">
              Open Positions
            </h2>

            <div className="space-y-6">
              {OPENINGS.map((role) => (
                <div
                  key={role.title}
                  className="border border-gray-100 rounded-sm p-7 hover:border-gray-200 hover:shadow-sm transition-all duration-150"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {role.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 mb-3">
                        <span className="text-sm text-gray-700">{role.location}</span>
                        <span className="text-gray-200 select-none">·</span>
                        <span className="text-sm text-gray-700">{role.type}</span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`mailto:careers@fairtradeworker.com?subject=Application: ${role.title}`}>
                          Apply
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-12" />

          {/* Catch-all */}
          <p className="text-gray-700">
            Don&apos;t see your role?{" "}
            <a
              href="mailto:careers@fairtradeworker.com"
              className="text-brand-600 font-medium hover:underline"
            >
              Email us at careers@fairtradeworker.com
            </a>
            .
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
