"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpDown,
  Briefcase,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  Download,
  CheckSquare,
  Square,
  X,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Calendar,
  RefreshCw,
  ChevronRight,
  Layers,
  User,
  Shield,
  AlignLeft,
  Save,
  Upload,
  Copy,
  RotateCcw,
  Calculator,
} from "lucide-react";
import { AppHeader } from "@shared/components/app-header";
import { JobCard } from "@contractor/components/job-card";
import { VoiceRecorder } from "@contractor/components/voice-recorder";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";
import { Separator } from "@shared/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@shared/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/ui/dialog";
import { mockJobs, mockEstimates, mockContractors, type Estimate, type Job } from "@shared/lib/mock-data";
import { JOB_CATEGORIES } from "@shared/lib/constants";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";
import { type BadgeProps } from "@shared/ui/badge";
import { useRealtimeJobs } from "@shared/hooks/use-realtime";
import { fetchJobs } from "@shared/lib/data";

// ─── Shared types ─────────────────────────────────────────────────────────────

type BadgeVariant = BadgeProps["variant"];

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — BROWSE JOBS
// ─────────────────────────────────────────────────────────────────────────────

type SortOption = "newest" | "budget-high" | "budget-low" | "urgency";

const URGENCY_ORDER = { high: 0, medium: 1, low: 2 };

function FilterSection({ label, defaultOpen = true, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full group mb-1.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide group-hover:text-gray-600 transition-colors">{label}</p>
        <ChevronRight className={cn("w-3 h-3 text-gray-300 transition-transform", open && "rotate-90")} />
      </button>
      {open && children}
    </div>
  );
}

