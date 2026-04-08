import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FairPrice Estimator — Free AI Construction Cost Estimates",
  description: "Get an instant AI-powered cost estimate for any construction project. Material, labor, and equipment breakdowns. Free, no signup required.",
  openGraph: {
    title: "FairPrice Estimator | FairTradeWorker",
    description: "Instant AI-powered construction cost estimates. Free, no signup required.",
  },
  alternates: { canonical: "/fairprice" },
};

export default function FairPriceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
