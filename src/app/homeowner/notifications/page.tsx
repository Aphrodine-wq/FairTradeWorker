"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  Gavel,
  Users,
  FileText,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@shared/lib/utils";
import { fetchNotifications } from "@shared/lib/data";
import { useRealtimeNotifications } from "@shared/hooks/use-realtime";
import { NotificationListSkeleton } from "@shared/components/loading-skeleton";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Types ───────────────────────────────────────────────────────────────────

type NotifType = "new_bid" | "message" | "bid_accepted" | "milestone_complete" | "payment_confirmed" | "review_reminder" | "contractor_match" | "estimate_updated" | "job_expired" | "verification_update";
type FilterKey = "all" | "bids" | "messages" | "projects" | "payments";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
  filterGroup: FilterKey;
}

const NOTIF_ICONS: Record<NotifType, { icon: React.ComponentType<{ className?: string }>; bg: string }> = {
  new_bid:            { icon: Gavel,        bg: "bg-blue-100 text-blue-600" },
  message:            { icon: MessageSquare, bg: "bg-violet-100 text-violet-600" },
  bid_accepted:       { icon: CheckCircle2,  bg: "bg-emerald-950/10 text-emerald-950" },
  milestone_complete: { icon: Clock,         bg: "bg-amber-100 text-amber-600" },
  payment_confirmed:  { icon: DollarSign,    bg: "bg-emerald-950/10 text-emerald-950" },
  review_reminder:    { icon: Star,          bg: "bg-amber-100 text-amber-600" },
  contractor_match:   { icon: Users,         bg: "bg-brand-100 text-brand-600" },
  estimate_updated:   { icon: FileText,      bg: "bg-blue-100 text-blue-600" },
  job_expired:        { icon: XCircle,       bg: "bg-red-100 text-red-600" },
  verification_update:{ icon: ShieldCheck,   bg: "bg-brand-100 text-brand-600" },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "bids", label: "Bids" },
  { key: "messages", label: "Messages" },
  { key: "projects", label: "Projects" },
  { key: "payments", label: "Payments" },
];

// Helper to infer filter group from notification type
function inferFilterGroup(type: string): FilterKey {
  if (["new_bid", "contractor_match", "estimate_updated"].includes(type)) return "bids";
  if (type === "message") return "messages";
  if (["milestone_complete", "payment_confirmed"].includes(type)) return "payments";
  return "projects";
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomeownerNotificationsPage() {
  usePageTitle("Notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  const rt = useRealtimeNotifications();

  useEffect(() => {
    fetchNotifications().then(({ data, isMock: mock }) => {
      setNotifications(data.map((n: any) => ({
        id: n.id,
        type: (n.type || "new_bid") as NotifType,
        title: n.title,
        body: n.body,
        time: n.created_at ? new Date(n.created_at).toLocaleDateString() : n.time || "",
        read: n.read ?? false,
        href: n.href || "/homeowner/dashboard",
        filterGroup: inferFilterGroup(n.type || "new_bid"),
      })));
      setIsMock(Boolean(mock));
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
            type: (n.type || "new_bid") as NotifType,
            title: n.title,
            body: n.body,
            time: "Just now",
            read: false,
            href: n.href || "/homeowner/dashboard",
            filterGroup: inferFilterGroup(n.type || "new_bid"),
          }));
        return [...newNotifs, ...prev];
      });
    }
  }, [rt.notifications, isMock]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.filterGroup === filter);
  const filterUnreadCount = (key: FilterKey) =>
    key === "all" ? unreadCount : notifications.filter((n) => n.filterGroup === key && !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    rt.markAllRead();
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    rt.markRead(id);
  };

  return (
    <div className="flex flex-col min-h-full bg-surface">
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
            {FILTERS.map((f) => {
              const count = filterUnreadCount(f.key);
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "text-[13px] font-medium px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5",
                    filter === f.key ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {f.label}
                  {count > 0 && (
                    <span className={cn("text-[11px] font-bold rounded-sm px-1.5 py-0.5 tabular-nums leading-none", filter === f.key ? "bg-white/20 text-white" : "bg-red-500 text-white")}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <NotificationListSkeleton />
          ) : (
            <div className="space-y-1">
              {filtered.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-[14px] text-gray-600">No notifications in this category.</p>
                </div>
              )}
              {filtered.map((notif) => {
                const config = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.new_bid;
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
