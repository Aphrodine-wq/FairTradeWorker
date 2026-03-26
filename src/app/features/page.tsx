import { Navbar } from "@marketplace/components/navbar";
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
