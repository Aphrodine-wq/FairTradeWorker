"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  Clock,
  TrendingUp,
  Wallet,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type PayoutStatus = "paid" | "processing" | "queued" | "bill_created" | "failed";

interface PayoutRecord {
  id: string;
  bidId: string;
  jobTitle: string;
  homeownerName: string;
  grossAmount: number;
  platformFee: number;
  feePercent: number;
  netAmount: number;
  status: PayoutStatus;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PAYOUTS: PayoutRecord[] = [
  {
    id: "pay-1",
    bidId: "bid-1",
    jobTitle: "Kitchen Remodel - Full Gut",
    homeownerName: "Michael Brown",
    grossAmount: 38500,
    platformFee: 1925,
    feePercent: 5,
    netAmount: 36575,
    status: "paid",
    failureReason: null,
    paidAt: "2026-03-12T14:30:00Z",
    createdAt: "2026-03-12T14:25:00Z",
  },
  {
    id: "pay-2",
    bidId: "bid-2",
    jobTitle: "Bathroom Renovation",
    homeownerName: "Sarah Williams",
    grossAmount: 15200,
    platformFee: 760,
    feePercent: 5,
    netAmount: 14440,
    status: "paid",
    failureReason: null,
    paidAt: "2026-03-18T10:15:00Z",
    createdAt: "2026-03-18T10:10:00Z",
  },
  {
    id: "pay-3",
    bidId: "bid-3",
    jobTitle: "Deck Build - Composite",
    homeownerName: "Robert Johnson",
    grossAmount: 11000,
    platformFee: 550,
    feePercent: 5,
    netAmount: 10450,
    status: "processing",
    failureReason: null,
    paidAt: null,
    createdAt: "2026-03-20T09:00:00Z",
  },
  {
    id: "pay-4",
    bidId: "bid-4",
    jobTitle: "Roof Replacement - 30 sq",
    homeownerName: "Patricia Taylor",
    grossAmount: 13500,
    platformFee: 675,
    feePercent: 5,
    netAmount: 12825,
    status: "queued",
    failureReason: null,
    paidAt: null,
    createdAt: "2026-03-22T11:30:00Z",
  },
  {
    id: "pay-5",
    bidId: "bid-5",
    jobTitle: "HVAC System Install",
    homeownerName: "Kevin Nguyen",
    grossAmount: 8900,
    platformFee: 445,
    feePercent: 5,
    netAmount: 8455,
    status: "paid",
    failureReason: null,
    paidAt: "2026-03-10T16:45:00Z",
    createdAt: "2026-03-10T16:40:00Z",
  },
  {
    id: "pay-6",
    bidId: "bid-6",
    jobTitle: "Fence Install - Cedar 6ft",
    homeownerName: "David Kim",
    grossAmount: 6200,
    platformFee: 310,
    feePercent: 5,
    netAmount: 5890,
    status: "paid",
    failureReason: null,
    paidAt: "2026-03-08T13:20:00Z",
    createdAt: "2026-03-08T13:15:00Z",
  },
  {
    id: "pay-7",
    bidId: "bid-7",
    jobTitle: "Electrical Panel Upgrade",
    homeownerName: "Angela Foster",
    grossAmount: 4500,
    platformFee: 225,
    feePercent: 5,
    netAmount: 4275,
    status: "failed",
    failureReason: "QuickBooks vendor account not verified. Please reconnect your QuickBooks account.",
    paidAt: null,
    createdAt: "2026-03-15T08:00:00Z",
  },
  {
    id: "pay-8",
    bidId: "bid-8",
    jobTitle: "Interior Painting - 4 Rooms",
    homeownerName: "Lisa Chen",
    grossAmount: 3800,
    platformFee: 190,
    feePercent: 5,
    netAmount: 3610,
    status: "bill_created",
    failureReason: null,
    paidAt: null,
    createdAt: "2026-03-23T07:45:00Z",
  },
];

// ─── Status Config ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PayoutStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: "success" | "info" | "warning" | "danger" | "secondary";
  }
