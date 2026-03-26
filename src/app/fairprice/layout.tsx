import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FairPrice Estimator",
  description: "Get an instant AI-powered cost estimate for your construction project. Free, no signup required.",
};

export default function FairPriceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
