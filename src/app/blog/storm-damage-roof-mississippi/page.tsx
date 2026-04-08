import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "Storm Damage in Mississippi: What to Do About Your Roof",
  description:
    "Mississippi storm season means roof damage. Learn what to do after a storm, how to file insurance claims, spot storm chaser scams, and get legitimate repair bids.",
  openGraph: {
    title: "Storm Damage in Mississippi: What to Do About Your Roof | FairTradeWorker",
    description: "What to do after storm damage hits your Mississippi roof. Insurance tips, scam warnings, and repair costs.",
    type: "article",
    publishedTime: "2026-03-12T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/storm-damage-roof-mississippi" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Storm Damage in Mississippi: What to Do About Your Roof",
  description: "What to do after storm damage hits your Mississippi roof. Insurance, scams, and repair costs.",
  datePublished: "2026-03-12",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/storm-damage-roof-mississippi",
};

export default function StormDamageRoofMississippiPage() {
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
              Storm Damage in Mississippi: What to Do About Your Roof
            </h1>
            <p className="text-gray-700 mt-2">March 12, 2026</p>
          </header>

          <div className="mt-10 prose prose-gray max-w-none space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Storm season in Mississippi runs roughly March through May, with a secondary window in November. Between the hail, straight-line winds, and occasional tornado, your roof takes a beating. When a bad storm comes through, the clock starts ticking — on both your roof and the line of people trying to separate you from your insurance check.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Types of storm damage</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Hail damage</strong> is the most common in Mississippi. On asphalt shingles, hail creates circular dents that crack the granule surface. You usually can't see it from the ground — it takes a roof inspection to confirm. Golf ball-sized hail (common in north Mississippi storms) can crack shingles outright.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Wind damage</strong> lifts shingle tabs, exposes the nail strip underneath, and sometimes peels entire sections off. Look for shingles in your yard or missing sections visible from the street. <strong>Fallen trees and limbs</strong> cause the most dramatic damage — a large limb can puncture through the decking into your attic.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">What to do immediately after a storm</h2>
            <p className="text-gray-700 leading-relaxed">
              First, document everything. Walk the perimeter of your house and take photos of any visible damage — downed limbs, missing shingles, dented gutters, damaged siding. Don't get on the roof yourself. If there's an active leak, contain the water inside (buckets, tarps on the attic side) and call for an emergency tarp service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Second, call your insurance company and file a claim. Do this within 24-48 hours. Your policy has a deadline for reporting storm damage, and waiting too long can jeopardize your claim. Take photos before and during any temporary repairs.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Filing insurance claims</h2>
            <p className="text-gray-700 leading-relaxed">
              Your insurance adjuster will inspect the roof and provide a damage estimate. Get your own independent inspection from a licensed roofer before the adjuster arrives — this gives you a baseline to compare. If the adjuster's estimate seems low, you can negotiate with your own documentation. Most Mississippi homeowner policies cover storm damage minus your deductible (typically $1,000-$2,500 for wind/hail).
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">How to spot a storm chaser scam</h2>
            <p className="text-gray-700 leading-relaxed">
              After every major storm in Mississippi, out-of-state roofing crews flood the area going door to door. Some are legitimate. Many are not. Here's what to watch for:
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>They knock on your door unsolicited</strong> offering a "free roof inspection." <strong>They pressure you to sign a contract on the spot</strong> before your insurance adjuster has even visited. <strong>They offer to "cover your deductible"</strong> — this is insurance fraud in Mississippi. <strong>They don't have a Mississippi contractor's license</strong> or a local business address. <strong>They ask for a large deposit upfront</strong> before any work begins.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The safest move is to work with a roofer who was in your area before the storm and will still be there next year.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Average repair costs</h2>
            <p className="text-gray-700 leading-relaxed">
              Minor repairs (replacing a few shingles, sealing a flashing leak): <strong>$200-$800</strong>. Partial reroof (one slope or section): <strong>$2,000-$5,000</strong>. Full reroof for a typical Mississippi home (1,500-2,500 sq ft): <strong>$6,000-$14,000</strong> depending on materials. Emergency tarp service: <strong>$200-$500</strong>.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Get legitimate bids from verified roofers</h2>
            <p className="text-gray-700 leading-relaxed">
              Post your roof repair on FairTradeWorker and get bids from licensed, insured roofers who are actually based in Mississippi. Every contractor on the platform has verified credentials, so you're not gambling on a storm chaser with a magnetic truck sign. Check the <Link href="/fairprice" className="text-brand-600 font-medium hover:underline">FairPrice Estimator</Link> to see what your repair should cost before the bids come in.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-gray-700 mb-4">Need a roof repair bid from a verified contractor?</p>
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
