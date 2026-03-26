import { Navbar } from "@marketplace/components/navbar";
import { Testimonials } from "@marketplace/components/testimonials";
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
