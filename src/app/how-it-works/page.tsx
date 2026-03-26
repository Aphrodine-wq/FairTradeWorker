import { Navbar } from "@marketplace/components/navbar";
import { HowItWorks } from "@marketplace/components/how-it-works";
import { Footer } from "@marketplace/components/footer";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF8]">
      <Navbar />
      <main className="pt-16">
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
