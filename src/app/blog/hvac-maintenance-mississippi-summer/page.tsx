import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "Mississippi Summer HVAC Guide: Keep Cool Without Going Broke",
  description:
    "Your Mississippi HVAC needs spring maintenance before summer hits. Learn what a tune-up includes, when to repair vs replace, and how to get fair HVAC bids.",
  openGraph: {
    title: "Mississippi Summer HVAC Guide: Keep Cool Without Going Broke | FairTradeWorker",
    description: "Spring HVAC maintenance saves Mississippi homeowners thousands. Here's what you need to know.",
    type: "article",
    publishedTime: "2026-03-28T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/hvac-maintenance-mississippi-summer" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Mississippi Summer HVAC Guide: Keep Cool Without Going Broke",
  description: "Spring HVAC maintenance saves Mississippi homeowners thousands before summer hits.",
  datePublished: "2026-03-28",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/hvac-maintenance-mississippi-summer",
};

export default function HvacMaintenanceMississippiPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#FAFAFA] min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }} />
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Link href="/blog" className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 mb-8">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to blog
          </Link>

          <header>
            <span className="text-sm font-semibold text-brand-600">Seasonal</span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Mississippi Summer HVAC Guide: Keep Cool Without Going Broke
            </h1>
            <p className="text-gray-700 mt-2">March 28, 2026</p>
          </header>

          <div className="mt-10 prose prose-gray max-w-none space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Mississippi summers don't play around. When it's 95 degrees with 80% humidity from June through September, your AC isn't a luxury — it's the only thing between you and a miserable existence. That's also why your HVAC system works harder here than almost anywhere else in the country.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The best time to deal with your HVAC is spring — before every technician in the state is booked solid with emergency calls. Here's what you need to know.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Why spring maintenance matters</h2>
            <p className="text-gray-700 leading-relaxed">
              A properly maintained AC system runs 15-20% more efficiently than a neglected one. In Mississippi, where your system runs 8-10 hours a day for four months straight, that efficiency gap translates to $200-$400 in extra electricity costs per summer. A spring tune-up costs $75-$150. The math is obvious.
            </p>
            <p className="text-gray-700 leading-relaxed">
              More importantly, a tune-up catches small problems before they become emergency repairs. A failing capacitor is a $150 fix in April. In July, when every HVAC tech is slammed, you're paying emergency rates and sitting in a 90-degree house waiting for them to show up.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">What a tune-up includes</h2>
            <p className="text-gray-700 leading-relaxed">
              A proper spring tune-up should cover: refrigerant level check and top-off, condenser coil cleaning (your outdoor unit collects a season's worth of pollen and debris), evaporator coil inspection, drain line flush (clogged drain lines cause water damage — common in humid climates), electrical connection tightening, thermostat calibration, and a full system test under load.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If a technician quotes you for a "tune-up" that's just changing the filter and leaving, that's not a tune-up. Get a second opinion.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Repair vs replace: the 10-year rule</h2>
            <p className="text-gray-700 leading-relaxed">
              HVAC systems in Mississippi take more abuse than most. A unit that might last 20 years in Minnesota is doing well to hit 12-15 here. If your system is over 10 years old and needs a repair that costs more than half the price of a new unit, replace it. A new high-efficiency system pays for itself faster in Mississippi than almost any other state because the cooling load is so extreme.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Average repair costs:</strong> Capacitor replacement runs $150-$350. Compressor replacement is $1,200-$2,500. Refrigerant leak repair is $200-$1,500 depending on severity. A new 3-ton system (typical for a 1,500-2,000 sq ft Mississippi home) runs $4,500-$8,000 installed.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Common failures in Mississippi</h2>
            <p className="text-gray-700 leading-relaxed">
              The humidity here kills two things faster than anywhere else: <strong>drain lines</strong> (algae buildup clogs them, causing water damage) and <strong>condenser coils</strong> (the outdoor unit works overtime and corrodes faster). Both are preventable with annual maintenance. The red clay soil in central and north Mississippi also tends to settle around outdoor units, restricting airflow and shortening compressor life.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Get HVAC bids on FTW</h2>
            <p className="text-gray-700 leading-relaxed">
              Whether you need a tune-up, a repair, or a full system replacement, post it on FairTradeWorker. You'll get bids from licensed HVAC contractors in your area — no lead fees, no middlemen. Check the <Link href="/fairprice" className="text-brand-600 font-medium hover:underline">FairPrice Estimator</Link> first to know what you should be paying before the bids come in.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-gray-700 mb-4">Ready to get your HVAC serviced before summer?</p>
            <Button asChild>
              <Link href="/signup?role=homeowner">Post Your Project Free</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
