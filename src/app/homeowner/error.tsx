"use client";

import { AlertTriangle } from "lucide-react";

export default function HomeownerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertTriangle className="w-12 h-12 text-brand-600 mb-4" strokeWidth={1.5} />
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-700 max-w-sm mb-6">
        We ran into an error loading this page. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center justify-center rounded-sm bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
