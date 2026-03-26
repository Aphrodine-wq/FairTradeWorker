import { Navbar } from "@marketplace/components/navbar";
import { Hero } from "@marketplace/components/hero";
import { StatsBar } from "@marketplace/components/stats-bar";
import { CTASection } from "@marketplace/components/cta-section";
import { Footer } from "@marketplace/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF8]">
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
