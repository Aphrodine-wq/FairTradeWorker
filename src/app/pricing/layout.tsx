import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free for Homeowners, Flat Rate for Contractors",
  description: "Free for homeowners. Contractor plans from $29/mo. No lead fees, no commissions, no hidden costs. Compare plans and start today.",
  openGraph: {
    title: "Pricing | FairTradeWorker",
    description: "Free for homeowners. Contractor plans from $29/mo. No lead fees, no commissions.",
  },
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
