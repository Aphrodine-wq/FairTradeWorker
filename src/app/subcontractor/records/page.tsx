"use client";

import { Award, Star, Briefcase, Wrench, FileText } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

export default function SubContractorRecordsPage() {
  usePageTitle("FairRecord");

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-200">
        <h1 className="text-[24px] font-semibold text-gray-900">FairRecord</h1>
        <p className="text-[13px] text-gray-700 mt-1">
          Your verified work history and reputation
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Profile card */}
        <div className="bg-white border border-gray-200 p-5 mb-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-sm bg-brand-100 flex items-center justify-center shrink-0">
              <span className="text-brand-700 text-[20px] font-bold">JD</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold text-gray-900">John Doe</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-[14px] font-semibold text-gray-900">4.7</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-[13px] text-gray-700">14 sub jobs completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-[13px] text-gray-700">Plumbing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Records list */}
        <div className="bg-white border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Verified Records
            </span>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-sm bg-gray-100 flex items-center justify-center mb-4">
              <Award className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-semibold text-gray-900 mb-1">No records yet</p>
            <p className="text-[13px] text-gray-700 max-w-sm">
              Complete sub jobs to build your verified work history. Each record shows your rating, timeline, and budget accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
