import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Frequently asked questions about FairTradeWorker for homeowners and contractors. Pricing, plans, escrow payments, contractor verification, and more.",
  alternates: {
    canonical: "/faq",
  },
};

// Hardcoded FAQ pairs for JSON-LD (mirrors FAQ_CATEGORIES in page.tsx)
const FAQ_SCHEMA_ITEMS = [
  { q: "How much does FairTradeWorker cost?", a: "For contractors, we offer four plans: Free, Solo at $29/month, Team at $79/month, and Enterprise at $149/month. Homeowners can use the platform for free, or upgrade to Plus at $9/month." },
  { q: "How is this different from HomeAdvisor or Thumbtack?", a: "FairTradeWorker runs on flat-rate subscriptions. No lead fees. No percentage cuts. The average contractor saves over $6,000 a year switching from lead-fee platforms." },
  { q: "Is there really a free plan?", a: "Yes. The Free plan includes unlimited job posting, unlimited manual estimates, direct messaging, escrow payments, project tracking, reviews, and community access." },
  { q: "How does escrow work?", a: "When a homeowner accepts a bid, they fund an escrow account. The money sits safely until milestones are hit and both parties confirm. No more chasing checks." },
  { q: "Do I need a license to join?", a: "Requirements vary by trade and location. We verify license status during onboarding. Unlicensed trades go through identity and insurance verification instead." },
  { q: "How does contractor verification work?", a: "Every contractor goes through identity verification, license checks, insurance confirmation, and work history review. Most are verified within 24 hours." },
  { q: "What is ConstructionAI?", a: "ConstructionAI is our custom-trained estimation model built on real construction data. It generates detailed cost breakdowns with material, labor, and equipment costs." },
  { q: "Do homeowners pay anything?", a: "The core platform is free. A 3% service fee applies to escrow payments. The optional Plus plan at $9/month adds priority matching and advanced tools." },
  { q: "Can I use FairTradeWorker outside of Mississippi?", a: "We're currently focused on Mississippi, expanding statewide, with neighboring Southeast states planned for late 2026." },
  { q: "Do you have a mobile app?", a: "The platform works great on mobile browsers. A dedicated mobile app with push notifications and voice estimation is in development." },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_SCHEMA_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
