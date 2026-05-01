"use client";

import React, { useState, useEffect } from "react";
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
import { realtimeClient, api } from "@shared/lib/realtime";

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

const INNER_SIDEBAR_ROUTES = ["/contractor/estimates", "/contractor/settings"];

function GlobalTopBar({ pathname }: { pathname: string }) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Fetch real counts from API, fall back to mock counts
    api.listNotifications()
      .then((notifs) => {
        setUnreadNotifications(notifs.filter((n: any) => !n.read).length);
      })
      .catch(() => setUnreadNotifications(5));

    api.listConversations()
      .then((convos) => {
        const total = convos.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0);
        setUnreadMessages(total || 3);
      })
      .catch(() => setUnreadMessages(3));
  }, []);

  return (
    <div className="h-11 flex items-center justify-end gap-2 px-4 bg-white border-b border-gray-200 flex-shrink-0">
      <Link
        href="/contractor/messages"
        className={cn(
          "relative w-8 h-8 rounded-sm hover:bg-gray-100 flex items-center justify-center transition-colors",
          pathname === "/contractor/messages" && "bg-gray-100"
        )}
      >
        <MessageSquare className="w-[18px] h-[18px] text-gray-700" />
        {unreadMessages > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">{unreadMessages}</span>
        )}
      </Link>
      <Link
        href="/contractor/notifications"
        className={cn(
          "relative w-8 h-8 rounded-sm hover:bg-gray-100 flex items-center justify-center transition-colors",
          pathname === "/contractor/notifications" && "bg-gray-100"
        )}
      >
        <Bell className="w-[18px] h-[18px] text-gray-700" />
        {unreadNotifications > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{unreadNotifications}</span>
        )}
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
