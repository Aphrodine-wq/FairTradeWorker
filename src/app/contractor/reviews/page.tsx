"use client";

import { useState, useEffect } from "react";
import { Star, TrendingUp, ThumbsUp, MessageSquare, Send } from "lucide-react";
import { mockReviews } from "@shared/lib/mock-data";
import { fetchReviews } from "@shared/lib/data";
import { api } from "@shared/lib/realtime";
import { formatDate, cn } from "@shared/lib/utils";
import { FallbackBanner } from "@shared/components/fallback-banner";
import { ReviewListSkeleton } from "@shared/components/loading-skeleton";
import { Button } from "@shared/ui/button";
import { Textarea } from "@shared/ui/textarea";
import { usePageTitle } from "@shared/hooks/use-page-title";
import { toast } from "sonner";

// ─── Star component ─────────────────────────────────────────────────────────

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

// ─── Response form ──────────────────────────────────────────────────────────

function ResponseForm({ reviewId }: { reviewId: string }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await api.respondToReview(reviewId, text.trim());
      toast.success("Response posted");
      setSubmitted(true);
    } catch {
      toast.error("Failed to post response");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <p className="text-[13px] text-brand-600 font-medium mt-2">Response posted</p>;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a response to this review..."
        rows={2}
        className="text-[13px] resize-none"
      />
      <Button
        onClick={handleSubmit}
        disabled={!text.trim() || submitting}
        size="sm"
        className="gap-1.5 text-[12px]"
      >
        <Send className="w-3 h-3" />
        {submitting ? "Posting..." : "Respond"}
      </Button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContractorReviewsPage() {
  usePageTitle("Reviews");
  const [filter, setFilter] = useState<"all" | "5" | "4" | "3">("all");
  const [reviews, setReviews] = useState(mockReviews);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    fetchReviews().then(({ data, isMock: mock }) => {
      if (!mock && data.length > 0) {
        setReviews(
          data.map((r: any) => ({
            id: r.id,
            authorName: r.reviewer?.name ?? "Unknown",
            authorAvatar: "",
            rating: r.rating,
            text: r.comment,
            date: r.created_at,
            role: r.reviewer?.role ?? "homeowner",
          }))
        );
      } else {
        setIsMock(true);
      }
      setLoading(false);
    });
  }, []);

  // Dynamic breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    return { stars, count, pct: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0 };
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const totalReviews = reviews.length;
  const areaAvg = 4.2;

  const filteredReviews = filter === "all"
    ? reviews
    : reviews.filter((r) => r.rating === parseInt(filter));

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {isMock && <FallbackBanner />}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Reviews</h1>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-[1200px]">
          {loading ? (
            <ReviewListSkeleton />
          ) : (
            <>
              {/* Stats row */}
              <div className="flex gap-6 mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-5 mb-5">
                    <div>
                      <p className="text-[56px] font-bold text-gray-900 tabular-nums leading-none">{avgRating.toFixed(1)}</p>
                      <StarRating rating={avgRating} size={20} />
                      <p className="text-[13px] text-gray-600 mt-1">{totalReviews} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {ratingBreakdown.map((row) => (
                        <div key={row.stars} className="flex items-center gap-2">
                          <span className="text-[12px] text-gray-600 w-3 text-right tabular-nums">{row.stars}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-sm overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-sm" style={{ width: `${row.pct}%` }} />
                          </div>
                          <span className="text-[12px] text-gray-600 w-6 tabular-nums">{row.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-[180px] rounded-sm bg-white p-4">
                    <TrendingUp className="w-5 h-5 text-emerald-950 mb-2" />
                    <p className="text-[12px] text-gray-600">Rating Trend</p>
                    <p className="text-[24px] font-bold text-gray-900 leading-tight">+0.3</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">vs last month</p>
                  </div>
                  <div className="w-[180px] rounded-sm bg-white p-4">
                    <Star className="w-5 h-5 text-amber-400 mb-2" />
                    <p className="text-[12px] text-gray-600">Area Average</p>
                    <p className="text-[24px] font-bold text-gray-900 leading-tight">{areaAvg}</p>
                    <p className="text-[11px] text-emerald-950 font-semibold mt-0.5">You&apos;re {(avgRating - areaAvg).toFixed(1)} above</p>
                  </div>
                  <div className="w-[180px] rounded-sm bg-white p-4">
                    <ThumbsUp className="w-5 h-5 text-brand-600 mb-2" />
                    <p className="text-[12px] text-gray-600">Ranking</p>
                    <p className="text-[24px] font-bold text-gray-900 leading-tight">Top 5%</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">Oxford, MS contractors</p>
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 mb-4">
                {(["all", "5", "4", "3"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "text-[13px] font-medium px-3 py-1.5 rounded-sm transition-colors",
                      filter === f ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {f === "all" ? "All" : `${f} stars`}
                  </button>
                ))}
              </div>

              {/* Reviews list */}
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-brand-700 text-sm font-bold">
                            {review.authorName.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-gray-900">{review.authorName}</p>
                          <p className="text-[12px] text-gray-600">{formatDate(review.date)}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <p className="text-[14px] text-gray-800 leading-relaxed">{review.text}</p>
                    <ResponseForm reviewId={review.id} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
