"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  Shield,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Check,
  Clock,
  CreditCard,
  Building2,
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { formatCurrency, cn } from "@shared/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type TransactionType = "escrow_funded" | "milestone_released" | "service_fee" | "refund";
type TransactionStatus = "completed" | "pending" | "processing";

interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  project: string;
  contractor: string;
  milestone?: string;
  date: string;
  reference: string;
}

interface EscrowAccount {
  projectId: string;
  projectName: string;
  contractor: string;
  contractValue: number;
  funded: number;
  released: number;
  held: number;
  milestonesTotal: number;
  milestonesPaid: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const ESCROW_ACCOUNTS: EscrowAccount[] = [
  {
    projectId: "j1",
    projectName: "Kitchen Remodel - Full Gut",
    contractor: "Johnson & Sons Construction",
    contractValue: 38500,
    funded: 38500,
    released: 13500,
    held: 25000,
    milestonesTotal: 6,
    milestonesPaid: 2,
  },
  {
    projectId: "j2",
    projectName: "Bathroom Reno",
    contractor: "Johnson & Sons Construction",
    contractValue: 15200,
    funded: 15200,
    released: 2500,
    held: 12700,
    milestonesTotal: 5,
    milestonesPaid: 1,
  },
  {
    projectId: "j4",
    projectName: "Roof Replacement",
    contractor: "Apex Roofing Co",
    contractValue: 13500,
    funded: 13500,
    released: 6500,
    held: 7000,
    milestonesTotal: 5,
    milestonesPaid: 2,
  },
];

const TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "milestone_released", status: "completed", amount: 5000, description: "Demo complete", project: "Kitchen Remodel", contractor: "Johnson & Sons", milestone: "Milestone 1 of 6", date: "2026-03-14", reference: "FTW-TXN-260314-A1" },
  { id: "t2", type: "service_fee", status: "completed", amount: 150, description: "Platform fee (3%)", project: "Kitchen Remodel", contractor: "Johnson & Sons", date: "2026-03-14", reference: "FTW-FEE-260314-A1" },
  { id: "t3", type: "milestone_released", status: "completed", amount: 8500, description: "Rough-in (plumb/elec)", project: "Kitchen Remodel", contractor: "Johnson & Sons", milestone: "Milestone 2 of 6", date: "2026-03-19", reference: "FTW-TXN-260319-B2" },
  { id: "t4", type: "service_fee", status: "completed", amount: 255, description: "Platform fee (3%)", project: "Kitchen Remodel", contractor: "Johnson & Sons", date: "2026-03-19", reference: "FTW-FEE-260319-B2" },
  { id: "t5", type: "milestone_released", status: "processing", amount: 7000, description: "Cabinet install", project: "Kitchen Remodel", contractor: "Johnson & Sons", milestone: "Milestone 3 of 6", date: "2026-03-24", reference: "FTW-TXN-260324-C3" },
  { id: "t6", type: "escrow_funded", status: "completed", amount: 38500, description: "Escrow funded — Kitchen Remodel", project: "Kitchen Remodel", contractor: "Johnson & Sons", date: "2026-03-08", reference: "FTW-ESC-260308-K1" },
  { id: "t7", type: "milestone_released", status: "completed", amount: 2500, description: "Demo complete", project: "Bathroom Reno", contractor: "Johnson & Sons", milestone: "Milestone 1 of 5", date: "2026-03-17", reference: "FTW-TXN-260317-D4" },
  { id: "t8", type: "escrow_funded", status: "completed", amount: 15200, description: "Escrow funded — Bathroom Reno", project: "Bathroom Reno", contractor: "Johnson & Sons", date: "2026-03-12", reference: "FTW-ESC-260312-B1" },
  { id: "t9", type: "milestone_released", status: "completed", amount: 3000, description: "Tear-off complete", project: "Roof Replacement", contractor: "Apex Roofing", milestone: "Milestone 1 of 5", date: "2026-03-16", reference: "FTW-TXN-260316-E5" },
  { id: "t10", type: "milestone_released", status: "completed", amount: 3500, description: "OSB & underlayment", project: "Roof Replacement", contractor: "Apex Roofing", milestone: "Milestone 2 of 5", date: "2026-03-17", reference: "FTW-TXN-260317-F6" },
  { id: "t11", type: "escrow_funded", status: "completed", amount: 13500, description: "Escrow funded — Roof Replacement", project: "Roof Replacement", contractor: "Apex Roofing", date: "2026-03-14", reference: "FTW-ESC-260314-R1" },
];

