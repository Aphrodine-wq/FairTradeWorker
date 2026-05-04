"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  CheckCircle2,
  Award,
  Settings,
  MessageSquare,
  Bell,
  Plus,
  Wallet,
} from "lucide-react";
import { Sidebar } from "@shared/components/sidebar";
import { cn } from "@shared/lib/utils";
import { authStore } from "@shared/lib/auth-store";
import { realtimeClient } from "@shared/lib/realtime";

const BASE = "/demo/homeowner";

const NAV_ITEMS = [
  { label: "Dashboard", href: `${BASE}/dashboard`, icon: LayoutDashboard },
  { label: "My Jobs", href: `${BASE}/jobs`, icon: Briefcase },
  { label: "Projects", href: `${BASE}/projects`, icon: FolderOpen },
  { label: "Milestones", href: `${BASE}/milestones`, icon: CheckCircle2 },
  { label: "Payments", href: `${BASE}/payments`, icon: Wallet },
  { label: "FairRecord", href: `${BASE}/reviews`, icon: Award },
  { label: "Settings", href: `${BASE}/settings`, icon: Settings },
];

function DemoTopBar({ pathname }: { pathname: string }) {
  return (
    <div className="h-11 flex items-center justify-between gap-2 px-4 bg-white border-b border-gray-200 flex-shrink-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Demo</span>
      <div className="flex items-center gap-2">
        <Link
          href={`${BASE}/messages`}
          className={cn(
            "relative w-8 h-8 rounded-sm hover:bg-gray-100 flex items-center justify-center transition-colors",
            pathname === `${BASE}/messages` && "bg-gray-100"
          )}
        >
          <MessageSquare className="w-[18px] h-[18px] text-gray-700" />
        </Link>
        <Link
          href={`${BASE}/notifications`}
          className={cn(
            "relative w-8 h-8 rounded-sm hover:bg-gray-100 flex items-center justify-center transition-colors",
            pathname === `${BASE}/notifications` && "bg-gray-100"
          )}
        >
          <Bell className="w-[18px] h-[18px] text-gray-700" />
        </Link>
      </div>
    </div>
  );
}

export default function DemoHomeownerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const token = authStore.getToken();
    if (token && !String(token).startsWith("demo.")) {
      realtimeClient.connect(token);
    }
    return () => realtimeClient.disconnect();
  }, []);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        items={NAV_ITEMS}
        currentPath={pathname}
        userRole="homeowner"
        topAction={
          <Link
            href={`${BASE}/jobs`}
            className="flex items-center justify-center gap-2 w-full rounded-sm bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-3 px-4 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post a Job
          </Link>
        }
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DemoTopBar pathname={pathname} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
