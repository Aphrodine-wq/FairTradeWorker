import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "A New Way to Do Home Projects",
  description:
    "Stop calling around for quotes. Post your project, get real bids from verified contractors, and pick the best one. That's how home projects should work.",
  openGraph: {
    title: "A New Way to Do Home Projects | FairTradeWorker",
    description: "Stop calling around for quotes. Post your project, get real bids from verified contractors, and pick the best one. That's how home projects should work.",
  },
  alternates: {
    canonical: "/new-way",
  },
};

export default function NewWayPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-[#FAFAFA] py-20 lg:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-4">
              Forget everything you know about hiring contractors
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.08]">
              Home projects should be fun, not stressful.
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              You shouldn&apos;t have to call ten contractors to get two callbacks
              and one overpriced quote. We flipped the whole thing around.
            </p>
          </div>
        </section>

        {/* The old way vs the new way */}
        <section className="bg-white py-16 lg:py-20 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">

              {/* Old way */}
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                  The old way
                </h2>
                <ul className="space-y-4">
                  {[
                    "Google \"plumber near me\" and hope for the best",
                    "Call 5 contractors, 2 answer, 1 shows up",
                    "Wait a week for a quote scribbled on a napkin",
                    "No idea if the price is fair or not",
                    "Pay upfront and pray the work gets finished",
                    "Leave a Yelp review nobody reads",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 w-4 h-4 rounded-full bg-gray-200 shrink-0" />
                      <span className="text-gray-500 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* New way */}
              <div>
                <h2 className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-6">
                  The FairTradeWorker way
                </h2>
                <ul className="space-y-4">
                  {[
                    "Post your project in two minutes — what, where, when",
                    "Verified contractors in your area see it and bid",
                    "You compare real prices side by side",
                    "AI-powered estimates tell you if a bid is fair",
                    "Your money sits in escrow until the work is done right",
                    "Reviews tied to real, completed, escrow-verified jobs",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 w-5 h-5 text-brand-600 shrink-0" />
                      <span className="text-gray-900 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it actually feels */}
        <section className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Here's what it actually looks like.
            </h2>
            <div className="mt-10 space-y-12">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-sm bg-brand-600 flex items-center justify-center text-sm font-bold text-white">1</span>
                  <h3 className="text-lg font-bold text-gray-900">You post your project</h3>
                </div>
                <p className="text-gray-600 leading-relaxed pl-11">
                  "Need my kitchen cabinets repainted. 22 cabinets, white to
                  navy. House is in Oxford off South Lamar." That&apos;s it. Add a
                  couple photos if you want. Takes two minutes on your phone.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-sm bg-brand-600 flex items-center justify-center text-sm font-bold text-white">2</span>
                  <h3 className="text-lg font-bold text-gray-900">Contractors start bidding</h3>
                </div>
                <p className="text-gray-600 leading-relaxed pl-11">
                  Within hours, painters in your area who are actually
                  available see your project and send you bids. Not a
                  salesperson calling from a call center in Phoenix — the
                  actual person who'd be painting your cabinets.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-sm bg-brand-600 flex items-center justify-center text-sm font-bold text-white">3</span>
                  <h3 className="text-lg font-bold text-gray-900">You pick the one you like</h3>
                </div>
                <p className="text-gray-600 leading-relaxed pl-11">
                  See every bid side by side. Check their reviews from past
                  jobs. Message them with questions. There's no pressure and no
                  deadline — you hire when you&apos;re ready.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-sm bg-brand-600 flex items-center justify-center text-sm font-bold text-white">4</span>
                  <h3 className="text-lg font-bold text-gray-900">Your money is protected the whole time</h3>
                </div>
                <p className="text-gray-600 leading-relaxed pl-11">
                  When you hire someone, your payment goes into escrow — not
                  the contractor's pocket. They do the work, you confirm it
                  looks good, then the money releases. If something's not right,
                  you&apos;ve got leverage. That&apos;s how it should work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For contractors too */}
        <section className="bg-white py-16 lg:py-20 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Contractors love it too.
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Most platforms charge contractors $30 to $80 per lead — and
              most of those leads never turn into jobs. That cost gets passed
              to you in inflated bids. We don&apos;t do that.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Flat monthly subscription — not per lead, not per bid",
                "Every homeowner on the platform actually has a project ready to go",
                "AI-powered estimation tools that build quotes in minutes, not hours",
                "Escrow means you always get paid for completed work",
                "Your reviews are tied to real jobs, not anonymous internet posts",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 w-5 h-5 text-brand-600 shrink-0" />
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link href="/pricing" className="inline-flex items-center gap-2">
                  See contractor plans
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What makes this different */}
        <section className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Why this works better.
            </h2>

            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Contractors compete on quality, not ad spend</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  On lead-fee platforms, the contractor who pays the most gets
                  the most leads. Here, the contractor with the best bid and
                  best track record wins. That&apos;s better for everyone.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Prices are actually fair</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  When contractors don&apos;t pay $60 per lead, they don&apos;t need to
                  pad their bids to cover it. You get real pricing because the
                  platform isn&apos;t taking a cut of every job.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Every review means something</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  Reviews on FairTradeWorker are tied to completed,
                  escrow-verified jobs. You can&apos;t fake them, you can&apos;t buy
                  them, and you can&apos;t delete the bad ones. What you see is what
                  you get.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Mississippi first</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  We&apos;re not trying to be everywhere at once. We launched in
                  Mississippi because it&apos;s home, and we&apos;re building density
                  market by market. When you post a job in Oxford or Tupelo,
                  you&apos;re getting local contractors who know the area — not a
                  handyman three states away.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ backgroundColor: "#0F1419" }} className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to try it?
            </h2>
            <p className="mt-3 text-gray-300 max-w-lg mx-auto">
              Post your first project for free. See what comes back.
              No credit card, no commitment, no catch.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="xl" asChild>
                <Link href="/signup?role=homeowner">Post a Job Free</Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500"
                asChild
              >
                <Link href="/signup?role=contractor">Join as Contractor</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
