import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const avatarData = [
  { initials: "MJ", bg: "bg-brand-600" },
  { initials: "SC", bg: "bg-blue-600" },
  { initials: "RG", bg: "bg-purple-600" },
  { initials: "JM", bg: "bg-amber-600" },
  { initials: "LT", bg: "bg-rose-600" },
];

export function Hero() {
  return (
    <section className="relative bg-white pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Subtle dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #E5E7EB 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.5,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge pill */}
        <div className="inline-flex items-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-sm font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0" />
            No Lead Fees. Ever.
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 text-balance max-w-4xl mx-auto leading-[1.08]">
          The Fair Way to{" "}
          <span className="text-brand-600">Find and Hire</span>{" "}
          Contractors
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto text-balance leading-relaxed">
          FairTradeWorker connects homeowners with verified, licensed contractors
          — no bidding wars, no lead fees, no middleman markups. Get honest
          estimates and hire with confidence.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup?role=homeowner" className="gap-2">
              Find a Contractor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup?role=contractor">
              I&apos;m a Contractor
            </Link>
          </Button>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Overlapping avatars */}
          <div className="flex items-center -space-x-2">
            {avatarData.map((avatar) => (
              <div
                key={avatar.initials}
                className={cn(
                  "w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                  avatar.bg
                )}
              >
                {avatar.initials}
              </div>
            ))}
          </div>
          <p className="text-sm font-medium text-gray-600">
            Trusted by{" "}
            <span className="text-gray-900 font-bold">3,200+</span> verified
            contractors across Texas
          </p>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium tracking-wide uppercase">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Licensed &amp; Verified
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Escrow Protected
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Zero Hidden Fees
          </span>
        </div>
      </div>
    </section>
  );
}

// inline cn since this is a server component that doesn't import it
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
