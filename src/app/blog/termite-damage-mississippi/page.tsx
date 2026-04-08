import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "Termite Damage in Mississippi: What Every Homeowner Needs to Know",
  description:
    "Mississippi ranks #3 in the US for termite risk. Learn the signs of termite damage, treatment costs ($500-$2,500), repair costs, and how to protect your home.",
  openGraph: {
    title: "Termite Damage in Mississippi: What Every Homeowner Needs to Know | FairTradeWorker",
    description: "Mississippi ranks #3 in the US for termite risk. Learn the signs, costs, and how to protect your home.",
    type: "article",
    publishedTime: "2026-04-03T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/termite-damage-mississippi" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Termite Damage in Mississippi: What Every Homeowner Needs to Know",
  description: "Mississippi ranks #3 in the US for termite risk. Learn the signs, treatment costs, and how to protect your home.",
  datePublished: "2026-04-03",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/termite-damage-mississippi",
};

export default function TermiteDamageMississippiPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#FAFAFA] min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }} />
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Link href="/blog" className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 mb-8">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to blog
          </Link>

          <header>
            <span className="text-sm font-semibold text-brand-600">Guides</span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Termite Damage in Mississippi: What Every Homeowner Needs to Know
            </h1>
            <p className="text-gray-700 mt-2">April 3, 2026</p>
          </header>

          <div className="mt-10 prose prose-gray max-w-none space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Mississippi ranks third in the entire country for termite risk, right behind Florida and Louisiana. The warm, humid climate and heavy clay soil across most of the state create perfect conditions for subterranean termites — the species that causes over 90% of structural termite damage in the US.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you own a home in Mississippi and you're not thinking about termites, you need to start. Here's what to watch for, what it costs, and what to do about it.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Know what you're dealing with</h2>
            <p className="text-gray-700 leading-relaxed">
              Eastern subterranean termites are the main threat in Mississippi. They live in the soil and build mud tubes up your foundation to reach the wood in your home. Unlike drywood termites out west, you won't see them eating your furniture — they work from the ground up, targeting floor joists, sill plates, and wall studs. They can be active for years before you notice anything.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Signs of termite damage</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Mud tubes</strong> on your foundation walls are the most obvious sign. These pencil-width tunnels run from the soil up to your wood framing. Check your crawl space, basement walls, and around pipe penetrations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Hollow-sounding wood</strong> when you tap on baseboards or door frames means they've already been eating. <strong>Swarmers</strong> — winged termites that show up in spring, usually March through May in Mississippi — mean there's a mature colony nearby. If you see a swarm inside your house, that colony is almost certainly in your walls.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Other signs include bubbling or peeling paint, sagging floors, and doors or windows that suddenly stick. By the time most homeowners notice these symptoms, the damage is already significant.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Treatment costs</h2>
            <p className="text-gray-700 leading-relaxed">
              A liquid barrier treatment for an average Mississippi home runs <strong>$500 to $1,500</strong>. Bait station systems cost <strong>$1,200 to $2,500</strong> with annual monitoring fees of $200-$400. Tent fumigation, which is rare for subterranean termites, can run $3,000+. Most homes in Mississippi need a liquid treatment or bait system, not fumigation.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Repair costs</h2>
            <p className="text-gray-700 leading-relaxed">
              This is where it gets expensive. The average termite damage repair in Mississippi runs <strong>$3,000 to $8,000</strong>. That typically covers replacing damaged floor joists, sill plates, and subfloor sections. Severe cases — where structural beams or load-bearing walls are compromised — can push past $15,000. Homeowner's insurance almost never covers termite damage because it's classified as a maintenance issue.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Why annual inspections matter</h2>
            <p className="text-gray-700 leading-relaxed">
              A professional termite inspection costs $75-$150 and takes about an hour. Compared to a $6,000 repair bill, that's the cheapest insurance you can buy. Mississippi law requires a termite inspection for most real estate transactions, but you shouldn't wait until you sell to get one. Annual inspections catch colonies before they cause real damage.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Find verified pest control on FTW</h2>
            <p className="text-gray-700 leading-relaxed">
              Post your termite inspection or treatment project on FairTradeWorker and get bids from verified pest control professionals in your area. Every contractor on the platform carries current licensing and insurance. Use the <Link href="/fairprice" className="text-brand-600 font-medium hover:underline">FairPrice Estimator</Link> to see what treatment should cost for your home before you commit to anything.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-gray-700 mb-4">Need a termite inspection or treatment bid?</p>
            <Button asChild>
              <Link href="/signup?role=homeowner">Post Your Project Free</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
