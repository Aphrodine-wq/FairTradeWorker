"use client";

import {
  MapPin,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Tag,
  User,
  Star,
  Building2,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { type SubJob } from "@shared/lib/mock-data";
import { formatCurrency, cn } from "@shared/lib/utils";

const URGENCY_STYLE: Record<string, { dot: string; label: string }> = {
  low:    { dot: "bg-gray-300", label: "Low" },
  medium: { dot: "bg-amber-400", label: "Medium" },
  high:   { dot: "bg-red-500",  label: "Urgent" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "General Contracting": "bg-brand-600",
  Plumbing: "bg-blue-600",
  Electrical: "bg-amber-500",
  HVAC: "bg-cyan-600",
  Roofing: "bg-red-600",
  Painting: "bg-violet-600",
  Flooring: "bg-stone-600",
  Landscaping: "bg-emerald-950",
  Remodeling: "bg-indigo-600",
  Concrete: "bg-slate-600",
  Fencing: "bg-teal-600",
  Drywall: "bg-orange-600",
};

const PAYMENT_LABEL: Record<string, { text: string; style: string }> = {
  contractor_escrow:   { text: "GC Escrow", style: "bg-blue-50 text-blue-700" },
  passthrough_escrow:  { text: "Pass-through", style: "bg-emerald-50 text-emerald-700" },
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

interface SubJobCardProps {
  subJob: SubJob;
  onBid?: (subJob: SubJob) => void;
}

export function SubJobCard({ subJob, onBid }: SubJobCardProps) {
  const urgency = URGENCY_STYLE[subJob.urgency] || URGENCY_STYLE.medium;
  const catColor = CATEGORY_COLORS[subJob.category] || "bg-gray-600";
  const payment = PAYMENT_LABEL[subJob.paymentPath] || PAYMENT_LABEL.contractor_escrow;
  const daysLeft = daysUntil(subJob.deadline);

  return (
    <div className="bg-white border border-gray-200 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-gray-900 leading-tight">{subJob.title}</p>
            <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-none flex-shrink-0", catColor)} />
              {subJob.milestoneLabel} — {subJob.projectTitle}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={cn("w-2 h-2 rounded-full", urgency.dot)} />
            <span className="text-[11px] font-semibold text-gray-500">{urgency.label}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-[13px] text-gray-600 line-clamp-2">{subJob.description}</p>
      </div>

      {/* Budget + Deadline */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <p className="text-[18px] font-bold text-gray-900 tabular-nums">
          {formatCurrency(subJob.budgetMin)}–{formatCurrency(subJob.budgetMax)}
        </p>
        <span className={cn(
          "text-[11px] font-semibold px-2 py-0.5",
          daysLeft <= 7 ? "bg-red-50 text-red-700" : daysLeft <= 21 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"
        )}>
          {daysLeft > 0 ? `${daysLeft}d left` : "Overdue"}
        </span>
      </div>

      {/* Skills */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {subJob.skills.map((skill) => (
          <span key={skill} className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5">
            {skill}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[12px] text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {subJob.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {subJob.bidsCount} bids
          </span>
          <span className={cn("px-1.5 py-0.5 text-[10px] font-semibold", payment.style)}>
            {payment.text}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Posted by */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-none bg-gray-200 flex items-center justify-center">
              <User className="w-3 h-3 text-gray-500" />
            </div>
            <div className="text-[11px]">
              <span className="font-semibold text-gray-700">{subJob.contractorName}</span>
              <span className="text-gray-400 ml-1 flex items-center gap-0.5 inline-flex">
                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                {subJob.contractorRating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bid button */}
      {subJob.status === "open" && onBid && (
        <div className="px-4 pb-4">
          <Button
            onClick={() => onBid(subJob)}
            className="w-full h-9 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-semibold rounded-none"
          >
            Place Bid
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
