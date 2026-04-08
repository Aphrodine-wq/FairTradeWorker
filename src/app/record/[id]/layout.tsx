import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contractor FairRecord",
  description: "View this contractor's verified work history, reviews, and credentials on FairTradeWorker.",
  openGraph: {
    title: "Contractor FairRecord | FairTradeWorker",
    description: "Verified work history, reviews, and credentials.",
  },
};

export default function RecordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
