import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "How Much Does a Kitchen Remodel Cost in Mississippi? (2026 Guide)",
  description:
    "Real kitchen remodel costs for Mississippi homeowners. From a $10K refresh to a $50K gut renovation — what to expect, what drives the price, and how to get fair bids.",
  openGraph: {
    title: "How Much Does a Kitchen Remodel Cost in Mississippi? | FairTradeWorker",
    description: "Real kitchen remodel costs for Mississippi homeowners. What to expect at every budget level.",
    type: "article",
    publishedTime: "2026-04-01T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/how-much-kitchen-remodel-mississippi" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How Much Does a Kitchen Remodel Cost in Mississippi?",
  description: "Real kitchen remodel costs for Mississippi homeowners at every budget level.",
  datePublished: "2026-04-01",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/how-much-kitchen-remodel-mississippi",
};

export default function KitchenRemodelCostPage() {
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
            <span className="text-sm font-semibold text-brand-600">Cost Guide</span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              How Much Does a Kitchen Remodel Cost in Mississippi?
            </h1>
            <p className="text-gray-700 mt-2">April 1, 2026</p>
          </header>

          <div className="mt-10 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Kitchen remodels are the most common home project on our
              platform, and the most common question is always the same: how
              much is this going to cost?
            </p>
            <p className="text-gray-700 leading-relaxed">
              It depends on what you're doing. A cosmetic refresh and a gut
              renovation are different animals. Here's what Mississippi
              homeowners are actually paying in 2026 — not national averages
              from a website that's never been to Tupelo.
            </p>

            {/* Quick summary table */}
            <div className="my-10 overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Remodel Level</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">What's Included</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Cost Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Cosmetic refresh</td>
                    <td className="p-3 text-gray-600">Paint, hardware, countertops, backsplash</td>
                    <td className="p-3 font-semibold text-gray-900">$8,000 - $18,000</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Mid-range remodel</td>
                    <td className="p-3 text-gray-600">New cabinets, countertops, flooring, appliances (same layout)</td>
                    <td className="p-3 font-semibold text-gray-900">$20,000 - $35,000</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-900">Full gut renovation</td>
                    <td className="p-3 text-gray-600">Layout changes, plumbing, electrical, custom everything</td>
                    <td className="p-3 font-semibold text-gray-900">$35,000 - $55,000+</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FairPrice CTA */}
            <div className="bg-white border border-border rounded-sm p-6 my-10">
              <p className="font-bold text-gray-900">Want a number specific to your kitchen?</p>
              <p className="mt-1 text-sm text-gray-600">
                Our AI-powered FairPrice Estimator gives you a detailed cost
                breakdown in about 30 seconds. Free, no signup.
              </p>
              <div className="mt-4">
                <Button size="sm" asChild>
                  <Link href="/fairprice" className="inline-flex items-center gap-2">
                    Try FairPrice Estimator
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Cabinets: 30-40% of your budget</h2>
            <p className="text-gray-700 leading-relaxed">
              Cabinets are where the money goes. They set the tone for the
              whole kitchen, and the price range is enormous depending on what
              you choose.
            </p>
            <div className="overflow-x-auto my-6">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Type</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Cost (typical kitchen)</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Best for</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Stock (home center)</td>
                    <td className="p-3 text-gray-900">$3,000 - $8,000</td>
                    <td className="p-3 text-gray-600">Budget remodels, rentals</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Semi-custom</td>
                    <td className="p-3 text-gray-900">$8,000 - $15,000</td>
                    <td className="p-3 text-gray-600">Most homeowners — good quality, some customization</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Full custom</td>
                    <td className="p-3 text-gray-900">$15,000 - $30,000+</td>
                    <td className="p-3 text-gray-600">High-end, unusual layouts, specific wood species</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-900">Cabinet refacing</td>
                    <td className="p-3 text-gray-900">$4,000 - $9,000</td>
                    <td className="p-3 text-gray-600">Solid boxes but ugly doors — saves 40-50% vs new</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 leading-relaxed">
              One thing Mississippi homeowners don't always know: cabinet
              refacing is a real option if your existing boxes are solid.
              You're replacing the doors and drawer fronts, adding new
              hardware, and it looks brand new. Costs about half of what new
              cabinets would run.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Countertops: the visual centerpiece</h2>
            <div className="overflow-x-auto my-6">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Material</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Cost per sqft (installed)</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Durability</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Laminate</td>
                    <td className="p-3 text-gray-900">$10 - $30</td>
                    <td className="p-3 text-gray-600">Good — scratches over time</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Butcher block</td>
                    <td className="p-3 text-gray-900">$40 - $70</td>
                    <td className="p-3 text-gray-600">Good with maintenance — needs oiling</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Granite</td>
                    <td className="p-3 text-gray-900">$50 - $100</td>
                    <td className="p-3 text-gray-600">Excellent — needs sealing annually</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-900">Quartz</td>
                    <td className="p-3 text-gray-900">$60 - $120</td>
                    <td className="p-3 text-gray-600">Excellent — zero maintenance</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Most Mississippi contractors will tell you quartz has taken over
              from granite in the last few years. It's non-porous (no sealing),
              consistent in color, and the price gap has narrowed. If you're
              spending $25K+ on a kitchen, quartz is usually worth the upgrade
              over granite.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Flooring, appliances, and the rest</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Flooring:</strong> Luxury vinyl plank (LVP) is the
              Mississippi kitchen standard now — waterproof, durable, and
              $3-$7/sqft installed. Tile runs $5-$12/sqft. Hardwood is
              beautiful but risky in a kitchen with Mississippi humidity.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Appliances:</strong> Budget $2,000-$4,000 for a
              standard package (fridge, range, dishwasher, microwave). Step
              up to a mid-range package at $5,000-$8,000. High-end
              (Sub-Zero, Wolf, Viking) starts at $10,000 and goes up from
              there.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Backsplash:</strong> Subway tile is $800-$1,500
              installed. Mosaic or patterned tile runs $1,500-$3,000.
              Full-slab quartz backsplash (matching your counters) is
              $2,000-$4,000. Some homeowners skip it entirely on a cosmetic
              refresh and just paint the wall — $0.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Plumbing:</strong> If you're keeping the sink where it
              is, plumbing costs are minimal ($200-$500 for a new faucet and
              disposal install). Moving a sink or adding one to an island
              means re-routing drain and supply lines — $1,500-$3,000 in
              plumbing alone.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Electrical:</strong> Budget $500-$1,500 for updating
              outlets, adding under-cabinet lighting, and bringing circuits up
              to code. If you're adding an island with outlets or moving
              appliance circuits, plan for $1,500-$3,000.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">The Mississippi advantage: labor costs</h2>
            <p className="text-gray-700 leading-relaxed">
              Labor in Mississippi runs 15-25% lower than the national
              average. A general contractor in Oxford or Tupelo charges
              $30-$60/hour compared to $50-$85 in Nashville, Atlanta, or
              Dallas. That adds up fast on a project that takes 3-6 weeks.
            </p>
            <p className="text-gray-700 leading-relaxed">
              On a $25,000 mid-range remodel, you might save $3,000-$5,000
              compared to doing the same project in a major metro. The
              materials cost the same everywhere — it's the labor where
              Mississippi homeowners come out ahead.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Timeline: how long does it take?</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Cosmetic refresh:</strong> 1-2 weeks. You can often
              keep using the kitchen with minor disruption.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Mid-range remodel:</strong> 3-5 weeks. Your kitchen is
              out of commission. Plan to eat out or set up a temporary kitchen
              in another room.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Full gut renovation:</strong> 6-10 weeks. Permit
              delays, inspection scheduling, and material lead times all add
              up. Custom cabinets alone can take 4-8 weeks to arrive after
              ordering.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Fall is the best time to start a kitchen remodel in Mississippi.
              Contractors have more availability after the busy summer season,
              and you'll be done before the holidays.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">How to get fair pricing</h2>
            <p className="text-gray-700 leading-relaxed">
              Get at least three bids. Not three phone calls — three detailed,
              written bids that break down materials and labor separately.
              That's exactly what FairTradeWorker does.{" "}
              <Link href="/new-way" className="text-brand-600 font-medium hover:underline">Post your kitchen remodel project</Link>,
              get bids from verified contractors in your area, and compare
              them side by side.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Watch out for bids that are significantly lower than the others.
              A bid that's 30% below everyone else usually means corners will
              be cut, materials will be substituted, or the project will hit
              you with change orders halfway through.
            </p>
            <p className="text-gray-700 leading-relaxed">
              On FairTradeWorker, every contractor is license-verified and
              reviewed by past homeowners. And your payment sits in escrow
              until the work is done — so you have leverage from day one.
            </p>

            {/* Related links */}
            <div className="mt-10 pt-6 border-t border-border">
              <p className="text-sm font-bold text-gray-900 mb-3">Related</p>
              <div className="space-y-2">
                <Link href="/blog/bathroom-remodel-cost-guide" className="block text-sm text-brand-600 hover:underline">
                  Bathroom Remodel Cost in Mississippi: What to Budget
                </Link>
                <Link href="/blog/hiring-contractor-checklist" className="block text-sm text-brand-600 hover:underline">
                  How to Hire a Contractor in Mississippi (Without Getting Burned)
                </Link>
                <Link href="/services/remodeling/kitchen-remodel/oxford-ms" className="block text-sm text-brand-600 hover:underline">
                  Kitchen Remodel Contractors in Oxford, MS
                </Link>
                <Link href="/services/remodeling/kitchen-remodel/tupelo-ms" className="block text-sm text-brand-600 hover:underline">
                  Kitchen Remodel Contractors in Tupelo, MS
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-gray-700 mb-4">Ready to get real bids on your kitchen remodel?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/signup?role=homeowner">Post Your Project Free</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/fairprice" className="inline-flex items-center gap-2">
                  Get Instant Estimate
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
