import type { Metadata } from "next";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How FairTradeWorker collects, uses, and protects your personal information. Read our full privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <main className="py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#0F1419] tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-gray-700">
            Last updated: March 26, 2026
          </p>

          <div className="mt-12 space-y-12">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Introduction
              </h2>
              <p className="text-gray-800 leading-relaxed">
                FairTradeWorker is operated by Strata Software Group
                (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), based in
                Oxford, Mississippi. This Privacy Policy explains how we
                collect, use, share, and protect your personal information when
                you use the FairTradeWorker platform, including our website,
                mobile applications, and related services. By using
                FairTradeWorker, you agree to the practices described in this
                policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Information We Collect
              </h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                We collect information you provide directly, information
                generated through your use of the platform, and information from
                third-party services integrated with your account.
              </p>

              <h3 className="text-lg font-medium text-[#0F1419] mb-2">
                Account Information
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed mb-4">
                <li>
                  Name, email address, phone number, and mailing address when
                  you create an account
                </li>
                <li>
                  Contractor-specific data: business name, license numbers,
                  insurance certificates, trade specialties, and service area
                </li>
                <li>
                  Homeowner-specific data: property address, property type, and
                  project history
                </li>
              </ul>

              <h3 className="text-lg font-medium text-[#0F1419] mb-2">
                Job and Transaction Data
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed mb-4">
                <li>
                  Job descriptions, photos, bids, estimates, messages between
                  users, and project timelines
                </li>
                <li>
                  Payment information processed through QuickBooks, including
                  invoice amounts, payment status, and escrow milestones.
                  FairTradeWorker does not store your credit card numbers or bank
                  account details directly — that data is held by Intuit
                  (QuickBooks).
                </li>
              </ul>

              <h3 className="text-lg font-medium text-[#0F1419] mb-2">
                Usage and Analytics Data
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed mb-4">
                <li>
                  Pages viewed, features used, search queries, and interaction
                  patterns collected through PostHog analytics
                </li>
                <li>
                  Device type, browser type, operating system, IP address, and
                  general geographic location
                </li>
                <li>Referring URLs and session duration</li>
              </ul>

              <h3 className="text-lg font-medium text-[#0F1419] mb-2">
                Verification Data
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  Identity verification results from third-party providers used
                  during contractor onboarding
                </li>
                <li>
                  License validation results checked against state licensing
                  boards
                </li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  Match homeowners with qualified, verified contractors based on
                  trade, location, availability, and track record
                </li>
                <li>
                  Facilitate communication between homeowners and contractors
                  through in-platform messaging
                </li>
                <li>
                  Process payments and manage escrow milestones through
                  QuickBooks integration
                </li>
                <li>
                  Generate AI-powered cost estimates using ConstructionAI, our
                  custom estimation model trained on real construction data
                </li>
                <li>
                  Improve the accuracy of our estimation models by analyzing
                  anonymized, aggregated project data — individual project
                  details are never used to train AI without explicit consent
                </li>
                <li>
                  Send transactional notifications (bid updates, payment
                  confirmations, job status changes) and, with your consent,
                  marketing communications
                </li>
                <li>
                  Detect and prevent fraud, abuse, and unauthorized access to the
                  platform
                </li>
                <li>
                  Analyze platform usage to improve features, fix issues, and
                  guide product development
                </li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Information Sharing
              </h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                We do not sell your personal information. We share data only in
                the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Between users:
                  </span>{" "}
                  When a homeowner posts a job and a contractor submits a bid,
                  relevant profile and project information is shared between both
                  parties to facilitate the transaction.
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    QuickBooks (Intuit):
                  </span>{" "}
                  Payment processing, invoicing, and escrow management are
                  handled through QuickBooks. Your payment data is governed by
                  Intuit&apos;s privacy policy.
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Verification providers:
                  </span>{" "}
                  Identity verification and background check services receive
                  contractor information necessary to complete verification
                  during onboarding.
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Analytics (PostHog):
                  </span>{" "}
                  Anonymized usage data is processed by PostHog to help us
                  understand how the platform is used. PostHog does not receive
                  personally identifiable information unless you are logged in
                  and we associate your session with your user ID for product
                  improvement purposes.
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Legal requirements:
                  </span>{" "}
                  We may disclose information if required by law, subpoena, or
                  court order, or if necessary to protect the rights, safety, or
                  property of FairTradeWorker, our users, or the public.
                </li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Data Security
              </h2>
              <p className="text-gray-800 leading-relaxed">
                We take reasonable measures to protect your information from
                unauthorized access, alteration, disclosure, or destruction.
                Data is encrypted in transit using TLS and at rest in our
                PostgreSQL database. Authentication is handled through
                JSON Web Tokens (JWT) with httpOnly cookies, and passwords are
                hashed using bcrypt. Access to production systems is restricted
                to authorized personnel. While no system is completely immune to
                security threats, we continuously monitor and update our
                security practices.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Your Rights
              </h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                Depending on your location, you may have the following rights
                regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  <span className="font-medium text-[#0F1419]">Access:</span>{" "}
                  Request a copy of the personal information we hold about you
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Correction:
                  </span>{" "}
                  Request that we correct inaccurate or incomplete information
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">Deletion:</span>{" "}
                  Request that we delete your personal information, subject to
                  legal retention requirements
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Data export:
                  </span>{" "}
                  Request a machine-readable export of your data
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">Opt out:</span>{" "}
                  Opt out of marketing communications at any time by
                  unsubscribing or updating your notification preferences
                </li>
              </ul>
              <p className="text-gray-800 leading-relaxed mt-4">
                These rights apply to residents of California (under the CCPA),
                the European Economic Area (under the GDPR), and other
                jurisdictions with applicable data protection laws. To exercise
                any of these rights, contact us at{" "}
                <a
                  href="mailto:hello@fairtradeworker.com"
                  className="text-[#C41E3A] underline"
                >
                  hello@fairtradeworker.com
                </a>
                . We will respond within 30 days.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Cookies and Tracking
              </h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                FairTradeWorker uses cookies and similar technologies for the
                following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Essential cookies:
                  </span>{" "}
                  Required for authentication (JWT session token stored as an
                  httpOnly cookie) and core platform functionality. These cannot
                  be disabled.
                </li>
                <li>
                  <span className="font-medium text-[#0F1419]">
                    Analytics cookies:
                  </span>{" "}
                  PostHog analytics tracks page views, feature usage, and
                  session data to help us improve the platform. PostHog is
                  configured to respect Do Not Track browser settings.
                </li>
              </ul>
              <p className="text-gray-800 leading-relaxed mt-4">
                You can opt out of analytics tracking by enabling Do Not Track
                in your browser settings, using a browser extension that blocks
                tracking scripts, or contacting us to request opt-out at the
                account level.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Children&apos;s Privacy
              </h2>
              <p className="text-gray-800 leading-relaxed">
                FairTradeWorker is not intended for use by anyone under the age
                of 18. We do not knowingly collect personal information from
                minors. If we become aware that we have collected information
                from a user under 18, we will delete that information
                immediately. If you believe a minor has provided us with
                personal information, please contact us at{" "}
                <a
                  href="mailto:hello@fairtradeworker.com"
                  className="text-[#C41E3A] underline"
                >
                  hello@fairtradeworker.com
                </a>
                .
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Changes to This Policy
              </h2>
              <p className="text-gray-800 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices, technology, or legal requirements. If
                we make material changes, we will notify you by email or through
                a prominent notice on the platform at least 30 days before the
                changes take effect. Your continued use of FairTradeWorker after
                the effective date constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-[#0F1419] mb-4">
                Contact Us
              </h2>
              <p className="text-gray-800 leading-relaxed">
                If you have questions about this Privacy Policy or how we handle
                your data, contact us at:
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
