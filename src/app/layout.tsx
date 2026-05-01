import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FairTradeWorker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FairTradeWorker",
    description:
      "Two-sided marketplace connecting homeowners with verified contractors. No lead fees. Fair pricing.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FairTradeWorker",
  url: "https://fairtradeworker.com",
  logo: "https://fairtradeworker.com/favicon.svg",
  description:
    "Two-sided marketplace connecting homeowners with verified contractors. No lead fees. Fair pricing. Transparent estimates.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@fairtradeworker.com",
    contactType: "customer service",
  },
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FairTradeWorker",
  url: "https://fairtradeworker.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://fairtradeworker.com/services?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {children}
        <Toaster />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
