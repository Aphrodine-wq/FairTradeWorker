"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  DollarSign,
  MessageSquare,
  Star,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { cn } from "@shared/lib/utils";
import { fetchNotifications } from "@shared/lib/data";
import { useRealtimeNotifications } from "@shared/hooks/use-realtime";
import { FallbackBanner } from "@shared/components/fallback-banner";
import { NotificationListSkeleton } from "@shared/components/loading-skeleton";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Types ───────────────────────────────────────────────────────────────────

type NotifType = "estimate_viewed" | "estimate_accepted" | "estimate_declined" | "payment_received" | "message" | "review" | "new_job" | "inspection" | "invoice_overdue" | "milestone";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
}

// ─── Mock fallback ──────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "estimate_viewed", title: "Michael Brown viewed your estimate", body: "Kitchen Remodel - Full Gut — $38,500", time: "2 min ago", read: false, href: "/contractor/estimates?tab=my-estimates" },
  { id: "n2", type: "message", title: "New message from Sarah Williams", body: "Hey Marcus, quick question about the tile selection for the shower...", time: "18 min ago", read: false, href: "/contractor/messages" },
  { id: "n3", type: "new_job", title: "New job posted near you", body: "Fence Installation — 150 LF Cedar, Starkville, MS — $5,000–$8,000", time: "45 min ago", read: false, href: "/contractor/work" },
  { id: "n4", type: "inspection", title: "Inspection scheduled tomorrow", body: "Roof Inspection — 15230 Cypress Creek, Houston — 1:00p", time: "1 hr ago", read: false, href: "/contractor/projects" },
  { id: "n5", type: "payment_received", title: "Payment received — $7,600", body: "Sarah Williams paid INV-2026-003 for Bathroom Renovation", time: "3 hrs ago", read: true, href: "/contractor/invoices" },
  { id: "n6", type: "estimate_accepted", title: "Estimate accepted", body: "Sarah Williams accepted your estimate for Bathroom Renovation — $15,200", time: "5 hrs ago", read: true, href: "/contractor/estimates?tab=my-estimates" },
  { id: "n7", type: "invoice_overdue", title: "Invoice overdue — 6 days", body: "INV-2026-004 for Robert Johnson (Deck Build) — $11,000", time: "6 hrs ago", read: true, href: "/contractor/invoices" },
  { id: "n8", type: "review", title: "New 5-star review", body: 'Michael Brown left a review: "Exceptional work on our kitchen remodel..."', time: "Yesterday", read: true, href: "/contractor/reviews" },
  { id: "n9", type: "milestone", title: "Milestone completed", body: "Kitchen Remodel — Cabinet Install marked complete", time: "Yesterday", read: true, href: "/contractor/projects" },
  { id: "n10", type: "estimate_declined", title: "Estimate declined", body: "Chris Martinez declined your estimate for Fence Installation — $6,750", time: "2 days ago", read: true, href: "/contractor/estimates?tab=my-estimates" },
];

const NOTIF_ICONS: Record<NotifType, { icon: React.ComponentType<{ className?: string }>; bg: string }> = {
  estimate_viewed:   { icon: Eye,          bg: "bg-gray-100 text-gray-600" },
  estimate_accepted: { icon: CheckCircle2, bg: "bg-gray-100 text-gray-600" },
  estimate_declined: { icon: AlertCircle,  bg: "bg-gray-100 text-gray-600" },
  payment_received:  { icon: DollarSign,   bg: "bg-gray-100 text-gray-600" },
  message:           { icon: MessageSquare, bg: "bg-gray-100 text-gray-600" },
  review:            { icon: Star,         bg: "bg-gray-100 text-gray-600" },
  new_job:           { icon: Briefcase,    bg: "bg-gray-100 text-gray-600" },
  inspection:        { icon: Calendar,     bg: "bg-gray-100 text-gray-600" },
  invoice_overdue:   { icon: AlertCircle,  bg: "bg-gray-100 text-gray-600" },
  milestone:         { icon: CheckCircle2, bg: "bg-gray-100 text-gray-600" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  usePageTitle("Notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  // Try real-time notifications
  const rt = useRealtimeNotifications();

  useEffect(() => {
    fetchNotifications().then(({ data, isMock: mock }) => {
      if (!mock && data.length > 0) {
        setNotifications(data.map((n: any) => ({
          id: n.id,
          type: (n.type || "new_job") as NotifType,
          title: n.title,
          body: n.body,
          time: n.created_at ? new Date(n.created_at).toLocaleDateString() : n.time || "",
          read: n.read ?? false,
          href: n.href || "/contractor/dashboard",
        })));
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
        setIsMock(true);
      }
      setLoading(false);
    });
  }, []);

  // Merge real-time notifications
  useEffect(() => {
    if (rt.notifications.length > 0 && !isMock) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newNotifs = rt.notifications
          .filter((n: any) => !existingIds.has(n.id))
          .map((n: any) => ({
            id: n.id,
            type: (n.type || "new_job") as NotifType,
            title: n.title,
            body: n.body,
            time: n.created_at ? new Date(n.created_at).toLocaleDateString() : "Just now",
            read: n.read ?? false,
            href: n.href || "/contractor/dashboard",
          }));
        return [...newNotifs, ...prev];
      });
    }
  }, [rt.notifications, isMock]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    rt.markAllRead();
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    rt.markRead(id);
  };

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {isMock && <FallbackBanner />}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-[13px] font-bold text-white bg-red-500 rounded-sm px-2 py-0.5 tabular-nums">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[13px] font-medium text-brand-600 hover:text-brand-700 transition-colors">
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-[800px]">
          <div className="flex items-center gap-2 mb-5">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-[13px] font-medium px-3 py-1.5 rounded-sm transition-colors",
                  filter === f ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                )}
              >
                {f === "all" ? "All" : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>

          {loading ? (
            <NotificationListSkeleton />
          ) : (
            <div className="space-y-1">
              {filtered.map((notif) => {
                const config = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.new_job;
                const Icon = config.icon;
                return (
                  <Link
                    key={notif.id}
                    href={notif.href}
                    onClick={() => markRead(notif.id)}
                    className={cn(
                      "flex gap-4 rounded-sm px-4 py-4 transition-all hover:bg-white",
                      !notif.read && "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0", config.bg)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className={cn("text-[14px] text-gray-900 leading-snug", !notif.read && "font-bold")}>{notif.title}</p>
                        <span className="text-[11px] text-gray-600 flex-shrink-0 pt-0.5">{notif.time}</span>
                      </div>
                      <p className="text-[13px] text-gray-600 mt-0.5 line-clamp-1">{notif.body}</p>
                    </div>
                    {!notif.read && <div className="w-2.5 h-2.5 rounded-sm bg-brand-600 flex-shrink-0 mt-1.5" />}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
