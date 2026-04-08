import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "How to Hire a Contractor in Mississippi (Without Getting Burned)",
  description:
    "A step-by-step checklist for hiring a contractor in Mississippi. Verify licenses, check insurance, get written bids, and avoid common scams.",
  openGraph: {
    title: "How to Hire a Contractor in Mississippi (Without Getting Burned) | FairTradeWorker",
    description: "Step-by-step checklist for hiring a contractor in Mississippi without getting burned.",
    type: "article",
    publishedTime: "2026-03-20T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/hiring-contractor-checklist" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Hire a Contractor in Mississippi (Without Getting Burned)",
  description: "Step-by-step checklist for hiring a contractor in Mississippi.",
  datePublished: "2026-03-20",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/hiring-contractor-checklist",
};

export default function HiringContractorChecklistPage() {
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
            <span className="text-sm font-semibold text-brand-600">Guides</span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              How to Hire a Contractor in Mississippi (Without Getting Burned)
            </h1>
            <p className="text-gray-700 mt-2">March 20, 2026</p>
          </header>

          <div className="mt-10 prose prose-gray max-w-none space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Hiring the wrong contractor is one of the most expensive mistakes a homeowner can make. In Mississippi, where residential construction requires state licensing for jobs over $50,000 and many cities have their own permit requirements, there's a lot that can go wrong if you skip your homework.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Here's a checklist that will keep you out of trouble — whether you're renovating a bathroom or building an addition.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Check their license</h2>
            <p className="text-gray-700 leading-relaxed">
              Mississippi requires contractors to be licensed through the Mississippi State Board of Contractors for any residential project over $50,000. You can verify any contractor's license status on the Board's website. Look for the license classification — residential builders have different classifications than commercial or specialty contractors. If someone tells you they don't need a license for a $60,000 project, walk away.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Verify insurance</h2>
            <p className="text-gray-700 leading-relaxed">
              Don't just ask if they have insurance — ask for a certificate of insurance (COI). A legitimate contractor will have it and won't be offended. You need to see general liability insurance (minimum $300,000) and workers' compensation. If a worker gets hurt on your property and the contractor doesn't carry workers' comp, you could be liable. In Mississippi, contractors with one or more employees are required to carry it.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Get at least three written bids</h2>
            <p className="text-gray-700 leading-relaxed">
              Not verbal estimates — written bids that itemize materials and labor separately. This is the only way to do an apples-to-apples comparison. If one bid is 40% lower than the other two, that's not a deal — that's a red flag. They're either cutting corners on materials, underestimating the scope, or planning to hit you with change orders later.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Never pay more than 30% upfront</h2>
            <p className="text-gray-700 leading-relaxed">
              A reasonable deposit is 10-30% to cover initial material purchases. Anything more than that should make you nervous. Structure payments around milestones — 30% at start, 30% at rough-in, 30% at substantial completion, 10% at final walkthrough. This keeps the contractor motivated to finish and gives you leverage if something goes wrong.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Even better, use an escrow system. The money is held by a third party and released when each milestone is verified. That's exactly how payments work on <Link href="/signup?role=homeowner" className="text-brand-600 font-medium hover:underline">FairTradeWorker</Link>.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Red flags to watch for</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>No written contract.</strong> If they want to work off a handshake, they're not professional enough for your project. <strong>Pressure to decide immediately.</strong> Legitimate contractors know you're getting multiple bids. <strong>No physical business address.</strong> A PO Box only means they're harder to find if something goes wrong. <strong>Demands cash only.</strong> This usually means they're avoiding taxes and likely don't carry insurance either.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">How FTW handles all of this</h2>
            <p className="text-gray-700 leading-relaxed">
              FairTradeWorker was built specifically to solve these problems. Every contractor on the platform has their license verified with the state board, insurance certificates on file, and real project reviews from other homeowners. When you post a project, you get itemized bids from verified contractors — no cold calls, no door knockers, no guessing. Use the <Link href="/fairprice" className="text-brand-600 font-medium hover:underline">FairPrice Estimator</Link> to know what your project should cost before bids even come in.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-gray-700 mb-4">Ready to find a verified contractor?</p>
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
