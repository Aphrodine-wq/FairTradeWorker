"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  FolderOpen,
  MessageSquare,
  Bell,
  Users,
  Settings,
  Award,
  Wallet,
  Receipt,
} from "lucide-react";
import { Sidebar } from "@shared/components/sidebar";
import { cn } from "@shared/lib/utils";
import { authStore } from "@shared/lib/auth-store";
import { realtimeClient } from "@shared/lib/realtime";

const BASE = "/demo/contractor";

const NAV_ITEMS = [
  { label: "Dashboard", href: `${BASE}/dashboard`, icon: LayoutDashboard },
  { label: "Browse Jobs", href: `${BASE}/work`, icon: Briefcase },
  { label: "Estimates", href: `${BASE}/estimates`, icon: FileText },
  { label: "Projects", href: `${BASE}/projects`, icon: FolderOpen },
  { label: "Invoices", href: `${BASE}/invoices`, icon: Receipt },
  { label: "Payments", href: `${BASE}/payments`, icon: Wallet },
  { label: "Clients", href: `${BASE}/clients`, icon: Users },
  { label: "FairRecord", href: `${BASE}/records`, icon: Award },
  { label: "Settings", href: `${BASE}/settings`, icon: Settings },
];

const INNER_SIDEBAR_ROUTES = [`${BASE}/estimates`, `${BASE}/settings`];

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

export default function DemoContractorLayout({ children }: { children: React.ReactNode }) {
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
        userRole="contractor"
        autoCollapse={INNER_SIDEBAR_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DemoTopBar pathname={pathname} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
