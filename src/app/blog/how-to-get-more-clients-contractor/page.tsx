import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "How to Get More Clients as a Contractor in Mississippi",
  description:
    "Proven strategies for Mississippi contractors to find more clients without paying for leads. Build your reputation, win more bids, and grow your business the right way.",
  openGraph: {
    title: "How to Get More Clients as a Contractor in Mississippi | FairTradeWorker",
    description: "Proven strategies for Mississippi contractors to find more clients without paying for leads.",
    type: "article",
    publishedTime: "2026-04-06T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/how-to-get-more-clients-contractor" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Get More Clients as a Contractor in Mississippi",
  description: "Proven strategies for Mississippi contractors to find more clients without paying for leads.",
  datePublished: "2026-04-06",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/how-to-get-more-clients-contractor",
};

export default function GetMoreClientsPage() {
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
            <span className="text-sm font-semibold text-violet-700">Business</span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              How to Get More Clients as a Contractor in Mississippi
            </h1>
            <p className="text-gray-700 mt-2">April 6, 2026</p>
          </header>

          <div className="mt-10 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              You got into this trade because you're good at building things. Not because you love marketing. But at some point, every Mississippi contractor hits the same wall: word of mouth carried you this far, and now it's not enough.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Maybe your best referral source retired. Maybe you finished a big project and there's nothing lined up behind it. Maybe you're just tired of the feast-or-famine cycle where you're slammed for three months and then scrambling for the next two.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Here's the truth: word of mouth is the best form of marketing, but it doesn't scale. You can't control when someone recommends you. You can't control whether the person they recommend you to actually needs work done right now. And you definitely can't build a predictable pipeline on "my buddy might call you next month."
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Your online presence matters more than you think</h2>
            <p className="text-gray-700 leading-relaxed">
              When a homeowner in Oxford or Hattiesburg needs a contractor, the first thing they do is search. Not ask their neighbor — search. Google, Facebook, Nextdoor. And if you're not showing up, you don't exist to them.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You don't need a fancy website. You need a Google Business Profile that's complete and active, with real photos of your work (not stock images), your license number, your service area, and at least a handful of recent reviews. That's the baseline. If you don't have that, you're invisible to about 70% of potential clients.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Post your finished projects on Facebook. Not with some marketing caption — just "Finished up this deck in Tupelo. Cedar, stained natural. Two weeks start to finish." Real work, real photos. That's the kind of content that actually gets shared in local groups.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Reviews are your currency</h2>
            <p className="text-gray-700 leading-relaxed">
              Every contractor says they do quality work. Reviews are the only way a homeowner can verify that before hiring you. And they don't need to be perfect — they need to be real and recent.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ask every single client for a review when the project wraps. Don't be weird about it. "Hey, if you're happy with how this turned out, a Google review would really help my business." Most people are willing. They just don't think to do it unless you ask.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The contractors who consistently win work on FairTradeWorker have one thing in common: strong review histories. Homeowners can see your past work, read what other clients said, and feel confident putting their project in your hands. That trust is earned over time, and it compounds.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Why lead-fee platforms eat your margins</h2>
            <p className="text-gray-700 leading-relaxed">
              If you've tried the big lead platforms — Angi, HomeAdvisor, Thumbtack — you already know the math doesn't work. You're paying $30-$80 per lead. Maybe 1 in 5 leads actually answers the phone. Maybe 1 in 10 turns into a job. So your real cost per acquired client is $300-$800, and that's before you've swung a hammer.
            </p>
            <p className="text-gray-700 leading-relaxed">
              On a $5,000 bathroom remodel in Mississippi, those lead costs can eat 10-15% of your revenue. That's money coming straight out of your profit. And the worst part? You're competing against 5-10 other contractors who all got the same lead, so you're in a race to the bottom on price.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The lead-fee model was designed to extract money from contractors, not to help them build businesses. It's a tax on showing up.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">How FairTradeWorker's bid model works differently</h2>
            <p className="text-gray-700 leading-relaxed">
              On FairTradeWorker, there are no lead fees. Zero. A homeowner posts a project, you see the details, and you submit a bid if it's a good fit. You don't pay to see the project. You don't pay to submit a bid. You don't pay when you win the job.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We make money from a small service fee on the homeowner side and from optional tools like our{" "}
              <Link href="/pricing" className="text-brand-600 font-medium hover:underline">Pro subscription</Link>{" "}
              that gives you priority visibility and AI-powered estimating. But the core model — seeing jobs and bidding on them — is free.
            </p>
            <p className="text-gray-700 leading-relaxed">
              That means you can bid on 20 projects a month and your marketing cost is $0. Compare that to $1,600 in lead fees on the other platforms. The math speaks for itself.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Tips for winning bids</h2>
            <p className="text-gray-700 leading-relaxed">
              Getting in front of clients is half the battle. Winning the job is the other half. Here's what separates contractors who close at 40% from those who close at 15%:
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Be specific in your scope.</strong> "We'll handle your kitchen remodel" tells the homeowner nothing. "Demo existing cabinets and countertops, install 14 linear feet of semi-custom maple cabinets with soft-close hardware, quartz countertops with undermount sink, LVP flooring in the kitchen and breakfast nook" — that tells them you've actually thought about their project.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Price fairly, not cheaply.</strong> The lowest bid doesn't always win. In fact, experienced homeowners are suspicious of the lowest bid. They want the bid that feels right — detailed enough to show you know what you're doing, priced fairly enough that they're not worried about getting ripped off. Our{" "}
              <Link href="/fairprice" className="text-brand-600 font-medium hover:underline">FairPrice Estimator</Link>{" "}
              gives homeowners a baseline, so your bid doesn't need to be the cheapest — it needs to be justified.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Respond fast.</strong> The first contractor to respond to a new project request gets a massive advantage. Not because speed equals quality, but because homeowners have momentum when they post a project. They're ready to move. If you wait three days to respond, they've already started talking to someone else.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Show your work.</strong> Attach photos from similar past projects. If a homeowner wants a deck built and you've built 50 decks, show them. A picture of a finished project is worth more than any sales pitch.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">The Mississippi opportunity</h2>
            <p className="text-gray-700 leading-relaxed">
              Mississippi's housing stock is aging. Median home age is over 40 years, and that means renovation demand is only going up. Add in storm damage repairs, energy efficiency upgrades, and a growing population in the DeSoto County corridor, and there's more work available than most contractors realize.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The contractors who are going to win over the next five years aren't the ones with the biggest trucks or the most yard signs. They're the ones who show up online, build real reputations, and make it easy for homeowners to hire them.
            </p>
            <p className="text-gray-700 leading-relaxed">
              That's what we built{" "}
              <Link href="/find-work" className="text-brand-600 font-medium hover:underline">FairTradeWorker</Link>{" "}
              to do.
            </p>

            {/* Related links */}
            <div className="mt-10 pt-6 border-t border-border">
              <p className="text-sm font-bold text-gray-900 mb-3">Related</p>
              <div className="space-y-2">
                <Link href="/blog/killing-lead-fees" className="block text-sm text-brand-600 hover:underline">
                  Why We're Killing Lead Fees
                </Link>
                <Link href="/blog/contractor-pricing-guide" className="block text-sm text-brand-600 hover:underline">
                  How to Price Construction Jobs Without Losing Money (or Clients)
                </Link>
                <Link href="/blog/grow-construction-business-mississippi" className="block text-sm text-brand-600 hover:underline">
                  Growing a Construction Business in Mississippi: What Actually Works
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-gray-700 mb-4">Ready to start getting real project leads — with no lead fees?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/signup?role=contractor">Sign Up as a Contractor</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/find-work" className="inline-flex items-center gap-2">
                  Browse Available Jobs
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
