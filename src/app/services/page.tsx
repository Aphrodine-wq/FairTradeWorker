import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Shield, Star } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { TRADES, SERVICE_LOCATIONS } from "@shared/lib/seo-data";

export const metadata: Metadata = {
  title: "Find Contractors by Trade and Location",
  description:
    "Browse verified contractors by trade — HVAC, electricians, plumbers, roofers, painters, and more. No lead fees. Compare bids and hire with confidence on FairTradeWorker.",
  openGraph: {
    title: "Find Contractors by Trade and Location | FairTradeWorker",
    description:
      "Browse verified contractors by trade — HVAC, electricians, plumbers, roofers, painters, and more. No lead fees.",
  },
};

// Unique states for location grouping
const stateGroups = SERVICE_LOCATIONS.reduce(
  (acc, loc) => {
    if (!acc[loc.state]) acc[loc.state] = [];
    acc[loc.state].push(loc);
    return acc;
  },
  {} as Record<string, typeof SERVICE_LOCATIONS>,
);

export default function ServicesIndexPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-[#0F1419] py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
              Find Verified Contractors Near You
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl leading-relaxed">
              Browse by trade or location. Every contractor is license-verified,
              insured, and reviewed by real homeowners. No lead fees — ever.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-[#C41E3A]" />
                License verified
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Star className="w-4 h-4 text-[#C41E3A]" />
                Real reviews only
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#C41E3A]" />
                {SERVICE_LOCATIONS.length} cities covered
              </div>
            </div>
          </div>
        </section>

        {/* Browse by Trade */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              Browse by Trade
            </h2>
            <p className="mt-2 text-[#4B5563]">
              Select a trade to find verified contractors in your area.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRADES.map((trade) => (
                <Link
                  key={trade.slug}
                  href={`/services/${trade.slug}`}
                  className="group bg-white border border-[#E5E1DB] p-6 hover:border-[#C41E3A]/30 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#111318] group-hover:text-[#C41E3A] transition-colors duration-150">
                        {trade.plural}
                      </h3>
                      <p className="mt-1 text-sm text-[#4B5563] line-clamp-2">
                        {trade.description}
                      </p>
                      <p className="mt-3 text-xs text-[#9CA3AF]">
                        Avg. cost: {trade.avgCostRange}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#C41E3A] transition-colors duration-150 shrink-0 ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Cities */}
        <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              Featured Cities
            </h2>
            <p className="mt-2 text-[#4B5563]">
              Full city guides with neighborhood coverage, local tips, and every trade.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {SERVICE_LOCATIONS.filter((l) => l.profile).map((loc) => (
                <Link key={loc.slug} href={`/services/city/${loc.slug}`}
                  className="group bg-[#FAFAFA] border border-[#E5E1DB] p-6 hover:border-[#C41E3A]/30 transition-colors duration-150">
                  <h3 className="text-xl font-bold text-[#111318] group-hover:text-[#C41E3A] transition-colors duration-150">
                    <MapPin className="w-5 h-5 inline mr-2 text-[#C41E3A]" />
                    {loc.city}, {loc.stateAbbr}
                  </h3>
                  <p className="mt-2 text-sm text-[#4B5563] leading-relaxed line-clamp-2">{loc.profile!.tagline}</p>
                  <p className="mt-3 text-xs text-[#9CA3AF]">{loc.profile!.neighborhoods.length} neighborhoods covered</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Browse by Location */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              All Mississippi Cities
            </h2>
            <p className="mt-2 text-[#4B5563]">
              We serve every city in Mississippi — launching market by market, starting with North MS.
            </p>

            <div className="mt-8 space-y-10">
              {Object.entries(stateGroups).map(([state, locations]) => (
                <div key={state}>
                  <h3 className="text-xl font-semibold text-[#111318] mb-4">
                    {state}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <Link
                        key={loc.slug}
                        href={`/services/general-contractors/${loc.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAFAFA] border border-[#E5E1DB] text-sm text-[#111318] hover:border-[#C41E3A]/30 hover:text-[#C41E3A] transition-colors duration-150"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        {loc.city}, {loc.stateAbbr}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0F1419] py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Ready to get started?
            </h2>
            <p className="mt-3 text-gray-300 max-w-lg mx-auto">
              Post your project for free and receive bids from verified
              contractors in your area. No lead fees, no hidden costs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">Post a Job Free</Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500"
                asChild
              >
                <Link href="/signup?role=contractor">Join as Contractor</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
