"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Mic,
  Briefcase,
  Settings,
} from "lucide-react";
import { Sidebar } from "@/components/app/sidebar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/contractor/dashboard", icon: LayoutDashboard },
  { label: "Estimates", href: "/contractor/estimates", icon: FileText },
  { label: "New Estimate", href: "/contractor/estimates/new", icon: Mic },
  { label: "Browse Jobs", href: "/contractor/jobs", icon: Briefcase },
  { label: "Settings", href: "/contractor/settings", icon: Settings },
];

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        items={NAV_ITEMS}
        currentPath={pathname}
        userRole="contractor"
      />
      {/* Main content — offset by sidebar width. Use CSS var via Tailwind's arbitrary value. */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 overflow-hidden",
          // We can't easily react to the sidebar's collapsed state from here without lifting state.
          // Use a fixed left margin matching expanded sidebar; sidebar is positioned fixed.
          "ml-64"
        )}
        style={{}}
      >
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
