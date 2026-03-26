import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@marketplace/components/navbar";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips, guides, and insights for homeowners and contractors on the FairTradeWorker blog.",
};
import { Footer } from "@marketplace/components/footer";
import { Separator } from "@shared/ui/separator";

const POSTS = [
  {
    title: "Why We're Killing Lead Fees",
    slug: "/blog/killing-lead-fees",
    date: "Mar 15, 2026",
    category: "Company",
    excerpt:
      "Lead fees were supposed to connect contractors with homeowners. Instead, they became a tax on showing up. Here's why we built something different.",
  },
  {
    title: "Voice AI: How Hunter Builds Estimates in 3 Minutes",
    slug: "/blog/hunter-voice-ai",
    date: "Mar 8, 2026",
    category: "Product",
    excerpt:
      "Most contractors are on a job site, not at a desk. Hunter meets them there — walk through a scope out loud and get a structured estimate before you're back in the truck.",
  },
  {
    title: "Escrow Payments: What Contractors Need to Know",
    slug: "/blog/escrow-payments-guide",
    date: "Feb 28, 2026",
    category: "Guides",
    excerpt:
      "Getting paid on time is one of the biggest problems in construction. Escrow doesn't just protect homeowners — it gives contractors leverage too. Here's how it works.",
  },
  {
    title: "Mississippi Launch: Building Density Market by Market",
    slug: "/blog/mississippi-launch",
    date: "Feb 15, 2026",
    category: "News",
    excerpt:
      "We set out to sign 500 verified contractors in our first month. We hit 1,000. Here's what we learned about what contractors actually want from a marketplace.",
  },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Company: "bg-gray-100 text-gray-600",
  Product: "bg-brand-50 text-brand-700",
  Guides: "bg-blue-50 text-blue-700",
  News: "bg-amber-50 text-amber-700",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Headline */}
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            From the field.
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Tips, stories, and updates from the FairTradeWorker team.
          </p>

          <Separator className="my-12" />

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {POSTS.map((post) => (
              <Link
                key={post.title}
                href={post.slug}
                className="group block border border-gray-100 rounded-xl p-7 hover:border-gray-200 hover:shadow-sm transition-all duration-150"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-brand-600 transition-colors mb-3">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>

          <p className="mt-14 text-sm text-gray-400">More coming soon.</p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
