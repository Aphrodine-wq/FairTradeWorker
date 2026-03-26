import type { Metadata } from "next";
import { Toaster } from "@shared/ui/toaster";
import { CookieConsent } from "@shared/components/cookie-consent";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fairtradeworker.com"),
  title: {
    default: "FairTradeWorker - The Fair Way to Find and Hire Contractors",
    template: "%s | FairTradeWorker",
  },
  description:
    "Two-sided marketplace connecting homeowners with verified contractors. No lead fees. Fair pricing. Transparent estimates.",
  openGraph: {
    type: "website",
    siteName: "FairTradeWorker",
    title: "FairTradeWorker - The Fair Way to Find and Hire Contractors",
    description:
      "Two-sided marketplace connecting homeowners with verified contractors. No lead fees. Fair pricing. Transparent estimates.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FairTradeWorker",
    description:
      "Two-sided marketplace connecting homeowners with verified contractors. No lead fees. Fair pricing.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
