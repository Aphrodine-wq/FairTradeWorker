import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { TRADES, SERVICE_LOCATIONS } from "@shared/lib/seo-data";

export const metadata: Metadata = {
  title: "Find Construction Work in Mississippi — Jobs for Contractors",
  description:
    "Find real construction jobs in Mississippi. No lead fees. Homeowners post projects, you bid on them. HVAC, electrical, plumbing, roofing, and every trade.",
  openGraph: {
    title: "Find Construction Work in Mississippi | FairTradeWorker",
    description: "Find real construction jobs in Mississippi. No lead fees. Bid on projects posted by real homeowners.",
  },
  alternates: { canonical: "/find-work" },
};

const stateGroups = SERVICE_LOCATIONS.reduce(
  (acc, loc) => {
    const key = loc.metro || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(loc);
    return acc;
  },
  {} as Record<string, typeof SERVICE_LOCATIONS>,
);

export default function FindWorkPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        <section className="bg-[#FAFAFA] py-20 lg:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Find work. Not leads.
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Homeowners in your area are posting real projects right now.
              You see the scope, you set your price, you bid. No paying $60
              to find out the lead was a tire kicker. No competing against
              whoever bought the most ads. Just real work from real people
              who need something built, fixed, or remodeled.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href="/signup?role=contractor">Join Free — Start Bidding</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">See Contractor Plans</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Free plan includes unlimited bidding. No credit card.
            </p>
          </div>
        </section>

        {/* Why contractors switch */}
        <section className="bg-white py-16 lg:py-20 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Why contractors are switching.
            </h2>
            <div className="mt-8 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">You keep what you earn.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  No per-lead fees. No percentage of the job. Flat monthly
                  rate on paid plans, and the Free plan lets you bid on
                  unlimited jobs without paying us anything.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">The homeowners are real.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Every job on FairTradeWorker is posted by a homeowner with
                  a project ready to go. Not a lead form that gets sold to
                  five other contractors. You're talking to the person who
                  needs the work done.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">You always get paid.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Escrow on every job. The homeowner's money is locked in
                  before you pick up a tool. Hit your milestones, they
                  confirm, funds release. No more net-90 invoices. No more
                  bounced checks.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sub out work on the platform.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Win a job that needs electrical or plumbing? Post a sub-job
                  and let specialized subs bid on it. Same escrow protection,
                  same verified pros. Your whole crew can run through
                  FairTradeWorker.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Find work by trade */}
        <section className="py-16 lg:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Find work by trade
            </h2>
            <p className="mt-2 text-gray-600">Select your trade to see available markets.</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRADES.map((trade) => (
                <Link key={trade.slug} href={`/find-work/${trade.slug}`}
                  className="group bg-white border border-border p-5 rounded-sm hover:border-brand-600/30 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors duration-150">{trade.name} Jobs</h3>
                      <p className="mt-1 text-sm text-gray-500">63 cities in Mississippi</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors duration-150 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Find work by location */}
        <section className="bg-white py-16 lg:py-20 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900">Find work by city</h2>
            <div className="mt-8 space-y-10">
              {Object.entries(stateGroups).map(([metro, locations]) => (
                <div key={metro}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{metro}</h3>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <Link key={loc.slug} href={`/find-work/general-contractors/${loc.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-border text-sm text-gray-900 hover:border-brand-600/30 hover:text-brand-600 transition-colors duration-150 rounded-sm">
                        <MapPin className="w-3.5 h-3.5" />{loc.city}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Stop buying leads. Start winning jobs.</h2>
            <p className="mt-3 text-gray-600 max-w-lg mx-auto">
              Sign up free. Browse jobs in your area. Bid when you see something you want. That's it.
            </p>
            <div className="mt-8">
              <Button size="xl" asChild>
                <Link href="/signup?role=contractor">Join Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