const PAYMENT_METHOD = {
  type: "Visa",
  last4: "4242",
  expiry: "08/28",
  name: "Michael Brown",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TXN_CONFIG: Record<TransactionType, { label: string; icon: typeof DollarSign; color: string; sign: "+" | "-" }> = {
  escrow_funded:      { label: "Escrow Funded",     icon: Lock,         color: "text-blue-600",    sign: "-" },
  milestone_released: { label: "Milestone Released", icon: ArrowUpRight, color: "text-emerald-600", sign: "-" },
  service_fee:        { label: "Service Fee",        icon: FileText,     color: "text-gray-500",    sign: "-" },
  refund:             { label: "Refund",             icon: ArrowDownRight, color: "text-blue-600",  sign: "+" },
};

const STATUS_BADGE: Record<TransactionStatus, { label: string; className: string }> = {
  completed:  { label: "Completed",  className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending:    { label: "Pending",    className: "bg-amber-50 text-amber-700 border-amber-200" },
  processing: { label: "Processing", className: "bg-blue-50 text-blue-700 border-blue-200" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomeownerPaymentsPage() {
  const [transactions] = useState<Transaction[]>(TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const [expandedTxn, setExpandedTxn] = useState<string | null>(null);
  const [showBalances, setShowBalances] = useState(true);

  const totalEscrowHeld = useMemo(() => ESCROW_ACCOUNTS.reduce((s, a) => s + a.held, 0), []);
  const totalReleased = useMemo(() => ESCROW_ACCOUNTS.reduce((s, a) => s + a.released, 0), []);
  const totalFunded = useMemo(() => ESCROW_ACCOUNTS.reduce((s, a) => s + a.funded, 0), []);
  const totalFees = useMemo(() => transactions.filter((t) => t.type === "service_fee" && t.status === "completed").reduce((s, t) => s + t.amount, 0), [transactions]);

  const sortedTransactions = useMemo(() => {
    let filtered = transactions;
    if (filter !== "all") filtered = filtered.filter((t) => t.type === filter);
    if (search) filtered = filtered.filter((t) => t.description.toLowerCase().includes(search.toLowerCase()) || t.project.toLowerCase().includes(search.toLowerCase()) || t.contractor.toLowerCase().includes(search.toLowerCase()));
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, search]);

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06)] relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Payments</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">Escrow balances, transactions, and receipts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {showBalances ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showBalances ? "Hide" : "Show"} balances
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 overflow-y-auto">
        {/* Finance cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total in Escrow</p>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Lock className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{showBalances ? formatCurrency(totalEscrowHeld) : "****"}</p>
            <p className="text-[11px] text-gray-400 mt-1">Held across {ESCROW_ACCOUNTS.length} projects</p>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Released</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">{showBalances ? formatCurrency(totalReleased) : "****"}</p>
            <p className="text-[11px] text-gray-400 mt-1">Paid to contractors</p>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Funded</p>
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-brand-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{showBalances ? formatCurrency(totalFunded) : "****"}</p>
            <p className="text-[11px] text-gray-400 mt-1">Across all projects</p>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Platform Fees</p>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{showBalances ? formatCurrency(totalFees) : "****"}</p>
            <p className="text-[11px] text-gray-400 mt-1">3% service fee</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Left — Transaction history (2 cols) */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              {/* Filters */}
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search transactions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-9 text-[13px]"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    {(["all", "milestone_released", "escrow_funded", "service_fee"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "h-8 px-3 rounded-lg text-[12px] font-medium transition-colors",
                          filter === f
                            ? "bg-gray-900 text-white"
                            : "text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        {f === "all" ? "All" : f === "milestone_released" ? "Milestones" : f === "escrow_funded" ? "Escrow" : "Fees"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transaction list */}
              <div>
                {sortedTransactions.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-400">No transactions found</p>
                  </div>
                ) : (
                  sortedTransactions.map((txn) => {
                    const cfg = TXN_CONFIG[txn.type];
                    const statusCfg = STATUS_BADGE[txn.status];
                    const Icon = cfg.icon;
                    const isExpanded = expandedTxn === txn.id;

                    return (
                      <div key={txn.id} className="border-b border-border last:border-0">
                        <button
                          onClick={() => setExpandedTxn(isExpanded ? null : txn.id)}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors text-left"
                        >
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                            txn.type === "escrow_funded" ? "bg-blue-50" : txn.type === "milestone_released" ? "bg-emerald-50" : "bg-gray-50"
                          )}>
                            <Icon className={cn("w-4 h-4", cfg.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-gray-900 truncate">{txn.description}</p>
                            <p className="text-[12px] text-gray-400 truncate">{txn.project} &middot; {txn.contractor}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className={cn("text-[14px] font-bold tabular-nums", cfg.color)}>
                              {cfg.sign}{formatCurrency(txn.amount)}
                            </p>
                            <p className="text-[11px] text-gray-400">{txn.date}</p>
                          </div>

                          <ChevronDown className={cn("w-4 h-4 text-gray-300 shrink-0 transition-transform", isExpanded && "rotate-180")} />
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-4 bg-gray-50/50">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 py-3">
                              <div>
                                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Reference</p>
                                <p className="text-[13px] font-mono text-gray-700 mt-0.5">{txn.reference}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Status</p>
                                <Badge className={cn("text-[11px] font-semibold mt-0.5 border", statusCfg.className)}>{statusCfg.label}</Badge>
                              </div>
                              <div>
                                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Type</p>
                                <p className="text-[13px] text-gray-700 mt-0.5">{cfg.label}</p>
                              </div>
                              {txn.milestone && (
                                <div>
                                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Milestone</p>
                                  <p className="text-[13px] text-gray-700 mt-0.5">{txn.milestone}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-border">
                              <button className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                <Download className="w-3.5 h-3.5" /> Download receipt
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-4">
            {/* Payment method */}
            <div className="bg-white rounded-xl border border-border p-5">
              <p className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider mb-4">Payment Method</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-border">
                <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">{PAYMENT_METHOD.type} ending in {PAYMENT_METHOD.last4}</p>
                  <p className="text-[11px] text-gray-400">Expires {PAYMENT_METHOD.expiry}</p>
                </div>
              </div>
              <button className="w-full mt-3 h-8 rounded-lg border border-border text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Update payment method
              </button>
            </div>

            {/* Escrow accounts */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider">Escrow Accounts</p>
                <Shield className="w-4 h-4 text-brand-600" />
              </div>
              <div className="space-y-3">
                {ESCROW_ACCOUNTS.map((account) => {
                  const releasedPct = account.funded > 0 ? Math.round((account.released / account.funded) * 100) : 0;
                  return (
                    <div key={account.projectId} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{account.projectName}</p>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-2">{account.contractor}</p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2 flex">
                        <div className="bg-emerald-500" style={{ width: `${releasedPct}%` }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">{account.milestonesPaid}/{account.milestonesTotal} milestones</span>
                        <span className="text-[12px] font-bold text-gray-900 tabular-nums">{showBalances ? formatCurrency(account.held) : "****"} held</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">Escrow Protected</p>
                  <p className="text-[11px] text-gray-400">Funds secured until verified</p>
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
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-[12px] text-gray-500">{item}</span>
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
