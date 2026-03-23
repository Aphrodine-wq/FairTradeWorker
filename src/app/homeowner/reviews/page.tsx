"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@shared/ui/button";
import { cn } from "@shared/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CompletedProject {
  id: string;
  title: string;
  contractorName: string;
  completionDate: string;
  totalPaid: number;
}

interface ReviewTag {
  label: string;
  selected: boolean;
}

interface ExistingReview {
  id: string;
  contractorName: string;
  projectTitle: string;
  rating: number;
  text: string;
  date: string;
  tags: string[];
  contractorResponse?: string;
}

// ─── Star Rating (display) ──────────────────────────────────────────────────

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
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

// ─── Clickable Star Rating ──────────────────────────────────────────────────

function ClickableStarRating({
  rating,
  onRate,
  size = 28,
}: {
  rating: number;
  onRate: (r: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
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

// ─── Mock Data ───────────────────────────────────────────────────────────────

const UNREVIEWED_PROJECTS: CompletedProject[] = [
  {
    id: "up1",
    title: "Fence Installation",
    contractorName: "Davis Fencing Co.",
    completionDate: "2026-03-15",
    totalPaid: 6750,
  },
  {
    id: "up2",
    title: "Exterior Painting",
    contractorName: "Pro Coat Painters",
    completionDate: "2026-03-08",
    totalPaid: 4200,
  },
  {
    id: "up3",
    title: "Deck Repair",
    contractorName: "Wilson Carpentry",
    completionDate: "2026-02-28",
    totalPaid: 3100,
  },
];

const EXISTING_REVIEWS: ExistingReview[] = [
  {
    id: "er1",
    contractorName: "Marcus Johnson",
    projectTitle: "Kitchen Remodel",
    rating: 5,
    text: "Marcus and his crew did an outstanding job on our kitchen remodel. Every detail was handled with care — the cabinet install was flawless and the tile work exceeded our expectations. He kept us updated daily and finished two days ahead of schedule. Could not be happier with the result.",
    date: "2026-03-10",
    tags: ["On time", "Great communication", "Quality work", "Would hire again"],
    contractorResponse:
      "Thank you so much for the kind words. It was a pleasure working on your kitchen — that backsplash pattern turned out great. Looking forward to working with you again on any future projects.",
  },
  {
    id: "er2",
    contractorName: "Garcia Plumbing Services",
    projectTitle: "Bathroom Renovation",
    rating: 5,
    text: "Garcia Plumbing completely transformed our master bathroom. The plumbing rough-in was done properly, the tile shower came out beautifully, and the new vanity fits perfectly. They were respectful of our home and cleaned up every day before leaving.",
    date: "2026-02-20",
    tags: ["Quality work", "Fair price", "Great communication"],
    contractorResponse:
      "We appreciate the review! Your bathroom was a fun project — that walk-in shower design was a great choice. Glad everything is working perfectly.",
  },
  {
    id: "er3",
    contractorName: "Roberts Electrical",
    projectTitle: "Panel Upgrade",
    rating: 4,
    text: "Solid work on our electrical panel upgrade from 100A to 200A. The team was knowledgeable and passed inspection on the first try. Only reason for 4 stars is they were a couple days behind the original schedule, but they communicated the delay upfront and the quality of work was excellent.",
    date: "2026-01-15",
    tags: ["Quality work", "Fair price"],
  },
  {
    id: "er4",
    contractorName: "Oxford Roofing LLC",
    projectTitle: "Roof Replacement",
    rating: 5,
    text: "Replaced our entire roof after storm damage. The crew was fast, professional, and left our yard spotless. They handled the insurance paperwork and made the whole process stress-free. The new architectural shingles look incredible. Highly recommend to anyone in the Oxford area.",
    date: "2025-12-05",
    tags: ["On time", "Great communication", "Quality work", "Fair price", "Would hire again"],
    contractorResponse:
      "Thank you for trusting us with your roof. Storm damage can be stressful, and we're glad we could make the process smooth. Your home looks great with those new shingles!",
  },
];

const TAG_OPTIONS = [
  "On time",
  "Great communication",
  "Fair price",
  "Quality work",
  "Would hire again",
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomeownerReviewsPage() {
  const [tab, setTab] = useState<"leave" | "history">("leave");

  // Review form state (per-project)
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [formRating, setFormRating] = useState(0);
  const [formText, setFormText] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<string[]>([]);

  const totalReviews = EXISTING_REVIEWS.length;
  const avgRating =
    EXISTING_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  const unreviewedProjects = UNREVIEWED_PROJECTS.filter(
    (p) => !submitted.includes(p.id)
  );

  function openForm(projectId: string) {
    setActiveFormId(projectId);
    setFormRating(0);
    setFormText("");
    setFormTags([]);
  }

  function closeForm() {
    setActiveFormId(null);
    setFormRating(0);
    setFormText("");
    setFormTags([]);
  }

  function toggleTag(tag: string) {
    setFormTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function submitReview(projectId: string) {
    setSubmitted((prev) => [...prev, projectId]);
    closeForm();
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
          Reviews
        </h1>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-[800px]">
          {/* Summary bar */}
          <div className="flex items-center gap-5 mb-6 bg-white rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-[14px] font-bold text-gray-900">
                  {totalReviews} reviews given
                </p>
                <p className="text-[12px] text-gray-400">
                  Average {avgRating.toFixed(1)} stars
                </p>
              </div>
            </div>
            <div className="flex gap-0.5 ml-auto">
              <StarRating rating={avgRating} size={16} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-5">
            {(
              [
                { key: "leave" as const, label: "Leave a Review" },
                { key: "history" as const, label: "My Reviews" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors",
                  tab === t.key
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Leave a Review Tab ─────────────────────────────────── */}
          {tab === "leave" && (
            <div className="space-y-4">
              {unreviewedProjects.length === 0 && (
                <div className="py-12 text-center bg-white rounded-xl">
                  <Star className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-[14px] font-medium text-gray-900 mb-1">
                    All caught up
                  </p>
                  <p className="text-[13px] text-gray-400">
                    No completed projects waiting for a review.
                  </p>
                </div>
              )}

              {unreviewedProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-700 text-sm font-bold">
                          {project.contractorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-gray-900">
                          {project.title}
                        </p>
                        <p className="text-[12px] text-gray-400">
                          {project.contractorName} -- Completed{" "}
                          {formatDate(project.completionDate)} --{" "}
                          {formatCurrency(project.totalPaid)}
                        </p>
                      </div>
                    </div>
                    {activeFormId !== project.id && (
                      <Button
                        size="sm"
                        onClick={() => openForm(project.id)}
                        className="bg-brand-600 hover:bg-brand-700 text-white"
                      >
                        Write Review
                      </Button>
                    )}
                  </div>

                  {/* Inline review form */}
                  {activeFormId === project.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                      {/* Star rating */}
                      <div>
                        <p className="text-[13px] font-medium text-gray-900 mb-2">
                          Rating
                        </p>
                        <ClickableStarRating
                          rating={formRating}
                          onRate={setFormRating}
                        />
                      </div>

                      {/* Text review */}
                      <div>
                        <p className="text-[13px] font-medium text-gray-900 mb-2">
                          Your review
                        </p>
                        <textarea
                          value={formText}
                          onChange={(e) => setFormText(e.target.value)}
                          rows={4}
                          placeholder="How was your experience working with this contractor?"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 resize-none leading-relaxed"
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <p className="text-[13px] font-medium text-gray-900 mb-2">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {TAG_OPTIONS.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors",
                                formTags.includes(tag)
                                  ? "bg-brand-600 text-white border-brand-600"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                              )}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-1">
                        <Button
                          onClick={() => submitReview(project.id)}
                          disabled={formRating === 0 || !formText.trim()}
                          className="bg-brand-600 hover:bg-brand-700 text-white"
                        >
                          Submit Review
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={closeForm}
                          className="text-gray-500"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── My Reviews Tab ─────────────────────────────────────── */}
          {tab === "history" && (
            <div className="space-y-4">
              {EXISTING_REVIEWS.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-700 text-sm font-bold">
                          {review.contractorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-gray-900">
                          {review.contractorName}
                        </p>
                        <p className="text-[12px] text-gray-400">
                          {review.projectTitle} -- {formatDate(review.date)}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size={14} />
                  </div>

                  <p className="text-[14px] text-gray-600 leading-relaxed mb-3">
                    {review.text}
                  </p>

                  {/* Tags */}
                  {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {review.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contractor response */}
                  {review.contractorResponse && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[12px] font-medium text-gray-500">
                          Contractor response
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-500 leading-relaxed pl-5">
                        {review.contractorResponse}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
