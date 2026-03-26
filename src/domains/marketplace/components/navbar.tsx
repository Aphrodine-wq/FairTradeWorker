import Link from "next/link";
import { Button } from "@shared/ui/button";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDFBF8]/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-base font-bold text-gray-900 hover:text-gray-700 transition-colors duration-150 flex-shrink-0">
            FairTradeWorker
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150">Features</Link>
            <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150">How It Works</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150">Pricing</Link>
            <Link href="/fairprice" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors duration-150">FairPrice</Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150">About</Link>
            <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150">FAQ</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150">
              Log In
            </Link>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
