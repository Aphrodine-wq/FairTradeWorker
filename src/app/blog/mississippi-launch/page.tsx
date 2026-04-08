import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";

export const metadata: Metadata = {
  title: "Mississippi Launch: Building Density Market by Market | FairTradeWorker",
  description:
    "We're not going national on day one. Here's why we're building density in Mississippi and Texas first, and what that means for contractors in those markets.",
  openGraph: {
    title: "Mississippi Launch: Building Density Market by Market | FairTradeWorker",
    description: "We're building density in Mississippi first. Here's why and what it means for contractors.",
    type: "article",
    publishedTime: "2026-02-15T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/mississippi-launch" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Mississippi Launch: Building Density Market by Market",
  description: "We're not going national on day one. Here's why we're building density in Mississippi first.",
  datePublished: "2026-02-15",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/mississippi-launch",
};

export default function MississippiLaunchPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#FAFAFA] min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }} />
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to blog
          </Link>

          <div className="mb-8">
            <span className="text-sm text-amber-700 font-medium">News</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Mississippi Launch: Building Density Market by Market
            </h1>
            <p className="text-gray-700 mt-2">February 15, 2026</p>
          </div>

          <div className="max-w-none">
            <p className="text-gray-800 leading-relaxed mb-4">
              Most construction marketplaces launch the same way: go national
              on day one, spend millions on ads, and hope that enough
              contractors and homeowners sign up in enough cities to make the
              platform feel alive. It almost never works. You end up with a
              homeowner in Tupelo who posts a job and gets zero bids because
              there are three contractors on the platform in the entire state.
              Everyone has a bad experience and nobody comes back.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              We&apos;re doing it differently. FairTradeWorker is launching in
              North Mississippi first, expanding to Texas, and building density
              one market at a time. Here&apos;s why.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              The Density Problem
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              A two-sided marketplace only works when both sides show up. If a
              homeowner posts a bathroom remodel and gets five bids from
              verified, local contractors within 24 hours, that&apos;s a great
              experience. If they post and hear crickets for a week, they
              delete the app and call somebody from a yard sign.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              The same is true for contractors. If a plumber logs in and sees
              15 active jobs in their service area, the platform is useful. If
              they see two jobs posted last month, they&apos;re not coming back.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              Density is what makes the marketplace work. It&apos;s better to
              have 100 great contractors in one city than 1 contractor in 100
              cities. One city with real density creates word of mouth,
              repeat usage, and proof that the model works. A hundred cities
              with thin coverage creates a hundred ghost towns.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              Why Mississippi First
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              Oxford, Mississippi is home base. Strata Software Group, the
              company behind FairTradeWorker, is here. We know the contractors,
              we know the market, and we can be on a job site in 20 minutes if
              something needs attention. That matters in the early days when
              every interaction shapes the platform.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              North Mississippi also has characteristics that make it a strong
              test market. Active residential construction. A mix of new builds
              and renovation work. Contractors who are busy enough to need
              better tools but underserved by the big national platforms that
              focus their sales teams on Dallas and Atlanta.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              We&apos;re signing contractors across all trades in this market.
              Not just GCs, not just plumbers. Every licensed trade that
              homeowners need. The goal is that when a homeowner in Oxford or
              Tupelo or Southaven posts any residential job, they get multiple
              qualified bids fast.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              Texas Is Next
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              Once Mississippi is dense and running, Texas is the next market.
              The state has one of the highest rates of new residential
              construction in the country, a large and active contractor base,
              and a regulatory environment that lets us move fast. We&apos;re
              targeting specific metros, not the whole state at once. Build
              density in one city, prove the model, expand to the next.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              The Southeast by Late 2026
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              The roadmap after Texas is the broader Southeast. Alabama,
              Tennessee, Louisiana, Georgia. Markets with strong construction
              activity, growing populations, and contractors who are tired of
              paying $60 per lead on platforms that don&apos;t care whether the
              lead converts.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              Each new market follows the same playbook: sign contractors
              across all trades, build density until the marketplace is
              self-sustaining, then move to the next city. No spray-and-pray
              national launch. No Super Bowl ad. Just a platform that works
              in the places where it&apos;s available, and grows because
              contractors tell other contractors about it.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              If you&apos;re a contractor in Mississippi or Texas and you want
              early access, sign up now. The best time to join a marketplace is
              before it&apos;s crowded.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
