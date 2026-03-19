import React from "react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function AppHeader({ title, subtitle, actions, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 bg-white border-b border-border px-8 py-4 flex-shrink-0",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </header>
  );
}
