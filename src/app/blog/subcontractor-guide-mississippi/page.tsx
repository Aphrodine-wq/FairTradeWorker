import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "Subcontractor Survival Guide: Finding Steady Work in Mississippi",
  description:
    "How Mississippi subcontractors can find steady work, diversify GC relationships, get paid on time, and build a reputation that keeps the pipeline full.",
  openGraph: {
    title: "Subcontractor Survival Guide: Finding Steady Work in Mississippi | FairTradeWorker",
    description: "How Mississippi subcontractors can find steady work and get paid on time.",
    type: "article",
    publishedTime: "2026-04-02T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/subcontractor-guide-mississippi" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Subcontractor Survival Guide: Finding Steady Work in Mississippi",
  description: "How Mississippi subcontractors can find steady work, diversify GC relationships, and get paid on time.",
  datePublished: "2026-04-02",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/subcontractor-guide-mississippi",
};

export default function SubcontractorGuidePage() {
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
              Subcontractor Survival Guide: Finding Steady Work in Mississippi
            </h1>
            <p className="text-gray-700 mt-2">April 2, 2026</p>
          </header>

          <div className="mt-10 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Being a subcontractor in Mississippi means you're good at what you do — framing, electrical, plumbing, drywall, concrete, whatever your trade is. But being good at the work doesn't guarantee steady work. That's the sub's dilemma, and it's been the same for decades.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You're either buried with more jobs than your crew can handle, or you're sitting at home wondering when the phone's going to ring. There's no in-between. And most of the time, whether you're busy or not has nothing to do with how skilled you are — it's about who you know and whether they happen to have work right now.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">The danger of relying on one GC</h2>
            <p className="text-gray-700 leading-relaxed">
              Most subs in Mississippi get the majority of their work from one or two general contractors. When that relationship is good, it's great. Steady calls, familiar job sites, you know what to expect. But when that GC slows down — or decides to use someone cheaper — your whole business is at risk.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We've talked to subs across the state who lost 70% of their revenue overnight because their primary GC took on a partner who brought his own subs. No warning. No transition. Just silence where the phone used to ring.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The fix isn't complicated: you need more than two sources of work. But finding new GC relationships takes time you don't have when you're already on a job site 10 hours a day. That's the catch-22.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Diversifying your GC relationships</h2>
            <p className="text-gray-700 leading-relaxed">
              The goal is 4-6 GCs who know your work and call you regularly. Not 20 — you can't maintain that many relationships. But enough that losing any single one doesn't sink you.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Start by looking at who's pulling permits in your area. In Mississippi, permit data is public record through your county building department. If a GC is pulling permits for residential work in your service area, they need subs. Reach out directly — not with a sales pitch, but with a simple introduction. "I'm a licensed electrician working in the Oxford area. If you ever need a sub for residential rough-in or service upgrades, I'd like to be on your list."
            </p>
            <p className="text-gray-700 leading-relaxed">
              Show up to local contractor association meetings. The Mississippi Home Builders Association has chapters across the state. These aren't glamorous events, but they're where GCs meet subs. One handshake at a chapter meeting has started more sub relationships than any website ever has.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">The net-90 problem (and why it kills subs)</h2>
            <p className="text-gray-700 leading-relaxed">
              Let's talk about the real reason subs go under: cash flow. Not lack of work. Cash flow.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Here's how it usually works: you complete a phase of work, submit an invoice, and then wait. The GC says net-30. In reality, it's net-45. Sometimes net-60. On bigger commercial jobs, net-90 is standard. Meanwhile, you're paying your crew every Friday. You're buying materials out of pocket. Your truck payment doesn't care that the GC hasn't paid you yet.
            </p>
            <p className="text-gray-700 leading-relaxed">
              A sub running a four-person crew in Mississippi might have $8,000-$12,000 in weekly expenses between labor, materials, fuel, and insurance. If you're waiting 60-90 days on $40,000 in receivables, you need $30,000+ in working capital just to survive. Most small subs don't have that cushion, so they end up on credit cards at 22% interest, which eats whatever margin they had on the job.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">How escrow changes the game for subs</h2>
            <p className="text-gray-700 leading-relaxed">
              This is why we built escrow into FairTradeWorker from day one — not just for homeowners, but for subs.
            </p>
            <p className="text-gray-700 leading-relaxed">
              When a GC posts a sub-job on our platform, the payment is funded into escrow before work begins. Not after. Before. That means the money exists. It's real. It's sitting in a protected account waiting for you to complete the milestone.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You finish the work, the GC confirms completion, and the money releases. No net-30. No net-60. No chasing invoices. No wondering if you're going to get paid. The money was there before you picked up a tool.
            </p>
            <p className="text-gray-700 leading-relaxed">
              For a sub who's been burned by slow-paying GCs — and in Mississippi, that's most of them — this changes everything. You can actually plan your finances. You can take on the right jobs instead of every job. You can grow instead of just surviving.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Building a sub reputation that opens doors</h2>
            <p className="text-gray-700 leading-relaxed">
              In the traditional model, your reputation lives in the heads of a few GCs. If they like you, you get calls. If they don't, you don't. And there's no way for a new GC to verify your track record without calling around.
            </p>
            <p className="text-gray-700 leading-relaxed">
              On FairTradeWorker, every completed sub-job builds your profile. GCs can see your completion rate, your on-time delivery percentage, your quality ratings, and reviews from other GCs you've worked with. It's a portable reputation that follows you — not one that's locked inside someone else's contact list.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The subs who do great work but never get discovered? This is how they get discovered. A GC in Biloxi who's never heard of you can look at your profile, see that you've completed 30 framing jobs with a 4.9 rating, and feel confident bringing you onto a project.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">How FairTradeWorker's sub-job system works</h2>
            <p className="text-gray-700 leading-relaxed">
              Here's the flow: a GC wins a project (either through our platform or on their own). They break it into sub-jobs — electrical rough-in, plumbing, HVAC, framing, whatever the project needs. Each sub-job gets posted with a scope, timeline, and budget.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You see sub-jobs in your trade and your area. You bid on the ones that fit. If the GC selects your bid, the escrow is funded and you start work. Milestones are tracked, payments release on completion, and both sides rate each other when it's done.
            </p>
            <p className="text-gray-700 leading-relaxed">
              No cold calls. No hoping a GC remembers your name. No chasing payments for months. Just a straightforward system where good work gets rewarded and you actually get paid when you're supposed to.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">The bottom line</h2>
            <p className="text-gray-700 leading-relaxed">
              Being a sub in Mississippi has always been about who you know. We're not trying to replace those relationships — the best work still happens between people who trust each other. But we are trying to make it easier to build those relationships, easier to find steady work, and a lot easier to get paid on time.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you're a sub who's tired of the feast-or-famine cycle, or if you're just looking to add a few more GC relationships to your pipeline,{" "}
              <Link href="/find-sub-work" className="text-brand-600 font-medium hover:underline">check out what's available in your area</Link>.
            </p>

            {/* Related links */}
            <div className="mt-10 pt-6 border-t border-border">
              <p className="text-sm font-bold text-gray-900 mb-3">Related</p>
              <div className="space-y-2">
                <Link href="/blog/escrow-payments-for-subs" className="block text-sm text-brand-600 hover:underline">
                  Why Escrow Payments Are a Game Changer for Subcontractors
                </Link>
                <Link href="/blog/escrow-payments-guide" className="block text-sm text-brand-600 hover:underline">
                  Escrow Payments: What Contractors Need to Know
                </Link>
                <Link href="/blog/contractor-pricing-guide" className="block text-sm text-brand-600 hover:underline">
                  How to Price Construction Jobs Without Losing Money (or Clients)
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-gray-700 mb-4">Ready to find steady sub work with guaranteed payments?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/signup?role=contractor">Sign Up as a Contractor</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/find-sub-work" className="inline-flex items-center gap-2">
                  Browse Sub-Jobs
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