function BrowseJobsTab() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [urgency, setUrgency] = useState<string>("all");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [permitsOnly, setPermitsOnly] = useState(false);
  const [insuranceOnly, setInsuranceOnly] = useState(false);
  const [materialsProvided, setMaterialsProvided] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Load jobs from API (falls back to mock data if backend is down)
  const [apiJobs, setApiJobs] = useState<Job[]>(mockJobs);
  React.useEffect(() => {
    fetchJobs().then(setApiJobs);
  }, []);

  // Real-time updates layer on top (only when authenticated via WebSocket)
  const { jobs: realtimeJobs, connected } = useRealtimeJobs();

  // Merge: API jobs as base, realtime updates overlay
  const allJobs = useMemo(() => {
    if (realtimeJobs.length === 0) return apiJobs;
    const rtConverted: Job[] = realtimeJobs.map((rj) => ({
      ...mockJobs[0],
      id: rj.id,
      title: rj.title,
      description: rj.description,
      detailedScope: rj.description,
      category: rj.category,
      budget: { min: rj.budget_min, max: rj.budget_max },
      location: rj.location,
      fullAddress: rj.location,
      postedBy: typeof rj.homeowner === "string" ? rj.homeowner : rj.homeowner?.name ?? "Homeowner",
      postedDate: rj.posted_at,
      status: rj.status as "open" | "in_progress" | "completed" | "cancelled",
      bidsCount: rj.bid_count,
      tags: [rj.category],
      thumbnail: "",
      photos: [],
    }));
    const apiIds = new Set(apiJobs.map((j) => j.id));
    const newRt = rtConverted.filter((j) => !apiIds.has(j.id));
    return [...newRt, ...apiJobs];
  }, [realtimeJobs, apiJobs]);

  const openJobs = allJobs.filter((j) => j.status === "open");

  // Derived stats
  const urgentCount = openJobs.filter((j) => j.urgency === "high").length;
  const avgBudget = openJobs.length > 0
    ? Math.round(openJobs.reduce((s, j) => s + (j.budget.min + j.budget.max) / 2, 0) / openJobs.length)
    : 0;
  const totalBudget = openJobs.reduce((s, j) => s + j.budget.max, 0);
  const newThisWeek = openJobs.filter((j) => (Date.now() - new Date(j.postedDate).getTime()) / 86400000 <= 7).length;

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    openJobs.forEach((j) => { counts[j.category] = (counts[j.category] || 0) + 1; });
    return counts;
  }, [openJobs]);

  // City counts
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    openJobs.forEach((j) => {
      const city = j.location.split(",")[0].trim();
      counts[city] = (counts[city] || 0) + 1;
    });
    return counts;
  }, [openJobs]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const toggleCity = (city: string) => {
    setSelectedCities((prev) => {
      const next = new Set(prev);
      if (next.has(city)) next.delete(city); else next.add(city);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const minB = parseFloat(minBudget) || 0;
    const maxB = parseFloat(maxBudget) || Infinity;

    let results = openJobs.filter((job) => {
      const matchSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = selectedCategories.size === 0 || selectedCategories.has(job.category);
      const matchUrgency = urgency === "all" || job.urgency === urgency;
      const matchProperty = propertyType === "all" || job.propertyType === propertyType;
      const matchBudget = job.budget.max >= minB && job.budget.min <= maxB;
      const matchCity = selectedCities.size === 0 || selectedCities.has(job.location.split(",")[0].trim());
      const matchPermits = !permitsOnly || job.permitsRequired;
      const matchInsurance = !insuranceOnly || job.insuranceClaim;
      const matchMaterials = !materialsProvided || job.materialsProvided;
      return matchSearch && matchCategory && matchUrgency && matchProperty && matchBudget && matchCity && matchPermits && matchInsurance && matchMaterials;
    });

    results.sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        case "budget-high": return b.budget.max - a.budget.max;
        case "budget-low": return a.budget.min - b.budget.min;
        case "urgency": return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
        default: return 0;
      }
    });

    return results;
  }, [openJobs, search, selectedCategories, urgency, propertyType, minBudget, maxBudget, selectedCities, permitsOnly, insuranceOnly, materialsProvided, sortBy]);

  const activeFilterCount = [
    selectedCategories.size > 0,
    urgency !== "all",
    propertyType !== "all",
    minBudget !== "",
    maxBudget !== "",
    selectedCities.size > 0,
    permitsOnly,
    insuranceOnly,
    materialsProvided,
    search !== "",
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch(""); setSelectedCategories(new Set()); setUrgency("all"); setPropertyType("all");
    setMinBudget(""); setMaxBudget(""); setSelectedCities(new Set());
    setPermitsOnly(false); setInsuranceOnly(false); setMaterialsProvided(false);
  };

  return (
    <div className="space-y-5">
      {/* ── Filter Bar ── */}
      <div className="flex items-center gap-3">
        {/* Category dropdown */}
        <select
          value={selectedCategories.size === 1 ? [...selectedCategories][0] : ""}
          onChange={(e) => {
            if (e.target.value === "") { setSelectedCategories(new Set()); }
            else { setSelectedCategories(new Set([e.target.value])); }
          }}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 appearance-none"
        >
          <option value="">All Categories</option>
          {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <option key={cat} value={cat}>{cat} ({count})</option>
          ))}
        </select>

        {/* Location dropdown */}
        <select
          value={selectedCities.size === 1 ? [...selectedCities][0] : ""}
          onChange={(e) => {
            if (e.target.value === "") { setSelectedCities(new Set()); }
            else { setSelectedCities(new Set([e.target.value])); }
          }}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 appearance-none"
        >
          <option value="">All Locations</option>
          {Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
            <option key={city} value={city}>{city} ({count})</option>
          ))}
        </select>

        {/* Urgency pills */}
        <div className="flex rounded-lg ring-1 ring-gray-200 overflow-hidden">
          {[
            { value: "all", label: "All" },
            { value: "high", label: "Urgent" },
            { value: "medium", label: "Med" },
            { value: "low", label: "Low" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setUrgency(opt.value)}
              className={cn(
                "px-3 py-2 text-[13px] font-medium transition-colors",
                urgency === opt.value ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 appearance-none"
        >
          <option value="newest">Newest</option>
          <option value="budget-high">Budget: High</option>
          <option value="budget-low">Budget: Low</option>
          <option value="urgency">Most Urgent</option>
        </select>

        {/* View toggle */}
        <div className="flex rounded-lg ring-1 ring-gray-200 overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={cn("px-2.5 py-2 transition-colors", viewMode === "grid" ? "bg-gray-900 text-white" : "bg-white text-gray-400 hover:bg-gray-50")}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={cn("px-2.5 py-2 transition-colors", viewMode === "list" ? "bg-gray-900 text-white" : "bg-white text-gray-400 hover:bg-gray-50")}>
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Clear */}
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-[13px] font-medium text-red-600 hover:text-red-700 transition-colors">
            Clear
          </button>
        )}

        {/* Result count */}
        <span className="text-[13px] text-gray-400 ml-auto">{filtered.length} jobs</span>
      </div>

      {/* Recommended for you — single top pick */}
        {selectedCategories.size === 0 && urgency === "all" && search === "" && (() => {
          const pick = openJobs.find((j) => j.urgency === "high" && j.bidsCount <= 3) || openJobs.find((j) => j.urgency === "high") || openJobs[0];
          if (!pick) return null;
          return (
            <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
              <div className="relative w-11 h-11 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                <Image src={pick.thumbnail} alt="" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wide">Top Pick for You</p>
                <p className="text-[13px] font-bold text-gray-900 truncate">{pick.title}</p>
                <p className="text-[11px] text-gray-500">{pick.location} · {formatCurrency(pick.budget.min)}–{formatCurrency(pick.budget.max)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {pick.urgency === "high" && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">URGENT</span>}
                {pick.bidsCount <= 3 && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">LOW BIDS</span>}
              </div>
            </div>
          );
        })()}

      {/* Job grid / list */}
      {filtered.length > 0 ? (
          <div className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3"
              : "flex flex-col gap-3"
          )}>
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl py-16 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-1 font-medium">No jobs found</p>
            <p className="text-gray-400 text-sm mb-4">Try adjusting your filters or search terms.</p>
            <Button variant="outline" size="sm" onClick={clearAll}>Clear Filters</Button>
          </div>
        )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — MY ESTIMATES
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Estimate["status"], { label: string; variant: BadgeVariant }> = {
  draft:    { label: "Draft",    variant: "secondary" },
  sent:     { label: "Sent",     variant: "info" },
  viewed:   { label: "Viewed",   variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Declined", variant: "danger" },
  expired:  { label: "Expired",  variant: "outline" },
};

type EstimateTabValue = "all" | Estimate["status"];

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return formatDate(dateStr);
}

function EstimateDetailDialog({ estimate, open, onClose }: { estimate: Estimate | null; open: boolean; onClose: () => void }) {
  if (!estimate) return null;
  const config = STATUS_CONFIG[estimate.status];
  const subtotal = estimate.lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span className="truncate">{estimate.jobTitle}</span>
            <Badge variant={config.variant}>{config.label}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Client</p>
            <p className="text-sm font-semibold text-gray-900">{estimate.clientName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Created</p>
            <p className="text-sm text-gray-700">{formatDate(estimate.createdDate)}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Description</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 w-16">Qty</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 w-28">Unit Price</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {estimate.lineItems.map((item, idx) => (
                <tr key={idx} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-gray-900">{item.description}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-gray-50 border-t-2 border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</span>
            <span className="text-xl font-bold text-gray-900 tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {estimate.status === "draft" && (
            <Button size="sm" className="gap-2"><Send className="w-3.5 h-3.5" />Send Estimate</Button>
          )}
          {(estimate.status === "sent" || estimate.status === "viewed") && (
            <Button size="sm" variant="outline" className="gap-2"><RefreshCw className="w-3.5 h-3.5" />Resend</Button>
          )}
          <Button size="sm" variant="outline" className="gap-2"><Edit className="w-3.5 h-3.5" />Edit</Button>
          <Button size="sm" variant="outline" className="gap-2"><Download className="w-3.5 h-3.5" />Download PDF</Button>
          <Button size="sm" variant="outline" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 ml-auto">
            <Trash2 className="w-3.5 h-3.5" />Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MyEstimatesTab() {
  const [activeTab, setActiveTab] = useState<EstimateTabValue>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailEstimate, setDetailEstimate] = useState<Estimate | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const getFiltered = (status: EstimateTabValue) => {
    const byStatus = status === "all" ? mockEstimates : mockEstimates.filter((e) => e.status === status);
    if (!search.trim()) return byStatus;
    const q = search.toLowerCase();
    return byStatus.filter((e) => e.jobTitle.toLowerCase().includes(q) || e.clientName.toLowerCase().includes(q));
  };

  const tabCounts: Record<EstimateTabValue, number> = {
    all:      mockEstimates.length,
    draft:    mockEstimates.filter((e) => e.status === "draft").length,
    sent:     mockEstimates.filter((e) => e.status === "sent").length,
    viewed:   mockEstimates.filter((e) => e.status === "viewed").length,
    accepted: mockEstimates.filter((e) => e.status === "accepted").length,
    declined: mockEstimates.filter((e) => e.status === "declined").length,
    expired:  mockEstimates.filter((e) => e.status === "expired").length,
  };

  const TABS: EstimateTabValue[] = ["all", "draft", "sent", "viewed", "accepted", "declined"];

  const toggleOne = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const openDetail = (estimate: Estimate) => {
    setDetailEstimate(estimate);
    setDetailOpen(true);
  };

  // Summary stats
  const totalValue = mockEstimates.reduce((s, e) => s + e.amount, 0);
  const acceptedCount = mockEstimates.filter((e) => e.status === "accepted").length;
  const acceptanceRate = mockEstimates.length > 0 ? Math.round((acceptedCount / mockEstimates.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center"><DollarSign className="w-4 h-4 text-brand-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Total Value</p>
            <p className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(totalValue)}</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Acceptance Rate</p>
            <p className="text-lg font-bold text-gray-900">{acceptanceRate}%</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center"><FileText className="w-4 h-4 text-amber-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Total Estimates</p>
            <p className="text-lg font-bold text-gray-900">{mockEstimates.length}</p>
          </div>
        </div>
      </div>

      {/* Search + status tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by job or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                activeTab === tab
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-600 border-border hover:bg-gray-50"
              )}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tabCounts[tab] > 0 && (
                <span className={cn("ml-1.5 text-[10px] rounded-full px-1.5 py-0.5", activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600")}>
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <button
                    onClick={() => setSelected(selected.size === getFiltered(activeTab).length ? new Set() : new Set(getFiltered(activeTab).map((e) => e.id)))}
                    className="text-gray-400 hover:text-brand-600 transition-colors"
                  >
                    {selected.size === getFiltered(activeTab).length && selected.size > 0
                      ? <CheckSquare className="w-4 h-4 text-brand-600" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Job / Client</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Amount</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Sent</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Last Activity</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {getFiltered(activeTab).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-gray-400">No estimates found.</td>
                </tr>
              ) : getFiltered(activeTab).map((estimate) => {
                const config = STATUS_CONFIG[estimate.status];
                const isSelected = selected.has(estimate.id);
                return (
                  <tr
                    key={estimate.id}
                    className={cn("border-b border-border last:border-0 hover:bg-gray-50 transition-colors cursor-pointer", isSelected && "bg-brand-50")}
                    onClick={() => openDetail(estimate)}
                  >
                    <td className="px-4 py-3.5" onClick={(e) => { e.stopPropagation(); toggleOne(estimate.id); }}>
                      <div className="flex items-center justify-center text-gray-400 hover:text-brand-600">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-brand-600" /> : <Square className="w-4 h-4" />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900 truncate max-w-xs">{estimate.jobTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{estimate.clientName}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                      <span className="font-bold text-gray-900 tabular-nums">{formatCurrency(estimate.amount)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-500 text-xs hidden md:table-cell">
                      {estimate.sentDate ? formatDate(estimate.sentDate) : <span className="text-gray-300">Not sent</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-gray-500 hidden lg:table-cell">
                      {relativeTime(estimate.sentDate || estimate.createdDate)}
                    </td>
                    <td className="px-2 py-3.5 relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenu(openMenu === estimate.id ? null : estimate.id)}
                        className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenu === estimate.id && (
                        <div className="absolute right-2 top-full mt-1 z-20 bg-white border border-border rounded-lg shadow-lg py-1 w-44" onMouseLeave={() => setOpenMenu(null)}>
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => { openDetail(estimate); setOpenMenu(null); }}>
                            <Eye className="w-3.5 h-3.5 text-gray-400" />View Details<ChevronRight className="w-3 h-3 text-gray-300 ml-auto" />
                          </button>
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                            <Edit className="w-3.5 h-3.5 text-gray-400" />Edit
                          </button>
                          {(estimate.status === "draft" || estimate.status === "sent") && (
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-brand-600 hover:bg-brand-50">
                              <Send className="w-3.5 h-3.5" />{estimate.status === "draft" ? "Send" : "Resend"}
                            </button>
                          )}
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                            <Download className="w-3.5 h-3.5 text-gray-400" />Download PDF
                          </button>
                          <div className="my-1 border-t border-border" />
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5" />Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <EstimateDetailDialog estimate={detailEstimate} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 — NEW ESTIMATE
// ─────────────────────────────────────────────────────────────────────────────

type LineCategory = "Labor" | "Material" | "Equipment" | "Subcontractor" | "Permit" | "Other";

interface LineItem {
  id: string;
  description: string;
  category: LineCategory;
  quantity: number;
  unitPrice: number;
}

const LINE_CATEGORIES: LineCategory[] = ["Labor", "Material", "Equipment", "Subcontractor", "Permit", "Other"];

const CATEGORY_COLORS: Record<LineCategory, string> = {
  Labor:         "bg-blue-100 text-blue-700",
  Material:      "bg-amber-100 text-amber-700",
  Equipment:     "bg-purple-100 text-purple-700",
  Subcontractor: "bg-orange-100 text-orange-700",
  Permit:        "bg-red-100 text-red-700",
  Other:         "bg-gray-100 text-gray-600",
};

const TEMPLATES = [
  {
    id: "kitchen", name: "Kitchen Remodel", description: "Full gut & rebuild with cabinets, countertops, and tile",
    items: [
      { description: "Demo & Debris Removal", category: "Labor" as LineCategory, quantity: 1, unitPrice: 3500 },
      { description: "Custom Cabinets",        category: "Material" as LineCategory, quantity: 1, unitPrice: 12000 },
      { description: "Quartz Countertops",     category: "Material" as LineCategory, quantity: 42, unitPrice: 85 },
      { description: "Installation Labor",     category: "Labor" as LineCategory, quantity: 120, unitPrice: 85 },
      { description: "Building Permit",        category: "Permit" as LineCategory, quantity: 1, unitPrice: 450 },
    ],
  },
  {
    id: "bathroom", name: "Bathroom Reno", description: "Walk-in shower, vanity, tile, fixtures",
    items: [
      { description: "Demo & Haul-Away",         category: "Labor" as LineCategory, quantity: 1, unitPrice: 1500 },
      { description: "Shower Floor & Wall Tile", category: "Material" as LineCategory, quantity: 1, unitPrice: 4200 },
      { description: "Vanity & Fixtures",        category: "Material" as LineCategory, quantity: 1, unitPrice: 3500 },
      { description: "Plumbing Rough-In",        category: "Subcontractor" as LineCategory, quantity: 1, unitPrice: 2800 },
      { description: "Labor",                    category: "Labor" as LineCategory, quantity: 40, unitPrice: 80 },
    ],
  },
  {
    id: "roof", name: "Roof Replacement", description: "Full tear-off, architectural shingles, flashings",
    items: [
      { description: "Full Tear-Off & Disposal", category: "Labor" as LineCategory, quantity: 1, unitPrice: 2200 },
      { description: "Architectural Shingles",   category: "Material" as LineCategory, quantity: 2800, unitPrice: 2.20 },
      { description: "Installation Labor",       category: "Labor" as LineCategory, quantity: 1, unitPrice: 3800 },
      { description: "Roofing Permit",           category: "Permit" as LineCategory, quantity: 1, unitPrice: 275 },
    ],
  },
  {
    id: "custom", name: "Custom", description: "Start from scratch",
    items: [{ description: "", category: "Labor" as LineCategory, quantity: 1, unitPrice: 0 }],
  },
];

const MOCK_CLIENTS = [
  { name: "Michael Brown",   email: "michael.brown@email.com",   phone: "(512) 555-0121", address: "4821 Shoal Creek Blvd, Austin, TX 78756" },
  { name: "Jennifer Wilson", email: "jennifer.wilson@email.com", phone: "(214) 555-0188", address: "7234 Lakewood Blvd, Dallas, TX 75214" },
  { name: "David Anderson",  email: "david.anderson@email.com",  phone: "(210) 555-0143", address: "1102 Alamo Heights Dr, San Antonio, TX 78209" },
  { name: "Patricia Taylor", email: "patricia.taylor@email.com", phone: "(713) 555-0167", address: "3318 Braeswood Blvd, Houston, TX 77025" },
];

const DEFAULT_PAYMENT_TERMS = "Payment Schedule: 50% deposit due before work begins. 25% due at project midpoint. Remaining 25% due upon final walkthrough and client acceptance.";

function NewEstimateTab() {
  const [selectedClientIdx, setSelectedClientIdx] = useState<number | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", category: "Labor", quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [validityDays, setValidityDays] = useState(30);
  const [paymentTerms, setPaymentTerms] = useState(DEFAULT_PAYMENT_TERMS);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  const categoryTotals = useMemo(() => {
    const map: Partial<Record<LineCategory, number>> = {};
    for (const item of lineItems) {
      const amt = item.quantity * item.unitPrice;
      if (amt > 0) map[item.category] = (map[item.category] ?? 0) + amt;
    }
    return map;
  }, [lineItems]);

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setLineItems((items) => [...items, { id: Date.now().toString(), description: "", category: "Labor", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((items) => items.filter((item) => item.id !== id));
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setLineItems(template.items.map((item, idx) => ({ ...item, id: String(Date.now() + idx) })));
    if (template.id !== "custom" && !jobTitle) setJobTitle(template.name);
  };

  const handleClientSelect = (idx: number) => {
    setSelectedClientIdx(idx);
    const c = MOCK_CLIENTS[idx];
    setClientName(c.name);
    setClientEmail(c.email);
    setClientPhone(c.phone);
    setClientAddress(c.address);
  };

  const handleVoiceItems = (items: { id: string; description: string; quantity: number; unitPrice: number }[]) => {
    setLineItems(items.map((item) => ({ ...item, category: "Labor" as LineCategory })));
    setJobTitle("Kitchen Remodel - Full Gut");
  };

  return (
    <div className="space-y-6">
      {/* Templates */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" />
          Start From a Template
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEMPLATES.map((template) => {
            const isActive = selectedTemplate === template.id;
            return (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className={cn(
                  "text-left rounded-xl border-2 p-3.5 transition-colors",
                  isActive ? "border-brand-600 bg-brand-50" : "border-border hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <p className={cn("text-sm font-semibold", isActive ? "text-brand-700" : "text-gray-900")}>{template.name}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{template.description}</p>
                {isActive && <span className="inline-block mt-2 text-xs font-medium text-brand-600">Applied</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left — Voice AI */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Voice AI Estimator</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Describe your estimate out loud and Hunter will extract line items automatically.</p>
            </CardHeader>
            <CardContent className="pt-0">
              <VoiceRecorder onItemsExtracted={handleVoiceItems} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-600" />
                Job Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer",
                  isDragOver ? "border-brand-600 bg-brand-50" : "border-border hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">{isDragOver ? "Drop to attach" : "Drag & drop photos or click to browse"}</p>
                <p className="text-xs text-gray-400">JPG, PNG up to 10MB</p>
                <Button variant="outline" size="sm">Choose Files</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-600" />
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Payment Schedule</label>
                <Textarea value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="min-h-[80px] resize-none text-xs" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Builder */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Select Existing Client</label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
                  value={selectedClientIdx ?? ""}
                  onChange={(e) => { const val = e.target.value; if (val !== "") handleClientSelect(Number(val)); }}
                >
                  <option value="">Choose a client...</option>
                  {MOCK_CLIENTS.map((c, idx) => <option key={idx} value={idx}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Full Name</label>
                  <Input placeholder="Michael Brown" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Job Title</label>
                  <Input placeholder="Kitchen Remodel" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Email</label>
                  <Input type="email" placeholder="client@email.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Phone</label>
                  <Input type="tel" placeholder="(512) 555-0100" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Property Address</label>
                <Input placeholder="4821 Shoal Creek Blvd, Austin, TX 78756" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estimate Builder</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold text-gray-600">Valid For</span>
                <select
                  className="border border-border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                >
                  {[15, 30, 60, 90].map((d) => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Line Items</p>
                  <button onClick={addItem} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
                    <Plus className="w-3.5 h-3.5" />Add row
                  </button>
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-border">
                          <th className="text-left px-3 py-2 text-gray-500 font-semibold">Description</th>
                          <th className="text-left px-2 py-2 text-gray-500 font-semibold w-28">Category</th>
                          <th className="text-right px-2 py-2 text-gray-500 font-semibold w-14">Qty</th>
                          <th className="text-right px-2 py-2 text-gray-500 font-semibold w-20">Unit $</th>
                          <th className="text-right px-3 py-2 text-gray-500 font-semibold w-20">Total</th>
                          <th className="w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item) => (
                          <tr key={item.id} className="border-b border-border last:border-0">
                            <td className="px-2 py-1.5">
                              <input className="w-full bg-transparent text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-600 rounded px-1 py-1 text-sm" placeholder="Description..." value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} />
                            </td>
                            <td className="px-1.5 py-1.5">
                              <select className="w-full appearance-none text-xs border border-border rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-600" value={item.category} onChange={(e) => updateItem(item.id, "category", e.target.value)}>
                                {LINE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                            </td>
                            <td className="px-1.5 py-1.5">
                              <input type="number" className="w-full text-right bg-transparent text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-600 rounded px-1 py-1 tabular-nums" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} />
                            </td>
                            <td className="px-1.5 py-1.5">
                              <input type="number" className="w-full text-right bg-transparent text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-600 rounded px-1 py-1 tabular-nums" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)} />
                            </td>
                            <td className="px-3 py-1.5 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </td>
                            <td className="pr-1.5 py-1.5">
                              <button onClick={() => removeItem(item.id)} className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {Object.keys(categoryTotals).length > 1 && (
                    <div className="border-t border-border bg-gray-50 px-4 py-3 space-y-1.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">By Category</p>
                      {(Object.entries(categoryTotals) as [LineCategory, number][]).map(([cat, amt]) => (
                        <div key={cat} className="flex items-center justify-between">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[cat])}>{cat}</span>
                          <span className="text-xs font-semibold text-gray-700 tabular-nums">{formatCurrency(amt)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-border">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-xs text-gray-500">Subtotal</span>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Tax Rate</span>
                        <input type="number" min="0" max="30" step="0.5" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="w-14 text-right text-xs border border-border rounded px-2 py-1 tabular-nums focus:outline-none focus:ring-1 focus:ring-brand-600" />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                      <span className="text-sm text-gray-700 tabular-nums">{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="bg-gray-50 border-t-2 border-gray-200 px-4 py-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Grand Total</span>
                      <span className="text-xl font-bold text-brand-600 tabular-nums">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button variant="secondary" className="flex-1 gap-2"><Save className="w-4 h-4" />Save as Draft</Button>
                <Button className="flex-1 gap-2"><Send className="w-4 h-4" />Send Estimate</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4 — CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

const PITCH_MULTIPLIERS = [
  { label: "Flat (1.00)", value: 1.0 },
  { label: "4/12 (1.05)", value: 1.05 },
  { label: "6/12 (1.12)", value: 1.12 },
  { label: "8/12 (1.20)", value: 1.20 },
  { label: "10/12 (1.30)", value: 1.30 },
  { label: "12/12 (1.41)", value: 1.41 },
];

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function CalcLayout({ inputs, results, ready, copied, onCopy }: {
  inputs: React.ReactNode;
  results: { label: string; value: string; cost: string | null }[];
  ready: boolean;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Inputs</h3>
        <Separator />
        {inputs}
      </div>
      <div className="bg-white border border-border rounded-xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Material Summary</h3>
          {ready && (
            <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={onCopy}>
              <Copy className="w-3.5 h-3.5" />{copied ? "Copied!" : "Copy to Estimate"}
            </Button>
          )}
        </div>
        <Separator className="mb-4" />
        {!ready ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Enter measurements to see results</div>
        ) : (
          <div className="space-y-0 flex-1">
            {results.map((r, i) => (
              <div key={i} className={cn("flex items-center justify-between py-2.5 text-sm", i < results.length - 1 && "border-b border-gray-50")}>
                <span className="text-gray-600">{r.label}</span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{r.value}</span>
                  {r.cost && <p className="text-xs text-gray-400 mt-0.5">{r.cost}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RoofingCalc() {
  const [area, setArea] = useState("");
  const [pitch, setPitch] = useState(1.05);
  const [copied, setCopied] = useState(false);
  const sqFt = parseFloat(area) || 0;
  const adjusted = sqFt * pitch;
  const squares = adjusted / 100;
  const bundles = Math.ceil(squares * 3);
  const underlayment = Math.ceil(squares / 4);
  const ridgeVent = Math.round(adjusted * 0.1);
  const dripEdge = Math.round(Math.sqrt(adjusted) * 4);
  const starterStrip = Math.ceil(dripEdge / 105);
  const iceWater = Math.ceil((adjusted * 0.1) / 75);
  const results = [
    { label: "Total Sq Ft (adjusted)", value: adjusted.toFixed(0) + " sq ft", cost: null },
    { label: "Squares needed", value: squares.toFixed(2) + " squares", cost: null },
    { label: "Bundles of shingles", value: bundles + " bundles", cost: `${formatCurrency(bundles * 32)}–${formatCurrency(bundles * 55)}` },
    { label: "Rolls of underlayment", value: underlayment + " rolls", cost: `${formatCurrency(underlayment * 22)}–${formatCurrency(underlayment * 38)}` },
    { label: "Ridge vent (LF)", value: ridgeVent + " LF", cost: `${formatCurrency(ridgeVent * 2)}–${formatCurrency(ridgeVent * 4)}` },
    { label: "Drip edge (LF)", value: dripEdge + " LF", cost: `${formatCurrency(dripEdge)}–${formatCurrency(dripEdge * 2)}` },
    { label: "Starter strip rolls", value: starterStrip + " rolls", cost: `${formatCurrency(starterStrip * 65)}–${formatCurrency(starterStrip * 90)}` },
    { label: "Ice & water shield", value: iceWater + " rolls", cost: `${formatCurrency(iceWater * 85)}–${formatCurrency(iceWater * 130)}` },
  ];
  return (
    <CalcLayout
      inputs={<>
        <FieldGroup label="Roof Area (sq ft)"><Input type="number" placeholder="e.g. 2800" value={area} onChange={(e) => setArea(e.target.value)} /></FieldGroup>
        <FieldGroup label="Roof Pitch">
          <select className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))}>
            {PITCH_MULTIPLIERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </FieldGroup>
        <Button variant="outline" size="sm" className="gap-2 mt-2" onClick={() => { setArea(""); setPitch(1.05); }}><RotateCcw className="w-3.5 h-3.5" />Reset</Button>
      </>}
      results={results}
      ready={sqFt > 0}
      copied={copied}
      onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    />
  );
}

function ConcreteCalc() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");
  const [waste, setWaste] = useState(true);
  const [copied, setCopied] = useState(false);
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const t = parseFloat(thickness) || 0;
  const rawCuYd = (l * w * (t / 12)) / 27;
  const cuYd = waste ? rawCuYd * 1.1 : rawCuYd;
  const bags80lb = Math.ceil(cuYd * 45);
  const rebarCount = Math.ceil((l * w * 2) / 20);
  const formBoard = Math.ceil((l + w) * 2);
  const baseTons = parseFloat((l * w * (4 / 12) / 27 * 1.5).toFixed(1));
  const results = [
    { label: "Cubic yards", value: cuYd.toFixed(2) + " CY" + (waste ? " (w/ 10% waste)" : ""), cost: `${formatCurrency(cuYd * 130)}–${formatCurrency(cuYd * 175)}` },
    { label: "80 lb bags (small jobs)", value: bags80lb + " bags", cost: `${formatCurrency(bags80lb * 6)}–${formatCurrency(bags80lb * 8)}` },
    { label: "Rebar sticks (20 LF ea)", value: rebarCount + " sticks", cost: `${formatCurrency(rebarCount * 9)}–${formatCurrency(rebarCount * 14)}` },
    { label: "Form board (LF)", value: formBoard + " LF", cost: `${formatCurrency(formBoard)}–${formatCurrency(formBoard * 2)}` },
    { label: "Base material (tons)", value: baseTons + " tons", cost: `${formatCurrency(baseTons * 18)}–${formatCurrency(baseTons * 28)}` },
  ];
  return (
    <CalcLayout
      inputs={<>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Length (ft)"><Input type="number" placeholder="20" value={length} onChange={(e) => setLength(e.target.value)} /></FieldGroup>
          <FieldGroup label="Width (ft)"><Input type="number" placeholder="12" value={width} onChange={(e) => setWidth(e.target.value)} /></FieldGroup>
        </div>
        <FieldGroup label="Thickness (in)"><Input type="number" placeholder="4" value={thickness} onChange={(e) => setThickness(e.target.value)} /></FieldGroup>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input type="checkbox" checked={waste} onChange={(e) => setWaste(e.target.checked)} className="w-4 h-4 rounded accent-brand-600" />
          Include 10% waste factor
        </label>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => { setLength(""); setWidth(""); setThickness(""); }}><RotateCcw className="w-3.5 h-3.5" />Reset</Button>
      </>}
      results={results}
      ready={l > 0 && w > 0 && t > 0}
      copied={copied}
      onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    />
  );
}

function FramingCalc() {
  const [wallLength, setWallLength] = useState("");
  const [wallHeight, setWallHeight] = useState("");
  const [spacing, setSpacing] = useState<16 | 24>(16);
  const [copied, setCopied] = useState(false);
  const l = parseFloat(wallLength) || 0;
  const h = parseFloat(wallHeight) || 0;
  const studCount = l > 0 ? Math.ceil((l / (spacing / 12)) + 1) + Math.ceil(l / 8) : 0;
  const plateLF = Math.ceil(l * 3);
  const plateSticks = Math.ceil(plateLF / 16);
  const headerCount = Math.ceil(l / 8);
  const sheathingSheets = Math.ceil((l * h) / 32);
  const results = [
    { label: "Stud count", value: studCount + " studs", cost: `${formatCurrency(studCount * 6)}–${formatCurrency(studCount * 10)}` },
    { label: "Plates (3 per wall, LF)", value: plateLF + " LF / " + plateSticks + " sticks", cost: `${formatCurrency(plateSticks * 7)}–${formatCurrency(plateSticks * 11)}` },
    { label: "Header estimate", value: headerCount + " headers", cost: `${formatCurrency(headerCount * 25)}–${formatCurrency(headerCount * 60)}` },
    { label: "Sheathing sheets (4x8)", value: sheathingSheets + " sheets", cost: `${formatCurrency(sheathingSheets * 22)}–${formatCurrency(sheathingSheets * 38)}` },
  ];
  return (
    <CalcLayout
      inputs={<>
        <FieldGroup label="Wall Length (ft)"><Input type="number" placeholder="32" value={wallLength} onChange={(e) => setWallLength(e.target.value)} /></FieldGroup>
        <FieldGroup label="Wall Height (ft)"><Input type="number" placeholder="9" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} /></FieldGroup>
        <FieldGroup label="Stud Spacing">
          <div className="flex gap-2">
            {([16, 24] as const).map((s) => (
              <button key={s} onClick={() => setSpacing(s)} className={cn("flex-1 h-10 rounded-lg border text-sm font-medium transition-colors", spacing === s ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-white text-gray-700 hover:bg-gray-50")}>
                {s}&quot; OC
              </button>
            ))}
          </div>
        </FieldGroup>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => { setWallLength(""); setWallHeight(""); }}><RotateCcw className="w-3.5 h-3.5" />Reset</Button>
      </>}
      results={results}
      ready={l > 0 && h > 0}
      copied={copied}
      onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    />
  );
}

function PaintCalc() {
  const [roomL, setRoomL] = useState("");
  const [roomW, setRoomW] = useState("");
  const [roomH, setRoomH] = useState("");
  const [doors, setDoors] = useState("");
  const [windows, setWindows] = useState("");
  const [copied, setCopied] = useState(false);
  const l = parseFloat(roomL) || 0;
  const w = parseFloat(roomW) || 0;
  const h = parseFloat(roomH) || 0;
  const d = parseInt(doors) || 0;
  const win = parseInt(windows) || 0;
  const wallArea = (2 * (l + w) * h) - (d * 20) - (win * 15);
  const ceilArea = l * w;
  const totalArea = Math.max(0, wallArea) + ceilArea;
  const gal1Coat = Math.ceil(totalArea / 400);
  const gal2Coat = gal1Coat * 2;
  const tapeRolls = Math.ceil((2 * (l + w) + l * w * 0.1) / 60);
  const dropCloths = Math.ceil((l * w) / 120);
  const results = [
    { label: "Wall sq ft (net)", value: Math.max(0, wallArea).toFixed(0) + " sq ft", cost: null },
    { label: "Ceiling sq ft", value: ceilArea.toFixed(0) + " sq ft", cost: null },
    { label: "Gallons — 1 coat", value: gal1Coat + " gal", cost: `${formatCurrency(gal1Coat * 35)}–${formatCurrency(gal1Coat * 65)}` },
    { label: "Gallons — 2 coats", value: gal2Coat + " gal", cost: `${formatCurrency(gal2Coat * 35)}–${formatCurrency(gal2Coat * 65)}` },
    { label: "Painter's tape", value: tapeRolls + " rolls", cost: `${formatCurrency(tapeRolls * 6)}–${formatCurrency(tapeRolls * 10)}` },
    { label: "Drop cloths", value: dropCloths + " cloths", cost: `${formatCurrency(dropCloths * 12)}–${formatCurrency(dropCloths * 22)}` },
  ];
  return (
    <CalcLayout
      inputs={<>
        <FieldGroup label="Room Dimensions">
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-xs text-gray-500 mb-1 block">L (ft)</label><Input type="number" placeholder="16" value={roomL} onChange={(e) => setRoomL(e.target.value)} /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">W (ft)</label><Input type="number" placeholder="14" value={roomW} onChange={(e) => setRoomW(e.target.value)} /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">H (ft)</label><Input type="number" placeholder="9" value={roomH} onChange={(e) => setRoomH(e.target.value)} /></div>
          </div>
        </FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Doors"><Input type="number" placeholder="2" value={doors} onChange={(e) => setDoors(e.target.value)} /></FieldGroup>
          <FieldGroup label="Windows"><Input type="number" placeholder="3" value={windows} onChange={(e) => setWindows(e.target.value)} /></FieldGroup>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => { setRoomL(""); setRoomW(""); setRoomH(""); setDoors(""); setWindows(""); }}><RotateCcw className="w-3.5 h-3.5" />Reset</Button>
      </>}
      results={results}
      ready={l > 0 && w > 0 && h > 0}
      copied={copied}
      onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    />
  );
}

function FencingCalc() {
  const [linearFt, setLinearFt] = useState("");
  const [fenceHeight, setFenceHeight] = useState<4 | 6 | 8>(6);
  const [postSpacing, setPostSpacing] = useState<6 | 8>(8);
  const [copied, setCopied] = useState(false);
  const lf = parseFloat(linearFt) || 0;
  const postCount = lf > 0 ? Math.ceil(lf / postSpacing) + 1 : 0;
  const picketCount = Math.ceil(lf * 12 / 3.5);
  const bayCount = lf > 0 ? Math.ceil(lf / postSpacing) : 0;
  const railCount = bayCount * (fenceHeight >= 6 ? 3 : 2);
  const concreteBags = postCount * (fenceHeight >= 6 ? 3 : 2);
  const gateSets = Math.ceil(lf / 100);
  const results = [
    { label: "Post count", value: postCount + " posts", cost: `${formatCurrency(postCount * 12)}–${formatCurrency(postCount * 22)}` },
    { label: "Picket count", value: picketCount + " pickets", cost: `${formatCurrency(picketCount * 3)}–${formatCurrency(picketCount * 8)}` },
    { label: "Rails needed", value: railCount + " rails", cost: `${formatCurrency(railCount * 8)}–${formatCurrency(railCount * 14)}` },
    { label: "Concrete bags", value: concreteBags + " bags", cost: `${formatCurrency(concreteBags * 6)}–${formatCurrency(concreteBags * 8)}` },
    { label: "Gate hardware sets", value: gateSets + " sets", cost: `${formatCurrency(gateSets * 45)}–${formatCurrency(gateSets * 120)}` },
  ];
  return (
    <CalcLayout
      inputs={<>
        <FieldGroup label="Linear Feet"><Input type="number" placeholder="200" value={linearFt} onChange={(e) => setLinearFt(e.target.value)} /></FieldGroup>
        <FieldGroup label="Fence Height">
          <div className="flex gap-2">
            {([4, 6, 8] as const).map((h) => (
              <button key={h} onClick={() => setFenceHeight(h)} className={cn("flex-1 h-10 rounded-lg border text-sm font-medium transition-colors", fenceHeight === h ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-white text-gray-700 hover:bg-gray-50")}>
                {h} ft
              </button>
            ))}
          </div>
        </FieldGroup>
        <FieldGroup label="Post Spacing">
          <div className="flex gap-2">
            {([6, 8] as const).map((s) => (
              <button key={s} onClick={() => setPostSpacing(s)} className={cn("flex-1 h-10 rounded-lg border text-sm font-medium transition-colors", postSpacing === s ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-white text-gray-700 hover:bg-gray-50")}>
                {s} ft OC
              </button>
            ))}
          </div>
        </FieldGroup>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setLinearFt("")}><RotateCcw className="w-3.5 h-3.5" />Reset</Button>
      </>}
      results={results}
      ready={lf > 0}
      copied={copied}
      onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    />
  );
}

function CalculatorTab() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <Calculator className="w-4 h-4" />
        Field-accurate quantities for roofing, concrete, framing, paint, and fencing
      </div>
      <Tabs defaultValue="roofing">
        <TabsList className="mb-6">
          <TabsTrigger value="roofing">Roofing</TabsTrigger>
          <TabsTrigger value="concrete">Concrete</TabsTrigger>
          <TabsTrigger value="framing">Framing</TabsTrigger>
          <TabsTrigger value="paint">Paint</TabsTrigger>
          <TabsTrigger value="fencing">Fencing</TabsTrigger>
        </TabsList>
        <TabsContent value="roofing"><RoofingCalc /></TabsContent>
        <TabsContent value="concrete"><ConcreteCalc /></TabsContent>
        <TabsContent value="framing"><FramingCalc /></TabsContent>
        <TabsContent value="paint"><PaintCalc /></TabsContent>
        <TabsContent value="fencing"><FencingCalc /></TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function WorkPage() {
  const openJobs = mockJobs.filter((j) => j.status === "open");
  const totalBudget = openJobs.reduce((s, j) => s + j.budget.max, 0);

  return (
    <div className="flex flex-col min-h-full bg-surface">
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Job Marketplace</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">{openJobs.length} open jobs — {formatCurrency(totalBudget)} in available work</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search jobs, locations, categories..."
              className="h-10 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 w-[320px]"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <BrowseJobsTab />
      </div>
    </div>
  );
}
