import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";

export const metadata: Metadata = {
  title: "Voice AI: How Hunter Builds Estimates in 3 Minutes | FairTradeWorker",
  description:
    "Most contractors are on a job site, not at a desk. Hunter meets them there — walk through a scope out loud and get a structured estimate before you're back in the truck.",
  openGraph: {
    title: "Voice AI: How Hunter Builds Estimates in 3 Minutes | FairTradeWorker",
    description: "Walk through a scope out loud and get a structured estimate before you're back in the truck.",
    type: "article",
    publishedTime: "2026-03-08T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/hunter-voice-ai" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Voice AI: How Hunter Builds Estimates in 3 Minutes",
  description: "Most contractors are on a job site, not at a desk. Hunter meets them there.",
  datePublished: "2026-03-08",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/hunter-voice-ai",
};

export default function HunterVoiceAiPage() {
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
            <span className="text-sm text-brand-600 font-medium">Product</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Voice AI: How Hunter Builds Estimates in 3 Minutes
            </h1>
            <p className="text-gray-700 mt-2">March 8, 2026</p>
          </div>

          <div className="max-w-none">
            <p className="text-gray-800 leading-relaxed mb-4">
              Writing estimates is one of the least favorite parts of being a
              contractor. You walk a job, take notes on the back of a receipt,
              drive back to the office, open a spreadsheet, and spend 45 minutes
              pricing out materials and labor. Then you do it again tomorrow for
              a different customer. Multiply that across a week and you&apos;re
              losing hours that could be spent on billable work.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              Hunter changes that. It&apos;s a voice-powered AI estimation
              tool built into FairTradeWorker. You talk through what you see on
              the job site, and Hunter turns that into a structured,
              professional estimate in about three minutes.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              How It Works
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              Open the FairTradeWorker app on your phone. Tap the microphone.
              Start describing the job the same way you&apos;d explain it to
              your lead carpenter or your supplier.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              &ldquo;Kitchen gut and remodel. About 180 square feet. Ripping
              out existing cabinets, countertops, and flooring. New custom
              cabinets, quartz countertops, LVP flooring. Moving the sink to
              the island, so we need plumbing rough-in. Adding four recessed
              lights and under-cabinet lighting. Client wants a tile
              backsplash, subway style.&rdquo;
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              That&apos;s it. Hunter listens, extracts every detail, and runs
              it through ConstructionAI, our custom-trained estimation model
              built on 18,000+ real construction projects. Within seconds,
              you&apos;ve got a full estimate broken down by CSI division.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              What You Get Back
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              Hunter doesn&apos;t give you a single number and call it a day.
              You get a structured breakdown that looks like something you&apos;d
              spend an hour building in Excel:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-gray-800 mb-4">
              <li>
                <strong>CSI Division Breakdown:</strong> Every line item
                organized by trade division. Demolition, rough carpentry,
                plumbing, electrical, finishes. Each with labor hours, material
                costs, and equipment if applicable.
              </li>
              <li>
                <strong>Material Takeoff:</strong> Quantities and unit costs for
                every material Hunter identified. Cabinets, countertop square
                footage, flooring, tile, lighting fixtures, plumbing fittings.
              </li>
              <li>
                <strong>Labor Estimates:</strong> Hours by trade, using current
                rate data for your market. Not national averages from 2019.
                Actual pricing that reflects what tradespeople charge in your
                area.
              </li>
              <li>
                <strong>Timeline Projection:</strong> Estimated project duration
                based on the scope, accounting for trade sequencing and typical
                lead times.
              </li>
              <li>
                <strong>Exclusions and Notes:</strong> Hunter flags what it
                didn&apos;t include so you can add anything that&apos;s missing
                before sending the estimate to your client.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              The AI Behind It
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              Hunter isn&apos;t using a generic language model to guess at
              prices. It runs on ConstructionAI, a custom model we built from
              scratch specifically for construction estimation. The training
              data comes from real completed projects with real costs, not
              national averages scraped from the internet.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              That means when Hunter prices out a plumbing rough-in for a
              kitchen island, it&apos;s pulling from thousands of similar
              scopes with known outcomes. The result is an estimate that&apos;s
              close enough to use as a starting point and detailed enough to
              adjust into a final bid.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              Edit, Adjust, Send
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              No AI estimate should go out the door without a contractor&apos;s
              eyes on it. Hunter gives you the foundation; you make it yours.
              Every line item is editable. Swap materials, adjust labor rates
              for your crew, add line items Hunter missed, remove ones that
              don&apos;t apply. The estimate recalculates in real time as you
              make changes.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              When it&apos;s ready, generate a clean PDF with your company
              branding and send it directly to the homeowner through the
              platform. Or export it to QuickBooks and handle it through your
              existing workflow. Either way, what used to take 45 minutes at a
              desk now takes 3 minutes on the job site and 5 minutes of review
              when you have a free moment.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              Who Gets Access
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              Hunter is available on the Solo plan ($29/month) and above. Free
              tier contractors can still bid on jobs and use the platform, but
              Hunter&apos;s voice estimation and ConstructionAI-powered
              breakdowns are part of the paid experience. For most contractors,
              the time saved on a single estimate pays for the entire month.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              We built Hunter because contractors shouldn&apos;t need to be
              good at spreadsheets to price a job accurately. The skill is in
              knowing what a project takes. Hunter just translates that
              knowledge into a format that wins work.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
