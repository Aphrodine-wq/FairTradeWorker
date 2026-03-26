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
  low:    { dot: "bg-gray-300", label: "Low", badge: "bg-gray-100 text-gray-600" },
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
  { time: "7:00a", endTime: "4:00p", label: "Kitchen Remodel", detail: "Framing south wall, install headers", location: "4821 Ridgeline Dr, Austin", crew: ["Marcus", "Tony", "David"], type: "work", client: "Michael Brown" },
  { time: "10:00a", endTime: "11:30a", label: "Site Visit — Bathroom Reno", detail: "Walk-through with homeowner, take measurements for tile order", location: "7744 Stone Oak Pkwy, SA", crew: ["Marcus"], type: "visit", client: "Sarah Williams" },
  { time: "1:00p", endTime: "2:00p", label: "Roof Inspection", detail: "City inspector on site — bring ladder, permit docs, and insurance cert", location: "15230 Cypress Creek, Houston", crew: ["David", "Alex"], type: "inspection", client: "Linda Okafor" },
  { time: "3:30p", endTime: "4:30p", label: "Estimate Walkthrough — HVAC", detail: "Measure ductwork, check attic access, photograph existing system", location: "1845 Sam Bass Rd, Round Rock", crew: ["Marcus"], type: "estimate", client: "Kevin Nguyen" },
];

// ─── Job Carousel ────────────────────────────────────────────────────────────

function JobCarousel({ jobs }: { jobs: Job[] }) {
  const [active, setActive] = useState(0);
  const next = useCallback(() => setActive((i) => (i + 1) % jobs.length), [jobs.length]);
  const prev = useCallback(() => setActive((i) => (i - 1 + jobs.length) % jobs.length), [jobs.length]);
  const job = jobs[active];
  if (!job) return null;

  return (
    <div className="px-5 pb-5">
      <div className="relative">
        {/* Image */}
        <div className="h-[180px] bg-gray-100 rounded-xl overflow-hidden relative">
          <Image src={job.thumbnail} alt={job.title} width={400} height={300} className="w-full h-full object-cover transition-opacity duration-300" />
          {/* Nav arrows */}
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {jobs.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === active ? "bg-white w-4" : "bg-white/50")} />
            ))}
          </div>
        </div>
        {/* Details */}
        <div className="mt-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[18px] font-bold text-gray-900 truncate">{job.title}</p>
              <p className="text-[14px] text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{job.location}</p>
            </div>
            <p className="text-[18px] font-bold text-gray-900 tabular-nums flex-shrink-0 ml-3">{formatCurrency(job.budget.min)}–{formatCurrency(job.budget.max)}</p>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[14px] text-gray-400">
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
    <div className={cn("overflow-hidden", className)}>
      {children}
    </div>
  );
}

