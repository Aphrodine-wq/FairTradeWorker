"use client";

import { WifiOff } from "lucide-react";
import { cn } from "@shared/lib/utils";

export function FallbackBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-[13px]",
        className
      )}
    >
      <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
      <span>Showing cached data — reconnecting...</span>
    </div>
  );
}
