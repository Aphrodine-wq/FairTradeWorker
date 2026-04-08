import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "HVAC Installation Cost in Mississippi: What to Expect (2026)",
  description:
    "Real HVAC installation costs for Mississippi homeowners. Central AC $3.5K-$7.5K, heat pumps $4K-$8K, full systems $5K-$12.5K. SEER ratings, sizing, and how to get fair bids.",
  openGraph: {
    title: "HVAC Installation Cost in Mississippi: What to Expect (2026) | FairTradeWorker",
    description: "Real HVAC installation costs for Mississippi homeowners. What to expect at every system level.",
    type: "article",
    publishedTime: "2026-04-04T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/hvac-installation-cost-mississippi" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "HVAC Installation Cost in Mississippi: What to Expect (2026)",
  description: "Real HVAC installation costs for Mississippi homeowners at every system level.",
  datePublished: "2026-04-04",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/hvac-installation-cost-mississippi",
};

export default function HvacInstallationCostPage() {
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
              HVAC Installation Cost in Mississippi: What to Expect (2026)
            </h1>
            <p className="text-gray-700 mt-2">April 4, 2026</p>
          </header>

          <div className="mt-10 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              In Mississippi, your HVAC system isn't a luxury — it's survival
              gear. We run air conditioning seven months a year, and when it
              fails in July, you have about 24 hours before your house becomes
              uninhabitable. Knowing what a new system costs before you're in
              crisis mode is the best way to make a smart decision instead of a
              desperate one.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Here's what Mississippi homeowners are actually paying for HVAC
              installations in 2026 — broken down by system type, efficiency
              level, and what drives the price in our climate.
            </p>

            {/* Cost summary table */}
            <div className="my-10 overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">System Type</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Cost Range (installed)</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Typical Home Size</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Central AC (condenser + coil)</td>
                    <td className="p-3 font-semibold text-gray-900">$3,500 - $7,500</td>
                    <td className="p-3 text-gray-600">1,200-2,500 sqft</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Gas furnace</td>
                    <td className="p-3 font-semibold text-gray-900">$2,500 - $6,500</td>
                    <td className="p-3 text-gray-600">1,200-2,500 sqft</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Full system (AC + furnace)</td>
                    <td className="p-3 font-semibold text-gray-900">$5,000 - $12,500</td>
                    <td className="p-3 text-gray-600">1,200-2,500 sqft</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Heat pump (heating + cooling)</td>
                    <td className="p-3 font-semibold text-gray-900">$4,000 - $8,000</td>
                    <td className="p-3 text-gray-600">1,200-2,500 sqft</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-900">Ductwork (new or replacement)</td>
                    <td className="p-3 font-semibold text-gray-900">$2,000 - $5,000</td>
                    <td className="p-3 text-gray-600">Varies — depends on accessibility</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">System comparison: what works best in Mississippi</h2>
            <p className="text-gray-700 leading-relaxed">
              Mississippi's climate changes the math on HVAC compared to
              northern states. Our mild winters and brutal summers mean cooling
              dominates the equation. Here's how the main options stack up for
              our region:
            </p>
            <div className="overflow-x-auto my-6">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">System</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Pros for MS</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Cons for MS</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Central AC + gas furnace</td>
                    <td className="p-3 text-gray-600">Proven, reliable cooling; fast heat on cold nights</td>
                    <td className="p-3 text-gray-600">Higher energy bills; requires gas line</td>
                    <td className="p-3 text-gray-600">Homes with existing gas service</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Heat pump</td>
                    <td className="p-3 text-gray-600">Heats and cools; 2-3x more efficient; lower bills</td>
                    <td className="p-3 text-gray-600">Slightly less effective below 30F (rare in MS)</td>
                    <td className="p-3 text-gray-600">Most Mississippi homes — the smart default</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-900">Ductless mini-split</td>
                    <td className="p-3 text-gray-600">No ductwork needed; zone control; very efficient</td>
                    <td className="p-3 text-gray-600">Wall-mounted units; higher cost per zone</td>
                    <td className="p-3 text-gray-600">Additions, older homes without ducts, garages</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Why heat pumps are winning in the South</h2>
            <p className="text-gray-700 leading-relaxed">
              Heat pumps have gone from niche to mainstream in Mississippi over
              the last five years. The reason is simple: they do both heating
              and cooling with one unit, and they're dramatically more efficient
              than a traditional AC + furnace combo. A heat pump moves heat
              instead of generating it, which means for every dollar of
              electricity, you get $2-$3 worth of heating or cooling.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The old knock on heat pumps was that they couldn't handle cold
              weather. That's true in Minnesota. In Mississippi, where temps
              below 30F are rare and usually last a few hours, a modern heat
              pump handles our winters with no issue. Some homeowners keep a
              small electric backup strip for those handful of nights — adds
              $300-$500 to the install and you'll use it maybe ten days a year.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The math on energy savings is real. A heat pump can cut your
              combined heating and cooling bill by 30-50% compared to a
              traditional AC + gas furnace setup. On Mississippi's power rates,
              that's $400-$800 per year in savings. The system pays back its
              premium in 3-5 years.
            </p>

            {/* FairPrice CTA */}
            <div className="bg-white border border-border rounded-sm p-6 my-10">
              <p className="font-bold text-gray-900">What should your HVAC replacement cost?</p>
              <p className="mt-1 text-sm text-gray-600">
                Our AI-powered FairPrice Estimator accounts for your home size,
                system type, and Mississippi labor rates. Get a detailed cost
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

            <h2 className="text-2xl font-bold text-gray-900 mt-10">SEER ratings: what they mean for your energy bill</h2>
            <p className="text-gray-700 leading-relaxed">
              SEER (Seasonal Energy Efficiency Ratio) measures how efficiently
              your system cools. Higher SEER = lower electric bills. As of
              January 2023, the federal minimum for Mississippi (Southeast
              region) is SEER2 15.0 for split systems. Here's what the
              different efficiency tiers cost and save:
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>SEER2 15 (minimum):</strong> This is what you get at the
              lowest price point. It's legal, it works, and it's still a
              significant upgrade if you're replacing a 10-year-old system that
              was probably SEER 13 or lower.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>SEER2 17-18 (mid-range):</strong> Adds $500-$1,500 to
              equipment cost. Saves roughly $150-$250/year on cooling bills
              compared to SEER2 15. Pays for itself in 3-6 years. This is the
              sweet spot for most Mississippi homeowners.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>SEER2 20+ (high-efficiency):</strong> Adds $2,000-$4,000
              to equipment cost. Variable-speed compressors that ramp up and
              down instead of cycling on/off. Quieter, more even temperatures,
              better humidity control. The energy savings are real but the
              payback period is longer — 7-10 years. Worth it if comfort is
              the priority.
            </p>
            <p className="text-gray-700 leading-relaxed">
              In Mississippi, the humidity control from higher-SEER variable
              speed systems is arguably more valuable than the energy savings.
              A system that runs at 40% capacity most of the day removes more
              moisture from the air than one that blasts at 100% and shuts off.
              If your house feels clammy even when the AC is running, a
              variable-speed system solves that problem.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Mississippi-specific factors that matter</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Humidity changes everything.</strong> A properly sized
              system in Mississippi doesn't just cool your air — it has to
              dehumidify it. An oversized system is actually worse than an
              undersized one because it cools the air fast, shuts off, and
              never runs long enough to pull moisture out. The result: a cold,
              clammy house that still feels uncomfortable. This is the single
              most common HVAC mistake in Mississippi.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Manual J load calculation is non-negotiable.</strong> Any
              HVAC contractor who sizes your system by "rule of thumb" (one ton
              per 500 sqft) instead of running a Manual J calculation doesn't
              understand Mississippi's climate. A Manual J accounts for your
              home's insulation, window orientation, duct losses, and humidity
              load. It takes 30-60 minutes and ensures you get the right size
              system. If a contractor won't do one, find a different contractor.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Ductwork condition matters more than the unit.</strong> A
              brand new high-efficiency system connected to leaky, uninsulated
              ductwork in a Mississippi attic loses 25-40% of its capacity
              before the air reaches your rooms. If your ducts are in a hot
              attic (most Mississippi homes), they need to be sealed and
              insulated. Budget $1,000-$2,500 for duct sealing and insulation
              — it's the highest-ROI upgrade in most HVAC projects.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Attic insulation is connected.</strong> While the HVAC
              crew is up there, check your attic insulation. Mississippi code
              calls for R-38 (about 12 inches of blown-in). Many older homes
              have R-19 or less. Adding insulation ($1,500-$2,500 for a typical
              attic) reduces your HVAC load by 15-25% and makes the new system
              work less hard. It's cheaper to insulate than to buy a bigger unit.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">When to repair vs. replace</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>The 10-year rule:</strong> If your system is under 10
              years old and the repair is under $1,500, repair it. If it's
              over 10 years and facing a major repair (compressor, coil, or
              refrigerant leak), replacement usually makes more sense. A new
              system gives you a 10-year warranty and 30-50% better efficiency.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>The R-22 factor:</strong> If your system still runs on
              R-22 refrigerant (Freon), it's time to replace. R-22 was phased
              out of production in 2020, and the remaining supply costs $100-$200
              per pound — a full charge on a 3-ton system is 6-12 pounds. One
              leak repair and recharge costs almost as much as a new system.
              Every R-22 system in Mississippi should be on a replacement plan.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>The "it's running but" test:</strong> If your system
              runs but your electric bill keeps climbing, rooms are unevenly
              heated or cooled, or it can't keep up on the hottest days, it's
              losing capacity. Compressors degrade gradually — the system
              doesn't just stop one day, it slowly gets worse. A 15-year-old
              system running at 70% capacity is costing you more in electricity
              than a new system payment.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Timeline for HVAC installation</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Straight replacement (same type, same location):</strong>{" "}
              1 day. The old equipment comes out, the new equipment goes in,
              the refrigerant lines get connected, the system gets charged and
              tested. Most replacements are done by end of day.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>System change (adding ductwork or switching to heat
              pump):</strong> 2-3 days. Running new ductwork, adding a
              disconnect, or modifying the air handler location takes
              additional time.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Full ductwork replacement:</strong> 3-5 days. Pulling
              old ductwork from a Mississippi attic in summer is brutal work.
              Most crews start at dawn and stop by early afternoon when attic
              temps hit 140F+.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Schedule your replacement for spring or fall if possible. Summer
              emergency replacements cost more (overtime labor, rush delivery
              fees) and you might wait 1-2 weeks for availability. A planned
              replacement in March or October gets you a better price and a
              faster install.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">How to get fair pricing</h2>
            <p className="text-gray-700 leading-relaxed">
              Get at least three bids. Every bid should include: equipment
              brand and model number, SEER2 rating, tonnage, whether a Manual
              J was performed, what's included for ductwork, warranty terms
              (manufacturer equipment warranty vs. contractor labor warranty),
              and the total installed price.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Beware of "whole system" quotes that don't specify the equipment.
              "3-ton 16 SEER system — $6,500 installed" doesn't tell you the
              brand, model, or what's included. A Carrier 16 SEER and an
              off-brand 16 SEER are not the same product. Get specifics.
            </p>
            <p className="text-gray-700 leading-relaxed">
              On FairTradeWorker, post your HVAC project and get itemized bids
              from licensed, local HVAC contractors. Compare bids side by side,
              check reviews from past customers, and know that your payment is
              protected in escrow until the system is installed and running.
            </p>

            {/* Related links */}
            <div className="mt-10 pt-6 border-t border-border">
              <p className="text-sm font-bold text-gray-900 mb-3">Related</p>
              <div className="space-y-2">
                <Link href="/blog/hvac-maintenance-mississippi-summer" className="block text-sm text-brand-600 hover:underline">
                  HVAC Maintenance for Mississippi Summers: Keep Your System Running
                </Link>
                <Link href="/blog/hiring-contractor-checklist" className="block text-sm text-brand-600 hover:underline">
                  How to Hire a Contractor in Mississippi (Without Getting Burned)
                </Link>
                <Link href="/services/hvac/oxford-ms" className="block text-sm text-brand-600 hover:underline">
                  HVAC Contractors in Oxford, MS
                </Link>
                <Link href="/services/hvac/tupelo-ms" className="block text-sm text-brand-600 hover:underline">
                  HVAC Contractors in Tupelo, MS
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-gray-700 mb-4">Ready to get real bids on your HVAC installation?</p>
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
