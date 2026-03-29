"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Separator } from "@shared/ui/separator";
import { Mail, Phone, Clock, MapPin } from "lucide-react";

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
                      className="w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
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
                    <Mail className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
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
                    <Phone className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">Phone</p>
                      <span className="text-sm text-gray-900">(512) 555-0100</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">Hours</p>
                      <span className="text-sm text-gray-900">
                        Mon–Fri, 8am–6pm CT
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
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
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
