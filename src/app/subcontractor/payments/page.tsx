"use client";

import { Wallet, ArrowDownLeft } from "lucide-react";
import { formatCurrency, cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

const STATS = [
  { label: "Total Earned", value: 18700 },
  { label: "Pending", value: 3200 },
  { label: "Last Payment", value: 2400 },
];

export default function SubContractorPaymentsPage() {
  usePageTitle("Payments");

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-200">
        <h1 className="text-[24px] font-semibold text-gray-900">Payments</h1>
        <p className="text-[13px] text-gray-700 mt-1">
          Your earnings and payment history
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 p-4">
              <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-none">
                {formatCurrency(stat.value)}
              </p>
            </div>
          ))}
        </div>

        {/* Payment history */}
        <div className="bg-white border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Payment History
            </span>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-none bg-gray-100 flex items-center justify-center mb-4">
              <Wallet className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-semibold text-gray-900 mb-1">No payments yet</p>
            <p className="text-[13px] text-gray-700 max-w-sm">
              Completed sub jobs will generate payment records here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
