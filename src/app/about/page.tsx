import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@marketplace/components/navbar";

export const metadata: Metadata = {
  title: "About",
  description: "FairTradeWorker is building a fairer construction marketplace. No lead fees, no hidden costs, just honest connections between homeowners and contractors.",
};
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { Separator } from "@shared/ui/separator";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headline */}
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            We got tired of the same broken system.
          </h1>

          {/* Story */}
          <div className="mt-10 space-y-6 text-lg text-gray-800 leading-relaxed max-w-3xl">
            <p>
              A contractor bids on a lead from HomeAdvisor. Pays $75. The
              homeowner already hired someone. He bids again next week. Same
              thing. By the end of the month, he&apos;s out $400 and hasn&apos;t
              landed a job. That&apos;s not a bad week — that&apos;s how the
              whole system was designed. Pay to play, whether you win or not.
            </p>
            <p>
              On the other side, a homeowner posts her bathroom remodel and gets
              six calls in two hours. None of them actually looked at the job.
              The estimates range from $4,000 to $18,000. She has no idea who to
              trust or why the numbers are so far apart. She ends up picking the
              guy in the middle and hoping for the best.
            </p>
            <p>
              FairTradeWorker exists because both of those people deserved
              better. Contractors should earn work on merit, not whoever can
              outspend the algorithm. Homeowners should get honest estimates from
              contractors who actually show up. We built a marketplace that works
              both ways — no lead fees, no mystery pricing, no games.
            </p>
          </div>

          <Separator className="my-14" />

          {/* What we believe */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              What we believe.
            </h2>
            <div className="space-y-8">
              {[
                {
                  value: "Contractors should keep what they earn.",
                  detail:
                    "No percentage cuts, no per-lead fees, no surprise charges. A flat subscription means your revenue is your revenue. The average contractor saves over $6,000 a year when they stop paying for leads.",
                },
                {
                  value: "Homeowners deserve honest estimates.",
                  detail:
                    "When bids aren't padded with lead costs, homeowners see real pricing. Our AI estimation tools give homeowners a baseline so they know what a project should cost before they hire. No more guessing who to trust.",
                },
                {
                  value: "Trust is built, not bought.",
                  detail:
                    "Every contractor on the platform goes through license verification, insurance confirmation, and identity checks. Reviews come from completed, escrow-verified jobs — not anonymous posts. You earn your reputation through work, not ad spend.",
                },
                {
                  value: "The best contractor for the job should get the job.",
                  detail:
                    "We don't sell priority placement to the highest bidder. Smart matching connects homeowners with contractors based on skills, location, availability, and track record. The contractor who's right for the job is the one who shows up in the feed.",
                },
              ].map((item) => (
                <div
                  key={item.value}
                  className="border-l-4 border-brand-600 pl-5"
                >
                  <p className="text-lg font-medium text-gray-900">
                    {item.value}
                  </p>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed max-w-2xl">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-14" />

          {/* How it's different */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What makes this different.
            </h2>
            <p className="text-gray-800 leading-relaxed max-w-3xl mb-8">
              Most construction marketplaces make money by selling leads. That
              model creates bad incentives — the platform benefits when
              contractors compete to spend more, not when they do better work.
              We flipped the model.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Flat-rate subscription",
                  desc: "Contractors pay a predictable monthly fee. No lead costs, no commissions, no per-bid charges. Homeowners use the platform for free.",
                },
                {
                  title: "Escrow on every job",
                  desc: "Homeowner funds are held in escrow until work is verified. Contractors get paid on time. Disputes are resolved within 5 business days.",
                },
                {
                  title: "AI estimation tools",
                  desc: "ConstructionAI generates detailed cost breakdowns trained on real construction data. Hunter builds estimates by voice in three minutes. These aren't generic calculators — they're built for the trades.",
                },
                {
                  title: "Verification, not volume",
                  desc: "Every contractor is license-checked, insurance-verified, and identity-confirmed. We'd rather have 500 verified contractors than 5,000 unvetted ones flooding homeowner feeds.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-surface rounded-none p-6">
                  <p className="text-sm font-bold text-gray-900 mb-2">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-14" />

          {/* Team */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Built in Mississippi. By people who&apos;ve swung a hammer.
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed max-w-3xl">
              <p>
                We&apos;re a small team based in Oxford, Mississippi. Some of us came from
                construction — years on job sites, running crews, dealing with
                the same broken platforms we&apos;re replacing. Some of us came
                from software — building products at scale, shipping things that
                actually work. All of us got tired of watching a good industry
                get exploited by bad marketplaces.
              </p>
              <p>
                We&apos;re starting in Mississippi because it&apos;s what we
                know. Small markets where contractors know each other, where
                reputation actually matters, and where the trades are
                completely underserved by technology. We&apos;re building
                density market by market — North Mississippi first, then
                the rest of the state, then the Southeast.
              </p>
            </div>
          </section>

          <Separator className="my-14" />

          {/* CTA */}
          <section className="bg-dark rounded-none p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to see it for yourself?
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create a free account in under two minutes. No credit card
              required. See why contractors and homeowners are switching.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500"
                asChild
              >
                <Link href="/contact">Talk to Us</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
