import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { TRADES, SERVICE_LOCATIONS, getTradeBySlug } from "@shared/lib/seo-data";

export const revalidate = 86400;

interface Props { params: Promise<{ trade: string }> }


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trade: slug } = await params;
  const trade = getTradeBySlug(slug);
  if (!trade) return {};
  const title = `${trade.name} Jobs in Mississippi — Find ${trade.name} Work`;
  const description = `Find ${trade.name.toLowerCase()} jobs in Mississippi. Real projects from real homeowners. No lead fees. Bid free on the Free plan. Join FairTradeWorker.`;
  return {
    title, description,
    openGraph: { title: `${title} | FairTradeWorker`, description },
    alternates: { canonical: `/find-work/${trade.slug}` },
  };
}

function groupByMetro(locations: typeof SERVICE_LOCATIONS) {
  return locations.reduce((acc, loc) => {
    const key = loc.metro || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(loc);
    return acc;
  }, {} as Record<string, typeof SERVICE_LOCATIONS>);
}

export default async function FindTradeWorkPage({ params }: Props) {
  const { trade: slug } = await params;
  const trade = getTradeBySlug(slug);
  if (!trade) notFound();
  const metroGroups = groupByMetro(SERVICE_LOCATIONS);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        <section className="bg-[#FAFAFA] py-20 lg:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="mb-6 text-sm text-gray-500">
              <Link href="/find-work" className="hover:text-gray-900">Find Work</Link>
              <span className="mx-1.5">/</span>
              <span className="text-gray-900">{trade.name}</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              {trade.name} Jobs in Mississippi
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Homeowners across Mississippi are posting {trade.name.toLowerCase()} projects.
              Pick your city, see what's available, and start bidding. No lead
              fees — the Free plan lets you bid on unlimited jobs.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup?role=contractor">Join Free — Find {trade.name} Work</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {trade.name} jobs by city
            </h2>
            <div className="mt-8 space-y-10">
              {Object.entries(metroGroups).map(([metro, locations]) => (
                <div key={metro}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{metro}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {locations.map((loc) => (
                      <Link key={loc.slug} href={`/find-work/${trade.slug}/${loc.slug}`}
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-border text-sm text-gray-900 hover:border-brand-600/30 hover:text-brand-600 transition-colors duration-150 rounded-sm">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />{loc.city}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other trades */}
        <section className="py-12 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Other trades hiring</h2>
            <div className="flex flex-wrap gap-2">
              {TRADES.filter((t) => t.slug !== trade.slug).map((t) => (
                <Link key={t.slug} href={`/find-work/${t.slug}`}
                  className="px-3 py-1.5 bg-white border border-border text-sm text-gray-600 hover:text-brand-600 hover:border-brand-600/30 transition-colors duration-150 rounded-sm">
                  {t.name} Jobs
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: "#0F1419" }} className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white">Ready to find {trade.name.toLowerCase()} work?</h2>
            <p className="mt-3 text-gray-300">Join free. Browse jobs. Bid when you see something you want.</p>
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
