"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Briefcase,
  Hammer,
  FileText,
} from "lucide-react";
import { Badge } from "@shared/ui/badge";
import {
  contractorDashboardStats,
  mockJobs,
  mockEstimates,
  mockReviews,
  type Job,
  type Estimate,
} from "@shared/lib/mock-data";
import { fetchJobs, fetchEstimates, fetchReviews, fetchProjects } from "@shared/lib/data";
import { formatCurrency, cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";
import { api } from "@shared/lib/realtime";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface DashboardProjectCard {
  id: string;
  title: string;
  clientName: string;
  currentMilestone: string | null;
}

function formatTodayDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function milestoneLabel(m: Record<string, unknown>): string {
  return String(m.label ?? m.name ?? m.title ?? "").trim();
}

function normStatus(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .replace(/\s+/g, "_");
}

/** Current milestone for a project payload from GET /api/projects */
function getCurrentMilestoneFromProject(project: Record<string, unknown>): string | null {
  const raw = project.milestones;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const ms = raw as Record<string, unknown>[];
  const inProg = ms.find((m) => {
    const st = normStatus(m.status);
    return st === "in_progress" || st === "inprogress" || m.in_progress === true;
  });
  if (inProg) {
    const lab = milestoneLabel(inProg);
    if (lab) return lab;
  }
  const pending = ms.find((m) => {
    const st = normStatus(m.status);
    const done = m.done === true || st === "complete" || st === "paid";
    return !done;
  });
  if (pending) {
    const lab = milestoneLabel(pending);
    if (lab) return lab;
  }
  const allComplete = ms.every((m) => {
    const st = normStatus(m.status);
    return m.done === true || st === "complete" || st === "paid";
  });
  if (allComplete) {
    const last = ms[ms.length - 1];
    const lab = milestoneLabel(last);
    return lab ? lab : null;
  }
  return null;
}

function projectToDashboardCard(project: Record<string, unknown>): DashboardProjectCard {
  const homeowner = project.homeowner as Record<string, unknown> | undefined;
  const client = project.client as Record<string, unknown> | undefined;
  const clientName =
    String(project.clientName ?? project.client_name ?? homeowner?.name ?? client?.name ?? "").trim();
  return {
    id: String(project.id ?? ""),
    title: String(project.title ?? project.name ?? "Project").trim() || "Project",
    clientName,
    currentMilestone: getCurrentMilestoneFromProject(project),
  };
}

/** When dashboard returns flat milestone rows, group into one card per project */
function groupDashboardMilestoneRows(items: Record<string, unknown>[]): DashboardProjectCard[] {
  const byProject = new Map<string, { id: string; title: string; client: string; rows: Record<string, unknown>[] }>();
  for (const row of items) {
    const id = String(row.projectId ?? row.project_id ?? "").trim();
    if (!id) continue;
    let g = byProject.get(id);
    if (!g) {
      g = {
        id,
        title: String(row.project ?? row.projectTitle ?? "Project").trim() || "Project",
        client: String(row.client ?? row.clientName ?? "").trim(),
        rows: [],
      };
      byProject.set(id, g);
    }
    g.rows.push(row);
  }
  return [...byProject.values()].map((g) => {
    const inProg = g.rows.find((r) => normStatus(r.status) === "in_progress");
    if (inProg && milestoneLabel(inProg)) {
      return { id: g.id, title: g.title, clientName: g.client, currentMilestone: milestoneLabel(inProg) };
    }
    const notDone = g.rows.find((r) => {
      const st = normStatus(r.status);
      return st !== "done" && st !== "completed" && st !== "paid";
    });
    if (notDone && milestoneLabel(notDone)) {
      return { id: g.id, title: g.title, clientName: g.client, currentMilestone: milestoneLabel(notDone) };
    }
    const last = g.rows[g.rows.length - 1];
    return {
      id: g.id,
      title: g.title,
      clientName: g.client,
      currentMilestone: last ? milestoneLabel(last) : null,
    };
  });
}

function mapDashboardMarketplaceItemToJob(item: any, index: number): Job {
  const pb = item.posted_by ?? item.postedBy;
  const ho = item.homeowner;
  const postedByName =
    (typeof pb === "object" && pb?.name) ||
    (typeof ho === "object" && ho?.name) ||
    item.postedBy ||
    "Homeowner";
  const postedByRating = Number(
    (typeof pb === "object" ? pb?.rating : undefined) ??
      (typeof ho === "object" ? ho?.rating : undefined) ??
      item.postedByRating ??
      0
  );
  const postedByJobs = Number((typeof pb === "object" ? pb?.jobs_posted : undefined) ?? item.postedByJobs ?? 0);
  const postedByAvatar = String(
    (typeof pb === "object" ? pb?.avatar : undefined) ??
      (typeof ho === "object" ? ho?.avatar_url : undefined) ??
      item.postedByAvatar ??
      ""
  );

  const prop = item.property ?? {};
  return {
    id: item.id || `dash-job-${index}`,
    title: item.title || "Job",
    description: item.description || "",
    detailedScope: (item.detailed_scope ?? item.detailedScope ?? item.description) || "",
    category: item.category || "General",
    subcategory: item.subcategory || item.category || "General",
    budget: {
      min: Number(item.budget?.min ?? item.budget_min ?? 0),
      max: Number(item.budget?.max ?? item.budget_max ?? 0),
    },
    location: item.location || "",
    fullAddress: (item.full_address ?? item.fullAddress ?? item.location) || "",
    postedBy: String(postedByName),
    postedByRating,
    postedByJobs,
    postedByAvatar,
    postedDate: (item.inserted_at ?? item.posted_at ?? item.postedDate) || new Date().toISOString(),
    deadline: item.deadline || new Date().toISOString(),
    preferredStartDate: (item.preferred_start_date ?? item.preferredStartDate) || new Date().toISOString(),
    estimatedDuration: (item.estimated_duration ?? item.estimatedDuration) || "",
    status: (item.status || "open") as Job["status"],
    bidsCount: Number(item.bidsCount ?? item.bid_count ?? 0),
    viewCount: Number(item.view_count ?? item.viewCount ?? 0),
    photos: Array.isArray(item.photos) ? item.photos : [],
    urgency: (item.urgency || "medium") as Job["urgency"],
    propertyType: ((item.property_type ?? item.propertyType) || "residential") as Job["propertyType"],
    sqft: Number(item.sqft ?? 0),
    yearBuilt: Number(item.year_built ?? item.yearBuilt ?? 0),
    accessNotes: (item.access_notes ?? item.accessNotes) || "",
    materialsProvided: Boolean(item.materials_provided ?? item.materialsProvided),
    permitsRequired: Boolean(item.permits_required ?? item.permitsRequired),
    inspectionRequired: Boolean(item.inspection_required ?? item.inspectionRequired),
    insuranceClaim: Boolean(item.insurance_claim ?? item.insuranceClaim),
    requirements: Array.isArray(item.requirements) ? item.requirements : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    specialInstructions: (item.special_instructions ?? item.specialInstructions) || "",
    thumbnail: item.thumbnail || "",
    property: {
      stories: Number(prop.stories ?? 0),
      foundation: prop.foundation || "slab",
      exterior: prop.exterior || "",
      roofType: (prop.roof_type ?? prop.roofType) || "",
      roofAge: Number(prop.roof_age ?? prop.roofAge ?? 0),
      garage: prop.garage || "none",
      lotSize: (prop.lot_size ?? prop.lotSize) || "",
      hoa: Boolean(prop.hoa),
      hoaNotes: (prop.hoa_notes ?? prop.hoaNotes) || "",
      heating: prop.heating || "",
      cooling: prop.cooling || "",
      waterHeater: ((prop.water_heater ?? prop.waterHeater) || "electric") as Job["property"]["waterHeater"],
      plumbing: prop.plumbing || "",
      electrical: prop.electrical || "",
      sewer: prop.sewer || "city",
      knownIssues: Array.isArray(prop.known_issues) ? prop.known_issues : Array.isArray(prop.knownIssues) ? prop.knownIssues : [],
      recentWork: Array.isArray(prop.recent_work) ? prop.recent_work : Array.isArray(prop.recentWork) ? prop.recentWork : [],
    },
  };
}

// ─── Job Carousel ────────────────────────────────────────────────────────────

function JobCarousel({ jobs }: { jobs: Job[] }) {
  const [active, setActive] = useState(0);
  const len = jobs.length;
  const next = useCallback(() => setActive((i) => (len ? (i + 1) % len : 0)), [len]);
  const prev = useCallback(() => setActive((i) => (len ? (i - 1 + len) % len : 0)), [len]);
  const job = len ? jobs[active % len] : null;
  if (!job) {
    return (
      <div className="px-5 pb-4 flex-1 flex items-center justify-center min-h-[120px]">
        <p className="text-sm text-gray-600 text-center">No open jobs in your area right now.</p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-4 flex-1 flex flex-col min-h-0">
      <div className="relative flex-1 flex flex-col min-h-0">
        {/* Image */}
        <div className="flex-1 min-h-[120px] bg-gray-100 rounded-sm overflow-hidden relative">
          {job.thumbnail && (job.thumbnail.startsWith("http") || job.thumbnail.startsWith("/")) ? (
            <Image
              src={job.thumbnail}
              alt={job.title}
              width={400}
              height={300}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full min-h-[120px] flex items-center justify-center bg-gray-100">
              <Briefcase className="w-10 h-10 text-gray-400" aria-hidden />
            </div>
          )}
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-sm bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <ChevronLeft className="w-3.5 h-3.5 text-gray-900" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-sm bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <ChevronRight className="w-3.5 h-3.5 text-gray-900" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {jobs.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={cn("w-1.5 h-1.5 rounded-sm transition-all", i === active ? "bg-white w-3" : "bg-white/50")} />
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
            {job.estimatedDuration ? <span>{job.estimatedDuration}</span> : null}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContractorDashboardPage() {
  usePageTitle("Dashboard");
  const pathname = usePathname();
  const isDemoFixture = pathname.startsWith("/demo/contractor");
  const basePath = isDemoFixture ? "/demo/contractor" : "/contractor";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [projects, setProjects] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (isDemoFixture) {
      setJobs(mockJobs);
      setEstimates(mockEstimates);
      setReviews(mockReviews);
      setProjects([]);
      setDashboard(null);
      return;
    }
    fetchJobs().then(setJobs);
    fetchEstimates().then(setEstimates);
    fetchProjects().then((list) => setProjects(Array.isArray(list) ? list : []));
    fetchReviews().then(({ data }) => setReviews(data));
    api.getContractorDashboard().then(setDashboard).catch(() => null);
  }, [isDemoFixture]);

  const dashboardOpenJobs: Job[] =
    dashboard?.jobMarketplace?.items?.map((item: any, index: number) => mapDashboardMarketplaceItemToJob(item, index)) || [];
  const openJobs = dashboardOpenJobs.length > 0 ? dashboardOpenJobs : jobs.filter((j) => j.status === "open");

  const projectCards = useMemo((): DashboardProjectCard[] => {
    const dashProjects = dashboard?.projects;
    if (Array.isArray(dashProjects) && dashProjects.length > 0) {
      return dashProjects.map((p: Record<string, unknown>) => projectToDashboardCard(p));
    }
    if (projects.length > 0) {
      return projects.map((p) => projectToDashboardCard(p));
    }
    const rows = dashboard?.milestones?.items;
    if (Array.isArray(rows) && rows.length > 0) {
      return groupDashboardMilestoneRows(rows as Record<string, unknown>[]);
    }
    return [];
  }, [dashboard, projects]);

  const pendingEstimates = dashboard?.estimateHistory?.items || estimates.filter((e) => e.status === "sent" || e.status === "viewed");
  const estimateHistoryCount =
    typeof dashboard?.estimateHistory?.count === "number" ? dashboard.estimateHistory.count : pendingEstimates.length;

  const scorecard = dashboard?.scorecard;
  const monthlyRevenue = Number(scorecard?.revenue?.amount ?? contractorDashboardStats.monthlyRevenue);
  const revenueChange = Number(scorecard?.revenue?.changePct ?? contractorDashboardStats.revenueChange);
  const avgRating = Number(scorecard?.rating?.value ?? contractorDashboardStats.avgRating);
  const reviewsCount = Number(scorecard?.rating?.reviewsCount ?? reviews.length);
  const estimatesSent = Number(scorecard?.source?.estimatesSent ?? contractorDashboardStats.estimatesSent);
  const estimatesAccepted = Number(scorecard?.source?.estimatesAccepted ?? contractorDashboardStats.estimatesAccepted);
  const winRate = Number(scorecard?.winRatePct ?? Math.round((estimatesAccepted / Math.max(estimatesSent, 1)) * 100));
  const totalPipeline =
    Number(scorecard?.pendingAmount) ||
    pendingEstimates.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
  const responseTime = scorecard?.responseTime ?? contractorDashboardStats.responseTime;

  const hasServerScorecard = Boolean(dashboard?.scorecard);
  const estimatesAcceptedSafe = Number(scorecard?.source?.estimatesAccepted) || 0;
  const showScorecardEmpty =
    hasServerScorecard &&
    monthlyRevenue <= 0 &&
    reviewsCount <= 0 &&
    estimatesAcceptedSafe <= 0;

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-semibold text-gray-900 tracking-tight">{formatTodayDate()}</h1>
          <div className="flex items-center gap-3">
            <Link href={`${basePath}/estimates?tab=agent`} className="flex items-center gap-1.5 h-8 px-3 rounded-sm bg-gray-900 text-white text-[12px] font-semibold hover:bg-gray-800 transition-colors">
              <Briefcase className="w-3.5 h-3.5" />
              Estimate Agent
            </Link>
            <Link href={`${basePath}/estimates`} className="flex items-center gap-1.5 h-8 px-3 rounded-sm bg-brand-600 text-white text-[12px] font-semibold hover:bg-brand-700 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              New Estimate
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-4 md:px-6 py-4 flex justify-center overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 md:grid-rows-2 gap-4 w-full max-w-[1400px] h-full min-h-0 overflow-y-auto xl:overflow-hidden">

          {/* Job Marketplace */}
          <BentoTile className="col-span-1 xl:col-span-2">
            <TileHeader title="Job Marketplace" count={openJobs.length} linkHref={`${basePath}/work`} linkLabel="Browse all" />
            <JobCarousel jobs={openJobs.slice(0, 6)} />
          </BentoTile>

          {/* Projects */}
          <BentoTile className="col-span-1 xl:col-span-2">
            <TileHeader title="Projects" count={projectCards.length} linkHref={`${basePath}/projects`} linkLabel="All projects" />
            <div className="px-5 pb-5 max-h-[min(320px,42vh)] overflow-y-auto">
              {projectCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projectCards.map((p) => (
                    <Link
                      key={p.id}
                      href={`${basePath}/projects?project=${encodeURIComponent(p.id)}&tab=milestones`}
                      className="group block rounded-sm border border-gray-200 bg-white p-3.5 hover:border-brand-600/40 hover:bg-[#F7F8FA] transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-gray-100 text-gray-600 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                          <Briefcase className="h-4 w-4" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-bold text-gray-900 truncate group-hover:text-brand-800 transition-colors">{p.title}</p>
                          {p.clientName ? (
                            <p className="text-[12px] text-gray-500 mt-0.5 truncate">{p.clientName}</p>
                          ) : null}
                          {p.currentMilestone ? (
                            <p className="text-[12px] text-gray-700 mt-2 leading-snug">
                              <span className="font-semibold text-gray-900">Milestone: </span>
                              {p.currentMilestone}
                            </p>
                          ) : (
                            <p className="text-[11px] text-gray-500 mt-2 italic">No milestones on this project yet</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-gray-200 rounded-sm bg-[#F7F8FA]">
                  <Briefcase className="h-8 w-8 text-gray-400 mb-2" aria-hidden />
                  <p className="text-[14px] font-semibold text-gray-800">No projects yet</p>
                  <p className="text-[12px] text-gray-600 mt-1 max-w-[260px]">
                    Create a project to track milestones and payments in one place.
                  </p>
                  <Link
                    href={`${basePath}/projects`}
                    className="mt-4 text-[13px] font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Go to Projects
                  </Link>
                </div>
              )}
            </div>
          </BentoTile>

          <BentoTile className="col-span-1 xl:col-span-2 h-full min-h-0 flex flex-col">
            <TileHeader title="Estimate History" count={estimateHistoryCount} linkHref={`${basePath}/estimates?tab=my-estimates`} linkLabel="View all" />
            {pendingEstimates.length > 0 ? (
              <div className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {pendingEstimates.map((est: any) => (
                    <Link key={est.id || est.clientName} href={`${basePath}/estimates?tab=my-estimates`} className="group flex items-center justify-between hover:opacity-80 transition-opacity">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-gray-900 group-hover:text-brand-700 transition-colors truncate">{est.clientName || "Client"}</p>
                        <p className="text-base text-gray-900 tabular-nums mt-0.5">{formatCurrency(Number(est.amount || 0))}</p>
                      </div>
                      <Badge variant={est.status === "viewed" ? "warning" : "info"} className="text-[12px] min-w-[44px] justify-center flex-shrink-0 ml-3">
                        {est.status === "viewed" ? "Viewed" : "Sent"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-5 pb-5 flex-1 flex flex-col min-h-0">
                <div className="flex-1 flex flex-col min-h-0 rounded-sm border border-dashed border-gray-200 bg-[#F7F8FA]">
                  <div className="flex flex-col items-center text-center px-4 pt-8 flex-shrink-0">
                    <FileText className="h-8 w-8 text-gray-400 mb-2" aria-hidden />
                    <p className="text-[14px] font-semibold text-gray-800">No pending estimates</p>
                    <p className="text-[12px] text-gray-600 mt-1 max-w-[260px]">
                      Sent estimates you are waiting on will appear here.
                    </p>
                  </div>
                  <div className="flex-1 min-h-[2px] w-full" aria-hidden />
                  <div className="flex justify-center px-4 pb-8 flex-shrink-0">
                    <Link
                      href={`${basePath}/estimates?tab=my-estimates`}
                      className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Go to Estimates
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </BentoTile>

          {/* Scorecard */}
          <BentoTile className="col-span-1 xl:col-span-2 h-full min-h-0 flex flex-col">
            <TileHeader title="Scorecard" linkHref={`${basePath}/estimates?tab=my-estimates`} linkLabel="Details" />
            {showScorecardEmpty ? (
              <div className="px-5 pb-5 flex-1 flex flex-col min-h-0">
                <div className="flex-1 flex flex-col min-h-0 rounded-sm border border-dashed border-gray-200 bg-[#F7F8FA]">
                  <div className="flex flex-col items-center text-center px-4 pt-8 flex-shrink-0">
                    <Hammer className="h-8 w-8 text-gray-400 mb-2" aria-hidden />
                    <p className="text-[14px] font-semibold text-gray-800">No completed jobs yet</p>
                    <p className="text-[12px] text-gray-600 mt-1 max-w-[260px]">
                      Land work, finish milestones, and collect reviews — your revenue, win rate, and rating will show up here.
                    </p>
                  </div>
                  <div className="flex-1 min-h-[2px] w-full" aria-hidden />
                  <div className="flex justify-center px-4 pb-8 flex-shrink-0">
                    <Link
                      href={`${basePath}/estimates?tab=my-estimates`}
                      className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 pb-5">
                  <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-[14px] font-medium text-gray-500">Revenue</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-[36px] font-bold text-gray-900 tabular-nums leading-none">{formatCurrency(monthlyRevenue)}</p>
                        {revenueChange !== 0 ? (
                          <span className="text-[14px] font-semibold text-emerald-950">
                            {revenueChange > 0 ? "+" : ""}
                            {revenueChange}%
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-medium text-gray-500">Rating</p>
                      <p className="text-[36px] font-bold text-gray-900 tabular-nums leading-none mt-1">{avgRating}</p>
                      <p className="text-[13px] text-gray-500 mt-1">{reviewsCount} reviews</p>
                    </div>
                  </div>

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
            )}
          </BentoTile>

        </div>
      </div>
    </div>
  );
}
