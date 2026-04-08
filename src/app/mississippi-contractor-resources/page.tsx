import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "Mississippi Contractor Resources — Licensing, Insurance, and Business Guide",
  description:
    "Free resource guide for Mississippi contractors. State licensing requirements, insurance minimums, permit contacts for every county, and business tools. Updated for 2026.",
  openGraph: {
    title: "Mississippi Contractor Resources | FairTradeWorker",
    description: "Free resource guide for Mississippi contractors. Licensing, insurance, permits, and business tools.",
    type: "website",
  },
  alternates: { canonical: "/mississippi-contractor-resources" },
};

export default function MississippiContractorResourcesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-[#FAFAFA] py-20 lg:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Mississippi Contractor Resources
            </h1>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Everything a Mississippi contractor needs in one place —
              licensing, insurance requirements, permit contacts, and business
              tools. Free, no signup required. Bookmark this page.
            </p>
          </div>
        </section>

        {/* Licensing */}
        <section className="bg-white py-16 lg:py-20 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Mississippi Contractor Licensing</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Mississippi requires a state license from the Mississippi State
              Board of Contractors for residential and commercial projects
              over $50,000. Below that threshold, licensing requirements vary
              by trade and municipality.
            </p>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">License Type</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Required For</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Issuing Body</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">General Contractor</td>
                    <td className="p-3 text-gray-600">Projects over $50,000 (residential or commercial)</td>
                    <td className="p-3 text-gray-600">MS State Board of Contractors</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Residential Builder</td>
                    <td className="p-3 text-gray-600">New home construction over $50,000</td>
                    <td className="p-3 text-gray-600">MS State Board of Contractors</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Electrician</td>
                    <td className="p-3 text-gray-600">All electrical work</td>
                    <td className="p-3 text-gray-600">MS State Board of Contractors (Electrical Division)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Plumber</td>
                    <td className="p-3 text-gray-600">All plumbing work</td>
                    <td className="p-3 text-gray-600">MS State Board of Health (Plumbing Division)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">HVAC</td>
                    <td className="p-3 text-gray-600">HVAC installation and repair</td>
                    <td className="p-3 text-gray-600">MS State Board of Contractors (HVAC Division)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Roofing</td>
                    <td className="p-3 text-gray-600">Roofing projects over $50,000</td>
                    <td className="p-3 text-gray-600">MS State Board of Contractors</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-900">Pest Control</td>
                    <td className="p-3 text-gray-600">All pest control and termite treatment</td>
                    <td className="p-3 text-gray-600">MS Department of Agriculture (Bureau of Plant Industry)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-gray-50 border border-border rounded-sm">
              <p className="text-sm text-gray-700">
                <strong>MS State Board of Contractors:</strong> (601) 354-6161
                — 2679 Crane Ridge Dr, Suite C, Jackson, MS 39216.
                License verification available online.
              </p>
            </div>
          </div>
        </section>

        {/* Insurance Requirements */}
        <section className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Insurance Requirements</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Mississippi doesn&apos;t mandate specific insurance amounts for all
              contractors, but these are the industry-standard minimums that
              homeowners and GCs expect.
            </p>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Insurance Type</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Minimum Coverage</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Typical Annual Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">General Liability</td>
                    <td className="p-3 text-gray-600">$1,000,000 per occurrence / $2,000,000 aggregate</td>
                    <td className="p-3 text-gray-600">$500 - $2,000/year</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Workers' Compensation</td>
                    <td className="p-3 text-gray-600">Required if 5+ employees in MS</td>
                    <td className="p-3 text-gray-600">$1,500 - $5,000/year (varies by trade)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-gray-900">Commercial Auto</td>
                    <td className="p-3 text-gray-600">$500,000 combined single limit</td>
                    <td className="p-3 text-gray-600">$1,200 - $3,000/year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-900">Inland Marine (Tools)</td>
                    <td className="p-3 text-gray-600">Value of tools and equipment</td>
                    <td className="p-3 text-gray-600">$200 - $800/year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Building Permit Contacts by Region */}
        <section className="bg-white py-16 lg:py-20 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Building Permit Contacts by City</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Most Mississippi cities require building permits for construction,
              renovation, and mechanical work. Here are the permit offices for
              major markets.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">North Mississippi</h3>
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-gray-50 border border-border rounded-sm">
                    <p className="font-medium text-gray-900">Oxford / Lafayette County</p>
                    <p className="text-sm text-gray-600">City of Oxford Building Department — City Hall, 107 Courthouse Square, Oxford, MS 38655 — (662) 232-2300</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-border rounded-sm">
                    <p className="font-medium text-gray-900">Tupelo / Lee County</p>
                    <p className="text-sm text-gray-600">City of Tupelo Building Inspections — 71 E. Troy St, Tupelo, MS 38804 — (662) 841-6520</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-border rounded-sm">
                    <p className="font-medium text-gray-900">Southaven / DeSoto County</p>
                    <p className="text-sm text-gray-600">City of Southaven Building Department — 8710 Northwest Dr, Southaven, MS 38671 — (662) 393-2526</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-border rounded-sm">
                    <p className="font-medium text-gray-900">Starkville / Oktibbeha County</p>
                    <p className="text-sm text-gray-600">City of Starkville Building Inspection — 110 W. Main St, Starkville, MS 39759 — (662) 323-2525</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Jackson Metro</h3>
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-gray-50 border border-border rounded-sm">
                    <p className="font-medium text-gray-900">Jackson / Hinds County</p>
                    <p className="text-sm text-gray-600">City of Jackson Building Permits — 218 S. President St, Jackson, MS 39201 — (601) 960-1039</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-border rounded-sm">
                    <p className="font-medium text-gray-900">Madison / Madison County</p>
                    <p className="text-sm text-gray-600">City of Madison Building Department — 1004 Madison Ave, Madison, MS 39110 — (601) 856-7116</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-border rounded-sm">
                    <p className="font-medium text-gray-900">Brandon / Rankin County</p>
                    <p className="text-sm text-gray-600">City of Brandon Building Department — 1000 Municipal Dr, Brandon, MS 39042 — (601) 825-2021</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Gulf Coast</h3>
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-gray-50 border border-border rounded-sm">
                    <p className="font-medium text-gray-900">Gulfport / Harrison County</p>
                    <p className="text-sm text-gray-600">City of Gulfport Building Department — 1410 24th Ave, Gulfport, MS 39501 — (228) 868-5703</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-border rounded-sm">
                    <p className="font-medium text-gray-900">Biloxi / Harrison County</p>
                    <p className="text-sm text-gray-600">City of Biloxi Building Permits — 140 Lameuse St, Biloxi, MS 39530 — (228) 435-6280</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Pine Belt</h3>
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-gray-50 border border-border rounded-sm">
                    <p className="font-medium text-gray-900">Hattiesburg / Forrest County</p>
                    <p className="text-sm text-gray-600">City of Hattiesburg Inspection Services — 200 Forrest St, Hattiesburg, MS 39401 — (601) 545-4590</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mississippi-specific tips */}
        <section className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Mississippi-Specific Business Tips</h2>

            <div className="mt-8 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Termite letters</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Mississippi law requires a Wood Destroying Insect Report
                  (termite letter) for most real estate transactions. If you
                  do renovation work, your clients will ask about termite
                  damage. Know who to refer to and what to look for.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Hurricane and storm prep</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Storm damage repair is a major revenue source for Mississippi
                  contractors, especially on the Gulf Coast. Get your emergency
                  response process documented before storm season (March-May
                  for tornadoes, June-November for hurricanes). Homeowners
                  need fast, trustworthy responses after a storm.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Clay soil and foundations</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Mississippi's expansive clay soil causes more foundation
                  issues than most states. If you do foundation work, concrete,
                  or structural repairs, understanding local soil conditions is
                  a competitive advantage. The Yazoo Clay formation in central
                  Mississippi is especially problematic.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Humidity and moisture</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Mississippi's humidity affects everything — crawl space
                  moisture, mold growth, paint adhesion, wood expansion, and
                  HVAC sizing. Contractors who understand moisture management
                  in this climate win more work and have fewer callbacks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="bg-white py-16 lg:py-20 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Free Tools for Mississippi Contractors</h2>

            <div className="mt-8 space-y-4">
              <Link href="/fairprice" className="block p-5 border border-border rounded-sm hover:border-brand-600/30 transition-colors duration-150">
                <h3 className="font-bold text-gray-900">FairPrice Estimator</h3>
                <p className="mt-1 text-sm text-gray-600">AI-powered cost estimates for any construction project. Free, instant, no signup.</p>
              </Link>

              <Link href="/services" className="block p-5 border border-border rounded-sm hover:border-brand-600/30 transition-colors duration-150">
                <h3 className="font-bold text-gray-900">Mississippi Service Directory</h3>
                <p className="mt-1 text-sm text-gray-600">Browse contractors by trade and city across all 63 Mississippi cities we serve.</p>
              </Link>

              <Link href="/blog/hiring-contractor-checklist" className="block p-5 border border-border rounded-sm hover:border-brand-600/30 transition-colors duration-150">
                <h3 className="font-bold text-gray-900">Contractor Hiring Checklist</h3>
                <p className="mt-1 text-sm text-gray-600">What homeowners look for when hiring. Know what you&apos;re being evaluated on.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ backgroundColor: "#0F1419" }} className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white">
              Join FairTradeWorker
            </h2>
            <p className="mt-3 text-gray-300 max-w-lg mx-auto">
              Flat monthly rate. No lead fees. Escrow on every job. Join
              Mississippi's growing network of verified contractors.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="xl" asChild>
                <Link href="/signup?role=contractor">Join as Contractor</Link>
              </Button>
              <Button size="xl" variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500" asChild>
                <Link href="/signup?role=homeowner">Post a Job Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
