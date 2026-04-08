"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  Shield,
  Lock,
  ArrowUpRight,
  ChevronDown,
  Check,
  Clock,
  CreditCard,
  FileText,
  Download,
  Search,
  Eye,
  EyeOff,
  Circle,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { formatCurrency, cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Types ───────────────────────────────────────────────────────────────────

type MilestoneStatus = "paid" | "approved" | "submitted" | "in_progress" | "pending";

interface PaymentMilestone {
  id: string;
  label: string;
  amount: number;
  status: MilestoneStatus;
  paidDate?: string;
  approvedDate?: string;
  submittedDate?: string;
  reference?: string;
  platformFee?: number;
}

interface ProjectPayment {
  id: string;
  name: string;
  contractor: string;
  contractValue: number;
  milestones: PaymentMilestone[];
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const PROJECTS: ProjectPayment[] = [
  {
    id: "j1",
    name: "Kitchen Remodel - Full Gut",
    contractor: "Johnson & Sons Construction",
    contractValue: 38500,
    milestones: [
      { id: "m1", label: "Demo complete", amount: 5000, status: "paid", paidDate: "2026-03-14", approvedDate: "2026-03-14", reference: "FTW-PAY-260314-A1", platformFee: 150 },
      { id: "m2", label: "Rough-in (plumb/elec)", amount: 8500, status: "paid", paidDate: "2026-03-19", approvedDate: "2026-03-19", reference: "FTW-PAY-260319-B2", platformFee: 255 },
      { id: "m3", label: "Cabinet install", amount: 7000, status: "approved", approvedDate: "2026-03-24", reference: "FTW-PAY-260324-C3", platformFee: 210 },
      { id: "m4", label: "Countertops", amount: 6500, status: "submitted", submittedDate: "2026-03-26" },
      { id: "m5", label: "Tile & flooring", amount: 7500, status: "in_progress" },
      { id: "m6", label: "Final walkthrough", amount: 4000, status: "pending" },
    ],
  },
  {
    id: "j2",
    name: "Bathroom Reno",
    contractor: "Johnson & Sons Construction",
    contractValue: 15200,
    milestones: [
      { id: "m7", label: "Demo complete", amount: 2500, status: "paid", paidDate: "2026-03-17", approvedDate: "2026-03-17", reference: "FTW-PAY-260317-D4", platformFee: 75 },
      { id: "m8", label: "Plumbing rough-in", amount: 3500, status: "approved", approvedDate: "2026-03-21", reference: "FTW-PAY-260321-E5", platformFee: 105 },
      { id: "m9", label: "Tile & waterproofing", amount: 4200, status: "in_progress" },
      { id: "m10", label: "Vanity & fixtures", amount: 3000, status: "pending" },
      { id: "m11", label: "Final walkthrough", amount: 2000, status: "pending" },
    ],
  },
  {
    id: "j4",
    name: "Roof Replacement",
    contractor: "Apex Roofing Co",
    contractValue: 13500,
    milestones: [
      { id: "m12", label: "Tear-off complete", amount: 3000, status: "paid", paidDate: "2026-03-16", approvedDate: "2026-03-16", reference: "FTW-PAY-260316-F6", platformFee: 90 },
      { id: "m13", label: "OSB & underlayment", amount: 3500, status: "paid", paidDate: "2026-03-17", approvedDate: "2026-03-17", reference: "FTW-PAY-260317-G7", platformFee: 105 },
      { id: "m14", label: "Shingles", amount: 4000, status: "approved", approvedDate: "2026-03-19", reference: "FTW-PAY-260319-H8", platformFee: 120 },
      { id: "m15", label: "Flashings & ridge", amount: 2000, status: "in_progress" },
      { id: "m16", label: "Final inspection", amount: 1000, status: "pending" },
    ],
  },
];

const PAYMENT_METHOD = {
  type: "Visa",
  last4: "4242",
  expiry: "08/28",
  name: "Michael Brown",
};

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; color: string; bg: string }> = {
  paid:        { label: "Paid",         color: "text-emerald-950", bg: "bg-emerald-950/10 border-emerald-800/30" },
  approved:    { label: "Processing",   color: "text-blue-700",    bg: "bg-blue-100 border-blue-300" },
  submitted:   { label: "Awaiting Review", color: "text-amber-700", bg: "bg-amber-100 border-amber-300" },
  in_progress: { label: "In Progress",  color: "text-gray-800",    bg: "bg-gray-100 border-gray-200" },
  pending:     { label: "Upcoming",     color: "text-gray-600",    bg: "bg-gray-50 border-gray-200" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomeownerPaymentsPage() {
  usePageTitle("Payments");
  const [expandedProject, setExpandedProject] = useState<string | null>("j1");
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [showBalances, setShowBalances] = useState(true);
  const [search, setSearch] = useState("");

  const allMilestones = PROJECTS.flatMap((p) => p.milestones);
  const totalFunded = PROJECTS.reduce((s, p) => s + p.contractValue, 0);
  const totalPaid = allMilestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0);
  const totalProcessing = allMilestones.filter((m) => m.status === "approved").reduce((s, m) => s + m.amount, 0);
  const totalHeld = totalFunded - totalPaid - totalProcessing;
  const totalFees = allMilestones.reduce((s, m) => s + (m.platformFee || 0), 0);
  const awaitingReview = allMilestones.filter((m) => m.status === "submitted").length;

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06)] relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Payments</h1>
            <p className="text-[13px] text-gray-600 mt-0.5">Escrow balances and milestone payments</p>
          </div>
          <div className="flex items-center gap-2">
            {awaitingReview > 0 && (
              <Link
                href="/homeowner/milestones"
                className="flex items-center gap-1.5 h-8 px-3 rounded-sm bg-amber-50 border border-amber-200 text-[12px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                {awaitingReview} awaiting review
              </Link>
            )}
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-sm border border-border text-[12px] font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              {showBalances ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showBalances ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 overflow-y-auto">
        {/* Finance cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-sm border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">In Escrow</p>
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{showBalances ? formatCurrency(totalHeld) : "****"}</p>
            <p className="text-[11px] text-gray-600 mt-1">Held until milestones approved</p>
          </div>
          <div className="bg-white rounded-sm border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Paid Out</p>
              <Check className="w-4 h-4 text-emerald-950" />
            </div>
            <p className="text-2xl font-bold text-emerald-950 tabular-nums">{showBalances ? formatCurrency(totalPaid) : "****"}</p>
            <p className="text-[11px] text-gray-600 mt-1">Released to contractors</p>
          </div>
          <div className="bg-white rounded-sm border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Processing</p>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-700 tabular-nums">{showBalances ? formatCurrency(totalProcessing) : "****"}</p>
            <p className="text-[11px] text-gray-600 mt-1">Approved, releasing soon</p>
          </div>
          <div className="bg-white rounded-sm border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Fees Paid</p>
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{showBalances ? formatCurrency(totalFees) : "****"}</p>
            <p className="text-[11px] text-gray-600 mt-1">3% platform fee</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Left — Project milestone payments (2 cols) */}
          <div className="col-span-2 space-y-4">
            {PROJECTS.map((project) => {
              const isExpanded = expandedProject === project.id;
              const paid = project.milestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0);
              const pct = project.contractValue > 0 ? Math.round((paid / project.contractValue) * 100) : 0;
              const nextAction = project.milestones.find((m) => m.status === "submitted");

              return (
                <div key={project.id} className="bg-white rounded-sm border border-border overflow-hidden">
                  {/* Project header */}
                  <button
                    onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-semibold text-gray-900">{project.name}</p>
                        {nextAction && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                            Review needed
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-gray-600 mt-0.5">{project.contractor}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-bold text-gray-900 tabular-nums">{formatCurrency(project.contractValue)}</p>
                      <p className="text-[11px] text-gray-600">{pct}% paid</p>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-gray-600 shrink-0 transition-transform", isExpanded && "rotate-180")} />
                  </button>

                  {/* Expanded milestone list */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      {/* Progress bar */}
                      <div className="px-5 py-3 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-medium text-gray-700">Escrow progress</span>
                          <span className="text-[11px] font-bold text-gray-900 tabular-nums">{formatCurrency(paid)} / {formatCurrency(project.contractValue)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-sm overflow-hidden flex">
                          {(() => {
                            const paidPct = (project.milestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0) / project.contractValue) * 100;
                            const approvedPct = (project.milestones.filter((m) => m.status === "approved").reduce((s, m) => s + m.amount, 0) / project.contractValue) * 100;
                            return (
                              <>
                                {paidPct > 0 && <div className="bg-emerald-600" style={{ width: `${paidPct}%` }} />}
                                {approvedPct > 0 && <div className="bg-blue-600" style={{ width: `${approvedPct}%` }} />}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Milestones */}
                      {project.milestones.map((m) => {
                        const cfg = STATUS_CONFIG[m.status];
                        const isDetailOpen = expandedMilestone === m.id;
                        const hasDetail = m.status === "paid" || m.status === "approved";

                        return (
                          <div key={m.id} className={cn("border-t border-border", m.status === "submitted" && "bg-amber-50/30")}>
                            <div
                              className={cn("flex items-center gap-4 px-5 py-3.5", hasDetail && "cursor-pointer hover:bg-gray-50/50")}
                              onClick={() => hasDetail && setExpandedMilestone(isDetailOpen ? null : m.id)}
                            >
                              {/* Status dot */}
                              <div className={cn(
                                "w-6 h-6 rounded-sm flex items-center justify-center shrink-0",
                                m.status === "paid" ? "bg-emerald-950/10" : m.status === "approved" ? "bg-blue-100" : m.status === "submitted" ? "bg-amber-100" : "bg-gray-50"
                              )}>
                                {m.status === "paid" && <Check className="w-3.5 h-3.5 text-emerald-950" strokeWidth={2.5} />}
                                {m.status === "approved" && <Clock className="w-3.5 h-3.5 text-blue-700" />}
                                {m.status === "submitted" && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                                {m.status === "in_progress" && <div className="w-2 h-2 rounded-sm bg-gray-400" />}
                                {m.status === "pending" && <Circle className="w-3.5 h-3.5 text-gray-300" />}
                              </div>

                              {/* Label */}
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-[13px] font-medium", m.status === "pending" ? "text-gray-600" : "text-gray-900")}>{m.label}</p>
                                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded border inline-block mt-0.5", cfg.bg, cfg.color)}>{cfg.label}</span>
                              </div>

                              {/* Amount */}
                              <p className={cn("text-[14px] font-bold tabular-nums shrink-0", m.status === "paid" ? "text-emerald-950" : "text-gray-900")}>
                                {formatCurrency(m.amount)}
                              </p>

                              {/* Action or chevron */}
                              <div className="w-24 flex justify-end shrink-0">
                                {m.status === "submitted" && (
                                  <Link
                                    href="/homeowner/milestones"
                                    className="text-[11px] font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-sm transition-colors"
                                  >
                                    Review
                                  </Link>
                                )}
                                {hasDetail && (
                                  <ChevronDown className={cn("w-4 h-4 text-gray-300 transition-transform", isDetailOpen && "rotate-180")} />
                                )}
                              </div>
                            </div>

                            {/* Payment detail */}
                            {isDetailOpen && hasDetail && (
                              <div className="px-5 pb-4 bg-gray-50/50">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 py-3 border-t border-border">
                                  <div>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">Reference</p>
                                    <p className="text-[12px] font-mono text-gray-900 mt-0.5">{m.reference}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">{m.status === "paid" ? "Paid" : "Approved"}</p>
                                    <p className="text-[12px] text-gray-900 mt-0.5">{m.paidDate || m.approvedDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">Milestone amount</p>
                                    <p className="text-[12px] font-semibold text-gray-900 mt-0.5 tabular-nums">{formatCurrency(m.amount)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">Platform fee (3%)</p>
                                    <p className="text-[12px] text-gray-900 mt-0.5 tabular-nums">{formatCurrency(m.platformFee || 0)}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <button className="flex items-center gap-1.5 text-[11px] font-medium text-gray-700 hover:text-gray-900 transition-colors">
                                    <Download className="w-3 h-3" /> Receipt
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Payment method */}
            <div className="bg-white rounded-sm border border-border p-5">
              <p className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider mb-4">Payment Method</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-sm border border-border">
                <div className="w-10 h-10 rounded-sm bg-dark flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">{PAYMENT_METHOD.type} ending in {PAYMENT_METHOD.last4}</p>
                  <p className="text-[11px] text-gray-600">Expires {PAYMENT_METHOD.expiry}</p>
                </div>
              </div>
              <button className="w-full mt-3 h-8 rounded-sm border border-border text-[12px] font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                Update payment method
              </button>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-sm border border-border p-5">
              <p className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="space-y-2">
                <Link
                  href="/homeowner/milestones"
                  className="flex items-center gap-3 p-3 rounded-sm border border-border hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-sm bg-amber-50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-gray-900">Review Milestones</p>
                    <p className="text-[11px] text-gray-600">{awaitingReview} awaiting approval</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                </Link>
                <Link
                  href="/homeowner/projects"
                  className="flex items-center gap-3 p-3 rounded-sm border border-border hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-sm bg-brand-50 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-gray-900">View Projects</p>
                    <p className="text-[11px] text-gray-600">{PROJECTS.length} active</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                </Link>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-sm border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-sm bg-emerald-950/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-950" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">Escrow Protected</p>
                  <p className="text-[11px] text-gray-600">Funds secured until verified</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  "256-bit SSL encryption",
                  "QuickBooks-powered payments",
                  "5-day dispute resolution",
                  "Full transaction audit trail",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0" strokeWidth={2.5} />
                    <span className="text-[12px] text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
