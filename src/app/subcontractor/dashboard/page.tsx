"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Users,
  Plus,
  Briefcase,
  CheckCircle2,
  Circle,
  Star,
  User,
} from "lucide-react";
import { Badge } from "@shared/ui/badge";
import {
  type SubJob,
  type Estimate,
  mockSubJobs,
} from "@shared/lib/mock-data";
import { fetchSubJobs, fetchSubContractorStats, fetchEstimates } from "@shared/lib/data";
import { formatCurrency, cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

function formatTodayDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

const URGENCY_STYLE: Record<string, { dot: string; label: string }> = {
  low:    { dot: "bg-gray-300", label: "Low" },
  medium: { dot: "bg-amber-400", label: "Med" },
  high:   { dot: "bg-red-500",  label: "Urgent" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "General Contracting": "bg-brand-600",
  Plumbing: "bg-blue-600",
  Electrical: "bg-amber-500",
  Roofing: "bg-red-600",
  Flooring: "bg-stone-600",
};

const PAYMENT_LABEL: Record<string, string> = {
  contractor_escrow: "GC Escrow",
  passthrough_escrow: "Pass-through",
};

// ─── Sub Job Carousel ───────────────────────────────────────────────────────

function SubJobCarousel({ subJobs }: { subJobs: SubJob[] }) {
  const [active, setActive] = useState(0);
  const next = useCallback(() => setActive((i) => (i + 1) % subJobs.length), [subJobs.length]);
  const prev = useCallback(() => setActive((i) => (i - 1 + subJobs.length) % subJobs.length), [subJobs.length]);
  const sj = subJobs[active];
  if (!sj) return null;

  const urgency = URGENCY_STYLE[sj.urgency] || URGENCY_STYLE.medium;
  const catColor = CATEGORY_COLORS[sj.category] || "bg-gray-600";
  const daysLeft = daysUntil(sj.deadline);

  return (
    <div className="px-5 pb-4 flex-1 flex flex-col min-h-0">
      <div className="relative flex-1 flex flex-col min-h-0">
        {/* Visual header */}
        <div className="flex-1 min-h-[120px] bg-gray-50 border border-gray-200 overflow-hidden relative flex flex-col justify-between p-4">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[18px] font-bold text-gray-900 leading-tight">{sj.title}</p>
                <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-1.5">
                  <span className={cn("w-2 h-2 rounded-sm flex-shrink-0", catColor)} />
                  {sj.milestoneLabel} — {sj.projectTitle}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={cn("w-2 h-2 rounded-full", urgency.dot)} />
                <span className="text-[11px] font-semibold text-gray-500">{urgency.label}</span>
              </div>
            </div>
            <p className="text-[13px] text-gray-600 mt-2 line-clamp-2">{sj.description}</p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[18px] font-bold text-gray-900 tabular-nums">
              {formatCurrency(sj.budgetMin)}–{formatCurrency(sj.budgetMax)}
            </p>
            <div className="flex items-center gap-3 text-[12px] text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{sj.location}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{sj.bidsCount} bids</span>
              <span className={cn(
                "text-[11px] font-semibold px-1.5 py-0.5",
                daysLeft <= 7 ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"
              )}>
                {daysLeft}d left
              </span>
            </div>
          </div>

          {/* Nav arrows */}
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 border border-gray-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <ChevronLeft className="w-3.5 h-3.5 text-gray-900" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 border border-gray-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <ChevronRight className="w-3.5 h-3.5 text-gray-900" />
          </button>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-1 mt-2">
          {subJobs.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className={cn("w-1.5 h-1.5 rounded-sm transition-all", i === active ? "bg-brand-600 w-3" : "bg-gray-300")} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Bento Tile ──────────────────────────────────────────────────────────────

function BentoTile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden flex flex-col", className)}>
      {children}
    </div>
  );
}

function TileHeader({ title, count, linkHref, linkLabel }: { title: string; count?: number; linkHref?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3">
      <div className="flex items-center gap-2.5">
        <h2 className="text-[20px] font-bold text-gray-900">{title}</h2>
        {count !== undefined && (
          <span className="text-[13px] font-semibold text-gray-600 bg-gray-100 rounded-sm px-2 py-0.5 tabular-nums">{count}</span>
        )}
      </div>
      {linkHref && (
        <Link href={linkHref} className="text-[14px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5 group">
          {linkLabel} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SubContractorDashboardPage() {
  usePageTitle("Dashboard");
  const pathname = usePathname();
  const isDemoFixture = pathname.startsWith("/demo/subcontractor");
  const basePath = isDemoFixture ? "/demo/subcontractor" : "/subcontractor";

  const [subJobs, setSubJobs] = useState<SubJob[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [stats, setStats] = useState({ activeSubJobs: 0, completedSubJobs: 0, monthlyRevenue: 0, revenueChange: 0, avgRating: 0, winRate: 0, responseTime: "—", pendingBids: 0 });

  useEffect(() => {
    if (isDemoFixture) {
      setSubJobs(mockSubJobs);
      setEstimates([]);
      setStats({
        activeSubJobs: 2,
        completedSubJobs: 14,
        monthlyRevenue: 12400,
        revenueChange: 8,
        avgRating: 4.8,
        winRate: 62,
        responseTime: "2.1 hrs",
        pendingBids: 3,
      });
      return;
    }
    fetchSubJobs().then(setSubJobs);
    fetchEstimates().then(setEstimates);
    fetchSubContractorStats().then(setStats);
  }, [isDemoFixture]);
  const openSubJobs = subJobs.filter((sj) => sj.status === "open");
  const activeSubJobs = subJobs.filter((sj) => sj.status === "in_progress");
  const pendingEstimates = estimates.filter((e) => e.status === "sent" || e.status === "viewed");
  const totalPipeline = pendingEstimates.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-semibold text-gray-900 tracking-tight">{formatTodayDate()}</h1>
          <div className="flex items-center gap-3">
            <Link href={`${basePath}/work`} className="flex items-center gap-1.5 h-8 px-3 rounded-sm bg-gray-900 text-white text-[12px] font-semibold hover:bg-gray-800 transition-colors">
              <Briefcase className="w-3.5 h-3.5" />
              Find Work
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-4 flex justify-center overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 md:grid-rows-2 gap-4 w-full max-w-[1400px] h-full overflow-y-auto xl:overflow-hidden">

          {/* Sub Job Marketplace */}
          <BentoTile className="col-span-1 xl:col-span-2">
            <TileHeader title="Sub Job Marketplace" count={openSubJobs.length} linkHref={`${basePath}/work`} linkLabel="Browse all" />
            <SubJobCarousel subJobs={openSubJobs} />
          </BentoTile>

          {/* Active Sub Jobs */}
          <BentoTile className="col-span-1 xl:col-span-2">
            <TileHeader title="Active Sub Jobs" count={activeSubJobs.length} linkHref={`${basePath}/jobs`} linkLabel="All jobs" />
            <div className="px-5 pb-5">
              {activeSubJobs.length > 0 ? (
                activeSubJobs.map((sj, i) => (
                  <Link key={sj.id} href={`${basePath}/jobs`} className="group flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 hover:opacity-80 transition-opacity">
                    <Circle className="w-4.5 h-4.5 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-gray-900 truncate">{sj.title}</p>
                      <p className="text-[12px] text-gray-500">{sj.milestoneLabel} — {sj.contractorName}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-600 flex-shrink-0">In Progress</span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-600 text-center py-6">No active sub jobs</p>
              )}

              {/* Recently completed placeholder */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Completed</p>
                <div className="flex items-center gap-3 py-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-brand-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-500 truncate">HVAC Ductwork Install</p>
                    <p className="text-[12px] text-gray-400">Ductwork — Office Buildout</p>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-600 flex-shrink-0">Complete</span>
                </div>
              </div>
            </div>
          </BentoTile>

          {/* Estimate History */}
          <BentoTile className="col-span-1 xl:col-span-2">
            <TileHeader title="Estimate History" count={pendingEstimates.length} linkHref={`${basePath}/estimates`} linkLabel="View all" />
            <div className="px-5 pb-5">
              {pendingEstimates.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {pendingEstimates.map((est) => (
                    <Link key={est.id} href={`${basePath}/estimates`} className="group flex items-center justify-between hover:opacity-80 transition-opacity">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-gray-900 group-hover:text-brand-700 transition-colors truncate">{est.clientName}</p>
                        <p className="text-base text-gray-900 tabular-nums mt-0.5">{formatCurrency(est.amount)}</p>
                      </div>
                      <Badge variant={est.status === "viewed" ? "warning" : "info"} className="text-[12px] min-w-[44px] justify-center flex-shrink-0 ml-3">
                        {est.status === "viewed" ? "Viewed" : "Sent"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-6">No pending estimates</p>
              )}
            </div>
          </BentoTile>

          {/* Scorecard */}
          <BentoTile className="col-span-1 xl:col-span-2 bg-white border border-gray-200">
            <TileHeader title="Scorecard" linkHref={`${basePath}/records`} linkLabel="Details" />
            <div className="px-5 pb-4 flex-1 flex flex-col justify-center">
              {/* Revenue + Rating */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="text-[14px] font-medium text-gray-500">Revenue</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-[36px] font-bold text-gray-900 tabular-nums leading-none">{formatCurrency(stats.monthlyRevenue)}</p>
                    <span className="text-[14px] font-semibold text-emerald-950">+{stats.revenueChange}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium text-gray-500">Rating</p>
                  <p className="text-[36px] font-bold text-gray-900 tabular-nums leading-none mt-1">{stats.avgRating}</p>
                  <p className="text-[13px] text-gray-500 mt-1">{stats.completedSubJobs} jobs done</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-evenly text-center pt-4">
                <div>
                  <p className="text-[15px] font-bold text-gray-900">Win Rate</p>
                  <p className="text-[28px] font-medium text-gray-900 tabular-nums leading-tight mt-1">{stats.winRate}%</p>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900">Pending</p>
                  <p className="text-[28px] font-medium text-gray-900 tabular-nums leading-tight mt-1">{stats.pendingBids}</p>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900">Response</p>
                  <p className="text-[28px] font-medium text-gray-900 tabular-nums leading-tight mt-1">{stats.responseTime}</p>
                </div>
              </div>
            </div>
          </BentoTile>

        </div>
      </div>
    </div>
  );
}
