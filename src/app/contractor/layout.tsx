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
  Star,
  Receipt,
  Bell,
  Users,
  Settings,
  Award,
  Wallet,
} from "lucide-react";
import { Sidebar } from "@shared/components/sidebar";
import { cn } from "@shared/lib/utils";
import { authStore } from "@shared/lib/auth-store";
import { realtimeClient } from "@shared/lib/realtime";

const NAV_ITEMS = [
  { label: "Dashboard",      href: "/contractor/dashboard",      icon: LayoutDashboard },
  { label: "Browse Jobs",    href: "/contractor/work",            icon: Briefcase },
  { label: "Estimates",      href: "/contractor/estimates",       icon: FileText },
  { label: "Projects",       href: "/contractor/projects",       icon: FolderOpen },
  { label: "Invoices",       href: "/contractor/invoices",       icon: Receipt },
  { label: "Payments",       href: "/contractor/payments",       icon: Wallet },
  { label: "Clients",        href: "/contractor/clients",        icon: Users },
  { label: "FairRecord",    href: "/contractor/records",        icon: Award },
  { label: "Settings",       href: "/contractor/settings",       icon: Settings },
];

function GlobalTopBar({ pathname }: { pathname: string }) {
  return (
    <div className="h-11 flex items-center justify-end gap-2 px-4 bg-white border-b border-gray-200 flex-shrink-0">
      <Link
        href="/contractor/messages"
        className={cn(
          "relative w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors",
          pathname === "/contractor/messages" && "bg-gray-100"
        )}
      >
        <MessageSquare className="w-[18px] h-[18px] text-gray-500" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full" />
      </Link>
      <Link
        href="/contractor/notifications"
        className={cn(
          "relative w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors",
          pathname === "/contractor/notifications" && "bg-gray-100"
        )}
      >
        <Bell className="w-[18px] h-[18px] text-gray-500" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </Link>
    </div>
  );
}

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Connect realtime WebSocket if authenticated
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
        userRole="contractor"
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
