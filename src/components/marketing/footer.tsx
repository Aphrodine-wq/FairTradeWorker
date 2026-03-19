import Link from "next/link";
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

const footerLinks = {
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "API", href: "/api-docs" },
    { label: "Integrations", href: "/integrations" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
];

export function Footer() {
  return (
    <footer className="bg-dark border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Top section: logo + links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-2">
            <Link
              href="/"
              className="text-xl font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              FairTradeWorker
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
              The fair way to find and hire contractors. Zero lead fees.
              Verified pros. Escrow payments. Built in Texas.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
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
                      className="text-sm text-gray-400 hover:text-white transition-colors"
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
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FairTradeWorker. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
