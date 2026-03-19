import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="bg-dark py-20 sm:py-24 lg:py-28 relative overflow-hidden">
      {/* Subtle geometric pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 39px,
            rgba(255,255,255,0.6) 39px,
            rgba(255,255,255,0.6) 40px
          ), repeating-linear-gradient(
            90deg,
            transparent,
            transparent 39px,
            rgba(255,255,255,0.6) 39px,
            rgba(255,255,255,0.6) 40px
          )`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Overline */}
        <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-5">
          Get Started Today
        </p>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance leading-tight">
          Ready to Transform{" "}
          <span className="text-brand-400">Your Business?</span>
        </h2>

        {/* Subtext */}
        <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
          Join thousands of contractors and homeowners who are done with lead
          fees, ghost bids, and payment disputes. Start for free — no credit
          card required.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="xl" asChild>
            <Link href="/signup" className="gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button
            size="xl"
            variant="outline"
            className="border-gray-600 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-gray-500"
            asChild
          >
            <Link href="/contact" className="gap-2">
              <Phone className="w-4 h-4" />
              Talk to Sales
            </Link>
          </Button>
        </div>

        {/* Trust micro-copy */}
        <p className="mt-8 text-sm text-gray-500">
          14-day free trial on Pro. No commitment. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
