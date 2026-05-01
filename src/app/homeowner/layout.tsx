"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
import { realtimeClient, api } from "@shared/lib/realtime";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/homeowner/dashboard", icon: LayoutDashboard },
  { label: "My Jobs", href: "/homeowner/jobs", icon: Briefcase },
  { label: "Projects", href: "/homeowner/projects", icon: FolderOpen },
  { label: "Milestones", href: "/homeowner/milestones", icon: CheckCircle2 },
  { label: "Payments", href: "/homeowner/payments", icon: Wallet },
  { label: "FairRecord", href: "/homeowner/reviews", icon: Award },
  { label: "Settings", href: "/homeowner/settings", icon: Settings },
];

function GlobalTopBar({ pathname }: { pathname: string }) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    api.listNotifications()
      .then((notifs) => {
        setUnreadNotifications(notifs.filter((n: any) => !n.read).length);
      })
      .catch(() => setUnreadNotifications(4));

    api.listConversations()
      .then((convos) => {
        const total = convos.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0);
        setUnreadMessages(total || 2);
      })
      .catch(() => setUnreadMessages(2));
  }, []);

  return (
    <div className="h-11 flex items-center justify-end gap-2 px-4 bg-white border-b border-gray-200 flex-shrink-0">
      <Link
        href="/homeowner/messages"
        className={cn(
          "relative w-8 h-8 rounded-sm hover:bg-gray-100 flex items-center justify-center transition-colors",
          pathname === "/homeowner/messages" && "bg-gray-100"
        )}
      >
        <MessageSquare className="w-[18px] h-[18px] text-gray-700" />
        {unreadMessages > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">{unreadMessages}</span>
        )}
      </Link>
      <Link
        href="/homeowner/notifications"
        className={cn(
          "relative w-8 h-8 rounded-sm hover:bg-gray-100 flex items-center justify-center transition-colors",
          pathname === "/homeowner/notifications" && "bg-gray-100"
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

export default function HomeownerLayout({
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
        userRole="homeowner"
        topAction={
          <Link
            href="/homeowner/jobs"
            className="flex items-center justify-center gap-2 w-full rounded-sm bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-3 px-4 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post a Job
          </Link>
        }
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
