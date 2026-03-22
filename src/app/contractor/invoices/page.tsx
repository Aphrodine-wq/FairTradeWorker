"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  ChevronRight,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Download,
  MoreHorizontal,
  Filter,
  ArrowUpRight,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";

// ─── Mock Data ───────────────────────────────────────────────────────────────

type InvoiceStatus = "paid" | "sent" | "overdue" | "draft";

interface Invoice {
  id: string;
  number: string;
  client: string;
  project: string;
  amount: number;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate: string | null;
  items: { description: string; quantity: number; rate: number }[];
}

const INVOICES: Invoice[] = [
  {
    id: "inv-1",
    number: "INV-2026-001",
    client: "Michael Brown",
    project: "Kitchen Remodel - Full Gut",
    amount: 19250,
    status: "paid",
    issuedDate: "2026-03-01",
    dueDate: "2026-03-15",
    paidDate: "2026-03-12",
    items: [
      { description: "Demo & Disposal", quantity: 1, rate: 3200 },
      { description: "Framing & Rough-in", quantity: 1, rate: 8500 },
      { description: "Cabinet Install (50% deposit)", quantity: 1, rate: 6000 },
      { description: "Permits & Fees", quantity: 1, rate: 1550 },
    ],
  },
  {
    id: "inv-2",
    number: "INV-2026-002",
    client: "Michael Brown",
    project: "Kitchen Remodel - Full Gut",
    amount: 19250,
    status: "sent",
    issuedDate: "2026-03-15",
    dueDate: "2026-03-29",
    paidDate: null,
    items: [
      { description: "Countertop Install", quantity: 1, rate: 3570 },
      { description: "Tile & Flooring", quantity: 1, rate: 4200 },
      { description: "Electrical Finish", quantity: 1, rate: 2450 },
      { description: "Plumbing Finish", quantity: 1, rate: 2800 },
      { description: "Cabinet Balance (50%)", quantity: 1, rate: 6000 },
      { description: "General Conditions", quantity: 1, rate: 230 },
    ],
  },
  {
    id: "inv-3",
    number: "INV-2026-003",
    client: "Sarah Williams",
    project: "Bathroom Renovation",
    amount: 7600,
    status: "paid",
    issuedDate: "2026-03-05",
    dueDate: "2026-03-19",
    paidDate: "2026-03-18",
    items: [
      { description: "Demo", quantity: 1, rate: 1500 },
      { description: "Plumbing Rough-in", quantity: 1, rate: 2800 },
      { description: "Tile (Floor & Shower) - 50%", quantity: 1, rate: 2100 },
      { description: "Permits", quantity: 1, rate: 1200 },
    ],
  },
  {
    id: "inv-4",
    number: "INV-2026-004",
    client: "Robert Johnson",
    project: "Deck Build",
    amount: 11000,
    status: "overdue",
    issuedDate: "2026-02-28",
    dueDate: "2026-03-14",
    paidDate: null,
    items: [
      { description: "Concrete Footings", quantity: 8, rate: 175 },
      { description: "Framing Lumber & Material", quantity: 1, rate: 3200 },
      { description: "Labor - Framing Phase", quantity: 40, rate: 85 },
      { description: "Composite Decking (50%)", quantity: 200, rate: 11 },
    ],
  },
  {
    id: "inv-5",
    number: "INV-2026-005",
    client: "Patricia Taylor",
    project: "Roof Replacement",
    amount: 13500,
    status: "sent",
    issuedDate: "2026-03-16",
    dueDate: "2026-03-30",
    paidDate: null,
    items: [
      { description: "Tear-off & Disposal", quantity: 1, rate: 2800 },
      { description: "Shingles (30 sq)", quantity: 30, rate: 132 },
      { description: "Underlayment & Ice Shield", quantity: 1, rate: 1155 },
      { description: "Flashing, Ridge, Drip Edge", quantity: 1, rate: 940 },
      { description: "Labor", quantity: 1, rate: 4645 },
    ],
  },
  {
    id: "inv-6",
    number: "INV-2026-006",
    client: "Sarah Williams",
    project: "Bathroom Renovation",
    amount: 7600,
    status: "draft",
    issuedDate: "2026-03-20",
    dueDate: "2026-04-03",
    paidDate: null,
    items: [
      { description: "Tile Finish & Grout", quantity: 1, rate: 2100 },
      { description: "Vanity & Fixtures", quantity: 1, rate: 3500 },
      { description: "Final Labor", quantity: 25, rate: 80 },
    ],
  },
];

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; badge: "success" | "info" | "danger" | "secondary" }> = {
  paid: { label: "Paid", icon: CheckCircle2, color: "text-emerald-600", badge: "success" },
  sent: { label: "Sent", icon: Send, color: "text-blue-600", badge: "info" },
  overdue: { label: "Overdue", icon: AlertCircle, color: "text-red-600", badge: "danger" },
  draft: { label: "Draft", icon: FileText, color: "text-gray-400", badge: "secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("inv-2");

  const filtered = INVOICES
    .filter((inv) => filter === "all" || inv.status === filter)
    .filter((inv) =>
      search === "" ||
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.project.toLowerCase().includes(search.toLowerCase())
    );

  const selected = INVOICES.find((inv) => inv.id === selectedId) || null;

  const totalOutstanding = INVOICES
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = INVOICES
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOverdue = INVOICES
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueCount = INVOICES.filter((inv) => inv.status === "overdue").length;

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Invoices</h1>
          <Button className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-[1400px]">
          {/* Stats */}
          <div className="flex gap-5 mb-6">
            <div className="flex-1">
              <p className="text-[13px] text-gray-400">Total Paid</p>
              <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-gray-400">Outstanding</p>
              <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{formatCurrency(totalOutstanding)}</p>
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-gray-400">Overdue</p>
              <div className="flex items-baseline gap-2">
                <p className="text-[28px] font-bold text-red-600 tabular-nums leading-tight mt-0.5">{formatCurrency(totalOverdue)}</p>
                {overdueCount > 0 && <span className="text-[13px] text-red-500">{overdueCount} invoice{overdueCount > 1 ? "s" : ""}</span>}
              </div>
            </div>
          </div>

          {/* Filters + Search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {(["all", "sent", "paid", "overdue", "draft"] as const).map((f) => (
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
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== "all" && (
                    <span className="ml-1 tabular-nums">
                      {INVOICES.filter((inv) => inv.status === f).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 w-[220px]"
              />
            </div>
          </div>

          {/* List + Detail */}
          <div className="flex gap-5">
            {/* Invoice list */}
            <div className="flex-1 space-y-2">
              {filtered.map((inv) => {
                const config = STATUS_CONFIG[inv.status];
                const StatusIcon = config.icon;
                const isSelected = inv.id === selectedId;
                const daysUntilDue = Math.ceil((new Date(inv.dueDate).getTime() - Date.now()) / 86400000);

                return (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedId(inv.id)}
                    className={cn(
                      "w-full text-left rounded-xl p-4 transition-all",
                      isSelected
                        ? "bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] ring-1 ring-gray-200"
                        : "bg-white hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[15px] font-bold text-gray-900">{inv.client}</p>
                        <p className="text-[12px] text-gray-400">{inv.number} — {inv.project}</p>
                      </div>
                      <Badge variant={config.badge} className="text-[11px]">
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[20px] font-bold text-gray-900 tabular-nums">{formatCurrency(inv.amount)}</p>
                      <p className="text-[12px] text-gray-400">
                        {inv.status === "paid"
                          ? `Paid ${formatDate(inv.paidDate!)}`
                          : inv.status === "overdue"
                            ? `${Math.abs(daysUntilDue)}d overdue`
                            : inv.status === "draft"
                              ? "Not sent"
                              : `Due ${formatDate(inv.dueDate)}`
                        }
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* PDF Preview */}
            {selected && (
              <div className="w-[480px] flex-shrink-0 self-start sticky top-5">
                {/* Actions bar */}
                <div className="flex gap-2 mb-3">
                  {selected.status === "draft" && (
                    <Button className="flex-1 gap-2">
                      <Send className="w-4 h-4" />
                      Send Invoice
                    </Button>
                  )}
                  {selected.status === "sent" && (
                    <Button className="flex-1 gap-2">
                      <DollarSign className="w-4 h-4" />
                      Mark as Paid
                    </Button>
                  )}
                  {selected.status === "overdue" && (
                    <Button className="flex-1 gap-2 bg-red-600 hover:bg-red-700">
                      <Send className="w-4 h-4" />
                      Send Reminder
                    </Button>
                  )}
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                </div>

                {/* Paper document */}
                <div className="bg-white rounded-lg shadow-[0_4px_30px_-6px_rgba(0,0,0,0.15)] ring-1 ring-gray-200/80 overflow-hidden">
                  {/* Top accent line */}
                  <div className="h-1.5 bg-brand-600" />

                  <div className="px-8 pt-6 pb-7">
                    {/* Header: Photo + Company + Invoice title */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3.5">
                        <Image
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                          alt="Marcus Johnson"
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                        />
                        <div>
                          <p className="text-[16px] font-bold text-gray-900 leading-tight">Johnson & Sons Construction</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Marcus Johnson — Owner</p>
                          <p className="text-[10px] text-gray-400">TX License #R21445 — Fully Insured</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[28px] font-bold text-gray-900 tracking-tight leading-none">INVOICE</p>
                        <p className="text-[12px] text-gray-400 mt-1">{selected.number}</p>
                        <Badge variant={STATUS_CONFIG[selected.status].badge} className="text-[10px] py-0.5 px-2.5 mt-1.5">
                          {STATUS_CONFIG[selected.status].label}
                        </Badge>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 mb-5" />

                    {/* Bill To + From + Dates — 3 column */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1.5">Bill To</p>
                        <p className="text-[13px] font-bold text-gray-900">{selected.client}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{selected.project}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1.5">From</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Johnson & Sons Construction<br />
                          4200 South Congress Ave<br />
                          Austin, TX 78745<br />
                          (512) 555-0100
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1.5">Details</p>
                        <div className="space-y-1.5">
                          <div>
                            <p className="text-[9px] text-gray-400">Issued</p>
                            <p className="text-[11px] font-semibold text-gray-900">{formatDate(selected.issuedDate)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400">Due</p>
                            <p className="text-[11px] font-semibold text-gray-900">{formatDate(selected.dueDate)}</p>
                          </div>
                          {selected.paidDate && (
                            <div>
                              <p className="text-[9px] text-gray-400">Paid</p>
                              <p className="text-[11px] font-bold text-emerald-600">{formatDate(selected.paidDate)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Line items table */}
                    <table className="w-full mb-5">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] px-3 py-2.5 rounded-l-lg">Description</th>
                          <th className="text-right text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] px-3 py-2.5 w-[45px]">Qty</th>
                          <th className="text-right text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] px-3 py-2.5 w-[65px]">Rate</th>
                          <th className="text-right text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] px-3 py-2.5 w-[80px] rounded-r-lg">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.items.map((item, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0">
                            <td className="text-[11px] text-gray-900 px-3 py-2.5">{item.description}</td>
                            <td className="text-[11px] text-gray-500 px-3 py-2.5 text-right tabular-nums">{item.quantity}</td>
                            <td className="text-[11px] text-gray-500 px-3 py-2.5 text-right tabular-nums">{formatCurrency(item.rate)}</td>
                            <td className="text-[11px] text-gray-900 font-semibold px-3 py-2.5 text-right tabular-nums">{formatCurrency(item.quantity * item.rate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-6">
                      <div className="w-[210px]">
                        <div className="flex justify-between py-1.5 px-3">
                          <span className="text-[10px] text-gray-400">Subtotal</span>
                          <span className="text-[11px] text-gray-900 tabular-nums">{formatCurrency(selected.amount)}</span>
                        </div>
                        <div className="flex justify-between py-1.5 px-3">
                          <span className="text-[10px] text-gray-400">Tax</span>
                          <span className="text-[11px] text-gray-900 tabular-nums">$0.00</span>
                        </div>
                        <div className="flex justify-between py-2.5 px-3 bg-gray-900 rounded-lg mt-1.5">
                          <span className="text-[12px] font-bold text-white">Total Due</span>
                          <span className="text-[16px] font-bold text-white tabular-nums">{formatCurrency(selected.amount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment terms */}
                    <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1">Payment Terms</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed">Net 14 days. Payment accepted via check, ACH transfer, or credit card. A 1.5% monthly late fee applies to balances past due.</p>
                    </div>

                    {/* Signature line */}
                    <div className="flex gap-8 mb-5">
                      <div className="flex-1">
                        <div className="border-b border-gray-300 pb-1 mb-1">
                          <p className="text-[13px] text-gray-900 italic" style={{ fontFamily: 'Georgia, serif' }}>Marcus Johnson</p>
                        </div>
                        <p className="text-[9px] text-gray-400">Contractor Signature</p>
                      </div>
                      <div className="flex-1">
                        <div className="border-b border-gray-300 pb-1 mb-1">
                          <p className="text-[13px] text-gray-300">&nbsp;</p>
                        </div>
                        <p className="text-[9px] text-gray-400">Client Signature</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-[9px] text-gray-400">
                        <p>marcus@johnson.com — (512) 555-0100</p>
                        <p>4200 South Congress Ave, Austin, TX 78745</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-brand-600 flex items-center justify-center">
                          <span className="text-white text-[6px] font-bold">FTW</span>
                        </div>
                        <p className="text-[9px] text-gray-400">FairTradeWorker</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
