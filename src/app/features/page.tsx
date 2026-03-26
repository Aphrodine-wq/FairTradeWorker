import type { Metadata } from "next";
import { Navbar } from "@marketplace/components/navbar";

export const metadata: Metadata = {
  title: "Features",
  description: "Discover how FairTradeWorker helps homeowners find verified contractors and helps contractors grow their business with AI-powered tools.",
};
import { Features } from "@marketplace/components/features";
import { Footer } from "@marketplace/components/footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF8]">
      <Navbar />
      <main className="pt-16">
        <Features />
      </main>
      <Footer />
    </div>
  );
}
