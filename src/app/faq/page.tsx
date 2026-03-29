"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { Separator } from "@shared/ui/separator";

const FAQ_CATEGORIES = [
  {
    title: "Pricing and Plans",
    items: [
      {
        q: "How much does FairTradeWorker cost?",
        a: "For contractors, we offer four plans: Free (everything you need to get started), Solo at $29/month (AI estimation and smart matching), Team at $79/month (multi-user accounts and advanced analytics), and Enterprise at $149/month (API access, white-label, and dedicated support). Homeowners can use the platform for free, or upgrade to Plus at $9/month for priority matching and advanced project tools. We make money on subscriptions, not on selling your leads.",
      },
      {
        q: "How is this different from HomeAdvisor or Thumbtack?",
        a: "Lead-fee platforms charge contractors $20 to $100 per lead, regardless of whether they win the job. That cost gets passed to homeowners in inflated bids. FairTradeWorker runs on flat-rate subscriptions — contractors pay a predictable monthly fee and keep everything they earn. No lead fees. No percentage cuts. The average contractor saves over $6,000 a year switching from lead-fee platforms.",
      },
      {
        q: "Is there really a free plan?",
        a: "Yes. The Free plan includes unlimited job posting, unlimited manual estimates, direct messaging, escrow payments, project tracking, reviews, and community access. You can find work, bid on jobs, and get paid without ever paying us a subscription. The paid plans unlock AI estimation, smart matching, analytics, and team features — but the core platform is fully functional on Free.",
      },
      {
        q: "What happens when my free trial ends?",
        a: "If you're on a trial of Solo, Team, or Enterprise, you'll automatically move to the Free plan when it expires. No charges, no surprises. You keep all your data, projects, and message history. You just lose access to paid features until you subscribe.",
      },
      {
        q: "Can I switch plans at any time?",
        a: "Yes. Upgrade, downgrade, or cancel whenever you want. When you upgrade, you get immediate access to new features. When you downgrade, your current billing cycle finishes before the change takes effect. No cancellation fees.",
      },
      {
        q: "Are there any lead fees or hidden charges?",
        a: "Never. Every plan is a flat-rate subscription. We don't charge per lead, per bid, or take a percentage of your job revenue. A 3% service fee applies to escrow payments to cover payment processing — that's the only additional cost, and it's the same on every plan.",
      },
    ],
  },
  {
    title: "For Contractors",
    items: [
      {
        q: "Do I need a license to join?",
        a: "Requirements vary by trade and location. We verify license status during onboarding for trades that require it in Mississippi. You'll need to provide your license number and we confirm it against state records. Unlicensed trades (handyman, general labor, etc.) are also welcome — they go through identity and insurance verification instead.",
      },
      {
        q: "How does contractor verification work?",
        a: "Every contractor goes through identity verification, license checks (where applicable), insurance confirmation, and a review of their work history. Verified badges appear on your profile so homeowners know exactly who they're dealing with. We update verifications annually. Most contractors are fully verified within 24 hours of signup.",
      },
      {
        q: "What is ConstructionAI and how does it work?",
        a: "ConstructionAI is our custom-trained estimation model built on real construction data — not generic AI. Enter the project type, description, location, and square footage, and it generates a detailed cost breakdown with material, labor, and equipment costs, CSI division breakdowns, line items, markup percentages, and confidence ranges. Available on Solo plans and above.",
      },
      {
        q: "How does the Voice AI estimator work?",
        a: "Hunter is our voice AI built for contractors on job sites. You describe the scope of work out loud — materials, labor, timeline — and Hunter builds a structured, line-item estimate in real time. You can review and edit it before sending. It works on your phone, no typing required. Average estimate time is about three minutes. Available on Solo plans and above.",
      },
      {
        q: "What's the difference between Solo and Team?",
        a: "Solo is for one contractor using the platform independently — you get AI estimation, smart matching, analytics, and branding. Team adds multi-user accounts so your crew or office staff can access shared projects, see team-wide analytics, track assignments, and coordinate through the platform. Team also includes Zapier/webhook integrations and priority support with 12-hour response.",
      },
      {
        q: "Can I import my existing client list?",
        a: "Enterprise plan users can import existing client contacts via CSV. We're building direct integrations with common CRM tools as well. If you need a custom import, reach out to our team and we'll work with you to get your data in.",
      },
    ],
  },
  {
    title: "For Homeowners",
    items: [
      {
        q: "Do homeowners pay anything?",
        a: "The core platform is completely free for homeowners — post jobs, receive bids, message contractors, and manage projects at no cost. A 3% service fee applies to escrow payments for payment processing. The optional Plus plan at $9/month adds priority contractor matching, unlimited active jobs, side-by-side bid comparison, inspection scheduling, and warranty tracking.",
      },
      {
        q: "How do I know the contractors are legitimate?",
        a: "Every contractor on FairTradeWorker goes through license verification, insurance confirmation, identity checks, and work history review before they can bid on jobs. Verified badges appear on their profiles. Reviews come from completed, escrow-verified jobs — not anonymous posts. You can also view detailed contractor history and verification reports on the Plus plan.",
      },
      {
        q: "What does priority contractor matching do?",
        a: "With Plus, your job postings are surfaced first to the highest-rated, most responsive contractors in your area. Free users still get bids, but Plus users typically see faster response times and more bids from top-tier contractors. It's the difference between casting a wide net and having the best pros come to you.",
      },
      {
        q: "How does the bid comparison tool work?",
        a: "On the Plus plan, you can view all your bids side by side in a comparison dashboard. See pricing breakdowns, contractor ratings, verification status, response times, and work history in one view. It takes the guesswork out of choosing between multiple bids.",
      },
    ],
  },
  {
    title: "Payments and Escrow",
    items: [
      {
        q: "How does escrow work?",
        a: "When a homeowner accepts a bid, they fund an escrow account tied to the project. The money sits safely with our payment processor until milestones are hit and both parties confirm the work. Funds are released on your schedule — by phase, by completion, or however you structure the contract. No more chasing checks.",
      },
      {
        q: "What happens if there's a dispute?",
        a: "Both parties can open a dispute through the platform at any time during an active project. Our support team reviews the project record, messages, photos, and contract terms to make a determination. Escrow funds are held until the dispute is resolved. We aim to close disputes within 5 business days.",
      },
      {
        q: "Is my payment information secure?",
        a: "All data is encrypted in transit and at rest. Payment processing runs through our secure payment infrastructure — we never store card numbers on our servers. We don't sell your data to third parties and we don't use your job history to target ads. Your information is yours.",
      },
    ],
  },
  {
    title: "Platform and Availability",
    items: [
      {
        q: "Can I use FairTradeWorker outside of Mississippi?",
        a: "Right now we're focused on Mississippi — starting in North Mississippi and expanding statewide. We're planning to open neighboring states in the Southeast by late 2026. If you're outside our area, sign up on the waitlist and we'll notify you when your market goes live.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "You can cancel anytime from your account settings — no phone calls, no hoops. Your subscription stays active through the end of your billing period. We don't charge cancellation fees, and your data stays intact if you decide to come back.",
      },
      {
        q: "Do you have a mobile app?",
        a: "The platform is fully responsive and works great on mobile browsers. A dedicated mobile app is in development — it will include push notifications, on-site voice estimation with Hunter, and photo capture for job documentation. We'll announce availability as we get closer to launch.",
      },
    ],
  },
] as const;

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headline */}
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Questions we actually get asked.
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            If something&apos;s not covered here, email us at{" "}
            <a
              href="mailto:hello@fairtradeworker.com"
              className="text-brand-600 font-medium hover:underline"
            >
              hello@fairtradeworker.com
            </a>
            .
          </p>

          <Separator className="my-12" />

          {/* Categorized FAQ */}
          <div className="space-y-12">
            {FAQ_CATEGORIES.map((category) => (
              <section key={category.title}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {category.title}
                </h2>
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                  {category.items.map((item) => {
                    const key = `${category.title}-${item.q}`;
                    const isOpen = openIndex === key;
                    return (
                      <div key={key}>
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          className="w-full flex items-start justify-between gap-4 py-5 text-left group"
                          aria-expanded={isOpen}
                        >
                          <span className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                            {item.q}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5 transition-transform duration-200 ${
                              isOpen ? "rotate-180 text-brand-600" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="pb-5">
                            <p className="text-gray-800 leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <Separator className="my-14" />

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-700 mb-6 max-w-md mx-auto">
              We&apos;re a real team, not a chatbot. Reach out and we&apos;ll
              get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
