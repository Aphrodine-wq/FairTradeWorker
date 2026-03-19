import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "FairTradeWorker - The Fair Way to Find and Hire Contractors",
  description:
    "Two-sided marketplace connecting homeowners with verified contractors. No lead fees. Fair pricing. Transparent estimates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
