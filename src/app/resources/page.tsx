import type { Metadata } from "next";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { FileText, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides, reports, and brand assets for FairTradeWorker contractors, homeowners, and partners.",
  openGraph: {
    title: "Resources | FairTradeWorker",
    description:
      "Guides, reports, and brand assets for FairTradeWorker contractors, homeowners, and partners.",
  },
  alternates: { canonical: "/resources" },
};

const DOCS = [
  {
    title: "Contractor Onboarding Guide",
    description:
      "Everything you need to create your profile, get verified, and start winning jobs on FairTradeWorker.",
    href: "/docs/FairTradeWorker_Contractor_Guide.pdf",
    audience: "Contractors",
  },
  {
    title: "Homeowner Guide",
    description:
      "How to post a project, compare bids, and pay safely through escrow.",
    href: "/docs/FairTradeWorker_Homeowner_Guide.pdf",
    audience: "Homeowners",
  },
  {
    title: "Media Kit & Brand Guide",
    description:
      "Brand colors, logo usage guidelines, messaging, and press information.",
    href: "/docs/FairTradeWorker_Media_Kit.pdf",
    audience: "Press & Partners",
  },
  {
    title: "Investor Overview",
    description:
      "Market opportunity, business model, traction, and competitive advantages.",
    href: "/docs/FairTradeWorker_Pitch_Deck.pdf",
    audience: "Investors",
  },
  {
    title: "SEO & Site Health Report",
    description:
      "Full-site analysis of 10,238 pages. Technical SEO health, architecture breakdown, and growth opportunities.",
    href: "/docs/FairTradeWorker_SEO_Site_Report.pdf",
    audience: "Internal",
  },
] as const;

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Resources
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl">
            Guides and documents for contractors, homeowners, and partners.
          </p>

          <div className="mt-12 space-y-4">
            {DOCS.map((doc) => (
              <a
                key={doc.href}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 rounded-sm border border-gray-200 hover:border-brand-600 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-brand-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                      {doc.title}
                    </h2>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm">
                      {doc.audience}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {doc.description}
                  </p>
                </div>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors flex-shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
