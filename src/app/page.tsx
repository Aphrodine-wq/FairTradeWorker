import { Navbar } from "@marketplace/components/navbar";
import { Hero } from "@marketplace/components/hero";
import { StatsBar } from "@marketplace/components/stats-bar";
import { Features } from "@marketplace/components/features";
import { HowItWorks } from "@marketplace/components/how-it-works";
import { PricingSection } from "@marketplace/components/pricing-section";
import { Testimonials } from "@marketplace/components/testimonials";
import { CTASection } from "@marketplace/components/cta-section";
import { Footer } from "@marketplace/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Features />
        <HowItWorks />
        <PricingSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
