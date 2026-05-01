import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Shield, Star } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import {
  TRADES,
  getLocationBySlug,
  getNeighborhoodBySlug,
  getProfileLocations,
} from "@shared/lib/seo-data";

export const revalidate = 86400;

interface Props {
  params: Promise<{ city: string; neighborhood: string }>;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, neighborhood } = await params;
  const loc = getLocationBySlug(city);
  if (!loc?.profile) return {};
  const hood = getNeighborhoodBySlug(loc.profile, neighborhood);
  if (!hood) return {};

  const title = `Contractors Near ${hood.name}, ${loc.city} ${loc.stateAbbr}`;
  const description = `Find verified contractors near ${hood.name} in ${loc.city}, ${loc.stateAbbr}. ${hood.description} Compare bids, no lead fees.`;

  return {
    title,
    description,
    openGraph: { title: `${title} | FairTradeWorker`, description, type: "website" },
    alternates: { canonical: `/services/city/${loc.slug}/${hood.slug}` },
  };
}

export default async function NeighborhoodPage({ params }: Props) {
  const { city, neighborhood } = await params;
  const loc = getLocationBySlug(city);
  if (!loc?.profile) notFound();
  const hood = getNeighborhoodBySlug(loc.profile, neighborhood);
  if (!hood) notFound();

  const profile = loc.profile;
  const otherHoods = profile.neighborhoods.filter((h) => h.slug !== hood.slug);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://fairtradeworker.com" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://fairtradeworker.com/services" },
      { "@type": "ListItem", position: 3, name: `${loc.city}, ${loc.stateAbbr}`, item: `https://fairtradeworker.com/services/city/${loc.slug}` },
      { "@type": "ListItem", position: 4, name: hood.name, item: `https://fairtradeworker.com/services/city/${loc.slug}/${hood.slug}` },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Contractors near ${hood.name}, ${loc.city}`,
    description: `${hood.description} Find verified contractors for all trades near ${hood.name}.`,
    provider: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
    areaServed: {
      "@type": "Place",
      name: `${hood.name}, ${loc.city}, ${loc.stateAbbr}`,
      containedInPlace: { "@type": "City", name: loc.city },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

        {/* Hero */}
        <section className="bg-surface py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li><Link href="/" className="hover:text-gray-900 transition-colors duration-150">Home</Link></li>
                <li className="text-gray-400">/</li>
                <li><Link href="/services" className="hover:text-gray-900 transition-colors duration-150">Services</Link></li>
                <li className="text-gray-400">/</li>
                <li><Link href={`/services/city/${loc.slug}`} className="hover:text-gray-900 transition-colors duration-150">{loc.city}, {loc.stateAbbr}</Link></li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900">{hood.name}</li>
              </ol>
            </nav>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight max-w-3xl">
              Contractors Near {hood.name}, {loc.city}
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl leading-relaxed">
              {hood.description} Find verified contractors who know the {hood.name} area — local building codes, soil conditions, and architectural style.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Shield className="w-4 h-4 text-[#C41E3A]" />License verified</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Star className="w-4 h-4 text-[#C41E3A]" />Real reviews</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-[#C41E3A]" />{loc.city}, {loc.stateAbbr}</div>
            </div>

            <div className="mt-8">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">Post Your Project Free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Browse Trades in this Neighborhood */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              Services Available Near {hood.name}
            </h2>
            <p className="mt-2 text-[#4B5563]">
              All trades available in {loc.city} — select one to see sub-services and pricing.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRADES.map((trade) => (
                <Link key={trade.slug} href={`/services/${trade.slug}/${loc.slug}`}
                  className="group bg-white border border-[#E5E1DB] p-5 hover:border-[#C41E3A]/30 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[#111318] group-hover:text-[#C41E3A] transition-colors duration-150">{trade.plural}</h3>
                      <p className="mt-1 text-sm text-[#4B5563] line-clamp-1">{trade.description}</p>
                      <p className="mt-2 text-xs font-medium text-[#C41E3A]">{trade.avgCostRange}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#C41E3A] transition-colors duration-150 shrink-0 ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Top sub-services for this area */}
        <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              Popular Projects Near {hood.name}
            </h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TRADES.slice(0, 6).flatMap((trade) =>
                trade.subServices.slice(0, 2).map((sub) => (
                  <Link key={`${trade.slug}-${sub.slug}`} href={`/services/${trade.slug}/${sub.slug}/${loc.slug}`}
                    className="flex items-center justify-between p-4 bg-[#FAFAFA] border border-[#E5E1DB] hover:border-[#C41E3A]/30 transition-colors duration-150">
                    <div>
                      <span className="font-medium text-[#111318]">{sub.name}</span>
                      <span className="block text-xs text-[#9CA3AF] mt-0.5">{sub.costRange}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                  </Link>
                )),
              )}
            </div>
          </div>
        </section>

        {/* Other Neighborhoods */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#111318]">
              Other {loc.city} Neighborhoods
            </h2>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {otherHoods.map((h) => (
                <Link key={h.slug} href={`/services/city/${loc.slug}/${h.slug}`}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[#E5E1DB] text-sm text-[#111318] hover:border-[#C41E3A]/30 hover:text-[#C41E3A] transition-colors duration-150">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />{h.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Find Contractors Near {hood.name}
            </h2>
            <p className="mt-3 text-gray-600 max-w-lg mx-auto">
              Post your project for free. Verified contractors near {hood.name} in {loc.city} bid on your job. No lead fees, escrow protection on every project.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="xl" asChild><Link href="/signup?role=homeowner">Post a Job Free</Link></Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/fairprice">Get Instant Estimate</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
