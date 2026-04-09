"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  ExternalLink,
  MessageSquare,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Textarea } from "@shared/ui/textarea";
import { cn, formatCurrency, formatDate } from "@shared/lib/utils";
import { toast } from "sonner";
import { usePageTitle } from "@shared/hooks/use-page-title";
import { api } from "@shared/lib/realtime";

// ─── Types ──────────────────────────────────────────────────────────────────

type JobStatus = "needs_review" | "reviewed";

interface MilestoneSnapshot {
  label: string;
  amount: number;
  verified: boolean;
}

interface CompletedJob {
  id: string;
  projectTitle: string;
  category: string;
  contractorName: string;
  contractorCompany: string;
  contractorId: string;
  locationCity: string;
  completionDate: string;
  estimatedBudget: number;
  finalCost: number;
  milestones: MilestoneSnapshot[];
  photos: string[];
  status: JobStatus;
  // Review data (filled after review)
  review?: {
    rating: number;
    text: string;
    tags: string[];
    submittedAt: string;
    fairRecordId: string;
  };
}

// ─── Star Components ────────────────────────────────────────────────────────

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, rating - (star - 1)));
        return (
          <div key={star} className="relative" style={{ width: size, height: size }}>
            <svg viewBox="0 0 20 20" style={{ width: size, height: size }} className="text-gray-200">
              <path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.51L10 13.49l-4.94 2.63L6 10.61l-4-3.9 5.61-.87z" fill="currentColor" />
            </svg>
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 20 20" style={{ width: size, height: size }} className="text-amber-400">
                <path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.51L10 13.49l-4.94 2.63L6 10.61l-4-3.9 5.61-.87z" fill="currentColor" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ClickableStarRating({
  rating,
  onRate,
  size = 32,
}: {
  rating: number;
  onRate: (r: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hover || rating);
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onRate(star)}
            className="transition-transform hover:scale-110"
          >
            <svg
              viewBox="0 0 20 20"
              style={{ width: size, height: size }}
              className={active ? "text-amber-400" : "text-gray-200"}
            >
              <path
                d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.51L10 13.49l-4.94 2.63L6 10.61l-4-3.9 5.61-.87z"
                fill="currentColor"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TAG_OPTIONS = [
  "On time",
  "Great communication",
  "Fair price",
  "Quality work",
  "Clean jobsite",
  "Would hire again",
];

