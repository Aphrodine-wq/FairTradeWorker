import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";

export const metadata: Metadata = {
  title: "Escrow Payments: What Contractors Need to Know | FairTradeWorker",
  description:
    "Getting paid on time is one of the biggest problems in construction. Escrow doesn't just protect homeowners — it gives contractors leverage too.",
  openGraph: {
    title: "Escrow Payments: What Contractors Need to Know | FairTradeWorker",
    description: "Escrow doesn't just protect homeowners — it gives contractors leverage too.",
    type: "article",
    publishedTime: "2026-02-28T00:00:00Z",
    authors: ["FairTradeWorker"],
  },
  alternates: { canonical: "/blog/escrow-payments-guide" },
};

const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Escrow Payments: What Contractors Need to Know",
  description: "Getting paid on time is one of the biggest problems in construction. Escrow doesn't just protect homeowners — it gives contractors leverage too.",
  datePublished: "2026-02-28",
  author: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  publisher: { "@type": "Organization", name: "FairTradeWorker", url: "https://fairtradeworker.com" },
  mainEntityOfPage: "https://fairtradeworker.com/blog/escrow-payments-guide",
};

export default function EscrowPaymentsGuidePage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#FAFAFA] min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }} />
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to blog
          </Link>

          <div className="mb-8">
            <span className="text-sm text-blue-700 font-medium">Guides</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Escrow Payments: What Contractors Need to Know
            </h1>
            <p className="text-gray-700 mt-2">February 28, 2026</p>
          </div>

          <div className="max-w-none">
            <p className="text-gray-800 leading-relaxed mb-4">
              Every contractor has a story about the time they finished a job
              and had to chase the homeowner for payment. Calls that go to
              voicemail. Checks that are &ldquo;in the mail.&rdquo; Disputes
              that pop up after the work is done and the crew has moved on.
              It&apos;s one of the most frustrating parts of the business, and
              it costs the industry billions in delayed and lost payments every
              year.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              FairTradeWorker uses escrow payments to fix this. The money is
              committed before work begins, released when milestones are met,
              and the whole thing runs through QuickBooks so it fits into the
              accounting workflow you already have.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              How Escrow Protects Both Sides
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              Escrow is simple in concept: a neutral third party holds the
              money until both sides agree the work is done. The homeowner
              knows their money is safe because it only releases when
              milestones are completed. The contractor knows the money exists
              because it&apos;s already funded before they pick up a tool.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              This changes the dynamic. You&apos;re not hoping the homeowner
              pays. You&apos;re not worrying about whether the check will
              clear. The funds are sitting in escrow, verified and committed.
              You do the work, hit the milestone, and the money moves.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              The Milestone-Based Payment Flow
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              Here&apos;s how a typical project moves through escrow on
              FairTradeWorker:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-gray-800 mb-4">
              <li>
                <strong>Bid Accepted:</strong> The homeowner accepts your bid.
                FairTradeWorker generates a QuickBooks invoice for the first
                milestone amount plus a 3% service fee.
              </li>
              <li>
                <strong>Escrow Funded:</strong> The homeowner pays the invoice.
                The funds are held in escrow. You get a notification that the
                project is funded and ready to start.
              </li>
              <li>
                <strong>Work Begins:</strong> You start the job knowing the
                money is committed. No more &ldquo;let me think about it&rdquo;
                after you&apos;ve already scheduled your crew.
              </li>
              <li>
                <strong>Milestone Complete:</strong> When you finish a
                milestone, you mark it complete in the app. The homeowner gets a
                notification to review and approve.
              </li>
              <li>
                <strong>Funds Release:</strong> Once approved, the milestone
                payment releases to your account minus the 5% platform fee.
                This happens automatically through QuickBooks.
              </li>
            </ul>

            <p className="text-gray-800 leading-relaxed mb-4">
              For larger projects, the job is split into multiple milestones.
              Each one follows the same fund-work-approve-release cycle. You
              never have more than one milestone of exposure at a time.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              The 5-Day Dispute Window
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              When a contractor marks a milestone as complete, the homeowner
              has 5 business days to review the work and either approve the
              release or open a dispute. If they do nothing, the funds release
              automatically after the window closes.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              This is important. The system defaults to paying the contractor.
              The homeowner has to actively flag an issue within the window if
              they believe the milestone wasn&apos;t met. No more indefinite
              holds or &ldquo;I&apos;ll get to it next week.&rdquo; The clock
              runs and the money moves.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              If a dispute is opened, both sides submit their position and
              FairTradeWorker&apos;s resolution team reviews it. The process is
              documented, timestamped, and transparent. No he-said-she-said.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              QuickBooks Integration
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              One of the biggest complaints contractors have about payment
              platforms is that the money ends up in some random account they
              have to manually reconcile. FairTradeWorker integrates directly
              with QuickBooks Online, which is what most contractors already
              use for invoicing and bookkeeping.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              When a milestone releases, the payment shows up in your
              QuickBooks automatically. Invoice created, payment recorded,
              receipt generated. Your books stay clean without manual entry.
              Your accountant or bookkeeper sees it the same way they see
              every other payment in your system.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
              Why This Is Better Than Chasing Payments
            </h2>

            <p className="text-gray-800 leading-relaxed mb-4">
              The alternative to escrow is what most contractors deal with
              today: send an invoice, wait, follow up, wait some more, maybe
              get paid in 30 days, maybe 60. Some contractors report average
              collection times of 45 to 90 days on residential work. That&apos;s
              cash flow pressure that kills small businesses.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              With escrow, the money is committed before day one. You know
              exactly when it releases. You can plan your cash flow around
              milestones, not around whether somebody remembers to write a
              check. For contractors who have been burned before, that
              certainty is worth more than any feature on the platform.
            </p>

            <p className="text-gray-800 leading-relaxed mb-4">
              Getting paid shouldn&apos;t be the hardest part of the job.
              Escrow makes it the easiest.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
