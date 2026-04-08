import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Clock, DollarSign, MapPin, Shield, Star } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import {
  TRADES,
  SERVICE_LOCATIONS,
  getTradeBySlug,
  getLocationBySlug,
  getSubServiceBySlug,
  getTradeLocationTitle,
  getTradeLocationDescription,
  getTradeLocationKeywords,
} from "@shared/lib/seo-data";
import type { Trade, ServiceLocation, SubService } from "@shared/lib/seo-data";

export const revalidate = 86400;

interface Props {
  params: Promise<{ trade: string; slug: string }>;
}

// Generate params for both locations AND sub-services

function resolve(tradeSlug: string, slug: string) {
  const trade = getTradeBySlug(tradeSlug);
  if (!trade) return null;
  const location = getLocationBySlug(slug);
  if (location) return { trade, location, subService: null as SubService | null };
  const subService = getSubServiceBySlug(trade, slug);
  if (subService) return { trade, location: null as ServiceLocation | null, subService };
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trade: ts, slug } = await params;
  const resolved = resolve(ts, slug);
  if (!resolved) return {};

  if (resolved.location) {
    const title = getTradeLocationTitle(resolved.trade, resolved.location);
    const description = getTradeLocationDescription(resolved.trade, resolved.location);
    return {
      title,
      description,
      keywords: getTradeLocationKeywords(resolved.trade, resolved.location),
      openGraph: { title: `${title} | FairTradeWorker`, description, type: "website" },
      alternates: { canonical: `/services/${resolved.trade.slug}/${resolved.location.slug}` },
    };
  }

  const sub = resolved.subService!;
  return {
    title: `${sub.name} — Find Verified Pros Near You`,
    description: `${sub.description} Find verified ${resolved.trade.plural.toLowerCase()} for ${sub.name.toLowerCase()} in Mississippi. Typical cost: ${sub.costRange}. No lead fees.`,
    alternates: { canonical: `/services/${resolved.trade.slug}/${sub.slug}` },
  };
}

