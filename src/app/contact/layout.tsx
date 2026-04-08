import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the FairTradeWorker team. Questions about posting a job, contractor plans, or partnerships — we respond within 24 hours.",
  openGraph: {
    title: "Contact Us | FairTradeWorker",
    description: "Get in touch with the FairTradeWorker team. We respond within 24 hours.",
  },
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
