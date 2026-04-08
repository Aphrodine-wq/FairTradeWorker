import Link from "next/link";
import { BrandMark } from "@shared/components/brand-mark";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "FairPrice Estimator", href: "/fairprice" },
    { label: "Find Contractors", href: "/services" },
    { label: "FAQ", href: "/faq" },
    { label: "Blog", href: "/blog" },
  ],
  "Popular Services": [
    { label: "HVAC Contractors", href: "/services/hvac" },
    { label: "Electricians", href: "/services/electricians" },
    { label: "Plumbers", href: "/services/plumbers" },
    { label: "Roofers", href: "/services/roofers" },
    { label: "General Contractors", href: "/services/general-contractors" },
    { label: "Remodeling", href: "/services/remodeling" },
  ],
  "For Contractors": [
    { label: "Find Work", href: "/signup?role=contractor" },
    { label: "AI Estimation", href: "/fairprice" },
    { label: "Voice AI (Hunter)", href: "/pricing" },
    { label: "Escrow Payments", href: "/faq" },
    { label: "Contractor Plans", href: "/pricing" },
  ],
  "For Homeowners": [
    { label: "Post a Job", href: "/signup?role=homeowner" },
    { label: "How Escrow Works", href: "/faq" },
    { label: "Homeowner Plans", href: "/pricing" },
    { label: "Contractor Verification", href: "/faq" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#0F1419" }} className="border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-150"
            >
              <BrandMark className="w-7 h-7" />
              <span className="text-lg font-bold text-white">FairTradeWorker</span>
            </Link>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              The fair way to find and hire contractors. Flat-rate subscriptions,
              zero lead fees, escrow on every job.
            </p>
            <p className="mt-4 text-sm text-gray-300">
              <a
                href="mailto:hello@fairtradeworker.com"
                className="hover:text-white transition-colors duration-150"
              >
                hello@fairtradeworker.com
              </a>
            </p>
            <p className="text-sm text-gray-300 mt-1">Oxford, MS</p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} FairTradeWorker. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-300 hover:text-white transition-colors duration-150"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-300 hover:text-white transition-colors duration-150"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-300 hover:text-white transition-colors duration-150"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
