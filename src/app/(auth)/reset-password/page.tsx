"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Input } from "@shared/ui/input";
import { BrandMark } from "@shared/components/brand-mark";
import { resetPassword } from "@shared/lib/ftw-svc-gaps";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrandMark className="w-9 h-9" />
              <span className="text-2xl font-bold text-gray-900">FairTradeWorker</span>
            </Link>
          </div>

          <Card className="shadow-md border-border">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                Invalid reset link
              </h1>
              <p className="text-sm text-gray-700 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <Link href="/forgot-password">
                <Button size="lg" className="w-full">
                  Request a new link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully");
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
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
                Set new password
              </h1>
              <p className="text-sm text-gray-700 mt-1">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                >
                  New password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-900"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-1"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
