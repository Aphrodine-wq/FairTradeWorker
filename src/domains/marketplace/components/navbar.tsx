"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@shared/components/brand-mark";
import { authStore } from "@shared/lib/auth-store";
import type { MarketingSession } from "@shared/lib/marketing-nav";
import { parseMarketingSessionFromFtwToken, readFtwTokenFromDocumentCookie } from "@shared/lib/marketing-nav";
import { MobileNav } from "./mobile-nav";
import { NavbarAuthCluster } from "./navbar-auth-cluster";

function computeNavbarSession(): MarketingSession | null {
  const st = authStore.getState();
  if (st.token && st.user) {
    return { kind: "real", role: st.user.role };
  }
  return parseMarketingSessionFromFtwToken(readFtwTokenFromDocumentCookie());
}

export function Navbar() {
  const [session, setSession] = useState<MarketingSession | null>(null);

  useEffect(() => {
    const sync = () => setSession(computeNavbarSession());
    sync();
    return authStore.subscribe(sync);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-150 flex-shrink-0">
            <BrandMark className="w-10 h-10" />
            <span className="text-2xl font-bold text-gray-900">FairTradeWorker</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">Features</Link>
            <Link href="/how-it-works" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">How It Works</Link>
            <Link href="/pricing" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">Pricing</Link>
            <Link href="/fairprice" className="text-base font-semibold text-brand-600 hover:text-brand-700 transition-colors duration-150">FairPrice</Link>
            <Link href="/about" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">About</Link>
            <Link href="/faq" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">FAQ</Link>
          </nav>

          <div className="flex items-center gap-4">
            <NavbarAuthCluster session={session} desktopClassName="hidden md:flex" />
            <MobileNav session={session} />
          </div>
        </div>
      </div>
    </header>
  );
}
