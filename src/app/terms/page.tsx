import type { Metadata } from "next";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for FairTradeWorker. Read the rules and agreements governing use of our construction marketplace.",
  openGraph: {
    title: "Terms of Service | FairTradeWorker",
    description: "Terms of Service for FairTradeWorker. Read the rules and agreements governing use of our construction marketplace.",
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <main className="py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#0F1419] tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-gray-700">
            Last updated: March 26, 2026
          </p>

          <div className="mt-12 space-y-12">
            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Acceptance of Terms
              </h2>
              <p className="text-gray-800 leading-relaxed">
                By creating an account on or using FairTradeWorker, you agree to
                be bound by these Terms of Service. If you do not agree to these
                terms, do not use the platform. FairTradeWorker is operated by
                Strata Software Group, based in Oxford, Mississippi. These terms
                apply to all users, including homeowners, contractors, and
                visitors.
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Description of Service
              </h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                FairTradeWorker is a two-sided marketplace that connects
                homeowners with licensed, verified contractors for construction,
                renovation, and home improvement projects. The platform provides
                tools for job posting, contractor matching, AI-powered cost
                estimation, in-platform messaging, escrow-based payments, and
                project management.
              </p>
              <p className="text-gray-800 leading-relaxed font-medium">
                FairTradeWorker is not a contractor, general contractor,
                construction company, or employer. We do not perform
                construction work, employ contractors, or guarantee the outcome
                of any project. We are a technology platform that facilitates
                connections between independent homeowners and independent
                contractors.
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                User Accounts
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  You must provide accurate, complete, and current information
                  when creating your account. Providing false information is
                  grounds for immediate termination.
                </li>
                <li>
                  You are responsible for maintaining the security of your
                  account credentials. Notify us immediately if you suspect
                  unauthorized access.
                </li>
                <li>
                  Each person may maintain only one account. Creating multiple
                  accounts to circumvent restrictions, manipulate reviews, or
                  game the matching system will result in permanent suspension of
                  all associated accounts.
                </li>
                <li>
                  You must be at least 18 years old to create an account.
                </li>
              </ul>
            </section>

            {/* Contractor Obligations */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Contractor Obligations
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  Maintain a valid, active license for your trade in every
                  jurisdiction where you accept work through the platform, where
                  licensure is required by law
                </li>
                <li>
                  Maintain adequate general liability and workers&apos;
                  compensation insurance as required by your state
                </li>
                <li>
                  Submit accurate, good-faith bids that reflect the actual scope
                  and cost of the work
                </li>
                <li>
                  Complete accepted work in a timely, professional manner
                  consistent with industry standards
                </li>
                <li>
                  Keep your verification status current — expired licenses or
                  lapsed insurance will result in account suspension until
                  updated
                </li>
                <li>
                  Communicate honestly with homeowners about timelines, costs,
                  and any changes to the original scope
                </li>
              </ul>
            </section>

            {/* Homeowner Obligations */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Homeowner Obligations
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  Provide accurate, detailed job descriptions including scope of
                  work, property conditions, access requirements, and any known
                  issues that could affect the project
                </li>
                <li>
                  Fund escrow milestones on time according to the agreed payment
                  schedule
                </li>
                <li>
                  Respond to contractor communications in a reasonable timeframe
                </li>
                <li>
                  Submit honest, good-faith reviews based on actual experience
                  with the contractor&apos;s work
                </li>
                <li>
                  Do not use the platform to solicit free estimates with no
                  intent to hire
                </li>
              </ul>
            </section>

            {/* FairTrade Promise */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                The FairTrade Promise
              </h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                FairTradeWorker is built on the principle that both sides of a
                construction transaction deserve a fair deal. Our commitments:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  <span className="font-medium text-[#0F1419]">
                    No lead fees:
                  </span>{" "}
                  Contractors never pay per lead or per bid. Revenue comes from
                  flat-rate subscriptions, not from taxing your pipeline.
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Transparent estimates:
                  </span>{" "}
                  Our AI estimation tools give homeowners a realistic baseline so
                  they can evaluate bids with confidence, not confusion.
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Merit-based matching:
                  </span>{" "}
                  Contractor visibility is determined by qualifications, track
                  record, and fit — not by who pays the most for placement.
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Escrow protection:
                  </span>{" "}
                  Homeowner funds are held in escrow and released at agreed
                  milestones, protecting both parties.
                </li>
              </ul>
            </section>

            {/* Payments and Escrow */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Payments and Escrow
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  All project payments are processed through QuickBooks (Intuit).
                  FairTradeWorker does not directly hold, process, or store
                  payment card or bank account information. Funds flow from the
                  homeowner to the contractor&apos;s QuickBooks account.
                </li>
                <li>
                  Payments are milestone-based. Homeowners fund escrow at agreed
                  project milestones, and funds are released to the contractor
                  upon milestone completion and homeowner approval.
                </li>
                <li>
                  A 3% convenience fee is charged to homeowners on escrow
                  payments to cover payment processing costs.
                </li>
                <li>
                  Either party may open a dispute within 5 calendar days of a
                  milestone completion claim. During the dispute window, escrowed
                  funds for that milestone are held until the dispute is
                  resolved.
                </li>
                <li>
                  Contractors are responsible for their own tax obligations.
                  FairTradeWorker will issue 1099 forms where required by law.
                </li>
              </ul>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Dispute Resolution
              </h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                We encourage homeowners and contractors to resolve
                disagreements directly through the platform&apos;s messaging
                system. If direct resolution fails:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Internal mediation:
                  </span>{" "}
                  Either party may request mediation through FairTradeWorker. Our
                  team will review the dispute, examine project records,
                  messages, and escrow history, and propose a resolution. Both
                  parties must participate in good faith.
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Binding arbitration:
                  </span>{" "}
                  If internal mediation does not resolve the dispute, it will be
                  settled by binding arbitration administered in the State of
                  Mississippi in accordance with the rules of the American
                  Arbitration Association. Each party bears their own
                  arbitration costs.
                </li>
              </ol>
              <p className="text-gray-800 leading-relaxed mt-4">
                By using FairTradeWorker, you agree to resolve disputes through
                this process and waive the right to participate in class action
                lawsuits or class-wide arbitration against Strata Software
                Group.
              </p>
            </section>

            {/* AI Estimation Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                AI Estimation Disclaimer
              </h2>
              <p className="text-gray-800 leading-relaxed">
                ConstructionAI, our custom-built estimation model, provides cost
                estimates based on project parameters, regional data, and
                historical construction pricing. These estimates are informational
                tools designed to give homeowners a realistic baseline and help
                contractors scope projects more efficiently. They are not
                guarantees, quotes, or binding commitments. Actual project costs
                are determined by the contractor&apos;s bid, which accounts for
                on-site conditions, material availability, labor markets, and
                other factors that an AI model cannot fully assess.
                FairTradeWorker is not liable for differences between AI
                estimates and final project costs.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Intellectual Property
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  The FairTradeWorker platform, including its design, code,
                  branding, ConstructionAI models, and documentation, is the
                  intellectual property of Strata Software Group. You may not
                  copy, modify, distribute, or reverse-engineer any part of the
                  platform.
                </li>
                <li>
                  Users retain ownership of content they create on the platform,
                  including job descriptions, bids, estimates, reviews, photos,
                  and messages. By posting content, you grant FairTradeWorker a
                  non-exclusive, royalty-free license to display, store, and
                  transmit that content as necessary to operate the platform.
                </li>
                <li>
                  Reviews and ratings are owned by the user who wrote them but
                  may not be removed solely because they are negative. We
                  reserve the right to remove reviews that violate our content
                  guidelines.
                </li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Limitation of Liability
              </h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                FairTradeWorker provides a marketplace platform. We are not a
                party to the agreements between homeowners and contractors and
                are not responsible for the quality, safety, legality, or
                completion of any construction work arranged through the
                platform.
              </p>
              <p className="text-gray-800 leading-relaxed">
                To the maximum extent permitted by law, Strata Software Group
                and its officers, employees, and affiliates shall not be liable
                for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of the platform,
                including but not limited to property damage, personal injury,
                lost profits, or data loss. Our total liability for any claim
                related to the platform shall not exceed the amount you paid to
                FairTradeWorker in the 12 months preceding the claim.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Termination
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  You may close your account at any time by contacting us at{" "}
                  <a
                    href="mailto:hello@fairtradeworker.com"
                    className="text-[#C41E3A] underline"
                  >
                    hello@fairtradeworker.com
                  </a>{" "}
                  or through your account settings. Active escrow obligations
                  must be fulfilled before account closure.
                </li>
                <li>
                  We may suspend or terminate your account for violation of these
                  terms, fraudulent activity, failure to maintain required
                  licenses or insurance, or conduct that harms other users or
                  the platform.
                </li>
                <li>
                  Upon termination, your profile will be deactivated. We retain
                  transaction records, reviews, and dispute history for 3 years
                  as required for legal and compliance purposes. You may request
                  deletion of non-retained data by contacting us.
                </li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Governing Law
              </h2>
              <p className="text-gray-800 leading-relaxed">
                These Terms of Service are governed by and construed in
                accordance with the laws of the State of Mississippi, without
                regard to conflict of law principles. Any legal proceedings not
                subject to the arbitration clause above shall be brought
                exclusively in the state or federal courts located in
                Mississippi.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Contact Us
              </h2>
              <p className="text-gray-800 leading-relaxed">
                If you have questions about these Terms of Service, contact us
                at:
              </p>
              <div className="mt-4 text-gray-800 leading-relaxed">
                <p className="font-medium text-[#0F1419]">
                  Strata Software Group
                </p>
                <p>Oxford, Mississippi</p>
                <p>
                  <a
                    href="mailto:hello@fairtradeworker.com"
                    className="text-[#C41E3A] underline"
                  >
                    hello@fairtradeworker.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