> = {
  paid: { label: "Paid", icon: CheckCircle2, badge: "success" },
  processing: { label: "Processing", icon: Loader2, badge: "info" },
  queued: { label: "Queued", icon: Clock, badge: "secondary" },
  bill_created: { label: "Bill Created", icon: Clock, badge: "warning" },
  failed: { label: "Failed", icon: AlertCircle, badge: "danger" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentMonthPayouts(payouts: PayoutRecord[]): PayoutRecord[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return payouts.filter((p) => {
    const d = new Date(p.createdAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContractorPaymentsPage() {
  const [payouts] = useState<PayoutRecord[]>(MOCK_PAYOUTS);
  const [filter, setFilter] = useState<"all" | PayoutStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"all" | "month" | "week">("all");

  // Derived data
  const totalEarned = useMemo(
    () =>
      payouts
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.netAmount, 0),
    [payouts]
  );

  const pendingPayouts = useMemo(
    () =>
      payouts
        .filter((p) => p.status === "processing" || p.status === "queued" || p.status === "bill_created")
        .reduce((sum, p) => sum + p.netAmount, 0),
    [payouts]
  );

  const thisMonth = useMemo(() => {
    const monthPayouts = getCurrentMonthPayouts(payouts);
    return monthPayouts
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.netAmount, 0);
  }, [payouts]);

  const availableBalance = useMemo(
    () =>
      payouts
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.netAmount, 0),
    [payouts]
  );

  // Filtering
  const filtered = useMemo(() => {
    let result = payouts;

    // Status filter
    if (filter !== "all") {
      result = result.filter((p) => p.status === filter);
    }

    // Date range filter
    if (dateRange === "month") {
      result = getCurrentMonthPayouts(result);
    } else if (dateRange === "week") {
      const weekAgo = Date.now() - 7 * 86400000;
      result = result.filter((p) => new Date(p.createdAt).getTime() > weekAgo);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.jobTitle.toLowerCase().includes(q) ||
          p.homeownerName.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [payouts, filter, dateRange, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    payouts.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [payouts]);

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
            Payments
          </h1>
          <Button variant="outline" className="gap-2 shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-[1400px]">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-5 mb-6">
            <SummaryCard
              label="Total Earned"
              value={formatCurrency(totalEarned)}
              icon={DollarSign}
              accent="text-emerald-600"
              sub="All time, net of fees"
            />
            <SummaryCard
              label="Pending Payouts"
              value={formatCurrency(pendingPayouts)}
              icon={Clock}
              accent="text-amber-600"
              sub={`${payouts.filter((p) => p.status === "processing" || p.status === "queued" || p.status === "bill_created").length} pending`}
            />
            <SummaryCard
              label="This Month"
              value={formatCurrency(thisMonth)}
              icon={TrendingUp}
              accent="text-brand-600"
              sub="Paid this month"
            />
            <SummaryCard
              label="Available Balance"
              value={formatCurrency(availableBalance)}
              icon={Wallet}
              accent="text-gray-900"
              sub="Ready for withdrawal"
            />
          </div>

          {/* Filters + Search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {(
                ["all", "paid", "processing", "queued", "bill_created", "failed"] as const
              ).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors",
                    filter === f
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {f === "all"
                    ? "All"
                    : f === "bill_created"
                      ? "Bill Created"
                      : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== "all" && statusCounts[f] ? (
                    <span className="ml-1 tabular-nums">{statusCounts[f]}</span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {/* Date range pills */}
              <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
                {(["all", "month", "week"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDateRange(d)}
                    className={cn(
                      "text-[12px] font-medium px-2.5 py-1 rounded-md transition-colors",
                      dateRange === d
                        ? "bg-gray-900 text-white"
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {d === "all" ? "All Time" : d === "month" ? "This Month" : "This Week"}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 w-[220px]"
                />
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_0.6fr_40px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Job
              </span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Date
              </span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right">
                Gross
              </span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right">
                Fee (5%)
              </span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right">
                Net Payout
              </span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide text-center">
                Status
              </span>
              <span />
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-[14px] text-gray-400">
                  No payments match your filters
                </p>
              </div>
            ) : (
              filtered.map((payout) => {
                const config = STATUS_CONFIG[payout.status];
                const isExpanded = expandedId === payout.id;

                return (
                  <div key={payout.id} className="border-b border-gray-100 last:border-0">
                    {/* Main Row */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : payout.id)
                      }
                      className="w-full grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_0.6fr_40px] gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-gray-900 truncate">
                          {payout.jobTitle}
                        </p>
                        <p className="text-[12px] text-gray-400 truncate">
                          {payout.homeownerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[13px] text-gray-900">
                          {formatDate(payout.paidAt || payout.createdAt)}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {payout.paidAt ? "Paid" : "Created"}
                        </p>
                      </div>
                      <p className="text-[14px] text-gray-900 tabular-nums text-right">
                        {formatCurrency(payout.grossAmount)}
                      </p>
                      <p className="text-[14px] text-gray-400 tabular-nums text-right">
                        -{formatCurrency(payout.platformFee)}
                      </p>
                      <p className="text-[14px] font-bold text-gray-900 tabular-nums text-right">
                        {formatCurrency(payout.netAmount)}
                      </p>
                      <div className="flex justify-center">
                        <Badge
                          variant={config.badge}
                          className="text-[11px] min-w-[72px] justify-center"
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex justify-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-300" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="px-5 pb-5">
                        <div className="bg-gray-50 rounded-lg p-5">
                          <div className="grid grid-cols-3 gap-6">
                            {/* Payout Breakdown */}
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
                                Payout Breakdown
                              </p>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-[13px] text-gray-500">
                                    Bid Amount
                                  </span>
                                  <span className="text-[13px] text-gray-900 tabular-nums font-medium">
                                    {formatCurrency(payout.grossAmount)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[13px] text-gray-500">
                                    Platform Fee ({payout.feePercent}%)
                                  </span>
                                  <span className="text-[13px] text-brand-600 tabular-nums font-medium">
                                    -{formatCurrency(payout.platformFee)}
                                  </span>
                                </div>
                                <div className="h-px bg-gray-200 my-1" />
                                <div className="flex justify-between">
                                  <span className="text-[13px] font-bold text-gray-900">
                                    Your Payout
                                  </span>
                                  <span className="text-[15px] font-bold text-gray-900 tabular-nums">
                                    {formatCurrency(payout.netAmount)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Details */}
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
                                Details
                              </p>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-[13px] text-gray-500">
                                    Payout ID
                                  </span>
                                  <span className="text-[12px] text-gray-900 font-mono">
                                    {payout.id}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[13px] text-gray-500">
                                    Bid ID
                                  </span>
                                  <span className="text-[12px] text-gray-900 font-mono">
                                    {payout.bidId}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[13px] text-gray-500">
                                    Created
                                  </span>
                                  <span className="text-[13px] text-gray-900">
                                    {formatDate(payout.createdAt)}
                                  </span>
                                </div>
                                {payout.paidAt && (
                                  <div className="flex justify-between">
                                    <span className="text-[13px] text-gray-500">
                                      Paid
                                    </span>
                                    <span className="text-[13px] text-emerald-600 font-medium">
                                      {formatDate(payout.paidAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status / Actions */}
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
                                Status
                              </p>
                              {payout.status === "failed" && payout.failureReason ? (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[12px] font-semibold text-red-700">
                                        Payout Failed
                                      </p>
                                      <p className="text-[11px] text-red-600 mt-1 leading-relaxed">
                                        {payout.failureReason}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="mt-3 w-full text-[12px]"
                                  >
                                    Retry Payout
                                  </Button>
                                </div>
                              ) : payout.status === "paid" ? (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <p className="text-[12px] font-semibold text-emerald-700">
                                      Payout Completed
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-emerald-600 mt-1">
                                    Funds deposited via QuickBooks
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                                    <p className="text-[12px] font-semibold text-gray-700">
                                      {payout.status === "queued"
                                        ? "Queued for Processing"
                                        : payout.status === "bill_created"
                                          ? "Bill Created in QuickBooks"
                                          : "Processing Payout"}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-gray-500 mt-1">
                                    {payout.status === "queued"
                                      ? "Waiting for homeowner payment confirmation"
                                      : "Payment transfer in progress"}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Fee Disclosure */}
          <div className="mt-5 px-5 py-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">
                  Platform Fee: 5% per payout
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">
                  FairTradeWorker charges a 5% platform fee on each completed
                  job. This covers payment processing, dispute resolution,
                  insurance verification, and marketplace operations. All payouts
                  are processed through QuickBooks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Summary Card Component ──────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-gray-400">{label}</p>
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            accent === "text-emerald-600"
              ? "bg-emerald-50"
              : accent === "text-amber-600"
                ? "bg-amber-50"
                : accent === "text-brand-600"
                  ? "bg-brand-50"
                  : "bg-gray-100"
          )}
        >
          <Icon className={cn("w-4 h-4", accent)} />
        </div>
      </div>
      <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight">
        {value}
      </p>
      <p className="text-[12px] text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
