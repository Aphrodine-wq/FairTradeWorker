"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@shared/ui/button";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/fairprice", label: "FairPrice", accent: true },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-150"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#FAFAFA]/95 backdrop-blur-sm border-l border-border shadow-lg transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          <span className="text-base font-bold text-gray-900">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-150"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col px-4 py-4 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                link.accent
                  ? "font-medium text-brand-600 hover:bg-brand-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 pt-2 border-t border-border flex flex-col gap-3 mt-2">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150"
          >
            Log In
          </Link>
          <Button size="sm" asChild className="w-full">
            <Link href="/signup" onClick={() => setOpen(false)}>
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
