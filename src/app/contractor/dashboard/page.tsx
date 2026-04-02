"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Users,
  CalendarClock,
  DollarSign,
  Clock,
  ArrowUpRight,
  FileText,
  Briefcase,
  Bell,
  MessageSquare,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import {
  contractorDashboardStats,
  mockJobs,
  mockEstimates,
  mockReviews,
  type Job,
  type Estimate,
} from "@shared/lib/mock-data";
import { fetchJobs, fetchEstimates, fetchReviews } from "@shared/lib/data";
import { formatCurrency, cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Burning the midnight oil";
  if (h < 9) return "Rise and grind";
  if (h < 12) return "Let's get after it";
  if (h < 14) return "Afternoon, boss";
  if (h < 17) return "Still grinding";
  if (h < 20) return "Wrapping up the day";
  return "Clocking out soon";
}

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

// ─── Constants ────────────────────────────────────────────────────────────────

const URGENCY_STYLE: Record<string, { dot: string; label: string; badge: string }> = {
  low:    { dot: "bg-gray-300", label: "Low", badge: "bg-gray-100 text-gray-800" },
  medium: { dot: "bg-amber-400", label: "Med", badge: "bg-amber-50 text-amber-700" },
  high:   { dot: "bg-red-500",  label: "Urgent", badge: "bg-red-50 text-red-700" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Remodeling: "bg-brand-600", Electrical: "bg-blue-600", Roofing: "bg-amber-600",
  HVAC: "bg-violet-600", Painting: "bg-pink-600", Flooring: "bg-teal-600",
  Fencing: "bg-orange-600", Concrete: "bg-gray-600", "Outdoor Living": "bg-emerald-600",
};

const TYPE_ACCENT: Record<string, { border: string; bg: string; text: string }> = {
  work:       { border: "border-l-brand-600", bg: "bg-brand-50",  text: "text-brand-700" },
  visit:      { border: "border-l-brand-400", bg: "bg-brand-50",  text: "text-brand-700" },
  inspection: { border: "border-l-brand-500", bg: "bg-brand-50",  text: "text-brand-700" },
  estimate:   { border: "border-l-brand-300", bg: "bg-brand-50",  text: "text-brand-700" },
};

const TYPE_LABEL: Record<string, string> = {
  work: "Active", visit: "Site Visit", inspection: "Inspection", estimate: "Estimate",
};

const TODAYS_SCHEDULE = [
  { time: "7:00a", endTime: "11:00a", label: "Countertop template", detail: "Template quartz countertops — confirm sink cutout and edge profile", location: "4821 Ridgeline Dr, Austin", crew: ["Marcus", "Tony"], type: "work", client: "Michael Brown" },
  { time: "10:00a", endTime: "11:30a", label: "Tile delivery — Bathroom", detail: "Receive tile delivery, verify quantities against order sheet", location: "7744 Stone Oak Pkwy, SA", crew: ["Tony"], type: "visit", client: "Sarah Williams" },
  { time: "1:00p", endTime: "4:00p", label: "Decking boards install", detail: "Install composite decking boards — 14 squares, stagger joints", location: "902 Pecan Valley, Austin", crew: ["Marcus", "David"], type: "work", client: "Robert Johnson" },
  { time: "3:30p", endTime: "4:30p", label: "Final inspection — Roof", detail: "City inspector on site — bring permit docs, insurance cert, and ladder", location: "15230 Cypress Creek, Houston", crew: ["David", "Alex"], type: "inspection", client: "Patricia Taylor" },
];

const ACTIVE_MILESTONES = [
  { projectId: "j1", project: "Kitchen Remodel", client: "Michael Brown", label: "Countertops", milestoneIndex: 3, status: "in_progress" as const },
  { projectId: "j2", project: "Bathroom Reno", client: "Sarah Williams", label: "Tile & waterproofing", milestoneIndex: 2, status: "in_progress" as const },
  { projectId: "j3", project: "Deck Build", client: "Robert Johnson", label: "Decking boards", milestoneIndex: 2, status: "in_progress" as const },
  { projectId: "j4", project: "Roof Replacement", client: "Patricia Taylor", label: "Flashings & ridge", milestoneIndex: 3, status: "in_progress" as const },
  { projectId: "j1", project: "Kitchen Remodel", client: "Michael Brown", label: "Cabinet install", milestoneIndex: 2, status: "done" as const },
  { projectId: "j3", project: "Deck Build", client: "Robert Johnson", label: "Framing", milestoneIndex: 1, status: "done" as const },
];

// ─── Job Carousel ────────────────────────────────────────────────────────────

function JobCarousel({ jobs }: { jobs: Job[] }) {
  const [active, setActive] = useState(0);
  const next = useCallback(() => setActive((i) => (i + 1) % jobs.length), [jobs.length]);
  const prev = useCallback(() => setActive((i) => (i - 1 + jobs.length) % jobs.length), [jobs.length]);
  const job = jobs[active];
  if (!job) return null;

  return (
    <div className="px-5 pb-4 flex-1 flex flex-col min-h-0">
      <div className="relative flex-1 flex flex-col min-h-0">
        {/* Image */}
        <div className="flex-1 min-h-[120px] bg-gray-100 rounded-none overflow-hidden relative">
          <Image src={job.thumbnail} alt={job.title} width={400} height={300} className="w-full h-full object-cover transition-opacity duration-300" />
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-none bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <ChevronLeft className="w-3.5 h-3.5 text-gray-900" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-none bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <ChevronRight className="w-3.5 h-3.5 text-gray-900" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {jobs.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={cn("w-1.5 h-1.5 rounded-none transition-all", i === active ? "bg-white w-3" : "bg-white/50")} />
            ))}
          </div>
        </div>
        {/* Details */}
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <p className="text-[18px] font-bold text-gray-900 truncate flex-1 min-w-0">{job.title}</p>
            <p className="text-[18px] font-bold text-gray-900 tabular-nums flex-shrink-0 ml-3">{formatCurrency(job.budget.min)}–{formatCurrency(job.budget.max)}</p>
          </div>
          <p className="text-[13px] text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{job.location}</p>
          {job.description && (
            <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-1">{job.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-[13px] text-gray-500">
            <span>{job.category}</span>
            <span>{job.bidsCount} bids</span>
            <span>{job.estimatedDuration}</span>
          </div>
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
          <span className="text-[13px] font-semibold text-gray-600 bg-gray-100 rounded-none px-2 py-0.5 tabular-nums">{count}</span>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContractorDashboardPage() {
  usePageTitle("Dashboard");
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [estimates, setEstimates] = useState<Estimate[]>(mockEstimates);
  const [reviews, setReviews] = useState(mockReviews);

  useEffect(() => {
    fetchJobs().then(setJobs);
    fetchEstimates().then(setEstimates);
    fetchReviews().then((apiReviews) => {
      if (apiReviews.length > 0) setReviews(apiReviews);
    });
  }, []);

  const { activeJobs, monthlyRevenue, estimatesSent, estimatesAccepted, revenueChange, avgRating, responseTime } = contractorDashboardStats;
  const winRate = Math.round((estimatesAccepted / estimatesSent) * 100);
  const openJobs = jobs.filter((j) => j.status === "open");
  const pendingEstimates = estimates.filter((e) => e.status === "sent" || e.status === "viewed");
  const acceptedEstimates = estimates.filter((e) => e.status === "accepted");
  const totalPipeline = pendingEstimates.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-semibold text-gray-900 tracking-tight">{formatTodayDate()}</h1>
          <div className="flex items-center gap-3">
            <Link href="/contractor/estimates?tab=agent" className="flex items-center gap-1.5 h-8 px-3 rounded-none bg-gray-900 text-white text-[12px] font-semibold hover:bg-gray-800 transition-colors">
              <Briefcase className="w-3.5 h-3.5" />
              Estimate Agent
            </Link>
            <Link href="/contractor/estimates" className="flex items-center gap-1.5 h-8 px-3 rounded-none bg-brand-600 text-white text-[12px] font-semibold hover:bg-brand-700 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              New Estimate
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-4 md:px-6 py-4 flex justify-center overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 md:grid-rows-2 gap-4 w-full max-w-[1400px] h-full overflow-y-auto xl:overflow-hidden">

          {/* Job Marketplace */}
          <BentoTile className="col-span-1 xl:col-span-2">
            <TileHeader title="Job Marketplace" count={openJobs.length} linkHref="/contractor/work" linkLabel="Browse all" />
            <JobCarousel jobs={openJobs.slice(0, 6)} />
          </BentoTile>

          {/* Milestones */}
          <BentoTile className="col-span-1 xl:col-span-2">
            <TileHeader title="Milestones" count={ACTIVE_MILESTONES.filter(m => m.status === "in_progress").length} linkHref="/contractor/projects" linkLabel="All projects" />
            <div className="px-5 pb-5">
              {ACTIVE_MILESTONES.map((m, i) => (
                <Link key={i} href={`/contractor/projects?project=${m.projectId}&tab=milestones&milestone=${m.milestoneIndex}`} className="group flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 hover:opacity-80 transition-opacity">
                  {m.status === "done"
                    ? <CheckCircle2 className="w-4.5 h-4.5 text-brand-600 flex-shrink-0" />
                    : <Circle className="w-4.5 h-4.5 text-gray-300 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-[14px] font-bold truncate", m.status === "done" ? "text-gray-500" : "text-gray-900")}>{m.label}</p>
                    <p className="text-[12px] text-gray-500">{m.project} — {m.client}</p>
                  </div>
                  {m.status === "done" && <span className="text-[11px] font-semibold text-brand-600 flex-shrink-0">Complete</span>}
                  {m.status === "in_progress" && <span className="text-[11px] font-semibold text-amber-600 flex-shrink-0">In Progress</span>}
                </Link>
              ))}
            </div>
          </BentoTile>

          <BentoTile className="col-span-1 xl:col-span-2">
            <TileHeader title="Estimate History" count={pendingEstimates.length} linkHref="/contractor/estimates?tab=my-estimates" linkLabel="View all" />
            <div className="px-5 pb-5">
              {pendingEstimates.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {pendingEstimates.map((est) => (
                    <Link key={est.id} href="/contractor/estimates?tab=my-estimates" className="group flex items-center justify-between hover:opacity-80 transition-opacity">
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
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h2 className="text-[20px] font-bold text-gray-900">Scorecard</h2>
              <Link href="/contractor/estimates?tab=my-estimates" className="text-[14px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5 group">
                Details <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="px-5 pb-4 flex-1 flex flex-col justify-center">
              {/* Revenue + Rating */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="text-[14px] font-medium text-gray-500">Revenue</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-[36px] font-bold text-gray-900 tabular-nums leading-none">{formatCurrency(monthlyRevenue)}</p>
                    <span className="text-[14px] font-semibold text-emerald-950">+{revenueChange}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium text-gray-500">Rating</p>
                  <p className="text-[36px] font-bold text-gray-900 tabular-nums leading-none mt-1">{avgRating}</p>
                  <p className="text-[13px] text-gray-500 mt-1">{reviews.length} reviews</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-evenly text-center pt-4">
                <div>
                  <p className="text-[15px] font-bold text-gray-900">Win Rate</p>
                  <p className="text-[28px] font-medium text-gray-900 tabular-nums leading-tight mt-1">{winRate}%</p>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900">Pending</p>
                  <p className="text-[28px] font-medium text-gray-900 tabular-nums leading-tight mt-1">{formatCurrency(totalPipeline)}</p>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900">Response</p>
                  <p className="text-[28px] font-medium text-gray-900 tabular-nums leading-tight mt-1">{responseTime}</p>
                </div>
              </div>

            </div>
          </BentoTile>

        </div>
      </div>
    </div>
  );
}
