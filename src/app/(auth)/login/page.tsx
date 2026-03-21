"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Input } from "@shared/ui/input";
import { cn } from "@shared/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic goes here
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-xl font-bold text-brand-600 tracking-tight">
            FairTradeWorker
          </span>
        </div>

        <Card className="shadow-md">
          <CardContent className="p-8">
            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
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

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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

              {/* Sign In Button */}
              <Button type="submit" size="lg" className="w-full mt-1">
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-medium uppercase tracking-wide">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full font-medium"
              >
                <GoogleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full font-medium"
              >
                <AppleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                Apple
              </Button>
            </div>

            {/* Sign Up Link */}
            <p className="mt-7 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Dev Quick Access */}
        <div className="mt-6 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-700 mb-3 uppercase tracking-wide">
            Dev Quick Access
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/contractor/dashboard">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Contractor Portal
              </Button>
            </Link>
            <Link href="/homeowner/dashboard">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Homeowner Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline SVG icons for social providers — no emoji, no external deps

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn("fill-current", className)}
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.34.74 3.15.8 1.19-.24 2.33-.93 3.6-.84 1.53.12 2.68.72 3.43 1.9-3.15 1.88-2.4 5.98.82 7.14-.57 1.5-1.32 2.99-3 3.88zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
