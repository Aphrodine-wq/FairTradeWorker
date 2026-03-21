"use client";

import { useState } from "react";
import { Star, TrendingUp, MessageSquare, ThumbsUp } from "lucide-react";
import { mockReviews } from "@shared/lib/mock-data";
import { formatDate, cn } from "@shared/lib/utils";

const RATING_BREAKDOWN = [
  { stars: 5, count: 4, pct: 80 },
  { stars: 4, count: 1, pct: 20 },
  { stars: 3, count: 0, pct: 0 },
  { stars: 2, count: 0, pct: 0 },
  { stars: 1, count: 0, pct: 0 },
];

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

export default function ContractorReviewsPage() {
  const [filter, setFilter] = useState<"all" | "5" | "4" | "3">("all");
  const avgRating = 4.9;
  const totalReviews = mockReviews.length;
  const areaAvg = 4.2;

  const filteredReviews = filter === "all"
    ? mockReviews
    : mockReviews.filter((r) => r.rating === parseInt(filter));

  return (
    <div className="flex flex-col min-h-full bg-surface">
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Reviews</h1>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-[1200px]">
          {/* Stats row */}
          <div className="flex gap-6 mb-8">
            {/* Rating overview */}
            <div className="flex-1">
              <div className="flex items-center gap-5 mb-5">
                <div>
                  <p className="text-[56px] font-bold text-gray-900 tabular-nums leading-none">{avgRating}</p>
                  <StarRating rating={avgRating} size={20} />
                  <p className="text-[13px] text-gray-400 mt-1">{totalReviews} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {RATING_BREAKDOWN.map((row) => (
                    <div key={row.stars} className="flex items-center gap-2">
                      <span className="text-[12px] text-gray-400 w-3 text-right tabular-nums">{row.stars}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="text-[12px] text-gray-400 w-6 tabular-nums">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comparison cards */}
            <div className="flex gap-4">
              <div className="w-[180px] rounded-xl bg-white p-4">
                <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="text-[12px] text-gray-400">Rating Trend</p>
                <p className="text-[24px] font-bold text-gray-900 leading-tight">+0.3</p>
                <p className="text-[11px] text-gray-400 mt-0.5">vs last month</p>
              </div>
              <div className="w-[180px] rounded-xl bg-white p-4">
                <Star className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-[12px] text-gray-400">Area Average</p>
                <p className="text-[24px] font-bold text-gray-900 leading-tight">{areaAvg}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">You're {(avgRating - areaAvg).toFixed(1)} above</p>
              </div>
              <div className="w-[180px] rounded-xl bg-white p-4">
                <ThumbsUp className="w-5 h-5 text-brand-600 mb-2" />
                <p className="text-[12px] text-gray-400">Ranking</p>
                <p className="text-[24px] font-bold text-gray-900 leading-tight">Top 5%</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Austin, TX contractors</p>
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
                  "text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors",
                  filter === f
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                )}
              >
                {f === "all" ? "All" : `${f} stars`}
              </button>
            ))}
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-700 text-sm font-bold">
                        {review.authorName.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-gray-900">{review.authorName}</p>
                      <p className="text-[12px] text-gray-400">{formatDate(review.date)}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={14} />
                </div>
                <p className="text-[14px] text-gray-600 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
