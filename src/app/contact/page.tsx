"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Separator } from "@shared/ui/separator";
/* Geometric inline SVG icons — no lucide */
const GeoMail = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="1,4 8,9 15,4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <polygon points="1,12 8,7 15,12" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
  </svg>
);

const GeoPhone = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="1" width="10" height="14" stroke="currentColor" strokeWidth="1.5" fill="none" transform="rotate(-8 8 8)" />
    <rect x="6" y="4" width="4" height="6" fill="currentColor" opacity="0.2" transform="rotate(-8 8 8)" />
  </svg>
);

const GeoClock = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="8" y1="4" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" />
    <line x1="8" y1="8" x2="11" y2="10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const GeoMapPin = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="8,1 14,8 8,15 2,8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.3" />
  </svg>
);

const SUBJECTS = [
  "General",
  "Contractor Support",
  "Homeowner Support",
  "Partnership",
  "Press",
] as const;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
      toast.success("Message sent");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Headline */}
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Let&apos;s talk.
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl">
            Whether you&apos;re a contractor with questions or a homeowner looking for
            help, we&apos;re here.
          </p>

          <Separator className="my-12" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

            {/* Form — takes up 2 cols */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    We got it.
                  </h2>
                  <p className="text-gray-700">
                    Someone from our team will follow up within one business day.
                    If it&apos;s urgent, email us directly at{" "}
                    <a
                      href="mailto:hello@fairtradeworker.com"
                      className="text-brand-600 font-medium hover:underline"
                    >
                      hello@fairtradeworker.com
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-900"
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Jane Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-900"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as typeof subject)}
                      className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us what&apos;s on your mind..."
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="resize-none"
                    />
                  </div>

                  <Button type="submit" size="lg" disabled={sending}>
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>

            {/* Side info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
                  Contact Info
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <GeoMail className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">Email</p>
                      <a
                        href="mailto:hello@fairtradeworker.com"
                        className="text-sm text-gray-900 hover:text-brand-600 transition-colors"
                      >
                        hello@fairtradeworker.com
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <GeoPhone className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">Phone</p>
                      <span className="text-sm text-gray-900">(512) 555-0100</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <GeoClock className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">Hours</p>
                      <span className="text-sm text-gray-900">
                        Mon–Fri, 8am–6pm CT
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <GeoMapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">Location</p>
                      <span className="text-sm text-gray-900">Oxford, MS</span>
                    </div>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  For contractor support or billing questions, email{" "}
                  <a
                    href="mailto:hello@fairtradeworker.com"
                    className="text-brand-600 font-medium hover:underline"
                  >
                    hello@fairtradeworker.com
                  </a>{" "}
                  directly — we respond same day on business days.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
                  Common Questions
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li>
                    <strong className="text-gray-900">Are you licensed?</strong>{" "}
                    FairTradeWorker is a Mississippi-based technology company. All contractors on
                    our platform carry their own licenses and insurance, which we verify.
                  </li>
                  <li>
                    <strong className="text-gray-900">How do payments work?</strong>{" "}
                    Payments flow through QuickBooks with milestone-based escrow.
                    Homeowners pay per milestone. Contractors get paid when work is approved.
                  </li>
                  <li>
                    <strong className="text-gray-900">What areas do you serve?</strong>{" "}
                    We&apos;re launching across Mississippi — Oxford, Tupelo, Hattiesburg,
                    Jackson, Southaven, and 200+ cities. Expanding to neighboring states in 2027.
                  </li>
                  <li>
                    <strong className="text-gray-900">Is it free for homeowners?</strong>{" "}
                    Yes. Posting a job and receiving bids is completely free. A small service fee
                    applies only when you hire and pay through the platform.
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
