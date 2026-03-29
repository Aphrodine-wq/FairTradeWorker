import Link from "next/link";
import { Button } from "@shared/ui/button";
import { BrandMark } from "@shared/components/brand-mark";
import { MobileNav } from "./mobile-nav";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-150 flex-shrink-0">
            <BrandMark className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">FairTradeWorker</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">Features</Link>
            <Link href="/how-it-works" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">How It Works</Link>
            <Link href="/pricing" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">Pricing</Link>
            <Link href="/fairprice" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors duration-150">FairPrice</Link>
            <Link href="/about" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">About</Link>
            <Link href="/faq" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">FAQ</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">
              Log In
            </Link>
            <Button size="sm" asChild className="hidden md:inline-flex">
              <Link href="/signup">Get Started</Link>
            </Button>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
