"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Types ───────────────────────────────────────────────────────────────────

type PayoutStatus = "paid" | "processing" | "queued" | "failed";

interface PayoutRecord {
  id: string;
  jobTitle: string;
  homeownerName: string;
  amount: number;
  status: PayoutStatus;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  projectId?: string;
  milestoneIndex?: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PAYOUTS: PayoutRecord[] = [
  {
    id: "pay-1", jobTitle: "Kitchen Remodel - Full Gut", homeownerName: "Michael Brown",
    amount: 38500, status: "paid", failureReason: null,
    paidAt: "2026-03-12T14:30:00Z", createdAt: "2026-03-12T14:25:00Z",
    projectId: "j1", milestoneIndex: 0,
  },
  {
    id: "pay-2", jobTitle: "Bathroom Renovation", homeownerName: "Sarah Williams",
    amount: 15200, status: "paid", failureReason: null,
    paidAt: "2026-03-18T10:15:00Z", createdAt: "2026-03-18T10:10:00Z",
    projectId: "j2", milestoneIndex: 0,
  },
  {
    id: "pay-3", jobTitle: "Deck Build - Composite", homeownerName: "Robert Johnson",
    amount: 11000, status: "processing", failureReason: null,
    paidAt: null, createdAt: "2026-03-20T09:00:00Z",
    projectId: "j3", milestoneIndex: 2,
  },
  {
    id: "pay-4", jobTitle: "Roof Replacement - 30 sq", homeownerName: "Patricia Taylor",
    amount: 13500, status: "queued", failureReason: null,
    paidAt: null, createdAt: "2026-03-22T11:30:00Z",
    projectId: "j4", milestoneIndex: 3,
  },
  {
    id: "pay-5", jobTitle: "HVAC System Install", homeownerName: "Kevin Nguyen",
    amount: 8900, status: "paid", failureReason: null,
    paidAt: "2026-03-10T16:45:00Z", createdAt: "2026-03-10T16:40:00Z",
  },
  {
    id: "pay-6", jobTitle: "Fence Install - Cedar 6ft", homeownerName: "David Kim",
    amount: 6200, status: "paid", failureReason: null,
    paidAt: "2026-03-08T13:20:00Z", createdAt: "2026-03-08T13:15:00Z",
  },
  {
    id: "pay-7", jobTitle: "Electrical Panel Upgrade", homeownerName: "Angela Foster",
    amount: 4500, status: "failed",
    failureReason: "QuickBooks vendor account not verified. Please reconnect your QuickBooks account.",
    paidAt: null, createdAt: "2026-03-15T08:00:00Z",
  },
  {
    id: "pay-8", jobTitle: "Interior Painting - 4 Rooms", homeownerName: "Lisa Chen",
    amount: 3800, status: "processing", failureReason: null,
    paidAt: null, createdAt: "2026-03-23T07:45:00Z",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContractorPaymentsPage() {
  usePageTitle("Payments");
  const [payouts] = useState<PayoutRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const paid = useMemo(() => payouts.filter((p) => p.status === "paid"), [payouts]);
  const pending = useMemo(
    () => payouts.filter((p) => ["processing", "queued"].includes(p.status)),
    [payouts]
  );
  const failed = useMemo(() => payouts.filter((p) => p.status === "failed"), [payouts]);

  const totalEarned = paid.reduce((s, p) => s + p.amount, 0);
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  const monthPaid = paid.filter((p) => {
    const d = new Date(p.paidAt!);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const historyPayouts = showAllHistory ? paid : paid.slice(0, 4);

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 pt-6 pb-6 max-w-[1100px]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[13px] text-gray-700 font-medium mb-1">Available Balance</p>
              <p className="text-[42px] font-bold text-gray-900 tabular-nums leading-none tracking-tight">
                {formatCurrency(totalEarned)}
              </p>
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-emerald-700" />
                  <span className="text-[13px] text-gray-700">
                    {formatCurrency(totalEarned)} earned
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-amber-600" />
                  <span className="text-[13px] text-gray-700">
                    {formatCurrency(totalPending)} incoming
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-gray-400" />
                  <span className="text-[13px] text-gray-700">
                    {paid.length + pending.length} jobs
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6">
        <div className="max-w-[1100px]">
          <div className="grid grid-cols-[1fr_380px] gap-6">

            {/* ── Left Column: Activity ──────────────────────────── */}
            <div className="space-y-6">

              {/* Failed Payouts */}
              {failed.length > 0 && (
                <div>
                  <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Needs Attention
                  </h2>
                  {failed.map((p) => (
                    <div key={p.id} className="bg-red-50 border border-red-200 rounded-sm p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-sm bg-red-100 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            {p.projectId ? (
                              <Link href={`/contractor/projects?project=${p.projectId}&tab=milestones${p.milestoneIndex !== undefined ? `&milestone=${p.milestoneIndex}` : ""}`} className="text-[14px] font-bold text-gray-900 hover:text-brand-600 transition-colors">{p.jobTitle}</Link>
                            ) : (
                              <p className="text-[14px] font-bold text-gray-900">{p.jobTitle}</p>
                            )}
                            <p className="text-[16px] font-bold text-gray-900 tabular-nums">{formatCurrency(p.amount)}</p>
                          </div>
                          <p className="text-[12px] text-red-800 leading-relaxed">{p.failureReason}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <Button size="sm" variant="destructive" className="text-[12px]">
                              Retry Payout
                            </Button>
                            <span className="text-[11px] text-gray-700">{p.homeownerName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Incoming */}
              {pending.length > 0 && (
                <div>
                  <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Incoming
                  </h2>
                  <div className="space-y-2">
                    {pending.map((p) => (
                      <div key={p.id} className="bg-white rounded-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-sm bg-amber-50 flex items-center justify-center shrink-0">
                            <ArrowDownLeft className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {p.projectId ? (
                              <Link href={`/contractor/projects?project=${p.projectId}&tab=milestones${p.milestoneIndex !== undefined ? `&milestone=${p.milestoneIndex}` : ""}`} className="text-[14px] font-bold text-gray-900 hover:text-brand-600 transition-colors">{p.jobTitle}</Link>
                            ) : (
                              <p className="text-[14px] font-bold text-gray-900">{p.jobTitle}</p>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[12px] text-gray-700">{p.homeownerName}</span>
                              <span className="text-gray-300">--</span>
                              <span className={cn(
                                "text-[11px] font-semibold px-2 py-0.5 rounded-sm",
                                p.status === "processing" ? "bg-blue-950/10 text-blue-900" :
                                "bg-gray-100 text-gray-800"
                              )}>
                                {p.status === "processing" ? "Processing" : "Queued"}
                              </span>
                            </div>
                          </div>
                          <p className="text-[18px] font-bold text-gray-900 tabular-nums shrink-0">
                            +{formatCurrency(p.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                    History
                  </h2>
                  {paid.length > 4 && (
                    <button
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      className="text-[12px] font-medium text-brand-600 hover:text-brand-700"
                    >
                      {showAllHistory ? "Show less" : `View all ${paid.length}`}
                    </button>
                  )}
                </div>
                <div className="bg-white rounded-sm border border-gray-200 divide-y divide-gray-100">
                  {historyPayouts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
                        <div className="w-9 h-9 rounded-sm bg-emerald-950/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {p.projectId ? (
                            <Link href={`/contractor/projects?project=${p.projectId}&tab=milestones${p.milestoneIndex !== undefined ? `&milestone=${p.milestoneIndex}` : ""}`} className="text-[14px] font-semibold text-gray-900 truncate block hover:text-brand-600 transition-colors" onClick={(e) => e.stopPropagation()}>{p.jobTitle}</Link>
                          ) : (
                            <p className="text-[14px] font-semibold text-gray-900 truncate">{p.jobTitle}</p>
                          )}
                          <p className="text-[12px] text-gray-700">{p.homeownerName} -- {formatDate(p.paidAt!)}</p>
                        </div>
                        <p className="text-[16px] font-bold text-gray-900 tabular-nums shrink-0">{formatCurrency(p.amount)}</p>
                        {expandedId === p.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />
                        )}
                      </div>

                      {expandedId === p.id && (
                        <div className="px-4 pb-4" onClick={(e) => e.stopPropagation()}>
                          <div className="ml-[52px] bg-gray-50 rounded-sm p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-[13px] text-gray-700">Job</span>
                              <span className="text-[13px] text-gray-900 font-medium">{p.jobTitle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[13px] text-gray-700">Client</span>
                              <span className="text-[13px] text-gray-900 font-medium">{p.homeownerName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[13px] text-gray-700">Paid</span>
                              <span className="text-[13px] text-gray-900 font-medium">{formatDate(p.paidAt!)}</span>
                            </div>
                            <div className="h-px bg-gray-200" />
                            <div className="flex justify-between">
                              <span className="text-[13px] font-bold text-gray-900">Amount</span>
                              <span className="text-[14px] font-bold text-gray-900 tabular-nums">{formatCurrency(p.amount)}</span>
                            </div>
                            <p className="text-[11px] text-gray-600 font-mono pt-1">{p.id}</p>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right Column: Summary ──────────────────────────── */}
            <div className="space-y-5">

              {/* This Month */}
              <div className="bg-white rounded-sm border border-gray-200 p-5">
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">This Month</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[12px] text-gray-700 mb-1">Earned</p>
                    <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-none">
                      {formatCurrency(monthPaid.reduce((s, p) => s + p.amount, 0))}
                    </p>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex justify-between">
                    <span className="text-[13px] text-gray-700">Jobs paid</span>
                    <span className="text-[13px] font-bold text-gray-900 tabular-nums">{monthPaid.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-gray-700">Avg per job</span>
                    <span className="text-[13px] font-bold text-gray-900 tabular-nums">
                      {monthPaid.length > 0
                        ? formatCurrency(Math.round(monthPaid.reduce((s, p) => s + p.amount, 0) / monthPaid.length))
                        : "$0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-gray-700">Pending</span>
                    <span className="text-[13px] font-bold text-amber-800 tabular-nums">{formatCurrency(totalPending)}</span>
                  </div>
                </div>
              </div>

              {/* All Time */}
              <div className="bg-white rounded-sm border border-gray-200 p-5">
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">All Time</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[13px] text-gray-700">Jobs completed</span>
                    <span className="text-[15px] font-bold text-gray-900 tabular-nums">{paid.length}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[13px] text-gray-700">Total earned</span>
                    <span className="text-[15px] font-bold text-gray-900 tabular-nums">{formatCurrency(totalEarned)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[13px] text-gray-700">Avg per job</span>
                    <span className="text-[15px] font-bold text-gray-900 tabular-nums">
                      {paid.length > 0 ? formatCurrency(Math.round(totalEarned / paid.length)) : "$0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payout Method */}
              <div className="bg-white rounded-sm border border-gray-200 p-5">
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-3">Payout Method</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-emerald-950/10 flex items-center justify-center">
                    <span className="text-[12px] font-bold text-emerald-950">QB</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-900">QuickBooks Online</p>
                    <p className="text-[12px] text-gray-700">Connected -- payouts auto-deposit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
