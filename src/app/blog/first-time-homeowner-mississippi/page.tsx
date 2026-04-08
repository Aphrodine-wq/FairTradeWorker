import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";

export const metadata: Metadata = {
  title: "First-Time Homeowner in Mississippi? Here's What Needs Fixing First",
  description:
    "Just bought a home in Mississippi? Here's the priority order for inspections and maintenance — termites, HVAC, roof, plumbing, electrical, and insulation.",
  openGraph: {
    title: "First-Time Homeowner in Mississippi? Here's What Needs Fixing First | FairTradeWorker",
    description: "Priority maintenance checklist for new Mississippi homeowners. What to inspect and fix first.",
    type: "article",
    publishedTime: "2026-02-20T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/first-time-homeowner-mississippi" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "First-Time Homeowner in Mississippi? Here's What Needs Fixing First",
  description: "Priority maintenance checklist for new Mississippi homeowners.",
  datePublished: "2026-02-20",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/first-time-homeowner-mississippi",
};

export default function FirstTimeHomeownerMississippiPage() {
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
              First-Time Homeowner in Mississippi? Here's What Needs Fixing First
            </h1>
            <p className="text-gray-700 mt-2">February 20, 2026</p>
          </header>

          <div className="mt-10 prose prose-gray max-w-none space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Congratulations on the house. Now the real work starts. If you just closed on a home in Mississippi — especially an older one — there's a specific order you should tackle maintenance and inspections. Getting this wrong costs real money. Getting it right saves you thousands over the first few years.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">1. Get a termite inspection immediately</h2>
            <p className="text-gray-700 leading-relaxed">
              This is not optional in Mississippi. The state ranks third in the US for termite activity, and subterranean termites are present in every single county. Even if your home inspection included a termite check at closing, get a dedicated termite inspection from a licensed pest control company. A home inspector looks for visible signs. A termite professional knows where to dig deeper.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cost: $75-$150 for the inspection. If they find activity, treatment runs $500-$2,500. Catching it early versus finding it in two years is the difference between a $1,000 treatment and a $6,000 structural repair. Read more in our <Link href="/blog/termite-damage-mississippi" className="text-brand-600 font-medium hover:underline">termite damage guide</Link>.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">2. Service the HVAC</h2>
            <p className="text-gray-700 leading-relaxed">
              Your HVAC system is the most expensive mechanical component in a Mississippi home, and the climate here runs it harder than almost anywhere else. Have a licensed HVAC tech do a full inspection and tune-up. They'll check refrigerant levels, clean coils, test electrical connections, and flush the drain line. Ask them to be honest about the system's remaining life — if it's 12+ years old, start budgeting for a replacement.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cost: $75-$150 for a tune-up. A new system runs $4,500-$8,500. Our <Link href="/blog/hvac-maintenance-mississippi-summer" className="text-brand-600 font-medium hover:underline">HVAC maintenance guide</Link> covers what to expect.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">3. Check the roof age</h2>
            <p className="text-gray-700 leading-relaxed">
              An asphalt shingle roof in Mississippi lasts 15-22 years depending on quality and storm exposure. If you don't know the roof age, have a roofer inspect it. They can estimate remaining life from shingle condition, granule loss, and flashing integrity. A roof that needs replacement in 2 years is something you want to know about now, not when it starts leaking during a spring thunderstorm.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cost: Most roofers will do a free inspection if they know a job might follow. A full reroof runs $6,000-$14,000 for a typical Mississippi home.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">4. Test plumbing</h2>
            <p className="text-gray-700 leading-relaxed">
              Check the water heater age (labeled on the unit). If it's over 10 years old, it's on borrowed time. Look at visible pipes — galvanized steel pipes in pre-1970 homes corrode from the inside and restrict water flow. Polybutylene pipes (gray plastic, common in 1980s Mississippi construction) are prone to failure and most plumbers recommend replacing them proactively.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cost: Water heater replacement runs $1,200-$2,500 installed. A full repipe is $4,000-$8,000 but prevents catastrophic water damage.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">5. Upgrade electrical if pre-1980</h2>
            <p className="text-gray-700 leading-relaxed">
              Homes built before 1980 in Mississippi may have outdated electrical panels (Federal Pacific and Zinsco panels are common and known fire hazards), aluminum wiring, or insufficient amperage for modern loads. A panel upgrade to 200 amps costs $1,500-$3,000 and is one of the most important safety upgrades you can make.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">6. Insulation check</h2>
            <p className="text-gray-700 leading-relaxed">
              Pop your head into the attic with a flashlight and a tape measure. If you can see the tops of the ceiling joists, you don't have enough insulation. Mississippi energy code calls for R-38 to R-60 in the attic. Adding blown-in insulation costs $1,500-$3,500 and directly reduces your monthly energy bills. Check our <Link href="/blog/energy-efficient-home-mississippi" className="text-brand-600 font-medium hover:underline">energy efficiency guide</Link> for more details.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">Get connected with pros on FTW</h2>
            <p className="text-gray-700 leading-relaxed">
              You don't have to figure all of this out alone. Post any of these projects on FairTradeWorker and get bids from verified, licensed professionals in your area. The <Link href="/fairprice" className="text-brand-600 font-medium hover:underline">FairPrice Estimator</Link> shows you what each project should cost so you go in informed.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-gray-700 mb-4">Ready to get your new home in shape?</p>
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
