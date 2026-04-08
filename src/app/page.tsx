import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FairTradeWorker — The Fun Way to Get Home Projects Done",
  description:
    "Post your project, get real bids from verified contractors, pick the best one. No lead fees. Escrow on every job. Serving Mississippi.",
  openGraph: {
    title: "FairTradeWorker — The Fun Way to Get Home Projects Done",
    description:
      "Post your project, get real bids from verified contractors, pick the best one. No lead fees. Escrow on every job.",
    type: "website",
  },
  alternates: { canonical: "/" },
};
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  BadgeCheck,
  CreditCard,
} from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Hero } from "@marketplace/components/hero";

import { CTASection } from "@marketplace/components/cta-section";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main>
        <Hero />

        {/* New way teaser */}
        <section className="bg-white py-20 lg:py-28 border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Tired of calling around for quotes?
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
              Post your project once, get real bids from verified local
              contractors, and pick the best one.
            </p>
            <div className="mt-8">
              <Button variant="default" size="lg" asChild>
                <Link href="/new-way" className="inline-flex items-center gap-2">
                  See how it works
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="py-20 lg:py-24 border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Here's the deal.
            </h2>

            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">No lead fees. Period.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Contractors pay a flat monthly rate. No per-lead charges,
                  no inflated bids to cover platform costs.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Escrow on every job.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Money goes into escrow before work starts. Contractor
                  finishes, homeowner confirms, funds release.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Voice estimates on the job site.</h3>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Walk the job, describe the scope out loud. Hunter builds
                  a line-item estimate in three minutes.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <Button variant="outline" asChild>
                <Link href="/features" className="inline-flex items-center gap-2">
                  See all features
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Three sides of the platform */}
        <section className="bg-surface py-20 border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Built for everyone on the job.
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl">
              Homeowners, general contractors, and the subs who do the
              specialized work. Everyone has a seat at the table.
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-border">
                  Homeowners
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Post your project, get bids from verified contractors,
                  compare side by side, and hire when you're ready. Your money
                  sits in escrow until the work is done.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-border">
                  Contractors
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Browse local jobs and bid with real numbers. Win work on
                  merit, not ad spend. When you need specialized help, post
                  sub-jobs directly on the platform and let subs bid on them.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-border">
                  Subcontractors
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Electricians, plumbers, HVAC techs — the people who do the
                  specialized work. Find sub-jobs posted by GCs, bid on them,
                  and get paid through the same escrow system. No more
                  waiting 90 days for a check.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <Button variant="outline" asChild>
                <Link href="/new-way" className="inline-flex items-center gap-2">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonial preview */}
        <section className="bg-white py-20 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div
                className="absolute top-0 left-0 font-serif text-gray-100 leading-none select-none pointer-events-none"
                style={{ fontSize: "160px", lineHeight: 1 }}
                aria-hidden="true"
              >
                &ldquo;
              </div>

              <div className="relative pt-16 sm:pt-20">
                <blockquote className="text-2xl sm:text-3xl text-gray-900 italic leading-relaxed max-w-3xl">
                  I was paying Thumbtack $800 a month for leads that never
                  answered the phone. Switched to FairTradeWorker and the
                  homeowners actually want to hire you. That&apos;s the difference.
                </blockquote>
                <p className="mt-6 text-sm text-gray-700">
                  &mdash; Marcus Johnson, Johnson &amp; Sons Construction,
                  Oxford MS
                </p>
              </div>
            </div>

            <div className="mt-10">
              <Button variant="outline" asChild>
                <Link href="/testimonials" className="inline-flex items-center gap-2">
                  Read more stories
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust & integrations */}
        <section className="bg-surface py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-bold text-gray-600 uppercase tracking-widest mb-10">
              Backed by tools you already use
            </p>

            {/* Integration logos */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 mb-12">
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">QuickBooks</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BadgeCheck className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">Persona ID</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">Checkr</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Lock className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">256-bit SSL</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-sm bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-brand-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  Every contractor verified
                </h4>
                <p className="text-xs text-gray-700">
                  License, insurance, and background checks before they can bid.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-sm bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-brand-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  Escrow-protected payments
                </h4>
                <p className="text-xs text-gray-700">
                  Funds held securely until work is verified. No chasing invoices.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-sm bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <BadgeCheck className="w-6 h-6 text-brand-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  FairTrade Promise
                </h4>
                <p className="text-xs text-gray-700">
                  Zero lead fees. Transparent pricing. The best contractor wins the job.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
