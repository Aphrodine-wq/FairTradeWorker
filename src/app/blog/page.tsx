import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@marketplace/components/navbar";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips, guides, and insights for homeowners and contractors on the FairTradeWorker blog.",
  openGraph: {
    title: "Blog | FairTradeWorker",
    description: "Tips, guides, and insights for homeowners and contractors on the FairTradeWorker blog.",
  },
  alternates: {
    canonical: "/blog",
  },
};
import { Footer } from "@marketplace/components/footer";
import { Separator } from "@shared/ui/separator";

const POSTS = [
  {
    title: "How to Get More Clients as a Contractor in Mississippi",
    slug: "/blog/how-to-get-more-clients-contractor",
    date: "Apr 6, 2026",
    category: "Business",
    excerpt:
      "Why word of mouth alone doesn't scale, how lead-fee platforms eat your margins, and how FairTradeWorker's bid model works differently.",
  },
  {
    title: "Roof Replacement Cost in Mississippi: Complete 2026 Guide",
    slug: "/blog/roof-replacement-cost-mississippi",
    date: "Apr 5, 2026",
    category: "Cost Guide",
    excerpt:
      "Asphalt, metal, or tile? Real roof replacement costs for Mississippi homeowners, plus what insurance covers after storm damage.",
  },
  {
    title: "HVAC Installation Cost in Mississippi: What to Expect",
    slug: "/blog/hvac-installation-cost-mississippi",
    date: "Apr 4, 2026",
    category: "Cost Guide",
    excerpt:
      "Central AC, heat pump, or mini-split? What each system costs in Mississippi and why SEER ratings matter more here than anywhere.",
  },
  {
    title: "Termite Damage in Mississippi: What Every Homeowner Needs to Know",
    slug: "/blog/termite-damage-mississippi",
    date: "Apr 3, 2026",
    category: "Guides",
    excerpt:
      "Mississippi is #3 in the US for termite risk. Here's what to look for, what treatment costs, and why annual inspections are non-negotiable.",
  },
  {
    title: "Subcontractor Survival Guide: Finding Steady Work in Mississippi",
    slug: "/blog/subcontractor-guide-mississippi",
    date: "Apr 2, 2026",
    category: "Business",
    excerpt:
      "The sub's dilemma: feast or famine. How to diversify GC relationships, get paid on time, and build a reputation that keeps the pipeline full.",
  },
  {
    title: "How Much Does a Kitchen Remodel Cost in Mississippi?",
    slug: "/blog/how-much-kitchen-remodel-mississippi",
    date: "Apr 1, 2026",
    category: "Cost Guide",
    excerpt:
      "From a $10K refresh to a $50K gut renovation — real kitchen remodel costs for Mississippi homeowners and what drives the price.",
  },
  {
    title: "Mississippi Summer HVAC Guide: Keep Cool Without Going Broke",
    slug: "/blog/hvac-maintenance-mississippi-summer",
    date: "Mar 28, 2026",
    category: "Seasonal",
    excerpt:
      "95-degree summers with brutal humidity. Why spring maintenance saves you money, and when to repair vs replace your system.",
  },
  {
    title: "Bathroom Remodel Cost in Mississippi: What to Budget",
    slug: "/blog/bathroom-remodel-cost-guide",
    date: "Mar 25, 2026",
    category: "Cost Guide",
    excerpt:
      "Half bath refresh to master bath gut renovation. Real costs, what drives the price, and how to get fair bids in Mississippi.",
  },
  {
    title: "How to Price Construction Jobs Without Losing Money (or Clients)",
    slug: "/blog/contractor-pricing-guide",
    date: "Mar 22, 2026",
    category: "Business",
    excerpt:
      "Common pricing mistakes, real overhead math, markup vs margin, and how to stay competitive without racing to the bottom.",
  },
  {
    title: "How to Hire a Contractor in Mississippi (Without Getting Burned)",
    slug: "/blog/hiring-contractor-checklist",
    date: "Mar 20, 2026",
    category: "Guides",
    excerpt:
      "License check, insurance verification, written bids, escrow. The complete checklist for hiring a contractor in Mississippi.",
  },
  {
    title: "Growing a Construction Business in Mississippi: What Actually Works",
    slug: "/blog/grow-construction-business-mississippi",
    date: "Mar 18, 2026",
    category: "Business",
    excerpt:
      "Hiring, licensing, recurring revenue, online presence, and why the platform model beats the Craigslist/Facebook approach in Mississippi.",
  },
  {
    title: "Why We're Killing Lead Fees",
    slug: "/blog/killing-lead-fees",
    date: "Mar 15, 2026",
    category: "Company",
    excerpt:
      "Lead fees were supposed to connect contractors with homeowners. Instead, they became a tax on showing up.",
  },
  {
    title: "Storm Damage in Mississippi: What to Do About Your Roof",
    slug: "/blog/storm-damage-roof-mississippi",
    date: "Mar 12, 2026",
    category: "Seasonal",
    excerpt:
      "Storm season is March through May. What to do after damage, how to file claims, and how to avoid storm chaser scams.",
  },
  {
    title: "Why Escrow Payments Are a Game Changer for Subcontractors",
    slug: "/blog/escrow-payments-for-subs",
    date: "Mar 10, 2026",
    category: "Guides",
    excerpt:
      "How escrow payments solve the biggest problem in subcontracting: getting paid on time. Real math showing cash flow improvement.",
  },
  {
    title: "Voice AI: How Hunter Builds Estimates in 3 Minutes",
    slug: "/blog/hunter-voice-ai",
    date: "Mar 8, 2026",
    category: "Product",
    excerpt:
      "Walk through a scope out loud on the job site and get a structured estimate before you're back in the truck.",
  },
  {
    title: "5 Ways to Make Your Mississippi Home More Energy Efficient",
    slug: "/blog/energy-efficient-home-mississippi",
    date: "Mar 5, 2026",
    category: "Guides",
    excerpt:
      "Attic insulation, window replacement, heat pumps, air sealing, smart thermostats. Cost and ROI for each in Mississippi's climate.",
  },
  {
    title: "Escrow Payments: What Contractors Need to Know",
    slug: "/blog/escrow-payments-guide",
    date: "Feb 28, 2026",
    category: "Guides",
    excerpt:
      "Getting paid on time is one of the biggest problems in construction. Escrow gives contractors leverage too.",
  },
  {
    title: "First-Time Homeowner in Mississippi? Here's What Needs Fixing First",
    slug: "/blog/first-time-homeowner-mississippi",
    date: "Feb 20, 2026",
    category: "Guides",
    excerpt:
      "Termite inspection, HVAC service, roof check, plumbing test, electrical upgrade. Priority order for new Mississippi homeowners.",
  },
  {
    title: "Fence Installation Cost in Mississippi: Materials and Prices",
    slug: "/blog/fence-cost-mississippi",
    date: "Mar 30, 2026",
    category: "Cost Guide",
    excerpt:
      "Wood, vinyl, chain-link, aluminum — what each fence type costs in Mississippi and why termite resistance matters here.",
  },
  {
    title: "Mississippi Launch: Building Density Market by Market",
    slug: "/blog/mississippi-launch",
    date: "Feb 15, 2026",
    category: "News",
    excerpt:
      "We're not going national on day one. Here's why we're building density in Mississippi first.",
  },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Company: "bg-gray-100 text-gray-800",
  Product: "bg-brand-50 text-brand-700",
  Guides: "bg-blue-50 text-blue-700",
  News: "bg-amber-50 text-amber-700",
  "Cost Guide": "bg-emerald-50 text-emerald-700",
  Seasonal: "bg-orange-50 text-orange-700",
  Business: "bg-violet-50 text-violet-700",
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
          <p className="mt-4 text-lg text-gray-700">
            Tips, stories, and updates from the FairTradeWorker team.
          </p>

          <Separator className="my-12" />

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {POSTS.map((post) => (
              <Link
                key={post.title}
                href={post.slug}
                className="group block border border-gray-100 rounded-sm p-7 hover:border-gray-200 hover:shadow-sm transition-all duration-150"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-sm ${
                      CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-600">{post.date}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-brand-600 transition-colors mb-3">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>


        </div>
      </main>

      <Footer />
    </div>
  );
}
