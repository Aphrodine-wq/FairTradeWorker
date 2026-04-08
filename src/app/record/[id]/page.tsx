"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Star,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { formatCurrency, cn } from "@shared/lib/utils";
import { type FairRecord, mockFairRecords } from "@shared/lib/mock-data";

export default function FairRecordPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<FairRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: replace with real API call
    const found = mockFairRecords.find(
      (r) => r.id === id || r.publicId === id
    );
    setRecord(found ?? null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-100 rounded-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center py-20">
        <Shield className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <h1 className="text-xl font-semibold text-[#0F1419]">
          Record Not Found
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          This FairRecord may have been removed or the link is invalid.
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-4 rounded-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant="outline"
            className="text-xs font-mono"
          >
            {record.publicId}
          </Badge>
          {record.homeownerConfirmed && (
            <Badge className="bg-[#059669] text-white text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-[#0F1419] mt-2">
          {record.projectTitle}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {record.contractorName} &middot; {record.contractorCompany}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <DollarSign className="w-4 h-4" />
            Budget
          </div>
          <p className="text-lg font-semibold text-[#0F1419]">
            {formatCurrency(record.finalCost)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {record.onBudget ? (
              <CheckCircle2 className="w-3 h-3 text-[#059669]" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs",
                record.onBudget ? "text-[#059669]" : "text-red-500"
              )}
            >
              {record.budgetAccuracyPct}% accuracy
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            Timeline
          </div>
          <p className="text-lg font-semibold text-[#0F1419]">
            {record.actualCompletionDate}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {record.onTime ? (
              <CheckCircle2 className="w-3 h-3 text-[#059669]" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs",
                record.onTime ? "text-[#059669]" : "text-red-500"
              )}
            >
              {record.onTime ? "On time" : "Late"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Star className="w-4 h-4" />
            Rating
          </div>
          <p className="text-lg font-semibold text-[#0F1419]">
            {record.avgRating.toFixed(1)} / 5.0
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {record.reviewCount} review{record.reviewCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <MapPin className="w-4 h-4" />
            Location
          </div>
          <p className="text-lg font-semibold text-[#0F1419]">
            {record.locationCity}
          </p>
          <p className="text-xs text-gray-400 mt-1">{record.category}</p>
        </div>
      </div>

      {/* Scope */}
      <div className="bg-white border border-gray-200 rounded-sm p-4">
        <h2 className="text-sm font-medium text-[#0F1419] mb-2">
          Scope of Work
        </h2>
        <p className="text-sm text-gray-600">{record.scopeSummary}</p>
      </div>

      {/* Contractor Info */}
      <div className="bg-white border border-gray-200 rounded-sm p-4">
        <h2 className="text-sm font-medium text-[#0F1419] mb-3">
          Contractor
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#0F1419]">
              {record.contractorName}
            </p>
            <p className="text-sm text-gray-500">
              {record.contractorCompany}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-medium">
                {record.contractorRating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {record.contractorJobsCompleted} jobs completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