function TileHeader({ title, count, linkHref, linkLabel }: { title: string; count?: number; linkHref?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3">
      <div className="flex items-center gap-2.5">
        <h2 className="text-[22px] font-bold text-gray-900">{title}</h2>
        {count !== undefined && (
          <span className="text-[13px] font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 tabular-nums">{count}</span>
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
    <div className="flex flex-col min-h-full bg-surface">
      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">{formatTodayDate()}</h1>
          <div className="flex items-center gap-3">
            <Link href="/contractor/estimates?tab=agent" className="flex items-center gap-2 h-10 px-4 rounded-lg bg-gray-900 text-white text-[13px] font-semibold hover:bg-gray-800 transition-colors shadow-sm">
              <Briefcase className="w-4 h-4" />
              Estimate Agent
            </Link>
            <Link href="/contractor/estimates">
              <Button className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                New Estimate
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-6 py-5 flex justify-center">
        <div className="grid grid-cols-4 gap-5 w-full max-w-[1400px]">

          {/* Job Marketplace */}
          <BentoTile className="col-span-2">
            <TileHeader title="Job Marketplace" count={openJobs.length} linkHref="/contractor/work" linkLabel="Browse all" />
            <JobCarousel jobs={openJobs.slice(0, 6)} />
          </BentoTile>

          {/* Schedule — simplified, just time + label */}
          <BentoTile className="col-span-2">
            <TileHeader title="Schedule" count={TODAYS_SCHEDULE.length} linkHref="/contractor/projects" linkLabel="All projects" />
            <div className="px-5 pb-5">
              {TODAYS_SCHEDULE.map((entry) => {
                const accent = TYPE_ACCENT[entry.type] || TYPE_ACCENT.work;
                return (
                  <Link key={entry.time} href="/contractor/projects" className="group flex items-center gap-4 hover:opacity-80 transition-opacity py-3 border-b border-gray-100 last:border-0">
                    <span className="text-[15px] font-bold text-gray-900 tabular-nums w-[75px] flex-shrink-0">{entry.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-gray-900 group-hover:text-brand-700 transition-colors truncate">{entry.label}</p>
                      <p className="text-[12px] text-gray-400">{entry.client}</p>
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0", accent.bg, accent.text)}>
                      {TYPE_LABEL[entry.type]}
                    </span>
                  </Link>
                );
              })}
            </div>
          </BentoTile>

          <BentoTile className="col-span-2">
            <TileHeader title="Estimate History" count={pendingEstimates.length} linkHref="/contractor/estimates?tab=my-estimates" linkLabel="View all" />
            <div className="px-5 pb-5">
              {pendingEstimates.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {pendingEstimates.map((est) => (
                    <Link key={est.id} href="/contractor/estimates?tab=my-estimates" className="group flex items-center justify-between hover:opacity-80 transition-opacity">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-gray-900 group-hover:text-brand-700 transition-colors truncate">{est.clientName}</p>
                        <p className="text-[15px] text-gray-700 tabular-nums mt-0.5">{formatCurrency(est.amount)}</p>
                      </div>
                      <Badge variant={est.status === "viewed" ? "warning" : "info"} className="text-[12px] min-w-[44px] justify-center flex-shrink-0 ml-3">
                        {est.status === "viewed" ? "Viewed" : "Sent"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">No pending estimates</p>
              )}
            </div>
          </BentoTile>

          {/* Scorecard */}
          <BentoTile className="col-span-2">
            <TileHeader title="Scorecard" linkHref="/contractor/estimates?tab=my-estimates" linkLabel="Details" />
            <div className="px-5 pb-5">
              {/* Revenue + Rating */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-[12px] text-gray-400">Revenue</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <p className="text-[26px] font-bold text-gray-900 tabular-nums leading-none">{formatCurrency(monthlyRevenue)}</p>
                    <span className="text-[12px] font-semibold text-emerald-600">+{revenueChange}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-gray-400">Rating</p>
                  <p className="text-[26px] font-bold text-gray-900 tabular-nums leading-none mt-0.5">{avgRating}</p>
                  <p className="text-[11px] text-gray-400">{reviews.length} reviews</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-[12px] text-gray-400">Win Rate</p>
                  <p className="text-[18px] font-bold text-gray-900 tabular-nums">{winRate}%</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-400">Pending</p>
                  <p className="text-[18px] font-bold text-gray-900 tabular-nums">{formatCurrency(totalPipeline)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-400">Response</p>
                  <p className="text-[18px] font-bold text-gray-900 tabular-nums">{responseTime}</p>
                </div>
              </div>

              {/* Recent wins */}
              {acceptedEstimates.slice(0, 2).map((est) => (
                <Link key={est.id} href="/contractor/estimates?tab=my-estimates" className="group flex items-center justify-between hover:opacity-80 transition-opacity py-2 border-b border-gray-100 last:border-0">
                  <p className="text-[14px] font-semibold text-gray-900 group-hover:text-brand-700 transition-colors truncate">{est.clientName}</p>
                  <span className="text-[14px] font-bold text-emerald-600 tabular-nums flex-shrink-0 ml-3">{formatCurrency(est.amount)}</span>
                </Link>
              ))}
            </div>
          </BentoTile>

        </div>
      </div>
    </div>
  );
}
