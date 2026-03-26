"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Copy,
  Star,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { mockFairRecords, type FairRecord } from "@shared/lib/mock-data";
import { fetchFairRecords } from "@shared/lib/data";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";
import { track } from "@shared/lib/analytics";

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

export default function ContractorRecordsPage() {
  const [records, setRecords] = useState<FairRecord[]>(mockFairRecords);
  const [stats, setStats] = useState({
    total: mockFairRecords.length,
    avg_budget_accuracy: 96.8,
    on_time_rate: 80.0,
    avg_rating: 4.9,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFairRecords().then((data) => {
      if (data.records.length > 0) {
        setRecords(data.records);
        setStats(data.stats);
      }
    });
  }, []);

  const copyLink = (publicId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/record/${publicId}`);
    track("fair_record_shared", { publicId });
    setCopiedId(publicId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-full bg-surface">
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">FairRecord</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">Verified project completion history</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-600" />
            <span className="text-[13px] font-medium text-gray-900">{stats.total} verified records</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-[1200px]">
          {/* Stats row */}
          <div className="flex gap-4 mb-8">
            <div className="w-[180px] rounded-xl bg-white p-4">
              <Award className="w-5 h-5 text-brand-600 mb-2" />
              <p className="text-[12px] text-gray-400">Total Records</p>
              <p className="text-[24px] font-bold text-gray-900 leading-tight">{stats.total}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">verified completions</p>
            </div>
            <div className="w-[180px] rounded-xl bg-white p-4">
              <DollarSign className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-[12px] text-gray-400">Budget Accuracy</p>
              <p className="text-[24px] font-bold text-gray-900 leading-tight">{stats.avg_budget_accuracy}%</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">avg across projects</p>
            </div>
            <div className="w-[180px] rounded-xl bg-white p-4">
              <Clock className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-[12px] text-gray-400">On-Time Rate</p>
              <p className="text-[24px] font-bold text-gray-900 leading-tight">{stats.on_time_rate}%</p>
              <p className="text-[11px] text-gray-400 mt-0.5">projects on schedule</p>
            </div>
            <div className="w-[180px] rounded-xl bg-white p-4">
              <Star className="w-5 h-5 text-amber-400 mb-2" />
              <p className="text-[12px] text-gray-400">Avg Rating</p>
              <p className="text-[24px] font-bold text-gray-900 leading-tight">{stats.avg_rating}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">at time of completion</p>
            </div>
          </div>

          {/* Records list */}
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-brand-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-bold text-gray-900">{record.projectTitle}</p>
                        {record.homeownerConfirmed && (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[12px] text-gray-400">{record.category}</span>
                        <span className="text-[12px] text-gray-400">{record.locationCity}, TX</span>
                        <span className="text-[12px] text-gray-400">{formatDate(record.actualCompletionDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(record.publicId)}
                      className="text-[12px] gap-1"
                    >
                      {copiedId === record.publicId ? (
                        <><CheckCircle2 className="w-3 h-3" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copy Link</>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/record/${record.publicId}`, "_blank")}
                      className="text-[12px] gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View
                    </Button>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="flex gap-6 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[13px] text-gray-600">
                      {formatCurrency(record.finalCost)} of {formatCurrency(record.estimatedBudget)}
                    </span>
                    <span className={cn(
                      "text-[11px] font-semibold px-1.5 py-0.5 rounded",
                      record.onBudget
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}>
                      {record.budgetAccuracyPct}% accuracy
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className={cn(
                      "text-[11px] font-semibold px-1.5 py-0.5 rounded",
                      record.onTime
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}>
                      {record.onTime ? "On Time" : "Late"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={record.avgRating} />
                    <span className="text-[12px] text-gray-400">{record.avgRating} ({record.reviewCount})</span>
                  </div>
                  {record.disputeCount === 0 && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[12px] text-emerald-600 font-medium">No disputes</span>
                    </div>
                  )}
                </div>

                {/* Scope preview */}
                <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">{record.scopeSummary}</p>

                {/* Public ID */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-mono">{record.publicId}</span>
                  <span className="text-[11px] text-gray-400">
                    Quality Score: <span className="font-semibold text-gray-600">{record.qualityScoreAtCompletion}/100</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
