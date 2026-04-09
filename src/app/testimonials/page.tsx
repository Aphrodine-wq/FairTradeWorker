import type { Metadata } from "next";
import { Navbar } from "@marketplace/components/navbar";
import { Testimonials } from "@marketplace/components/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "See what homeowners and contractors are saying about FairTradeWorker.",
  openGraph: {
    title: "Testimonials | FairTradeWorker",
    description: "See what homeowners and contractors are saying about FairTradeWorker.",
  },
  alternates: {
    canonical: "/testimonials",
  },
};
import { CTASection } from "@marketplace/components/cta-section";
import { Footer } from "@marketplace/components/footer";

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            What People Are Saying
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl">
            Real feedback from homeowners and contractors across Mississippi.
          </p>
        </div>
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