// ── Sub-service index (e.g. /services/hvac/ac-repair) ──────────────
function SubServiceIndex({ trade, sub }: { trade: Trade; sub: SubService }) {
  const metroGroups = SERVICE_LOCATIONS.reduce(
    (acc, loc) => {
      const key = loc.metro || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(loc);
      return acc;
    },
    {} as Record<string, ServiceLocation[]>,
  );

  return (
    <>
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
              <li className="text-gray-300">{sub.name}</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
            {sub.name} in Mississippi
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl leading-relaxed">
            {sub.description} Select your city below to find verified {trade.plural.toLowerCase()} near you. Typical cost: {sub.costRange}.
          </p>
          <div className="mt-8">
            <Button size="xl" asChild>
              <Link href="/signup?role=homeowner">Post Your Project Free</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">Find {sub.name} by City</h2>
          <div className="mt-8 space-y-10">
            {Object.entries(metroGroups).map(([metro, locations]) => (
              <div key={metro}>
                <h3 className="text-xl font-semibold text-[#111318] mb-4">{metro}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {locations.map((loc) => (
                    <Link key={loc.slug} href={`/services/${trade.slug}/${sub.slug}/${loc.slug}`}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[#E5E1DB] text-sm text-[#111318] hover:border-[#C41E3A]/30 hover:text-[#C41E3A] transition-colors duration-150">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />{loc.city}, {loc.stateAbbr}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-[#E5E1DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-[#111318] mb-4">Other {trade.name} Services</h2>
          <div className="flex flex-wrap gap-2">
            {trade.subServices.filter((s) => s.slug !== sub.slug).map((s) => (
              <Link key={s.slug} href={`/services/${trade.slug}/${s.slug}`}
                className="px-3 py-1.5 bg-white border border-[#E5E1DB] text-sm text-[#4B5563] hover:text-[#C41E3A] hover:border-[#C41E3A]/30 transition-colors duration-150">
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── Trade + location page (e.g. /services/hvac/oxford-ms) ──────────
function TradeLocationPage({ trade, location }: { trade: Trade; location: ServiceLocation }) {
  const nearbyLocations = SERVICE_LOCATIONS.filter(
    (l) => l.stateAbbr === location.stateAbbr && l.slug !== location.slug,
  ).slice(0, 8);

  const title = getTradeLocationTitle(trade, location);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${trade.plural} in ${location.city}, ${location.stateAbbr}`,
    description: getTradeLocationDescription(trade, location),
    provider: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
    areaServed: { "@type": "City", name: location.city, containedInPlace: { "@type": "State", name: location.state } },
    serviceType: trade.name,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free to post your project and receive bids" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      ...trade.faqs.map((faq) => ({ "@type": "Question" as const, name: faq.question, acceptedAnswer: { "@type": "Answer" as const, text: faq.answer } })),
      { "@type": "Question" as const, name: `How do I find ${trade.plural.toLowerCase()} in ${location.city}, ${location.stateAbbr}?`, acceptedAnswer: { "@type": "Answer" as const, text: `Post your ${trade.name.toLowerCase()} project on FairTradeWorker for free. Verified ${trade.plural.toLowerCase()} in ${location.city} will bid on your job. Compare prices, reviews, and qualifications, then hire with escrow-protected payments.` } },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://fairtradeworker.com" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://fairtradeworker.com/services" },
      { "@type": "ListItem", position: 3, name: trade.plural, item: `https://fairtradeworker.com/services/${trade.slug}` },
      { "@type": "ListItem", position: 4, name: `${location.city}, ${location.stateAbbr}`, item: `https://fairtradeworker.com/services/${trade.slug}/${location.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
              <li className="text-gray-300">{location.city}, {location.stateAbbr}</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">{title}</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl leading-relaxed">
            Find verified {trade.plural.toLowerCase()} in {location.city}, {location.stateAbbr}. Post your project for free, compare bids from licensed professionals, and hire with escrow-protected payments. No lead fees.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300"><Shield className="w-4 h-4 text-[#C41E3A]" />License verified</div>
            <div className="flex items-center gap-2 text-sm text-gray-300"><Star className="w-4 h-4 text-[#C41E3A]" />Real reviews</div>
            <div className="flex items-center gap-2 text-sm text-gray-300"><DollarSign className="w-4 h-4 text-[#C41E3A]" />Escrow payments</div>
            <div className="flex items-center gap-2 text-sm text-gray-300"><Clock className="w-4 h-4 text-[#C41E3A]" />Avg. cost: {trade.avgCostRange}</div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button size="xl" asChild><Link href="/signup?role=homeowner">Post Your {trade.name} Project Free</Link></Button>
            <Button size="xl" variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500" asChild>
              <Link href="/fairprice">Get Instant Estimate</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sub-services in this location */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">{trade.name} Services in {location.city}</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trade.subServices.map((sub) => (
              <Link key={sub.slug} href={`/services/${trade.slug}/${sub.slug}/${location.slug}`}
                className="group bg-white border border-[#E5E1DB] p-5 hover:border-[#C41E3A]/30 transition-colors duration-150">
                <h3 className="font-semibold text-[#111318] group-hover:text-[#C41E3A] transition-colors duration-150">{sub.name}</h3>
                <p className="mt-1 text-sm text-[#4B5563] line-clamp-2">{sub.description}</p>
                <p className="mt-2 text-xs font-medium text-[#C41E3A]">{sub.costRange}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why FTW */}
      <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">Why Hire {trade.plural} Through FairTradeWorker</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Verified Professionals", desc: `Every ${trade.name.toLowerCase()} contractor in ${location.city} is license-verified, insured, and background-checked before they can bid on your project.` },
              { icon: DollarSign, title: "Zero Lead Fees", desc: "Unlike HomeAdvisor or Thumbtack, we never charge per lead. Contractors pay a flat subscription, so they don't inflate bids to cover lead costs." },
              { icon: Star, title: "Real Reviews Only", desc: "Every review comes from a completed, escrow-verified job. No fake reviews, no anonymous posts." },
            ].map((item) => (
              <div key={item.title} className="bg-[#FAFAFA] border border-[#E5E1DB] p-6">
                <item.icon className="w-8 h-8 text-[#C41E3A]" />
                <h3 className="mt-4 text-lg font-semibold text-[#111318]">{item.title}</h3>
                <p className="mt-2 text-[#4B5563] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">How to Hire {trade.plural} in {location.city}</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Describe your project", desc: `Tell us about your ${trade.name.toLowerCase()} project in ${location.city}. Add photos, square footage, and requirements. Takes under two minutes.` },
              { step: "2", title: "Get bids from verified pros", desc: `Licensed ${trade.plural.toLowerCase()} in the ${location.metro || location.city} area bid on your project. Compare pricing, reviews, and qualifications.` },
              { step: "3", title: "Hire with escrow protection", desc: "Choose your contractor and pay through escrow. Funds are held until the work passes inspection." },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-10 h-10 flex items-center justify-center bg-[#C41E3A] text-white font-bold text-lg">{item.step}</div>
                <h3 className="mt-4 text-lg font-semibold text-[#111318]">{item.title}</h3>
                <p className="mt-2 text-[#4B5563] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">{trade.name} FAQs for {location.city}, {location.stateAbbr}</h2>
          <div className="mt-8 space-y-6 max-w-3xl">
            {trade.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-semibold text-[#111318]">{faq.question}</h3>
                <p className="mt-2 text-[#4B5563] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
            <div>
              <h3 className="text-lg font-semibold text-[#111318]">How do I find {trade.plural.toLowerCase()} in {location.city}, {location.stateAbbr}?</h3>
              <p className="mt-2 text-[#4B5563] leading-relaxed">
                Post your {trade.name.toLowerCase()} project on FairTradeWorker for free. Verified {trade.plural.toLowerCase()} in {location.city} will bid on your job. Compare prices, reviews, and qualifications, then hire with escrow-protected payments. No lead fees, no hidden costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Cities */}
      {nearbyLocations.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#111318]">{trade.plural} in Nearby Cities</h2>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {nearbyLocations.map((loc) => (
                <Link key={loc.slug} href={`/services/${trade.slug}/${loc.slug}`}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[#E5E1DB] text-sm text-[#111318] hover:border-[#C41E3A]/30 hover:text-[#C41E3A] transition-colors duration-150">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />{loc.city}, {loc.stateAbbr}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Trades */}
      <section className="py-12 border-t border-[#E5E1DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-[#111318] mb-4">Other Services in {location.city}, {location.stateAbbr}</h2>
          <div className="flex flex-wrap gap-2">
            {TRADES.filter((t) => t.slug !== trade.slug).map((t) => (
              <Link key={t.slug} href={`/services/${t.slug}/${location.slug}`}
                className="px-3 py-1.5 bg-white border border-[#E5E1DB] text-sm text-[#4B5563] hover:text-[#C41E3A] hover:border-[#C41E3A]/30 transition-colors duration-150">
                {t.plural}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0F1419] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Get Free {trade.name} Estimates in {location.city}</h2>
          <p className="mt-3 text-gray-300 max-w-lg mx-auto">
            Post your project and receive bids from verified {trade.plural.toLowerCase()} in {location.city}, {location.stateAbbr}. Free to post. No lead fees. Escrow on every job.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="xl" asChild><Link href="/signup?role=homeowner">Post a Job Free</Link></Button>
            <Button size="xl" variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500" asChild>
              <Link href="/signup?role=contractor">Join as {location.city} Contractor</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Main page component ────────────────────────────────────────────
export default async function SlugPage({ params }: Props) {
  const { trade: ts, slug } = await params;
  const resolved = resolve(ts, slug);
  if (!resolved) notFound();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        {resolved.location ? (
          <TradeLocationPage trade={resolved.trade} location={resolved.location} />
        ) : (
          <SubServiceIndex trade={resolved.trade} sub={resolved.subService!} />
        )}
      </main>
      <Footer />
    </div>
  );
}
