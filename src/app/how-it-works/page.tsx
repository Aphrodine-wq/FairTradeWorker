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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            How FairTradeWorker Works
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl">
            Post a job, get bids from verified contractors, compare estimates side by side, and hire with confidence. No lead fees. No middlemen.
          </p>
        </div>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
