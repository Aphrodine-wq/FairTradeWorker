import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { TRADES, SERVICE_LOCATIONS, getTradeBySlug, getLocationBySlug } from "@shared/lib/seo-data";

export const revalidate = 86400;

interface Props { params: Promise<{ trade: string; location: string }> }


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trade: ts, location: ls } = await params;
  const trade = getTradeBySlug(ts);
  const loc = getLocationBySlug(ls);
  if (!trade || !loc) return {};
  const title = `${trade.name} Jobs in ${loc.city}, ${loc.stateAbbr} — Find Work`;
  const description = `Find ${trade.name.toLowerCase()} work in ${loc.city}, ${loc.stateAbbr}. Real projects posted by homeowners. No lead fees. Bid free. Escrow on every job.`;
  return {
    title, description,
    openGraph: { title: `${title} | FairTradeWorker`, description },
    alternates: { canonical: `/find-work/${trade.slug}/${loc.slug}` },
  };
}

export default async function FindTradeLocationWorkPage({ params }: Props) {
  const { trade: ts, location: ls } = await params;
  const trade = getTradeBySlug(ts);
  const loc = getLocationBySlug(ls);
  if (!trade || !loc) notFound();

  const nearbyLocations = SERVICE_LOCATIONS.filter(
    (l) => l.metro === loc.metro && l.slug !== loc.slug,
  ).slice(0, 8);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${trade.name} Jobs in ${loc.city}, ${loc.stateAbbr}`,
    description: `Find ${trade.name.toLowerCase()} work in ${loc.city}, ${loc.stateAbbr}.`,
    publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

        <section className="bg-[#FAFAFA] py-20 lg:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="mb-6 text-sm text-gray-500">
              <Link href="/find-work" className="hover:text-gray-900">Find Work</Link>
              <span className="mx-1.5">/</span>
              <Link href={`/find-work/${trade.slug}`} className="hover:text-gray-900">{trade.name}</Link>
              <span className="mx-1.5">/</span>
              <span className="text-gray-900">{loc.city}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              {trade.name} Jobs in {loc.city}, {loc.stateAbbr}
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Homeowners in {loc.city} are posting {trade.name.toLowerCase()} projects
              on FairTradeWorker. You see the full scope before you bid. No
              lead fees, no chasing — just real work from people who need a
              {" "}{trade.name.toLowerCase()} pro.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href="/signup?role=contractor">Join Free — Start Bidding</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="bg-white py-16 lg:py-20 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">
              How {trade.name.toLowerCase()} work finds you on FairTradeWorker
            </h2>
            <div className="mt-8 space-y-4">
              {[
                `Homeowners in ${loc.city} post ${trade.name.toLowerCase()} projects with full scope and photos`,
                "You see the job details before you spend any time or money",
                "Bid with your real price — no inflating to cover lead fees",
                "Win on merit: best bid, best reviews, best fit",
                "Escrow locks in payment before you start work",
                "Get paid when milestones are complete — no chasing invoices",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 bg-gray-50 border border-border rounded-sm">
                  <Check className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                  <span className="text-gray-900">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Common projects */}
        <section className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Common {trade.name.toLowerCase()} projects in {loc.city}
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trade.subServices.map((sub) => (
                <div key={sub.slug} className="p-4 bg-white border border-border rounded-sm">
                  <p className="font-medium text-gray-900">{sub.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{sub.costRange}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby cities */}
        {nearbyLocations.length > 0 && (
          <section className="bg-white py-16 lg:py-20 border-t border-border">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {trade.name} work in nearby cities
              </h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {nearbyLocations.map((l) => (
                  <Link key={l.slug} href={`/find-work/${trade.slug}/${l.slug}`}
                    className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-border text-sm text-gray-900 hover:border-brand-600/30 hover:text-brand-600 transition-colors duration-150 rounded-sm">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />{l.city}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Other trades */}
        <section className="py-12 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Other work in {loc.city}</h2>
            <div className="flex flex-wrap gap-2">
              {TRADES.filter((t) => t.slug !== trade.slug).map((t) => (
                <Link key={t.slug} href={`/find-work/${t.slug}/${loc.slug}`}
                  className="px-3 py-1.5 bg-white border border-border text-sm text-gray-600 hover:text-brand-600 hover:border-brand-600/30 transition-colors duration-150 rounded-sm">
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Find {trade.name.toLowerCase()} work in {loc.city}
            </h2>
            <p className="mt-3 text-gray-600">
              Join free. See real projects. Bid when you're ready.
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
