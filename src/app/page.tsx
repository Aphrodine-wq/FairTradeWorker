import Link from "next/link";
import {
  Mic,
  DollarSign,
  Shield,
  ArrowRight,
  ShieldCheck,
  Lock,
  BadgeCheck,
  CreditCard,
} from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Hero } from "@marketplace/components/hero";
import { StatsBar } from "@marketplace/components/stats-bar";
import { CTASection } from "@marketplace/components/cta-section";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF8]">
      <Navbar />
      <main>
        <Hero />
        <StatsBar />

        {/* Features preview */}
        <section className="bg-white py-20 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-3">
                Why FairTradeWorker
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                The tools you actually need.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-border rounded-xl p-8">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                  <DollarSign className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  $0 lead fees
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Flat subscription. No commissions, no per-lead charges.
                  Contractors save $6,000+/year on average.
                </p>
              </div>

              <div className="border border-border rounded-xl p-8">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Escrow on every job
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Homeowners fund milestones upfront. Contractors get paid when
                  work is verified. No chasing invoices.
                </p>
              </div>

              <div className="border border-border rounded-xl p-8">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                  <Mic className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  AI estimates in 3 minutes
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Talk through the scope on-site. Hunter builds a full line-item
                  estimate by voice. Review, edit, send.
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

        {/* How it works preview */}
        <section className="bg-surface py-20 border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-3">
                How It Works
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                Simple for both sides.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-border">
                  For Contractors
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">1</span>
                    </span>
                    <p className="text-sm text-gray-600">
                      Sign up, get verified, start browsing jobs in your area.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">2</span>
                    </span>
                    <p className="text-sm text-gray-600">
                      Bid on projects with detailed estimates. Win the job.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">3</span>
                    </span>
                    <p className="text-sm text-gray-600">
                      Do the work. Escrow releases when it's verified.
                    </p>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-border">
                  For Homeowners
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">1</span>
                    </span>
                    <p className="text-sm text-gray-600">
                      Post your project. Takes two minutes.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">2</span>
                    </span>
                    <p className="text-sm text-gray-600">
                      Review bids from verified contractors. Compare and message.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">3</span>
                    </span>
                    <p className="text-sm text-gray-600">
                      Hire, fund escrow, release payment when satisfied.
                    </p>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-10">
              <Button variant="outline" asChild>
                <Link href="/how-it-works" className="inline-flex items-center gap-2">
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
                <blockquote className="text-2xl sm:text-3xl text-gray-800 italic leading-relaxed max-w-3xl">
                  No lead fees, quality homeowners, and the Voice AI saves me
                  hours every week. I&apos;ve grown my business 40% since
                  joining.
                </blockquote>
                <p className="mt-6 text-sm text-gray-500">
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
            <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">
              Built on tools you already trust
            </p>

            {/* Integration logos */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 mb-12">
              <div className="flex items-center gap-2 text-gray-400">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">QuickBooks</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <BadgeCheck className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">Persona ID</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">Checkr</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Lock className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">256-bit SSL</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <ShieldCheck className="w-8 h-8 text-brand-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  Every contractor verified
                </h4>
                <p className="text-xs text-gray-500">
                  License, insurance, and background checks before they can bid.
                </p>
              </div>
              <div className="text-center">
                <Lock className="w-8 h-8 text-brand-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  Escrow-protected payments
                </h4>
                <p className="text-xs text-gray-500">
                  Funds held securely until work is verified. No chasing invoices.
                </p>
              </div>
              <div className="text-center">
                <BadgeCheck className="w-8 h-8 text-brand-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  FairTrade Promise
                </h4>
                <p className="text-xs text-gray-500">
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
