import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { TRADES } from "@shared/lib/seo-data";

export const metadata: Metadata = {
  title: "Find Subcontractor Work in Mississippi — Sub Jobs for Every Trade",
  description:
    "Find sub work posted by general contractors in Mississippi. Electrical, plumbing, HVAC, drywall, tile, painting — real sub jobs with escrow payments. No lead fees.",
  openGraph: {
    title: "Find Subcontractor Work in Mississippi | FairTradeWorker",
    description: "Find sub work posted by GCs in Mississippi. Real sub jobs with escrow payments.",
  },
  alternates: { canonical: "/find-sub-work" },
};

export default function FindSubWorkPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        <section className="bg-[#FAFAFA] py-20 lg:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Sub work that actually pays.
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-2xl">
              General contractors on FairTradeWorker post sub-jobs when they
              need specialized help. Electrical, plumbing, HVAC, drywall,
              tile, painting — you name it. You bid on the scope, you do the
              work, escrow pays you when it's done. No more waiting 90 days
              for a GC to cut you a check.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href="/signup?role=contractor">Join as Subcontractor</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/find-work">Looking for direct work instead?</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How sub work works */}
        <section className="bg-white py-16 lg:py-20 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900">How it works for subs.</h2>
            <div className="mt-8 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">GCs post sub-jobs on the platform.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  When a general contractor wins a job that needs specialized
                  trade work, they post a sub-job with the full scope —
                  what's needed, where, when, and budget range.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">You see the scope and bid.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  No cold calls. No driving to a site to find out the job
                  doesn't exist. You see the full scope, photos, and timeline
                  before you spend a minute on it. Bid your price.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Escrow protects you.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  This is the big one. The GC's payment goes into escrow
                  before you start. You hit your milestones, the GC confirms,
                  the money releases to you. Not net-60. Not net-90. Done.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Build a real track record.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Every sub-job you complete builds your FairRecord — verified
                  reviews from GCs who've worked with you. That reputation
                  follows you and helps you win more work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Browse by trade */}
        <section className="py-16 lg:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Sub work by trade</h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRADES.filter((t) => [
                "electricians", "plumbers", "hvac", "drywall", "painters",
                "flooring", "carpenters", "concrete", "insulation", "roofers",
              ].includes(t.slug)).map((trade) => (
                <Link key={trade.slug} href={`/find-sub-work/${trade.slug}`}
                  className="group bg-white border border-border p-5 rounded-sm hover:border-brand-600/30 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors duration-150">{trade.name} Sub Work</h3>
                      <p className="mt-1 text-sm text-gray-500">{trade.subServices.length} service types</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors duration-150 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Stop chasing GCs for checks.
            </h2>
            <p className="mt-3 text-gray-600 max-w-lg mx-auto">
              Escrow on every sub-job. You do the work, the money's already
              there. Join free and start finding sub work in Mississippi.
            </p>
            <div className="mt-8">
              <Button size="xl" asChild>
                <Link href="/signup?role=contractor">Join as Subcontractor</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
