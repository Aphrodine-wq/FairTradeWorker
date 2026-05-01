import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MapPin, Shield, Star } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import {
  TRADES,
  SERVICE_LOCATIONS,
  getTradeBySlug,
} from "@shared/lib/seo-data";

export const revalidate = 86400;

interface Props {
  params: Promise<{ trade: string }>;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trade: slug } = await params;
  const trade = getTradeBySlug(slug);
  if (!trade) return {};

  const title = `${trade.plural} Near You — Verified & Reviewed`;
  const description = `Find verified ${trade.plural.toLowerCase()} near you. Compare bids, read real reviews, and hire with confidence. No lead fees. Free to post your ${trade.name.toLowerCase()} project on FairTradeWorker.`;

  return {
    title,
    description,
    keywords: trade.keywords,
    openGraph: {
      title: `${title} | FairTradeWorker`,
      description,
      type: "website",
    },
    alternates: {
      canonical: `/services/${trade.slug}`,
    },
  };
}

// Group locations by state
function groupByState(locations: typeof SERVICE_LOCATIONS) {
  return locations.reduce(
    (acc, loc) => {
      if (!acc[loc.state]) acc[loc.state] = [];
      acc[loc.state].push(loc);
      return acc;
    },
    {} as Record<string, typeof SERVICE_LOCATIONS>,
  );
}

export default async function TradePage({ params }: Props) {
  const { trade: slug } = await params;
  const trade = getTradeBySlug(slug);
  if (!trade) notFound();

  const stateGroups = groupByState(SERVICE_LOCATIONS);

  // JSON-LD: Service schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: trade.plural,
    description: trade.description,
    provider: {
      "@type": "Organization",
      name: "FairTradeWorker",
      url: "https://fairtradeworker.com",
    },
    areaServed: SERVICE_LOCATIONS.map((loc) => ({
      "@type": "City",
      name: `${loc.city}, ${loc.stateAbbr}`,
    })),
    serviceType: trade.name,
  };

  // JSON-LD: FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: trade.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* Hero */}
        <section className="bg-surface py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-gray-900 transition-colors duration-150">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link href="/services" className="hover:text-gray-900 transition-colors duration-150">
                    Services
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900">{trade.plural}</li>
              </ol>
            </nav>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight max-w-3xl">
              {trade.plural} Near You
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl leading-relaxed">
              {trade.description} Compare bids from verified professionals. No
              lead fees on any plan.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Average project cost: <strong className="text-gray-900">{trade.avgCostRange}</strong>
            </p>

            <div className="mt-8">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">
                  Post Your {trade.name} Project Free
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Sub-Services */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              {trade.name} Services We Cover
            </h2>
            <p className="mt-2 text-[#4B5563]">
              Select a service to find verified pros in your city.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trade.subServices.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/services/${trade.slug}/${sub.slug}`}
                  className="group bg-white border border-[#E5E1DB] p-5 hover:border-[#C41E3A]/30 transition-colors duration-150"
                >
                  <h3 className="text-lg font-semibold text-[#111318] group-hover:text-[#C41E3A] transition-colors duration-150">
                    {sub.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#4B5563] line-clamp-2">
                    {sub.description}
                  </p>
                  <p className="mt-3 text-xs font-medium text-[#C41E3A]">
                    {sub.costRange}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works (condensed) */}
        <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              How to Hire {trade.plural}
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Post your project",
                  desc: `Describe your ${trade.name.toLowerCase()} project in detail. It's free and takes under two minutes.`,
                },
                {
                  step: "2",
                  title: "Compare bids",
                  desc: `Verified ${trade.plural.toLowerCase()} in your area bid on your job. Compare pricing, reviews, and qualifications.`,
                },
                {
                  step: "3",
                  title: "Hire with confidence",
                  desc: "Choose your contractor. Payments are held in escrow until the work is done right.",
                },
              ].map((item) => (
                <div key={item.step}>
                  <div className="w-10 h-10 flex items-center justify-center bg-[#C41E3A] text-white font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#111318]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[#4B5563] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Find by Location */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              Find {trade.plural} by City
            </h2>
            <p className="mt-2 text-[#4B5563]">
              Select your city to see {trade.plural.toLowerCase()} near you.
            </p>

            <div className="mt-8 space-y-10">
              {Object.entries(stateGroups).map(([state, locations]) => (
                <div key={state}>
                  <h3 className="text-xl font-semibold text-[#111318] mb-4">
                    {state}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {locations.map((loc) => (
                      <Link
                        key={loc.slug}
                        href={`/services/${trade.slug}/${loc.slug}`}
                        className="group flex items-center gap-2 px-3 py-2.5 bg-white border border-[#E5E1DB] text-sm text-[#111318] hover:border-[#C41E3A]/30 hover:text-[#C41E3A] transition-colors duration-150"
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{loc.city}, {loc.stateAbbr}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              Frequently Asked Questions
            </h2>
            <div className="mt-8 space-y-6 max-w-3xl">
              {trade.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="text-lg font-semibold text-[#111318]">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-[#4B5563] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Get Free {trade.name} Estimates
            </h2>
            <p className="mt-3 text-gray-600 max-w-lg mx-auto">
              Post your project and receive bids from verified{" "}
              {trade.plural.toLowerCase()} in your area. Free to post, no lead
              fees, escrow on every job.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">Post a Job Free</Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                asChild
              >
                <Link href="/fairprice">Try FairPrice Estimator</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Browse Other Trades (internal linking) */}
        <section className="py-12 border-t border-[#E5E1DB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-[#111318] mb-4">
              Browse Other Trades
            </h2>
            <div className="flex flex-wrap gap-2">
              {TRADES.filter((t) => t.slug !== trade.slug).map((t) => (
                <Link
                  key={t.slug}
                  href={`/services/${t.slug}`}
                  className="px-3 py-1.5 bg-white border border-[#E5E1DB] text-sm text-[#4B5563] hover:text-[#C41E3A] hover:border-[#C41E3A]/30 transition-colors duration-150"
                >
                  {t.plural}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
