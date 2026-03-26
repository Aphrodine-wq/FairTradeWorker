import type { Metadata } from "next";
import { Navbar } from "@marketplace/components/navbar";
import { Testimonials } from "@marketplace/components/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "See what homeowners and contractors are saying about FairTradeWorker.",
};
import { CTASection } from "@marketplace/components/cta-section";
import { Footer } from "@marketplace/components/footer";

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF8]">
      <Navbar />
      <main className="pt-16">
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
