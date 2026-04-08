"use client";

import { Receipt } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

export default function SubContractorInvoicesPage() {
  usePageTitle("Invoices");

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-200">
        <h1 className="text-[24px] font-semibold text-gray-900">Invoices</h1>
        <p className="text-[13px] text-gray-700 mt-1">
          Track invoices for your sub jobs
        </p>
      </div>

      {/* Table header */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-gray-200">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_140px_120px_120px] gap-4 px-5 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Job</span>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Contractor</span>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Amount</span>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Status</span>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-sm bg-gray-100 flex items-center justify-center mb-4">
              <Receipt className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-semibold text-gray-900 mb-1">No invoices yet</p>
            <p className="text-[13px] text-gray-700 max-w-sm">
              Invoices will appear here once you complete sub jobs and submit billing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
