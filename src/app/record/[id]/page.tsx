"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  Shield,
  Star,
  Wrench,
} from "lucide-react";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { type FairRecord } from "@shared/lib/mock-data";
import { fetchPublicRecord } from "@shared/lib/data";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";
import { BRAND } from "@shared/lib/constants";

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

export default function PublicRecordPage() {
  const params = useParams();
  const publicId = params.id as string;

  const [record, setRecord] = useState<FairRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicRecord(publicId).then((r) => {
      setRecord(r);
      setLoading(false);
    });
  }, [publicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading record...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <Shield className="w-12 h-12 text-gray-300" />
        <h1 className="text-xl font-semibold text-gray-900">Record Not Found</h1>
        <p className="text-sm text-gray-700">This FairRecord ID does not exist or has been removed.</p>
        <Link href="/">
          <Button variant="outline">Back to FairTradeWorker</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-brand-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">FT</span>
            </div>
            <span className="text-[15px] font-semibold text-gray-900">{BRAND.name}</span>
          </Link>
          <div className="flex items-center gap-2">
            {record.homeownerConfirmed ? (
              <Badge variant="success" className="text-[11px]">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verified Completion
              </Badge>
            ) : (
              <Badge variant="warning" className="text-[11px]">Pending Confirmation</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Certificate card */}
        <div className="bg-white rounded-sm overflow-hidden">
          {/* Certificate header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-6 h-6 text-brand-600" />
                  <h1 className="text-[22px] font-bold text-gray-900">FairRecord</h1>
                </div>
                <p className="text-[13px] text-gray-600">Verified Project Completion Certificate</p>
              </div>
              <span className="text-[13px] font-mono text-gray-600 bg-gray-50 px-3 py-1.5 rounded-sm">{record.publicId}</span>
            </div>
          </div>

          {/* Project info */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-[18px] font-semibold text-gray-900 mb-4">{record.projectTitle}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-[11px] text-gray-600">Category</p>
                  <p className="text-[14px] text-gray-900 font-medium">{record.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-[11px] text-gray-600">Location</p>
                  <p className="text-[14px] text-gray-900 font-medium">{record.locationCity}, TX</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-[11px] text-gray-600">Completed</p>
                  <p className="text-[14px] text-gray-900 font-medium">{formatDate(record.actualCompletionDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-[11px] text-gray-600">Rating at Completion</p>
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={record.avgRating} size={14} />
                    <span className="text-[13px] text-gray-900 font-medium">{record.avgRating}</span>
                    <span className="text-[12px] text-gray-600">({record.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wider mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-sm">
                <DollarSign className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                <p className="text-[11px] text-gray-600 mb-1">Budget Accuracy</p>
                <p className={cn(
                  "text-[28px] font-bold tabular-nums leading-none",
                  record.onBudget ? "text-emerald-950" : "text-amber-600"
                )}>
                  {record.budgetAccuracyPct}%
                </p>
                <div className="mt-2 text-[12px] text-gray-700">
                  {formatCurrency(record.finalCost)} of {formatCurrency(record.estimatedBudget)}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-sm">
                <Clock className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                <p className="text-[11px] text-gray-600 mb-1">Timeline</p>
                <p className={cn(
                  "text-[28px] font-bold leading-none",
                  record.onTime ? "text-emerald-950" : "text-amber-600"
                )}>
                  {record.onTime ? "On Time" : "Late"}
                </p>
                <div className="mt-2 text-[12px] text-gray-700">
                  {record.onTime ? "Completed on or before deadline" : `Completed ${formatDate(record.actualCompletionDate)}`}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-sm">
                <CheckCircle2 className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                <p className="text-[11px] text-gray-600 mb-1">Disputes</p>
                <p className={cn(
                  "text-[28px] font-bold leading-none",
                  record.disputeCount === 0 ? "text-emerald-950" : "text-amber-600"
                )}>
                  {record.disputeCount}
                </p>
                <div className="mt-2 text-[12px] text-gray-700">
                  {record.disputeCount === 0 ? "Clean record" : `${record.disputeCount} dispute(s) filed`}
                </div>
              </div>
            </div>
          </div>

          {/* Scope of work */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wider mb-3">Scope of Work</h3>
            <p className="text-[14px] text-gray-800 leading-relaxed">{record.scopeSummary}</p>
          </div>

          {/* Contractor info */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wider mb-4">Contractor</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-sm bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-700 text-sm font-bold">
                  {record.contractorName.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-gray-900">{record.contractorName}</p>
                  <Shield className="w-4 h-4 text-brand-600" />
                </div>
                <p className="text-[13px] text-gray-700">{record.contractorCompany}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <StarRating rating={record.contractorRating} size={12} />
                    <span className="text-[12px] text-gray-700">{record.contractorRating}</span>
                  </div>
                  <span className="text-[12px] text-gray-600">{record.contractorJobsCompleted} jobs completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification footer */}
          <div className="px-8 py-5 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-600" />
                <p className="text-[12px] text-gray-700">
                  Verified by <span className="font-semibold text-gray-900">{BRAND.name}</span>
                  {record.confirmedAt && <> on {formatDate(record.confirmedAt)}</>}
                </p>
              </div>
              <p className="text-[11px] text-gray-600 font-mono">{record.publicId}</p>
            </div>
          </div>
        </div>

        {/* Certificate Download */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000"}/api/records/${record.publicId}/certificate`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Download Certificate
          </Button>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <p className="text-[13px] text-gray-600 mb-3">Want verified contractors for your project?</p>
          <Link href="/">
            <Button>Post a Job on {BRAND.name}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
