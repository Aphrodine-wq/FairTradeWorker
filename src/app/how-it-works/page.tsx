import type { Metadata } from "next";
import { Navbar } from "@marketplace/components/navbar";
import { HowItWorks } from "@marketplace/components/how-it-works";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Post a job, get bids from verified contractors, compare estimates, and hire with confidence. No lead fees.",
  openGraph: {
    title: "How It Works | FairTradeWorker",
    description: "Post a job, get bids from verified contractors, compare estimates, and hire with confidence. No lead fees.",
  },
  alternates: {
    canonical: "/how-it-works",
  },
};
import { Footer } from "@marketplace/components/footer";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
