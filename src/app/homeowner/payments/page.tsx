"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  Receipt,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
} from "lucide-react";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReceiptLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface PaymentRecord {
  id: string;
  receiptNumber: string;
  bidId: string;
  jobTitle: string;
  contractorName: string;
  grossAmount: number;
  serviceFee: number;
  totalCharged: number;
  lineItems: ReceiptLineItem[];
  status: "paid" | "pending";
  paidAt: string | null;
  createdAt: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: "rcpt-1",
    receiptNumber: "FTW-260312-A7K2",
    bidId: "bid-1",
    jobTitle: "Kitchen Remodel - Full Gut",
    contractorName: "Johnson & Sons Construction",
    grossAmount: 38500,
    serviceFee: 1155,
    totalCharged: 39655,
    lineItems: [
      { description: "Demo & Disposal", quantity: 1, unitPrice: 3200, amount: 3200 },
      { description: "Framing & Rough-in", quantity: 1, unitPrice: 8500, amount: 8500 },
      { description: "Cabinet Install", quantity: 1, unitPrice: 12000, amount: 12000 },
      { description: "Countertops & Tile", quantity: 1, unitPrice: 7770, amount: 7770 },
      { description: "Plumbing & Electrical Finish", quantity: 1, unitPrice: 5250, amount: 5250 },
      { description: "Permits & Fees", quantity: 1, unitPrice: 1780, amount: 1780 },
    ],
    status: "paid",
    paidAt: "2026-03-12T14:30:00Z",
    createdAt: "2026-03-12T14:30:00Z",
  },
  {
    id: "rcpt-2",
    receiptNumber: "FTW-260318-B3M9",
    bidId: "bid-2",
    jobTitle: "Bathroom Renovation",
    contractorName: "Johnson & Sons Construction",
    grossAmount: 15200,
    serviceFee: 456,
    totalCharged: 15656,
    lineItems: [
      { description: "Demo", quantity: 1, unitPrice: 1500, amount: 1500 },
      { description: "Plumbing Rough-in", quantity: 1, unitPrice: 2800, amount: 2800 },
      { description: "Tile (Floor & Shower)", quantity: 1, unitPrice: 4200, amount: 4200 },
      { description: "Vanity & Fixtures", quantity: 1, unitPrice: 3500, amount: 3500 },
      { description: "Permits", quantity: 1, unitPrice: 1200, amount: 1200 },
      { description: "Final Labor", quantity: 25, unitPrice: 80, amount: 2000 },
    ],
    status: "paid",
    paidAt: "2026-03-18T10:15:00Z",
    createdAt: "2026-03-18T10:15:00Z",
  },
  {
    id: "rcpt-3",
    receiptNumber: "FTW-260322-C8P1",
    bidId: "bid-4",
    jobTitle: "Roof Replacement - 30 sq",
    contractorName: "Apex Roofing Co",
    grossAmount: 13500,
    serviceFee: 405,
    totalCharged: 13905,
    lineItems: [
      { description: "Tear-off & Disposal", quantity: 1, unitPrice: 2800, amount: 2800 },
      { description: "Shingles (30 sq)", quantity: 30, unitPrice: 132, amount: 3960 },
      { description: "Underlayment & Ice Shield", quantity: 1, unitPrice: 1155, amount: 1155 },
      { description: "Flashing, Ridge, Drip Edge", quantity: 1, unitPrice: 940, amount: 940 },
      { description: "Labor", quantity: 1, unitPrice: 4645, amount: 4645 },
    ],
    status: "pending",
    paidAt: null,
    createdAt: "2026-03-22T11:30:00Z",
  },
  {
    id: "rcpt-4",
    receiptNumber: "FTW-260310-D2N5",
    bidId: "bid-5",
    jobTitle: "HVAC System Install",
    contractorName: "CoolAir Mechanical",
    grossAmount: 8900,
    serviceFee: 267,
    totalCharged: 9167,
    lineItems: [
      { description: "Equipment (14 SEER2 Heat Pump)", quantity: 1, unitPrice: 4200, amount: 4200 },
      { description: "Ductwork Modification", quantity: 1, unitPrice: 1800, amount: 1800 },
      { description: "Labor - Install", quantity: 1, unitPrice: 2400, amount: 2400 },
      { description: "Thermostat & Controls", quantity: 1, unitPrice: 500, amount: 500 },
    ],
    status: "paid",
    paidAt: "2026-03-10T16:45:00Z",
    createdAt: "2026-03-10T16:45:00Z",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomeownerPaymentsPage() {
  const [payments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalSpent = useMemo(
    () =>
      payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.totalCharged, 0),
    [payments]
  );

  const totalFees = useMemo(
    () =>
      payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.serviceFee, 0),
    [payments]
  );

  const pendingTotal = useMemo(
    () =>
      payments
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + p.totalCharged, 0),
    [payments]
  );

  const filtered = useMemo(() => {
    if (!search) return payments;
    const q = search.toLowerCase();
    return payments.filter(
      (p) =>
        p.jobTitle.toLowerCase().includes(q) ||
        p.contractorName.toLowerCase().includes(q) ||
        p.receiptNumber.toLowerCase().includes(q)
    );
  }, [payments, search]);

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
            Payments
          </h1>
        </div>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-[1400px]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-5 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] text-gray-400">Total Spent</p>
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-brand-600" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-[12px] text-gray-400 mt-1">
                Includes {formatCurrency(totalFees)} in service fees
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] text-gray-400">Pending Payments</p>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight">
                {formatCurrency(pendingTotal)}
              </p>
              <p className="text-[12px] text-gray-400 mt-1">
                {payments.filter((p) => p.status === "pending").length} awaiting
                payment
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] text-gray-400">Receipts</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight">
                {payments.filter((p) => p.status === "paid").length}
              </p>
              <p className="text-[12px] text-gray-400 mt-1">
                Completed payments
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-gray-900">
              Payment History
            </p>
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

          {/* Payment List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center">
                <p className="text-[14px] text-gray-400">
                  No payments found
                </p>
              </div>
            ) : (
              filtered.map((payment) => {
                const isExpanded = expandedId === payment.id;
                const isPaid = payment.status === "paid";

                return (
                  <div
                    key={payment.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    {/* Row */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : payment.id)
                      }
                      className="w-full flex items-center gap-5 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      {/* Status icon */}
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          isPaid ? "bg-emerald-50" : "bg-amber-50"
                        )}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-600" />
                        )}
                      </div>

                      {/* Job info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-gray-900 truncate">
                          {payment.jobTitle}
                        </p>
                        <p className="text-[12px] text-gray-400 truncate">
                          {payment.contractorName}
                          {isPaid ? ` — Paid ${formatDate(payment.paidAt!)}` : " — Payment pending"}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-[18px] font-bold text-gray-900 tabular-nums">
                          {formatCurrency(payment.totalCharged)}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          incl. {formatCurrency(payment.serviceFee)} service fee
                        </p>
                      </div>

                      {/* Badge */}
                      <Badge
                        variant={isPaid ? "success" : "warning"}
                        className="text-[11px] min-w-[56px] justify-center flex-shrink-0"
                      >
                        {isPaid ? "Paid" : "Pending"}
                      </Badge>

                      {/* Expand icon */}
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-300" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Receipt */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-100">
                        <div className="mt-4">
                          {/* Receipt Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                                Receipt
                              </p>
                              <p className="text-[14px] font-semibold text-gray-900 mt-0.5">
                                {payment.receiptNumber}
                              </p>
                            </div>
                            {isPaid && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-[12px]"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download Receipt
                              </Button>
                            )}
                          </div>

                          {/* Line Items Table */}
                          <table className="w-full mb-4">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide px-3 py-2.5 rounded-l-lg">
                                  Description
                                </th>
                                <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[60px]">
                                  Qty
                                </th>
                                <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[80px]">
                                  Rate
                                </th>
                                <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[100px] rounded-r-lg">
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {payment.lineItems.map((item, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-gray-100 last:border-0"
                                >
                                  <td className="text-[13px] text-gray-900 px-3 py-2.5">
                                    {item.description}
                                  </td>
                                  <td className="text-[13px] text-gray-500 px-3 py-2.5 text-right tabular-nums">
                                    {item.quantity}
                                  </td>
                                  <td className="text-[13px] text-gray-500 px-3 py-2.5 text-right tabular-nums">
                                    {formatCurrency(item.unitPrice)}
                                  </td>
                                  <td className="text-[13px] text-gray-900 font-semibold px-3 py-2.5 text-right tabular-nums">
                                    {formatCurrency(item.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Totals */}
                          <div className="flex justify-end">
                            <div className="w-[260px]">
                              <div className="flex justify-between py-1.5 px-3">
                                <span className="text-[12px] text-gray-400">
                                  Subtotal
                                </span>
                                <span className="text-[13px] text-gray-900 tabular-nums">
                                  {formatCurrency(payment.grossAmount)}
                                </span>
                              </div>
                              <div className="flex justify-between py-1.5 px-3">
                                <span className="text-[12px] text-gray-400">
                                  Service Fee (3%)
                                </span>
                                <span className="text-[13px] text-gray-900 tabular-nums">
                                  {formatCurrency(payment.serviceFee)}
                                </span>
                              </div>
                              <div className="flex justify-between py-2.5 px-3 bg-gray-900 rounded-lg mt-1.5">
                                <span className="text-[12px] font-bold text-white">
                                  Total Charged
                                </span>
                                <span className="text-[16px] font-bold text-white tabular-nums">
                                  {formatCurrency(payment.totalCharged)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Info Footer */}
                          {isPaid && (
                            <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 flex items-center gap-3">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <div>
                                <p className="text-[12px] font-semibold text-emerald-700">
                                  Payment Confirmed
                                </p>
                                <p className="text-[11px] text-emerald-600">
                                  Paid on {formatDate(payment.paidAt!)} via
                                  QuickBooks. Receipt #{payment.receiptNumber}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Fee Info */}
          <div className="mt-5 px-5 py-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">
                  About Service Fees
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">
                  A 3% service fee is added to each payment to cover secure
                  payment processing, contractor verification, dispute
                  resolution, and the FairTrade Promise protection. All payments
                  are processed through QuickBooks for your records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
