"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Briefcase,
  DollarSign,
  Bell,
} from "lucide-react";
import { cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: "bid_accepted" | "sub_job_match" | "payment_received";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "sn1",
    type: "bid_accepted",
    title: "Bid accepted",
    body: "Your bid on the Kitchen Rough-In sub job was accepted by Marcus Johnson.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "sn2",
    type: "sub_job_match",
    title: "New sub job match",
    body: "A new Plumbing sub job in Austin, TX matches your skills and service area.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "sn3",
    type: "payment_received",
    title: "Payment received",
    body: "You received $2,400 for the Bathroom Plumbing Rough-In sub job.",
    time: "1 day ago",
    read: true,
  },
];

const ICON_MAP: Record<Notification["type"], React.ElementType> = {
  bid_accepted: CheckCircle2,
  sub_job_match: Briefcase,
  payment_received: DollarSign,
};

const ICON_COLORS: Record<Notification["type"], string> = {
  bid_accepted: "bg-emerald-950/10 text-emerald-950",
  sub_job_match: "bg-brand-50 text-brand-700",
  payment_received: "bg-amber-50 text-amber-700",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SubContractorNotificationsPage() {
  usePageTitle("Notifications");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[13px] text-gray-700 mt-1">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
              className="text-[13px] font-medium text-brand-600 hover:text-brand-700"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-gray-200 divide-y divide-gray-100">
          {notifications.map((notif) => {
            const Icon = ICON_MAP[notif.type];
            const colorClass = ICON_COLORS[notif.type];
            return (
              <button
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={cn(
                  "w-full text-left px-5 py-4 flex items-start gap-4 transition-colors hover:bg-gray-50/50",
                  !notif.read && "bg-brand-50/30"
                )}
              >
                <div className={cn("w-9 h-9 rounded-none flex items-center justify-center shrink-0", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={cn(
                      "text-[14px] truncate",
                      notif.read ? "font-medium text-gray-900" : "font-bold text-gray-900"
                    )}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-none bg-brand-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[13px] text-gray-700 line-clamp-2">{notif.body}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{notif.time}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
