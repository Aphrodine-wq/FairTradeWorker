import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "How to Price Construction Jobs Without Losing Money (or Clients)",
  description:
    "A Mississippi contractor's guide to pricing jobs right. Common mistakes, real overhead math, markup vs margin, and how to stay competitive without racing to the bottom.",
  openGraph: {
    title: "How to Price Construction Jobs Without Losing Money (or Clients) | FairTradeWorker",
    description: "A Mississippi contractor's guide to pricing jobs right. Stop undercharging and start building profit.",
    type: "article",
    publishedTime: "2026-03-22T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/contractor-pricing-guide" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Price Construction Jobs Without Losing Money (or Clients)",
  description: "A Mississippi contractor's guide to pricing jobs right — common mistakes, real overhead math, and how to stay competitive.",
  datePublished: "2026-03-22",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/contractor-pricing-guide",
};

export default function ContractorPricingGuidePage() {
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
              How to Price Construction Jobs Without Losing Money (or Clients)
            </h1>
            <p className="text-gray-700 mt-2">March 22, 2026</p>
          </header>

          <div className="mt-10 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Pricing is the thing that separates contractors who build wealth from contractors who stay broke. You can be the best framer in Mississippi, but if you're pricing jobs wrong, you're working for free and you might not even know it.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Most contractors learn pricing the hard way — by losing money on a job and then trying to figure out what went wrong. This guide is an attempt to short-circuit that process. Here are the mistakes we see over and over, and how to fix them.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Mistake #1: Undercharging to win the job</h2>
            <p className="text-gray-700 leading-relaxed">
              This is the most common mistake, and it's understandable. You need work. There's a job on the table. You know two other guys are bidding on it. So you sharpen your pencil, cut your margin to nothing, and submit a bid you can barely afford to win.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Then you win the job. And for the next six weeks, you're working 50 hours a week for what works out to less than your crew makes per hour. Every unexpected issue — and there's always something — comes straight out of your pocket because there was no margin to absorb it.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Here's the counterintuitive truth: it's better to lose a job than to win it at a price that loses money. A job you don't take costs you $0. A job you underbid can cost you thousands.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Mistake #2: Forgetting your real overhead</h2>
            <p className="text-gray-700 leading-relaxed">
              Most contractors know their material costs and labor costs. But overhead? That's where the numbers get fuzzy. And fuzzy overhead is where profit disappears.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Your real overhead includes: truck payment, fuel, insurance (GL, workers' comp, auto), license fees, tools and equipment, phone, accounting, software, office space if you have it, continuing education, and the time you spend doing estimates, invoicing, and managing jobs that you're not billing for. That last one is huge — if you spend 15 hours a week on admin and sales, that's 15 hours of unbillable time that your bids need to cover.
            </p>

            {/* Overhead example */}
            <div className="my-10 overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Overhead Category</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Monthly Cost (Typical MS Contractor)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 text-gray-900">Vehicle (payment + fuel + maintenance)</td>
                    <td className="p-3 text-gray-900">$800 - $1,500</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-gray-900">Insurance (GL + WC + auto)</td>
                    <td className="p-3 text-gray-900">$500 - $1,200</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-gray-900">Tools and equipment</td>
                    <td className="p-3 text-gray-900">$200 - $600</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-gray-900">Phone, software, accounting</td>
                    <td className="p-3 text-gray-900">$200 - $400</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-gray-900">License and continuing ed</td>
                    <td className="p-3 text-gray-900">$50 - $150</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Total monthly overhead</td>
                    <td className="p-3 font-bold text-gray-900">$1,750 - $3,850</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-gray-700 leading-relaxed">
              If your monthly overhead is $3,000 and you do 3 jobs a month, each job needs to carry $1,000 in overhead before you've made a dollar of profit. If you're not building that into your bids, you're subsidizing your clients' projects out of your own pocket.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Mistake #3: Not accounting for callbacks</h2>
            <p className="text-gray-700 leading-relaxed">
              Every contractor gets callbacks. Something settles, a finish cracks, a door sticks after the humidity changes (this is Mississippi — the humidity always changes). If you're doing quality work, callbacks are rare. But they still happen, and they cost you time and money.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Build a 2-3% callback allowance into every bid. On a $15,000 job, that's $300-$450. If you don't need it, it's profit. If you do need it, you're covered. Either way, you're not losing money on a job you thought was done.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Markup vs. margin: the math contractors get wrong</h2>
            <p className="text-gray-700 leading-relaxed">
              This trips up more contractors than almost anything else. Markup and margin are not the same thing, and confusing them can cost you thousands on a single job.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Markup</strong> is the percentage you add to your costs. If your costs are $10,000 and you mark up 20%, your price is $12,000.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Margin</strong> is the percentage of the final price that's profit. On that same $12,000 job, your profit is $2,000 — which is a 16.7% margin, not 20%.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you're targeting a 20% profit margin, you need a 25% markup. If you're targeting 30% margin, you need a 43% markup. The gap between these numbers is where a lot of contractors accidentally give away their profit.
            </p>

            <div className="my-10 overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Target Margin</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">Required Markup</th>
                    <th className="text-left p-3 font-bold text-gray-900 border-b border-border">On $10K in costs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 text-gray-900">10%</td>
                    <td className="p-3 text-gray-900">11.1%</td>
                    <td className="p-3 text-gray-900">Bid $11,111 / Profit $1,111</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-gray-900">15%</td>
                    <td className="p-3 text-gray-900">17.6%</td>
                    <td className="p-3 text-gray-900">Bid $11,765 / Profit $1,765</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-gray-900">20%</td>
                    <td className="p-3 text-gray-900">25.0%</td>
                    <td className="p-3 text-gray-900">Bid $12,500 / Profit $2,500</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-900">30%</td>
                    <td className="p-3 text-gray-900">42.9%</td>
                    <td className="p-3 text-gray-900">Bid $14,286 / Profit $4,286</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">How lead-fee platforms force you to overbid</h2>
            <p className="text-gray-700 leading-relaxed">
              Here's something most contractors don't think about: when you're paying $50-$80 per lead on platforms like Angi or Thumbtack, those lead costs have to go somewhere. They end up baked into your bids.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you're spending $500/month on leads and winning 3 jobs from those leads, that's $167 per job in marketing costs. On a small job — a $3,000 fence install, for example — that's 5.5% of revenue going to the platform before you've touched your actual costs. You either eat that margin or you pad your bids, which makes you less competitive.
            </p>
            <p className="text-gray-700 leading-relaxed">
              On FairTradeWorker, there are no lead fees. That means the price you quote is based on the actual cost of the work plus your real margin — not the cost of the work plus your margin plus a tax to the platform that connected you. Your bids can be lower and more competitive while your actual profit stays the same or improves.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">How to price competitively when there are no lead fees</h2>
            <p className="text-gray-700 leading-relaxed">
              When your cost of acquiring a client drops to zero, it changes your entire pricing strategy. You don't have to build lead costs into every bid. You don't have to win every job to cover your marketing spend. You can be more selective about which projects you bid on, which means you can focus on the work where your margins are healthiest.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Use our{" "}
              <Link href="/fairprice" className="text-brand-600 font-medium hover:underline">FairPrice Estimator</Link>{" "}
              to see what homeowners expect to pay for common project types in your area. This isn't about matching the lowest number — it's about understanding the market so your bids land in the right range. A bid that's 10% above the FairPrice estimate with a detailed scope and strong reviews will beat a lowball bid from an unknown contractor every time.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">The pricing formula that works</h2>
            <p className="text-gray-700 leading-relaxed">
              Here's the simple version: Materials + Labor + Overhead allocation + Callback reserve + Profit margin = Your bid price. Don't skip any of those steps. Don't "round down" because you want the job. Don't forget that your time doing the estimate is worth something too.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you price right, you'll lose some bids. That's fine. The bids you win will actually make you money. And over time, the contractors who price right are the ones still in business — the ones who undercut everyone are the ones who burn out and quit.
            </p>

            {/* Related links */}
            <div className="mt-10 pt-6 border-t border-border">
              <p className="text-sm font-bold text-gray-900 mb-3">Related</p>
              <div className="space-y-2">
                <Link href="/blog/killing-lead-fees" className="block text-sm text-brand-600 hover:underline">
                  Why We're Killing Lead Fees
                </Link>
                <Link href="/blog/how-to-get-more-clients-contractor" className="block text-sm text-brand-600 hover:underline">
                  How to Get More Clients as a Contractor in Mississippi
                </Link>
                <Link href="/blog/grow-construction-business-mississippi" className="block text-sm text-brand-600 hover:underline">
                  Growing a Construction Business in Mississippi: What Actually Works
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-gray-700 mb-4">Ready to bid on jobs where your price is based on the work — not lead fees?</p>
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
