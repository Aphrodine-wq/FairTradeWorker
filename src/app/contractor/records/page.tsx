"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Link2,
  MapPin,
  Shield,
  Star,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { mockFairRecords, mockContractors, type FairRecord } from "@shared/lib/mock-data";
import { fetchFairRecords } from "@shared/lib/data";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";
import { track } from "@shared/lib/analytics";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Star Rating ────────────────────────────────────────────────────────────

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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ContractorRecordsPage() {
  usePageTitle("FairRecord");
  const [records, setRecords] = useState<FairRecord[]>(mockFairRecords);
  const contractor = mockContractors[0]; // current logged-in contractor
  const [stats, setStats] = useState({
    total: mockFairRecords.length,
    avg_budget_accuracy: 96.8,
    on_time_rate: 80.0,
    avg_rating: 4.9,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedProfile, setCopiedProfile] = useState(false);

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

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/contractor/profile`);
    track("fair_record_profile_shared");
    setCopiedProfile(true);
    setTimeout(() => setCopiedProfile(false), 2000);
  };

  const totalEarnings = records.reduce((sum, r) => sum + r.finalCost, 0);
  const initials = contractor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* ── Profile Header ───────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 pt-6 pb-6 max-w-[1100px]">
          {/* Profile row */}
          <div className="flex items-start gap-5 mb-6">
            {/* Avatar */}
            <div className="w-[72px] h-[72px] rounded-none bg-brand-100 flex items-center justify-center shrink-0">
              <span className="text-brand-700 text-[24px] font-bold">{initials}</span>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">{contractor.name}</h1>
                {contractor.verified && (
                  <Badge variant="success" className="text-[11px]">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-[15px] text-gray-800 font-medium">{contractor.company}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-[13px] text-gray-700">{contractor.specialty}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-[13px] text-gray-700">Oxford, MS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-[13px] text-gray-700">{contractor.yearsExperience} years</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={stats.avg_rating} size={13} />
                  <span className="text-[13px] font-medium text-gray-900">{stats.avg_rating}</span>
                  <span className="text-[12px] text-gray-600">({stats.total} records)</span>
                </div>
              </div>
              {contractor.licensed && contractor.insured && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] font-medium text-emerald-950 bg-emerald-950/10 px-2 py-0.5 rounded-none">Licensed</span>
                  <span className="text-[11px] font-medium text-emerald-950 bg-emerald-950/10 px-2 py-0.5 rounded-none">Insured</span>
                  {contractor.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[11px] font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded-none">{skill}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Share button */}
            <Button
              variant="outline"
              onClick={copyProfileLink}
              className="text-[13px] gap-2 shrink-0"
            >
              {copiedProfile ? (
                <><CheckCircle2 className="w-4 h-4" /> Copied</>
              ) : (
                <><Link2 className="w-4 h-4" /> Share Profile</>
              )}
            </Button>
          </div>

          {/* ── Performance Stats ─────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-none border border-gray-200 p-4 text-center">
              <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider mb-2">FairRecords</p>
              <p className="text-[32px] font-bold text-gray-900 leading-none tabular-nums">{stats.total}</p>
              <p className="text-[11px] text-gray-600 mt-1">verified by homeowners</p>
            </div>
            <div className="rounded-none border border-gray-200 p-4 text-center">
              <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider mb-2">Budget Accuracy</p>
              <p className="text-[32px] font-bold text-emerald-950 leading-none tabular-nums">{stats.avg_budget_accuracy}%</p>
              <p className="text-[11px] text-gray-600 mt-1">avg across projects</p>
            </div>
            <div className="rounded-none border border-gray-200 p-4 text-center">
              <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider mb-2">On-Time Rate</p>
              <p className="text-[32px] font-bold text-gray-900 leading-none tabular-nums">{stats.on_time_rate}%</p>
              <p className="text-[11px] text-gray-600 mt-1">delivered on schedule</p>
            </div>
            <div className="rounded-none border border-gray-200 p-4 text-center">
              <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider mb-2">Project Volume</p>
              <p className="text-[32px] font-bold text-gray-900 leading-none tabular-nums">{formatCurrency(totalEarnings)}</p>
              <p className="text-[11px] text-gray-600 mt-1">total verified value</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── How FairRecord Works (explainer for new contractors) ── */}
      {records.length <= 3 && (
        <div className="px-6 pt-5 max-w-[1100px]">
          <div className="rounded-none bg-brand-50 border border-brand-200 px-5 py-4">
            <p className="text-[13px] font-semibold text-brand-900 mb-1">How FairRecord works</p>
            <p className="text-[12px] text-brand-700 leading-relaxed">
              When a homeowner verifies your completed work through FairTradeWorker&apos;s escrow system,
              a FairRecord is automatically added to your profile. Each record shows budget accuracy, timeline
              performance, and the homeowner&apos;s verified rating. Share your profile or individual records
              to win more bids.
            </p>
          </div>
        </div>
      )}

      {/* ── Project Records ──────────────────────────────────────── */}
      <div className="flex-1 px-6 py-5">
        <div className="max-w-[1100px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">
              Verified Project History
            </h2>
            <span className="text-[12px] text-gray-600">{records.length} records</span>
          </div>

          {/* Records as a clean table-like list */}
          <div className="bg-white rounded-none border border-gray-100 divide-y divide-gray-100">
            {records.map((record) => (
              <div key={record.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Left: project info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[15px] font-semibold text-gray-900">{record.projectTitle}</p>
                      {record.homeownerConfirmed && (
                        <Shield className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-gray-600">
                      <span>{record.category}</span>
                      <span className="text-gray-200">|</span>
                      <span>{record.locationCity}, MS</span>
                      <span className="text-gray-200">|</span>
                      <span>{formatDate(record.actualCompletionDate)}</span>
                      {record.homeownerConfirmed && record.confirmedAt && (
                        <>
                          <span className="text-gray-200">|</span>
                          <span>Verified {formatDate(record.confirmedAt)}</span>
                        </>
                      )}
                    </div>

                    {/* Scope preview */}
                    <p className="text-[12px] text-gray-700 leading-relaxed line-clamp-1 mt-1.5">{record.scopeSummary}</p>

                    {/* Metric pills */}
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded",
                        record.onBudget ? "bg-emerald-950/10 text-emerald-950" : "bg-amber-50 text-amber-700"
                      )}>
                        <DollarSign className="w-3 h-3" />
                        {record.budgetAccuracyPct}%
                      </span>
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded",
                        record.onTime ? "bg-emerald-950/10 text-emerald-950" : "bg-amber-50 text-amber-700"
                      )}>
                        <Clock className="w-3 h-3" />
                        {record.onTime ? "On Time" : "Late"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-50 text-gray-900">
                        <Star className="w-3 h-3 text-amber-400" />
                        {record.avgRating}
                      </span>
                      {record.disputeCount === 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950/10 text-emerald-950">
                          <CheckCircle2 className="w-3 h-3" />
                          Clean
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: value + actions */}
                  <div className="shrink-0 text-right">
                    <p className="text-[16px] font-bold text-gray-900 tabular-nums">{formatCurrency(record.finalCost)}</p>
                    <p className="text-[11px] text-gray-600 mb-3">of {formatCurrency(record.estimatedBudget)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(record.publicId)}
                        className="text-[11px] h-7 px-2 gap-1"
                      >
                        {copiedId === record.publicId ? (
                          <><CheckCircle2 className="w-3 h-3" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Share</>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/record/${record.publicId}`, "_blank")}
                        className="text-[11px] h-7 px-2 gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-gray-300 font-mono mt-1">{record.publicId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
