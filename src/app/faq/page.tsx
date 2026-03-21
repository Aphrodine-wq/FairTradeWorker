"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Separator } from "@shared/ui/separator";

const FAQ_ITEMS = [
  {
    q: "How much does FairTradeWorker cost?",
    a: "For contractors, we offer three plans: Starter (free forever), Pro at $49/month, and Enterprise at $149/month. Homeowners always use the platform for free — no fees, ever. We make money on subscriptions, not on selling your leads.",
  },
  {
    q: "How is this different from HomeAdvisor or Thumbtack?",
    a: "Lead-fee platforms charge contractors $20–$100 per lead, regardless of whether they win the job. That cost gets passed to homeowners in inflated bids. FairTradeWorker runs on flat-rate subscriptions — contractors pay a predictable monthly fee and keep everything they earn. No lead fees. No percentage cuts.",
  },
  {
    q: "Do I need a license to join as a contractor?",
    a: "Requirements vary by trade and location. We verify license status during onboarding for trades that require it in Texas. You'll need to provide your license number and we confirm it against state records. Unlicensed trades are also welcome — they go through identity and insurance verification instead.",
  },
  {
    q: "How does escrow work?",
    a: "When a homeowner accepts a bid, they fund an escrow account tied to the project. The money sits safely with our payment processor until milestones are hit and both parties confirm the work. Funds are released on your schedule — by phase, by completion, or however you structure the contract. No more chasing checks.",
  },
  {
    q: "Can I use FairTradeWorker outside of Texas?",
    a: "Right now we're focused on Texas — it's where we're building density and vetting our model. We're planning to expand to the broader Southwest in late 2026. If you're outside Texas, you can sign up on the waitlist and we'll notify you when your area goes live.",
  },
  {
    q: "How does the Voice AI estimator work?",
    a: "Hunter is our voice AI built for contractors on job sites. You describe the scope of work out loud — materials, labor, timeline — and Hunter builds a structured estimate in real time. You can review and edit it before sending. It works on your phone, no typing required. Available on Pro and Enterprise plans.",
  },
  {
    q: "What happens if there's a dispute?",
    a: "Both parties can open a dispute through the platform at any time during an active project. Our support team reviews the project record, messages, photos, and contract terms to make a determination. Escrow funds are held until the dispute is resolved. We aim to close disputes within 5 business days.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "You can cancel anytime from your account settings — no phone calls, no hoops. Your subscription stays active through the end of your billing period. We don't do prorated refunds, but we won't charge you again after you cancel.",
  },
  {
    q: "Do homeowners pay anything?",
    a: "No. Homeowners post jobs, receive bids, message contractors, and manage projects entirely for free. We believe homeowners shouldn't pay to access the people they need — that's the job of a good marketplace.",
  },
  {
    q: "How are contractors verified?",
    a: "Every contractor goes through identity verification, license checks (where applicable), insurance confirmation, and a review of their work history. Verified badges appear on contractor profiles so homeowners know exactly who they're dealing with. We update verifications annually.",
  },
  {
    q: "Can I import my existing client list?",
    a: "Yes. Enterprise plan users can import existing client contacts via CSV. We're building direct integrations with common CRM tools as well. If you need a custom import, reach out to our team and we'll work with you.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted in transit and at rest. Payment processing runs through Stripe — we never store card numbers. We don't sell your data to third parties and we don't use your job history to target ads. Your information is yours.",
  },
] as const;

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
          <p className="mt-4 text-lg text-gray-500">
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

          {/* Accordion */}
          <div className="divide-y divide-gray-100">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index}>
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="w-full flex items-start justify-between gap-4 py-6 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-brand-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pb-6">
                      <p className="text-gray-600 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
