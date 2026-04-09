import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MapPin, Shield, Star, Sun, Leaf, Snowflake, CloudRain } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import {
  TRADES,
  SERVICE_LOCATIONS,
  getLocationBySlug,
  getProfileLocations,
} from "@shared/lib/seo-data";

export const revalidate = 86400;

interface Props {
  params: Promise<{ city: string }>;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const loc = getLocationBySlug(city);
  if (!loc) return {};

  const title = loc.profile
    ? `Contractors in ${loc.city}, ${loc.stateAbbr} — All Trades, Verified Pros`
    : `Contractors in ${loc.city}, ${loc.stateAbbr} | FairTradeWorker`;
  const description = loc.profile
    ? `Find verified contractors in ${loc.city}, Mississippi for HVAC, electrical, plumbing, roofing, painting, and more. Compare bids by neighborhood. No lead fees. Free to post.`
    : `Find verified contractors in ${loc.city}, ${loc.stateAbbr}. Compare bids, read reviews, and hire with confidence on FairTradeWorker.`;

  return {
    title,
    description,
    openGraph: { title: `${title} | FairTradeWorker`, description, type: "website" },
    alternates: { canonical: `/services/city/${loc.slug}` },
  };
}

const seasonIcons: Record<string, typeof Sun> = {
  Spring: CloudRain,
  Summer: Sun,
  Fall: Leaf,
  Winter: Snowflake,
};

export default async function CityHubPage({ params }: Props) {
  const { city } = await params;
  const loc = getLocationBySlug(city);
  if (!loc?.profile) notFound();

  const profile = loc.profile;
  const nearbyLocations = SERVICE_LOCATIONS.filter(
    (l) => l.metro === loc.metro && l.slug !== loc.slug,
  ).slice(0, 8);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Contractors in ${loc.city}, ${loc.stateAbbr}`,
    description: profile.description,
    publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
    about: { "@type": "City", name: loc.city, containedInPlace: { "@type": "State", name: loc.state } },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: profile.localFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://fairtradeworker.com" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://fairtradeworker.com/services" },
      { "@type": "ListItem", position: 3, name: `${loc.city}, ${loc.stateAbbr}`, item: `https://fairtradeworker.com/services/city/${loc.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
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
                <li className="text-gray-300">{loc.city}, {loc.stateAbbr}</li>
              </ol>
            </nav>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
              {profile.tagline}
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl leading-relaxed">
              {profile.description}
            </p>
            <p className="mt-3 text-sm text-gray-400">Population: {profile.population}</p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">Post Your Project Free</Link>
              </Button>
              <Button size="xl" variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500" asChild>
                <Link href="/fairprice">Get Instant Estimate</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Local Highlights */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              What to Know About Home Projects in {loc.city}
            </h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.highlights.map((highlight) => (
                <div key={highlight} className="flex items-start gap-3 p-4 bg-white border border-[#E5E1DB]">
                  <Check className="w-5 h-5 text-[#C41E3A] shrink-0 mt-0.5" />
                  <span className="text-[#111318]">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Browse by Trade */}
        <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              Find Contractors in {loc.city} by Trade
            </h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRADES.map((trade) => (
                <Link key={trade.slug} href={`/services/${trade.slug}/${loc.slug}`}
                  className="group bg-[#FAFAFA] border border-[#E5E1DB] p-5 hover:border-[#C41E3A]/30 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#111318] group-hover:text-[#C41E3A] transition-colors duration-150">{trade.plural}</h3>
                      <p className="mt-1 text-sm text-[#4B5563] line-clamp-1">{trade.avgCostRange}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#C41E3A] transition-colors duration-150 shrink-0 ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Neighborhoods */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              {loc.city} Neighborhoods We Serve
            </h2>
            <p className="mt-2 text-[#4B5563]">
              Find contractors who know your specific area.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.neighborhoods.map((hood) => (
                <Link key={hood.slug} href={`/services/city/${loc.slug}/${hood.slug}`}
                  className="group bg-white border border-[#E5E1DB] p-5 hover:border-[#C41E3A]/30 transition-colors duration-150">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#111318] group-hover:text-[#C41E3A] transition-colors duration-150">
                        <MapPin className="w-4 h-4 inline mr-1.5 text-[#C41E3A]" />{hood.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-[#4B5563] leading-relaxed">{hood.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#C41E3A] transition-colors duration-150 shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Seasonal Tips */}
        <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              Seasonal Home Maintenance in {loc.city}
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.seasonalTips.map((tip) => {
                const Icon = seasonIcons[tip.season] || Sun;
                return (
                  <div key={tip.season} className="bg-[#FAFAFA] border border-[#E5E1DB] p-6">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-[#C41E3A]" />
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">{tip.season}</span>
                        <h3 className="text-lg font-semibold text-[#111318]">{tip.title}</h3>
                      </div>
                    </div>
                    <p className="mt-3 text-[#4B5563] leading-relaxed">{tip.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Local FAQs */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111318]">
              {loc.city} Contractor FAQs
            </h2>
            <div className="mt-8 space-y-6 max-w-3xl">
              {profile.localFaqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="text-lg font-semibold text-[#111318]">{faq.question}</h3>
                  <p className="mt-2 text-[#4B5563] leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby Cities */}
        {nearbyLocations.length > 0 && (
          <section className="py-16 lg:py-20 bg-white border-t border-[#E5E1DB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-[#111318]">Contractors in Nearby Cities</h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {nearbyLocations.map((l) => {
                  const href = l.profile ? `/services/city/${l.slug}` : `/services/general-contractors/${l.slug}`;
                  return (
                    <Link key={l.slug} href={href}
                      className="flex items-center gap-2 px-3 py-2.5 bg-[#FAFAFA] border border-[#E5E1DB] text-sm text-[#111318] hover:border-[#C41E3A]/30 hover:text-[#C41E3A] transition-colors duration-150">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />{l.city}, {l.stateAbbr}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-[#0F1419] py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Start Your {loc.city} Project Today
            </h2>
            <p className="mt-3 text-gray-300 max-w-lg mx-auto">
              Post your project for free. Verified contractors in {loc.city} bid on your job. No lead fees, escrow on every project.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="xl" asChild><Link href="/signup?role=homeowner">Post a Job Free</Link></Button>
              <Button size="xl" variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500" asChild>
                <Link href="/signup?role=contractor">Join as {loc.city} Contractor</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
