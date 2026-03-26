import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free for homeowners. Contractor plans starting at $49/mo. No lead fees, no hidden costs.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