const VERIFICATION_ITEMS = [
  "Work matches the agreed scope",
  "Site is clean and materials removed",
  "Quality meets expectations",
  "No damage to surrounding areas",
];

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_COMPLETED_JOBS: CompletedJob[] = [
  {
    id: "cj1",
    projectTitle: "Kitchen Remodel - Full Gut",
    category: "Remodeling",
    contractorName: "Marcus Johnson",
    contractorCompany: "Johnson & Sons Construction",
    contractorId: "c1",
    locationCity: "Oxford",
    completionDate: "2026-03-22",
    estimatedBudget: 38500,
    finalCost: 36800,
    milestones: [
      { label: "Demo complete", amount: 5000, verified: true },
      { label: "Rough-in (plumbing & electrical)", amount: 8500, verified: true },
      { label: "Cabinet installation", amount: 7000, verified: true },
      { label: "Countertops & backsplash", amount: 6500, verified: true },
      { label: "Final walkthrough & punch list", amount: 11500, verified: true },
    ],
    photos: ["/photos/kitchen-1.jpg", "/photos/kitchen-2.jpg", "/photos/kitchen-3.jpg"],
    status: "needs_review",
  },
  {
    id: "cj2",
    projectTitle: "Fence Installation - Cedar Privacy",
    category: "Fencing",
    contractorName: "Davis Fencing Co.",
    contractorCompany: "Davis Fencing Co.",
    contractorId: "c5",
    locationCity: "Oxford",
    completionDate: "2026-03-15",
    estimatedBudget: 6750,
    finalCost: 6750,
    milestones: [
      { label: "Post holes & setting", amount: 2000, verified: true },
      { label: "Rails & pickets", amount: 3000, verified: true },
      { label: "Gates & hardware", amount: 1750, verified: true },
    ],
    photos: ["/photos/fence-1.jpg", "/photos/fence-2.jpg"],
    status: "needs_review",
  },
  {
    id: "cj3",
    projectTitle: "Master Bathroom Renovation",
    category: "Remodeling",
    contractorName: "Robert Garcia",
    contractorCompany: "Garcia Plumbing Services",
    contractorId: "c3",
    locationCity: "Oxford",
    completionDate: "2026-02-20",
    estimatedBudget: 22000,
    finalCost: 21400,
    milestones: [
      { label: "Demo & prep", amount: 3500, verified: true },
      { label: "Plumbing rough-in", amount: 4500, verified: true },
      { label: "Tile & waterproofing", amount: 6000, verified: true },
      { label: "Fixtures & vanity", amount: 5000, verified: true },
      { label: "Final details & cleanup", amount: 3000, verified: true },
    ],
    photos: ["/photos/bath-1.jpg", "/photos/bath-2.jpg"],
    status: "reviewed",
    review: {
      rating: 5,
      text: "Garcia Plumbing completely transformed our master bathroom. The plumbing rough-in was done properly, the tile shower came out beautifully, and the new vanity fits perfectly. They were respectful of our home and cleaned up every day before leaving.",
      tags: ["Quality work", "Fair price", "Great communication", "Clean jobsite"],
      submittedAt: "2026-02-21T10:30:00Z",
      fairRecordId: "FR-B7M4P1",
    },
  },
  {
    id: "cj4",
    projectTitle: "Electrical Panel Upgrade",
    category: "Electrical",
    contractorName: "Roberts Electrical",
    contractorCompany: "Roberts Electrical LLC",
    contractorId: "c8",
    locationCity: "Oxford",
    completionDate: "2026-01-14",
    estimatedBudget: 4800,
    finalCost: 5100,
    milestones: [
      { label: "Disconnect & remove old panel", amount: 1500, verified: true },
      { label: "Install new panel & circuits", amount: 2500, verified: true },
      { label: "Inspection & energize", amount: 800, verified: true },
    ],
    photos: ["/photos/panel-1.jpg"],
    status: "reviewed",
    review: {
      rating: 4,
      text: "Solid work on our electrical panel upgrade from 100A to 200A. The team was knowledgeable and passed inspection on the first try. Only reason for 4 stars is they were a couple days behind the original schedule, but they communicated the delay upfront.",
      tags: ["Quality work", "Fair price"],
      submittedAt: "2026-01-16T14:00:00Z",
      fairRecordId: "FR-C2J8N5",
    },
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HomeownerFairRecordPage() {
  usePageTitle("FairRecord");
  const [jobs, setJobs] = useState<CompletedJob[]>(MOCK_COMPLETED_JOBS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const needsReview = jobs.filter((j) => j.status === "needs_review");
  const reviewed = jobs.filter((j) => j.status === "reviewed");
  const totalReviewed = reviewed.length;
  const avgRating =
    totalReviewed > 0
      ? reviewed.reduce((sum, j) => sum + (j.review?.rating ?? 0), 0) / totalReviewed
      : 0;

  async function submitReview(
    jobId: string,
    rating: number,
    text: string,
    tags: string[]
  ) {
    const job = jobs.find((j) => j.id === jobId);
    let fairRecordId = `FR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Post to real API
    try {
      const result = await api.createReview({
        rating,
        comment: text,
        reviewed_id: job?.contractorId ?? "",
        job_id: jobId,
      });
      if (result?.fair_record_id) {
        fairRecordId = result.fair_record_id;
      }
    } catch {
      // API failed — still update UI optimistically
    }

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "reviewed" as JobStatus,
              review: {
                rating,
                text,
                tags,
                submittedAt: new Date().toISOString(),
                fairRecordId,
              },
            }
          : j
      )
    );
    setExpandedId(null);
    toast.success("Review submitted -- FairRecord created for contractor");
  }

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 pt-6 pb-5 max-w-[800px]">
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight mb-1">FairRecord</h1>
          <p className="text-[14px] text-gray-700">
            Verify your completed projects and rate your contractors. Your verification creates their public FairRecord.
          </p>

          {/* Status bar */}
          <div className="flex items-center gap-5 mt-4">
            {needsReview.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-[13px] font-semibold text-amber-800">
                  {needsReview.length} {needsReview.length === 1 ? "job" : "jobs"} to review
                </span>
              </div>
            )}
            {needsReview.length === 0 && (
              <div className="flex items-center gap-2 bg-emerald-950/10 border border-emerald-800/20 rounded-sm px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                <span className="text-[13px] font-semibold text-emerald-950">All caught up</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-600" />
              <span className="text-[13px] text-gray-800">{totalReviewed} verified records</span>
            </div>
            {totalReviewed > 0 && (
              <div className="flex items-center gap-1.5">
                <StarRating rating={avgRating} />
                <span className="text-[13px] text-gray-800">{avgRating.toFixed(1)} avg given</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-[800px]">

          {/* ── How It Works (show when few reviews) ─────────────── */}
          {totalReviewed <= 2 && (
            <div className="rounded-sm bg-brand-50 border border-brand-200 px-5 py-4 mb-6">
              <p className="text-[13px] font-semibold text-brand-900 mb-2">How FairRecord works for homeowners</p>
              <div className="space-y-1.5">
                <p className="text-[12px] text-brand-700 leading-relaxed flex items-start gap-2">
                  <span className="w-5 h-5 rounded-sm bg-brand-200 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-brand-800">1</span>
                  Your contractor completes a milestone and submits for review through the escrow system.
                </p>
                <p className="text-[12px] text-brand-700 leading-relaxed flex items-start gap-2">
                  <span className="w-5 h-5 rounded-sm bg-brand-200 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-brand-800">2</span>
                  Once all milestones are verified and paid, the job appears here for your final review.
                </p>
                <p className="text-[12px] text-brand-700 leading-relaxed flex items-start gap-2">
                  <span className="w-5 h-5 rounded-sm bg-brand-200 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-brand-800">3</span>
                  You verify the work, rate the contractor, and a FairRecord is created on their public portfolio.
                </p>
              </div>
            </div>
          )}

          {/* ── Needs Review Section ─────────────────────────────── */}
          {needsReview.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Ready for Your Review
              </h2>
              <div className="space-y-4">
                {needsReview.map((job) => (
                  <NeedsReviewCard
                    key={job.id}
                    job={job}
                    isExpanded={expandedId === job.id}
                    onToggle={() =>
                      setExpandedId(expandedId === job.id ? null : job.id)
                    }
                    onSubmit={(rating, text, tags) =>
                      submitReview(job.id, rating, text, tags)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Reviewed Section ──────────────────────────────────── */}
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider mb-1">
              Your Verified Projects
            </h2>
            <p className="text-[12px] text-gray-600 mb-4">
              Jobs you&apos;ve reviewed. Each one created a FairRecord on the contractor&apos;s public portfolio.
            </p>
            {reviewed.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-sm">
                <Award className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-[14px] font-medium text-gray-900 mb-1">No records yet</p>
                <p className="text-[13px] text-gray-600">
                  When you review completed jobs above, a FairRecord is created for the contractor.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewed.map((job) => (
                  <ReviewedCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Needs Review Card ──────────────────────────────────────────────────────

function NeedsReviewCard({
  job,
  isExpanded,
  onToggle,
  onSubmit,
}: {
  job: CompletedJob;
  isExpanded: boolean;
  onToggle: () => void;
  onSubmit: (rating: number, text: string, tags: string[]) => void;
}) {
  const [checks, setChecks] = useState<boolean[]>(VERIFICATION_ITEMS.map(() => false));
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const allChecked = checks.every(Boolean);
  const budgetPct = Math.round((job.finalCost / job.estimatedBudget) * 100);

  return (
    <div className="bg-white rounded-sm overflow-hidden border border-amber-200">
      {/* Card header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-sm bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900">{job.projectTitle}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[12px] text-gray-700">{job.contractorName}</span>
            <span className="text-[12px] text-gray-600">{job.category}</span>
            <span className="text-[12px] text-gray-600">Completed {formatDate(job.completionDate)}</span>
          </div>
        </div>
        <div className="text-right shrink-0 mr-2">
          <p className="text-[14px] font-semibold text-gray-900 tabular-nums">{formatCurrency(job.finalCost)}</p>
          <p className="text-[11px] text-gray-600">of {formatCurrency(job.estimatedBudget)}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />
        )}
      </button>

      {/* Expanded review form */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          {/* Milestone summary */}
          <div className="py-4 border-b border-gray-100">
            <p className="text-[12px] font-medium text-gray-700 uppercase tracking-wider mb-3">
              Milestones Completed
            </p>
            <div className="space-y-2">
              {job.milestones.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                    <span className="text-[13px] text-gray-900">{m.label}</span>
                  </div>
                  <span className="text-[13px] font-medium text-gray-900 tabular-nums">
                    {formatCurrency(m.amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-[13px] font-semibold text-gray-900">Budget accuracy</span>
              <span
                className={cn(
                  "text-[13px] font-bold px-2 py-0.5 rounded",
                  budgetPct <= 105
                    ? "bg-emerald-950/10 text-emerald-950"
                    : "bg-amber-50 text-amber-700"
                )}
              >
                {budgetPct}%
              </span>
            </div>
          </div>

          {/* Verification checklist */}
          <div className="py-4 border-b border-gray-100">
            <p className="text-[12px] font-medium text-gray-700 uppercase tracking-wider mb-3">
              Verification Checklist
            </p>
            <div className="rounded-sm border border-gray-200 divide-y divide-gray-200">
              {VERIFICATION_ITEMS.map((item, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setChecks((prev) => prev.map((c, idx) => (idx === i ? !c : c)))
                    }
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      checks[i]
                        ? "bg-emerald-600 border-emerald-600"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    {checks[i] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </button>
                  <span
                    className={cn("text-[14px]", checks[i] ? "text-gray-900" : "text-gray-700")}
                  >
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating + Review */}
          <div className="py-4 space-y-4">
            <div>
              <p className="text-[12px] font-medium text-gray-700 uppercase tracking-wider mb-3">
                Rate This Contractor
              </p>
              <ClickableStarRating rating={rating} onRate={setRating} />
            </div>

            <div>
              <p className="text-[12px] font-medium text-gray-700 uppercase tracking-wider mb-2">
                Your Review
              </p>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="How was your experience? This will appear on the contractor's public FairRecord."
                className="text-[14px] resize-none"
              />
            </div>

            <div>
              <p className="text-[12px] font-medium text-gray-700 uppercase tracking-wider mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-sm text-[12px] font-medium border transition-colors",
                      tags.includes(tag)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-gray-800 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => onSubmit(rating, text, tags)}
              disabled={!allChecked || rating === 0 || !text.trim()}
              className={cn(
                "text-[13px] font-semibold",
                allChecked && rating > 0 && text.trim()
                  ? "bg-brand-600 hover:bg-brand-700 text-white"
                  : ""
              )}
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Verify & Create FairRecord
            </Button>
            {!allChecked && (
              <span className="text-[12px] text-gray-600">
                Complete all verification checks to submit
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reviewed Card ──────────────────────────────────────────────────────────

function ReviewedCard({ job }: { job: CompletedJob }) {
  const review = job.review!;
  const budgetPct = Math.round((job.finalCost / job.estimatedBudget) * 100);

  return (
    <div className="bg-white rounded-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-brand-100 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-brand-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-bold text-gray-900">{job.projectTitle}</p>
              <Badge variant="success" className="text-[10px] px-1.5 py-0">Verified</Badge>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[12px] text-gray-700">{job.contractorName}</span>
              <span className="text-[12px] text-gray-600">{job.category}</span>
              <span className="text-[12px] text-gray-600">{formatDate(job.completionDate)}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`/record/${review.fairRecordId}`, "_blank")}
          className="text-[12px] gap-1 text-brand-600"
        >
          <ExternalLink className="w-3 h-3" /> View Public Record
        </Button>
      </div>

      {/* Metrics row */}
      <div className="flex gap-6 mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[13px] text-gray-800">
            {formatCurrency(job.finalCost)} of {formatCurrency(job.estimatedBudget)}
          </span>
          <span
            className={cn(
              "text-[11px] font-semibold px-1.5 py-0.5 rounded",
              budgetPct <= 105
                ? "bg-emerald-950/10 text-emerald-950"
                : "bg-amber-50 text-amber-700"
            )}
          >
            {budgetPct}% accuracy
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <StarRating rating={review.rating} />
          <span className="text-[12px] text-gray-700">{review.rating}/5</span>
        </div>
      </div>

      {/* Review text */}
      <p className="text-[13px] text-gray-800 leading-relaxed mb-3">{review.text}</p>

      {/* Tags */}
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Record link */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-[11px] text-gray-700">
            FairRecord created {formatDate(review.submittedAt)}
          </span>
        </div>
        <span className="text-[11px] text-gray-600 font-mono">{review.fairRecordId}</span>
      </div>
    </div>
  );
}
