"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, LayoutGrid, List } from "lucide-react";
import { Input } from "@shared/ui/input";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Textarea } from "@shared/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/ui/dialog";
import { type SubJob, type SubPaymentPath } from "@shared/lib/mock-data";
import { fetchSubJobs } from "@shared/lib/data";
import { api } from "@shared/lib/realtime";
import { SubJobCard } from "@subcontractor/components/sub-job-card";
import { AppHeader } from "@shared/components/app-header";
import { cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";
import { toast } from "sonner";

type SortOption = "newest" | "budget-high" | "budget-low" | "deadline";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "budget-high", label: "Budget: High" },
  { value: "budget-low", label: "Budget: Low" },
  { value: "deadline", label: "Deadline" },
];

const CATEGORY_FILTERS = [
  "General Contracting", "Plumbing", "Electrical", "HVAC", "Roofing",
  "Painting", "Flooring", "Landscaping", "Concrete", "Fencing", "Drywall",
];

const SKILL_FILTERS = [
  "Countertops", "Stone Fabrication", "Tile Setting", "LVP Install", "Backsplash",
  "Gutters", "Rough-In", "PEX", "Flashing", "Ridge Cap", "Waterproofing",
  "Framing", "Finish Carpentry", "Drywall Hanging", "Texture",
];

