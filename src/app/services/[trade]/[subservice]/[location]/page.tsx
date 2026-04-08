import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, DollarSign, MapPin, Shield, Star } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import {
  TRADES,
  SERVICE_LOCATIONS,
  getTradeBySlug,
  getLocationBySlug,
  getSubServiceBySlug,
  getSubServiceLocationTitle,
  getSubServiceLocationDescription,
} from "@shared/lib/seo-data";

interface Props {
  params: Promise<{ trade: string; subservice: string; location: string }>;
}

export async function generateStaticParams() {
  const params: { trade: string; subservice: string; location: string }[] = [];
  for (const trade of TRADES) {
    for (const sub of trade.subServices) {
      for (const loc of SERVICE_LOCATIONS) {
        params.push({ trade: trade.slug, subservice: sub.slug, location: loc.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trade: ts, subservice: ss, location: ls } = await params;
  const trade = getTradeBySlug(ts);
  if (!trade) return {};
  const sub = getSubServiceBySlug(trade, ss);
  const loc = getLocationBySlug(ls);
  if (!sub || !loc) return {};

  const title = getSubServiceLocationTitle(sub, loc);
  const description = getSubServiceLocationDescription(trade, sub, loc);

  return {
    title,
    description,
    openGraph: { title: `${title} | FairTradeWorker`, description, type: "website" },
    alternates: { canonical: `/services/${trade.slug}/${sub.slug}/${loc.slug}` },
  };
}

export default async function SubServiceLocationPage({ params }: Props) {
  const { trade: ts, subservice: ss, location: ls } = await params;
  const trade = getTradeBySlug(ts);
  if (!trade) notFound();
  const sub = getSubServiceBySlug(trade, ss);
  const loc = getLocationBySlug(ls);
  if (!sub || !loc) notFound();

  const title = getSubServiceLocationTitle(sub, loc);
  const nearbyLocations = SERVICE_LOCATIONS.filter(
    (l) => l.metro === loc.metro && l.slug !== loc.slug,
  ).slice(0, 8);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${sub.name} in ${loc.city}, ${loc.stateAbbr}`,
    description: getSubServiceLocationDescription(trade, sub, loc),
    provider: {
      "@type": "Organization",
      name: "FairTradeWorker",
      url: "https://fairtradeworker.com",
    },
    areaServed: { "@type": "City", name: loc.city, containedInPlace: { "@type": "State", name: loc.state } },
    serviceType: sub.name,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free to post your project" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://fairtradeworker.com" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://fairtradeworker.com/services" },
      { "@type": "ListItem", position: 3, name: trade.plural, item: `https://fairtradeworker.com/services/${trade.slug}` },
      { "@type": "ListItem", position: 4, name: sub.name, item: `https://fairtradeworker.com/services/${trade.slug}/${sub.slug}/${loc.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

        {/* Hero */}
        <section className="bg-[#0F1419] py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="mb-6 text-sm text-gray-400" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li><Link href="/" className="hover:text-white transition-colors duration-150">Home</Link></li>
                <li className="text-gray-600">/</li>
                <li><Link href="/services" className="hover:text-white transition-colors duration-150">Services</Link></li>
                <li className="text-gray-600">/</li>
                <li><Link href={`/services/${trade.slug}`} className="hover:text-white transition-colors duration-150">{trade.plural}</Link></li>
                <li className="text-gray-600">/</li>
                <li className="text-gray-300">{sub.name} in {loc.city}</li>
              </ol>
            </nav>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
              {title}
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl leading-relaxed">
              {sub.description} Get bids from verified {trade.plural.toLowerCase()} in{" "}
              {loc.city}, {loc.stateAbbr}. No lead fees.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <DollarSign className="w-4 h-4 text-[#C41E3A]" />
                Typical cost: {sub.costRange}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Shield className="w-4 h-4 text-[#C41E3A]" />
                License verified
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Star className="w-4 h-4 text-[#C41E3A]" />
                Real reviews
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">
                  Get Free {sub.name} Quotes
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500" asChild>
                <Link href="/fairprice">Get Instant Estimate</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              How to Get {sub.name} in {loc.city}
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Describe your project",
                  desc: `Tell us about your ${sub.name.toLowerCase()} needs. Add photos and details. Free, takes two minutes.`,
                },
                {
                  step: "2",
                  title: "Compare quotes",
                  desc: `Verified ${trade.plural.toLowerCase()} in ${loc.city} send you competitive bids. Compare pricing and reviews.`,
                },
                {
                  step: "3",
                  title: "Hire with escrow",
                  desc: "Pick your pro. Payments held in escrow until the work is done right.",
                },
              ].map((item) => (
                <div key={item.step}>
                  <div className="w-10 h-10 flex items-center justify-center bg-[#C41E3A] text-white font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#111318]">{item.title}</h3>
                  <p className="mt-2 text-[#4B5563] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why FTW */}
        <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              Why Choose FairTradeWorker for {sub.name}
            </h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Every contractor is license-verified and insured",
                "No lead fees — contractors pay flat subscriptions, not per-lead",
                "AI-powered estimates so you know the real cost upfront",
                "Escrow payments protect you until the work is complete",
                "Reviews from real, escrow-verified completed jobs only",
                "Free to post — you only pay when you hire",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 p-4 bg-[#FAFAFA] border border-[#E5E1DB]">
                  <Check className="w-5 h-5 text-[#C41E3A] shrink-0 mt-0.5" />
                  <span className="text-[#111318]">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other sub-services in this trade */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#111318]">
              Other {trade.name} Services in {loc.city}
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trade.subServices
                .filter((s) => s.slug !== sub.slug)
                .map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${trade.slug}/${s.slug}/${loc.slug}`}
                    className="flex items-center justify-between p-4 bg-white border border-[#E5E1DB] hover:border-[#C41E3A]/30 transition-colors duration-150"
                  >
                    <div>
                      <span className="font-medium text-[#111318]">{s.name}</span>
                      <span className="block text-xs text-[#9CA3AF] mt-0.5">{s.costRange}</span>
                    </div>
                    <MapPin className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* Nearby cities */}
        {nearbyLocations.length > 0 && (
          <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-[#111318]">
                {sub.name} in Nearby Cities
              </h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {nearbyLocations.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/services/${trade.slug}/${sub.slug}/${l.slug}`}
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#FAFAFA] border border-[#E5E1DB] text-sm text-[#111318] hover:border-[#C41E3A]/30 hover:text-[#C41E3A] transition-colors duration-150"
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {l.city}, {l.stateAbbr}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-[#0F1419] py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Get {sub.name} Quotes in {loc.city}
            </h2>
            <p className="mt-3 text-gray-300 max-w-lg mx-auto">
              Post your project for free. Verified {trade.plural.toLowerCase()} in{" "}
              {loc.city} bid on your job. No lead fees, escrow on every project.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">Post a Job Free</Link>
              </Button>
              <Button size="xl" variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500" asChild>
                <Link href={`/services/${trade.slug}/${loc.slug}`}>
                  All {trade.name} Services
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
