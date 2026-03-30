"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Clock, MapPin, DollarSign, Users, ArrowRight } from "lucide-react";
import { Badge } from "@shared/ui/badge";
import { mockSubJobs, type SubJob } from "@shared/lib/mock-data";
import { fetchSubJobs } from "@shared/lib/data";
import { formatCurrency, cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

type TabFilter = "active" | "completed" | "all";

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  open: { label: "Open", style: "bg-blue-50 text-blue-700" },
  in_progress: { label: "In Progress", style: "bg-amber-50 text-amber-700" },
  completed: { label: "Completed", style: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelled", style: "bg-gray-100 text-gray-600" },
};

export default function MySubJobsPage() {
  usePageTitle("My Sub Jobs");
  const [subJobs, setSubJobs] = useState<SubJob[]>(mockSubJobs);
  const [tab, setTab] = useState<TabFilter>("active");

  useEffect(() => {
    fetchSubJobs().then(setSubJobs);
  }, []);

  const filtered = subJobs.filter((sj) => {
    if (tab === "active") return sj.status === "in_progress" || sj.status === "open";
    if (tab === "completed") return sj.status === "completed";
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-200">
        <h1 className="text-[24px] font-semibold text-gray-900">My Sub Jobs</h1>
        <div className="flex items-center gap-1 mt-3">
          {(["active", "completed", "all"] as TabFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 h-8 text-[13px] font-semibold transition-colors capitalize",
                tab === t ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((sj) => {
              const status = STATUS_CONFIG[sj.status] || STATUS_CONFIG.open;
              return (
                <div key={sj.id} className="bg-white border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[16px] font-bold text-gray-900">{sj.title}</p>
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5", status.style)}>{status.label}</span>
                      </div>
                      <p className="text-[13px] text-gray-500 mt-1">{sj.milestoneLabel} — {sj.projectTitle}</p>
                      <p className="text-[13px] text-gray-600 mt-2 line-clamp-1">{sj.description}</p>
                    </div>
                    <p className="text-[16px] font-bold text-gray-900 tabular-nums flex-shrink-0 ml-4">
                      {formatCurrency(sj.budgetMin)}–{formatCurrency(sj.budgetMax)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[12px] text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{sj.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{sj.contractorName}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sj.deadline}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-[15px] font-semibold text-gray-900">No sub jobs yet</p>
            <p className="text-[13px] text-gray-500 mt-1">Browse available sub jobs to get started</p>
            <Link href="/subcontractor/work" className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:text-brand-700">
              Browse Sub Jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
