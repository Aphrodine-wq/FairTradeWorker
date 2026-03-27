"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { BrandMark } from "@shared/components/brand-mark";
import { Input } from "@shared/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
      toast.success("Check your email for a reset link.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Brand */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <BrandMark className="w-9 h-9" />
            <span className="text-2xl font-bold text-gray-900">FairTradeWorker</span>
          </Link>
        </div>

        <Card className="shadow-md border-border">
          <CardContent className="p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Reset your password
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {submitted ? (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                If an account exists with that email, we&apos;ve sent a reset link.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-1"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