export default function BrowseSubJobsPage() {
  usePageTitle("Browse Sub Jobs");
  const [subJobs, setSubJobs] = useState<SubJob[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedUrgency, setSelectedUrgency] = useState<string | null>(null);
  const [selectedPaymentPath, setSelectedPaymentPath] = useState<SubPaymentPath | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [bidDialogJob, setBidDialogJob] = useState<SubJob | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidTimeline, setBidTimeline] = useState("");
  const [bidMessage, setBidMessage] = useState("");

  useEffect(() => {
    fetchSubJobs().then(setSubJobs);
  }, []);

  const filtered = useMemo(() => {
    let result = subJobs.filter((sj) => sj.status === "open");

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (sj) =>
          sj.title.toLowerCase().includes(q) ||
          sj.description.toLowerCase().includes(q) ||
          sj.skills.some((s) => s.toLowerCase().includes(q)) ||
          sj.milestoneLabel.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      result = result.filter((sj) => selectedCategories.includes(sj.category));
    }
    if (selectedSkills.length > 0) {
      result = result.filter((sj) => sj.skills.some((s) => selectedSkills.includes(s)));
    }
    if (selectedUrgency) {
      result = result.filter((sj) => sj.urgency === selectedUrgency);
    }
    if (selectedPaymentPath) {
      result = result.filter((sj) => sj.paymentPath === selectedPaymentPath);
    }

    switch (sort) {
      case "budget-high":
        result.sort((a, b) => b.budgetMax - a.budgetMax);
        break;
      case "budget-low":
        result.sort((a, b) => a.budgetMin - b.budgetMin);
        break;
      case "deadline":
        result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
      default:
        result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    }

    return result;
  }, [subJobs, search, sort, selectedCategories, selectedSkills, selectedUrgency, selectedPaymentPath]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategories([]);
    setSelectedSkills([]);
    setSelectedUrgency(null);
    setSelectedPaymentPath(null);
  }

  const hasFilters = search || selectedCategories.length > 0 || selectedSkills.length > 0 || selectedUrgency || selectedPaymentPath;

  async function submitBid() {
    if (!bidDialogJob) return;
    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid bid amount");
      return;
    }
    try {
      await api.placeSubBid(bidDialogJob.id, {
        amount,
        timeline: bidTimeline || undefined,
        message: bidMessage || undefined,
      });
      toast.success("Bid submitted");
      setBidDialogJob(null);
      setBidAmount("");
      setBidTimeline("");
      setBidMessage("");
    } catch {
      toast.error("Could not submit bid");
    }
  }

  return (
    <div className="flex h-full">
      {/* Filter Sidebar */}
      {showFilters && (
        <div className="w-[260px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-gray-900">Filters</h2>
            {hasFilters && (
              <button onClick={clearFilters} className="text-[12px] text-brand-600 hover:text-brand-700 font-semibold">
                Clear all
              </button>
            )}
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sub jobs..."
                className="pl-8 h-8 text-[13px] rounded-sm"
              />
            </div>
          </div>

          {/* Category */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
            <div className="space-y-1">
              {CATEGORY_FILTERS.map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="w-3.5 h-3.5 rounded-sm border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-[13px] text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_FILTERS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "text-[11px] font-medium px-2 py-1 transition-colors",
                    selectedSkills.includes(skill)
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Urgency</p>
            <div className="space-y-1">
              {["low", "medium", "high"].map((u) => (
                <label key={u} className="flex items-center gap-2 cursor-pointer py-1">
                  <input
                    type="radio"
                    name="urgency"
                    checked={selectedUrgency === u}
                    onChange={() => setSelectedUrgency(selectedUrgency === u ? null : u)}
                    className="w-3.5 h-3.5 border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-[13px] text-gray-700 capitalize">{u}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Path */}
          <div className="p-4">
            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment</p>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="radio"
                  name="payment"
                  checked={selectedPaymentPath === "contractor_escrow"}
                  onChange={() => setSelectedPaymentPath(selectedPaymentPath === "contractor_escrow" ? null : "contractor_escrow")}
                  className="w-3.5 h-3.5 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-[13px] text-gray-700">GC Escrow</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="radio"
                  name="payment"
                  checked={selectedPaymentPath === "passthrough_escrow"}
                  onChange={() => setSelectedPaymentPath(selectedPaymentPath === "passthrough_escrow" ? null : "passthrough_escrow")}
                  className="w-3.5 h-3.5 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-[13px] text-gray-700">Pass-through</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="h-12 flex items-center justify-between px-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-semibold transition-colors",
                showFilters ? "bg-brand-50 text-brand-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
            <span className="text-[13px] text-gray-500">
              {filtered.length} sub job{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-7 px-2 text-[12px] font-semibold bg-gray-100 border-none text-gray-700 rounded-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="flex items-center bg-gray-100">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("w-7 h-7 flex items-center justify-center", viewMode === "grid" ? "bg-brand-600 text-white" : "text-gray-500")}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("w-7 h-7 flex items-center justify-center", viewMode === "list" ? "bg-brand-600 text-white" : "text-gray-500")}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length > 0 ? (
            <div className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                : "flex flex-col gap-3"
            )}>
              {filtered.map((sj) => (
                <SubJobCard
                  key={sj.id}
                  subJob={sj}
                  onBid={(sj) => {
                    setBidDialogJob(sj);
                    setBidAmount(String(sj.budgetMin));
                    setBidTimeline("");
                    setBidMessage("");
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-[15px] font-semibold text-gray-900">No sub jobs found</p>
              <p className="text-[13px] text-gray-500 mt-1">Try adjusting your filters</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-3 text-[13px] font-semibold text-brand-600 hover:text-brand-700">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(bidDialogJob)}
        onOpenChange={(open) => {
          if (!open) setBidDialogJob(null);
        }}
      >
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Place Sub-Bid</DialogTitle>
          </DialogHeader>
          {bidDialogJob && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">{bidDialogJob.title}</p>
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Amount</label>
                <Input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Timeline</label>
                <Input value={bidTimeline} onChange={(e) => setBidTimeline(e.target.value)} placeholder="e.g., 5 days" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Message</label>
                <Textarea value={bidMessage} onChange={(e) => setBidMessage(e.target.value)} rows={4} placeholder="Briefly explain your approach and availability." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setBidDialogJob(null)}>Cancel</Button>
                <Button onClick={submitBid}>Submit Bid</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
