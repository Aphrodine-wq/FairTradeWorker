"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  FolderOpen,
  MessageSquare,
  Bell,
  Receipt,
  Settings,
  Award,
  Wallet,
  Users,
} from "lucide-react";
import { Sidebar } from "@shared/components/sidebar";
import { cn } from "@shared/lib/utils";
import { authStore } from "@shared/lib/auth-store";
import { realtimeClient } from "@shared/lib/realtime";

const NAV_ITEMS = [
  { label: "Dashboard",        href: "/subcontractor/dashboard",    icon: LayoutDashboard },
  { label: "Browse Sub Jobs",  href: "/subcontractor/work",         icon: Briefcase },
  { label: "Estimates",        href: "/subcontractor/estimates",    icon: FileText },
  { label: "Projects",          href: "/subcontractor/jobs",         icon: FolderOpen },
  { label: "Invoices",         href: "/subcontractor/invoices",     icon: Receipt },
  { label: "Payments",         href: "/subcontractor/payments",     icon: Wallet },
  { label: "Clients",          href: "/subcontractor/clients",      icon: Users },
  { label: "FairRecord",       href: "/subcontractor/records",      icon: Award },
  { label: "Settings",         href: "/subcontractor/settings",     icon: Settings },
];

const INNER_SIDEBAR_ROUTES = ["/subcontractor/estimates", "/subcontractor/settings"];

const UNREAD_MESSAGES = 1;
const UNREAD_NOTIFICATIONS = 3;

function GlobalTopBar({ pathname }: { pathname: string }) {
  return (
    <div className="h-11 flex items-center justify-end gap-2 px-4 bg-white border-b border-gray-200 flex-shrink-0">
      <Link
        href="/subcontractor/messages"
        className={cn(
          "relative w-8 h-8 rounded-sm hover:bg-gray-100 flex items-center justify-center transition-colors",
          pathname === "/subcontractor/messages" && "bg-gray-100"
        )}
      >
        <MessageSquare className="w-[18px] h-[18px] text-gray-700" />
        {UNREAD_MESSAGES > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">{UNREAD_MESSAGES}</span>
        )}
      </Link>
      <Link
        href="/subcontractor/notifications"
        className={cn(
          "relative w-8 h-8 rounded-sm hover:bg-gray-100 flex items-center justify-center transition-colors",
          pathname === "/subcontractor/notifications" && "bg-gray-100"
        )}
      >
        <Bell className="w-[18px] h-[18px] text-gray-700" />
        {UNREAD_NOTIFICATIONS > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{UNREAD_NOTIFICATIONS}</span>
        )}
      </Link>
    </div>
  );
}

export default function SubContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  React.useEffect(() => {
    const token = authStore.getToken();
    if (token) {
      realtimeClient.connect(token);
    }
    return () => realtimeClient.disconnect();
  }, []);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        items={NAV_ITEMS}
        currentPath={pathname}
        userRole="subcontractor"
        roles={["contractor", "subcontractor"]}
        autoCollapse={INNER_SIDEBAR_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <GlobalTopBar pathname={pathname} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
