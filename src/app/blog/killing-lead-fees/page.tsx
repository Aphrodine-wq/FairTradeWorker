import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";

export const metadata: Metadata = {
  title: "Why We're Killing Lead Fees | FairTradeWorker",
  description:
    "Lead fees were supposed to connect contractors with homeowners. Instead, they became a tax on showing up. Here's why we built something different.",
};

export default function KillingLeadFeesPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#FAFAFA] min-h-screen">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to blog
          </Link>

          <div className="mb-8">
            <span className="text-sm text-gray-800 font-medium">Company</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Why We&apos;re Killing Lead Fees
            </h1>
            <p className="text-gray-700 mt-2">March 15, 2026</p>
          </div>

          <div className="max-w-none">
            <p className="text-gray-800 leading-relaxed mb-4">
              If you&apos;re a contractor who&apos;s used HomeAdvisor, Angi, or
              Thumbtack in the last five years, you already know the drill. A
              homeowner submits a request. The platform sells that same lead to
              three, four, sometimes eight contractors. You pay $15 to $100 just
              for the phone number. Then you call, and half the time nobody
              picks up. The other half, they&apos;ve already hired somebody
              from the first wave.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              That&apos;s the lead-fee model. It was built to make platforms
              money, not to help contractors build businesses. We think
              it&apos;s fundamentally broken, and we built FairTradeWorker to
              prove there&apos;s a better way.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              The Real Cost of Lead Fees
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              Let&apos;s do the math that the big platforms don&apos;t want you
              to think about. Say you&apos;re a general contractor doing
              residential remodels. A decent kitchen lead on Angi runs about
              $60. You need to buy 5 to 8 leads to land one job, because the
              same lead is going to multiple contractors and the homeowner only
              hires one.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              That&apos;s $300 to $480 in lead costs for a single job. If
              you&apos;re closing one job a week from these platforms,
              you&apos;re spending $1,200 to $1,920 a month. That&apos;s
              $14,400 to $23,000 a year, and that&apos;s before you account
              for the time you spent chasing leads that went nowhere.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              For specialty trades, it&apos;s even worse. Plumbing and
              electrical leads are cheaper per unit but convert at lower rates
              because homeowners are more likely to get multiple quotes for
              smaller jobs. A plumber buying $20 leads might need 10 to close
              one service call. The economics don&apos;t work for anyone except
              the platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              Why It Creates a Race to the Bottom
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              The lead-fee model doesn&apos;t just cost money. It warps
              behavior. When you&apos;re paying $60 for a lead, you feel
              pressure to underbid just to win the job and recover that cost.
              Contractors start cutting margins, rushing estimates, and
              promising timelines they can&apos;t keep. The homeowner ends up
              with a lower-quality experience, and the contractor ends up
              working for less than the job is worth.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              It also punishes smaller operations. A solo contractor
              can&apos;t absorb $1,500 a month in lead costs the way a
              company with 20 trucks can. The platforms end up favoring volume
              players who can afford to lose money on lead acquisition, which
              pushes out the skilled tradespeople who do better work but
              can&apos;t outspend the competition.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              How FairTradeWorker Works Instead
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              We charge a flat monthly subscription. That&apos;s it. No
              per-lead fees, no per-bid charges, no surprise costs when a
              homeowner looks at your profile. You pay one price and you get
              unlimited access to every job posted in your service area and
              trade categories.
            </p>

            <ul className="list-disc pl-6 space-y-2 text-gray-800 mb-4">
              <li>
                <strong>Free tier:</strong> Limited to 3 active bids per month.
                Enough to try the platform and see if it works for you.
              </li>
              <li>
                <strong>Solo ($29/mo):</strong> Unlimited bids, AI-powered
                estimation with Hunter, and your verified contractor profile.
              </li>
              <li>
                <strong>Team ($79/mo):</strong> Everything in Solo plus team
                management, advanced analytics, and priority placement.
              </li>
              <li>
                <strong>Enterprise ($149/mo):</strong> Full platform access with
                dedicated support, custom branding, and API integrations.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              The Math That Actually Works
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              At $29 a month, a Solo contractor spends $348 a year on
              FairTradeWorker. Compare that to the $14,000+ they&apos;d spend
              on lead fees doing the same volume of work. That&apos;s a savings
              of $3,000 to $6,000 per year at minimum, and closer to $15,000
              for contractors who were heavily reliant on paid leads.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              More importantly, every bid you submit goes directly to one
              homeowner who posted a real job. There&apos;s no shared lead.
              The homeowner reviews bids, checks your verified profile and
              FairRecord, and picks the contractor they want. You compete on
              the quality of your work and the fairness of your price, not on
              who got the notification first.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              Built by People Who Get It
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              We didn&apos;t build FairTradeWorker because we saw a market
              opportunity in &ldquo;disrupting home services.&rdquo; We built
              it because the current system is unfair to the people who do the
              actual work. Contractors deserve a platform that charges them
              honestly, connects them with real customers, and stays out of the
              way while they run their business.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              That&apos;s what killing lead fees means. Not a marketing
              gimmick. A different business model, built on the idea that if
              the platform only makes money when contractors succeed, then the
              platform will be designed to help contractors succeed.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
