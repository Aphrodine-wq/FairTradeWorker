"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@shared/ui/badge";
import { mockEstimates, type Estimate } from "@shared/lib/mock-data";
import { fetchEstimates } from "@shared/lib/data";
import { formatCurrency, cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

type TabFilter = "all" | "draft" | "sent" | "accepted" | "declined";

const STATUS_BADGE: Record<string, "info" | "warning" | "success" | "danger" | "secondary"> = {
  draft: "secondary",
  sent: "info",
  viewed: "warning",
  accepted: "success",
  declined: "danger",
  expired: "secondary",
};

export default function SubContractorEstimatesPage() {
  usePageTitle("Estimates");
  const [estimates, setEstimates] = useState<Estimate[]>(mockEstimates);
  const [tab, setTab] = useState<TabFilter>("all");

  useEffect(() => {
    fetchEstimates().then(setEstimates);
  }, []);

  const filtered = tab === "all" ? estimates : estimates.filter((e) => e.status === tab);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-semibold text-gray-900">Estimates</h1>
          <button className="flex items-center gap-1.5 h-8 px-3 rounded-none bg-brand-600 text-white text-[12px] font-semibold hover:bg-brand-700 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New Estimate
          </button>
        </div>
        <div className="flex items-center gap-1 mt-3">
          {(["all", "draft", "sent", "accepted", "declined"] as TabFilter[]).map((t) => (
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
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((est) => (
              <div key={est.id} className="bg-white border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 truncate">{est.jobTitle}</p>
                    <p className="text-[12px] text-gray-500">{est.clientName}</p>
                  </div>
                  <Badge variant={STATUS_BADGE[est.status] || "secondary"} className="text-[11px] capitalize">
                    {est.status}
                  </Badge>
                </div>
                <p className="text-[20px] font-bold text-gray-900 tabular-nums">{formatCurrency(est.amount)}</p>
                <p className="text-[12px] text-gray-500 mt-1">{est.lineItems.length} line items</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-[15px] font-semibold text-gray-900">No estimates</p>
            <p className="text-[13px] text-gray-500 mt-1">Create your first estimate to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
