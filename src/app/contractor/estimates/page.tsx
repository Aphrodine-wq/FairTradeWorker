"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import NextImage from "next/image";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  DollarSign,
  Calculator,
  Send,
  Trash2,
  List,
  Mic,
  MicOff,
  Paperclip,
  Upload,
  Bot,
  Hammer,
  Wrench,
  CheckCircle2,
  Loader2,
  Crown,
  Image as ImageIcon,
  Users,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Minus,
  Download,
  UserPlus,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Card } from "@shared/ui/card";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@shared/ui/tabs";
import { mockEstimates, type Estimate } from "@shared/lib/mock-data";
import { fetchEstimates } from "@shared/lib/data";
import { api } from "@shared/lib/realtime";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";
import { toast } from "sonner";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@shared/ui/alert-dialog";

// ─── Status Config ───────────────────────────────────────────────────────────

const STATUS_STYLE: Record<
  string,
  { label: string; variant: "default" | "info" | "warning" | "success" | "danger" }
> = {
  draft: { label: "Draft", variant: "default" },
  sent: { label: "Sent", variant: "info" },
  viewed: { label: "Viewed", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Declined", variant: "danger" },
  expired: { label: "Expired", variant: "default" },
};

// ─── FairPrice Market Context ────────────────────────────────────────────────

const FAIR_PRICE_BASES: Record<string, { low: number; high: number }> = {
  "Remodeling": { low: 5000, high: 9000 },
  "Electrical": { low: 2000, high: 3800 },
  "Plumbing": { low: 1800, high: 3400 },
  "Roofing": { low: 4000, high: 7500 },
  "HVAC": { low: 3500, high: 6200 },
  "Painting": { low: 1200, high: 2400 },
  "Flooring": { low: 2200, high: 4000 },
  "Concrete": { low: 2800, high: 5200 },
  "Fencing": { low: 1800, high: 3600 },
};

function getEstimateFairPrice(category: string, total: number) {
  const base = FAIR_PRICE_BASES[category];
  if (!base || total <= 0) return null;
  const multiplier = Math.max(1, total / ((base.low + base.high) / 2));
  const low = Math.round(base.low * multiplier * 0.88 / 100) * 100;
  const high = Math.round(base.high * multiplier * 0.88 * 1.05 / 100) * 100;
  const mid = (low + high) / 2;
  const pct = Math.round(((total - mid) / mid) * 100);
  return { low, high, pct };
}

const TIMELINE_OPTIONS = [
  { value: "1-week", label: "1 week" },
  { value: "2-weeks", label: "2 weeks" },
  { value: "1-month", label: "1 month" },
  { value: "2-months", label: "2 months" },
  { value: "3-months", label: "3 months" },
  { value: "6-months", label: "6 months" },
];

// ─── My Estimates Tab ────────────────────────────────────────────────────────

function EstimateRow({ est }: { est: Estimate }) {
  const [open, setOpen] = useState(false);
  const style = STATUS_STYLE[est.status] || STATUS_STYLE.draft;

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/80 transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-gray-900 truncate">
              {est.jobTitle}
            </p>
            <div className="flex items-center gap-3 mt-0.5 text-[12px] text-gray-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {est.clientName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(est.createdDate)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[15px] font-bold text-gray-900 tabular-nums">
            {formatCurrency(est.amount)}
          </span>
          <Badge
            variant={style.variant}
            className="text-[10px] min-w-[60px] justify-center"
          >
            {style.label}
          </Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Delete estimate"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete estimate</AlertDialogTitle>
                <AlertDialogDescription>This estimate will be permanently deleted. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { toast.success("Estimate deleted"); }}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="flex items-center justify-end gap-2 mb-3">
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Send className="w-3.5 h-3.5" />
              Send to Client
            </button>
          </div>
          {/* PDF-style document */}
          <div className="bg-white rounded-lg shadow-[0_4px_30px_-6px_rgba(0,0,0,0.15)] ring-1 ring-gray-200/80 overflow-hidden max-w-[600px]">
            {/* Top accent line */}
            <div className="h-1.5 bg-brand-600" />

            <div className="px-7 pt-5 pb-6">
              {/* Header: Photo + Company + Estimate title */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <NextImage
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                    alt="Marcus Johnson"
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div>
                    <p className="text-[14px] font-bold text-gray-900 leading-tight">Johnson & Sons Construction</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Marcus Johnson — Owner</p>
                    <p className="text-[9px] text-gray-400">TX License #R21445 — Fully Insured</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[24px] font-bold text-gray-900 tracking-tight leading-none">ESTIMATE</p>
                  <p className="text-[11px] text-gray-400 mt-1">EST-{est.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="h-px bg-gray-200 mb-5" />

              {/* Prepared For + From + Dates */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1.5">Prepared For</p>
                  <p className="text-[13px] font-bold text-gray-900">{est.clientName}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{est.jobTitle}</p>
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
                      <p className="text-[9px] text-gray-400">Date</p>
                      <p className="text-[11px] font-semibold text-gray-900">{formatDate(est.createdDate)}</p>
                    </div>
                    {est.sentDate && (
                      <div>
                        <p className="text-[9px] text-gray-400">Sent</p>
                        <p className="text-[11px] font-semibold text-gray-900">{formatDate(est.sentDate)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] text-gray-400">Valid For</p>
                      <p className="text-[11px] font-semibold text-gray-900">30 Days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <table className="w-full mb-4">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] px-3 py-2 rounded-l-lg">Description</th>
                    <th className="text-right text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] px-3 py-2 w-[40px]">Qty</th>
                    <th className="text-right text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] px-3 py-2 w-[60px]">Rate</th>
                    <th className="text-right text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] px-3 py-2 w-[70px] rounded-r-lg">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {est.lineItems.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="text-[11px] text-gray-900 px-3 py-2">{item.description}</td>
                      <td className="text-[11px] text-gray-500 px-3 py-2 text-right tabular-nums">{item.quantity}</td>
                      <td className="text-[11px] text-gray-500 px-3 py-2 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-[11px] text-gray-900 font-semibold px-3 py-2 text-right tabular-nums">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="flex justify-end mb-5">
                <div className="w-[200px]">
                  <div className="flex justify-between py-1.5 px-3">
                    <span className="text-[10px] text-gray-400">Subtotal</span>
                    <span className="text-[11px] text-gray-900 tabular-nums">{formatCurrency(est.amount)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 px-3 bg-gray-900 rounded-lg mt-1.5">
                    <span className="text-[12px] font-bold text-white">Total</span>
                    <span className="text-[15px] font-bold text-white tabular-nums">{formatCurrency(est.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1">Terms & Conditions</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">This estimate is valid for 30 days from the date above. A 50% deposit is required to schedule and begin work. Remaining balance is due upon substantial completion. Price is subject to change if project scope changes after acceptance.</p>
              </div>

              {/* Signature lines */}
              <div className="flex gap-6 mb-5">
                <div className="flex-1">
                  <div className="border-b border-gray-300 pb-1 mb-1">
                    <p className="text-[12px] text-gray-900 italic" style={{ fontFamily: 'Georgia, serif' }}>Marcus Johnson</p>
                  </div>
                  <p className="text-[9px] text-gray-400">Contractor Signature</p>
                </div>
                <div className="flex-1">
                  <div className="border-b border-gray-300 pb-1 mb-1">
                    <p className="text-[12px] text-gray-300">&nbsp;</p>
                  </div>
                  <p className="text-[9px] text-gray-400">Client Acceptance</p>
                </div>
                <div className="w-[100px]">
                  <div className="border-b border-gray-300 pb-1 mb-1">
                    <p className="text-[12px] text-gray-300">&nbsp;</p>
                  </div>
                  <p className="text-[9px] text-gray-400">Date</p>
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
  );
}

function MyEstimatesTab({ estimates }: { estimates: Estimate[] }) {
  return (
    <Card className="overflow-hidden">
      {estimates.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          No estimates yet. Create your first one.
        </div>
      ) : (
        estimates.map((est) => <EstimateRow key={est.id} est={est} />)
      )}
    </Card>
  );
}

// ─── New Estimate Tab ────────────────────────────────────────────────────────

type LineItemCategory = "Materials" | "Labor" | "Equipment" | "Other";

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  group: LineItemCategory;
}

function NewEstimateTab() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [category, setCategory] = useState("");
  const [timeline, setTimeline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("50-50");
  const [notes, setNotes] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: "1", unitPrice: "", group: "Materials" },
  ]);

  const updateLine = (idx: number, field: keyof LineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const [activeGroup, setActiveGroup] = useState<LineItemCategory>("Materials");

  const addLine = (group?: LineItemCategory) =>
    setLineItems((prev) => [...prev, { description: "", quantity: "1", unitPrice: "", group: group || activeGroup }]);

  const removeLine = (idx: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== idx));

  const lineTotal = (item: LineItem) =>
    (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);

  const grandTotal = lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const filledItems = lineItems.filter((i) => i.description && parseFloat(i.unitPrice) > 0);
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const inputBase = "w-full h-11 rounded-lg border border-gray-200 bg-white px-3.5 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow";
  const selectBase = "h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow appearance-none";
  const labelBase = "text-[12px] font-semibold text-gray-900 block mb-1.5";

  const PAYMENT_LABELS: Record<string, string> = {
    "50-50": "50% deposit, 50% on completion",
    "thirds": "1/3 deposit, 1/3 midpoint, 1/3 completion",
    "milestone": "Milestone-based payments",
    "completion": "100% on completion",
    "net30": "Net 30 days",
  };

  const [buildStep, setBuildStep] = useState<"client" | "job" | "items" | "terms">("client");

  const BUILD_STEPS = [
    { id: "client" as const, label: "Client" },
    { id: "job" as const, label: "Job Details" },
    { id: "items" as const, label: "Line Items" },
    { id: "terms" as const, label: "Terms & Notes" },
  ];

  return (
    <div className="flex gap-6 items-start">
      {/* Left: Form */}
      <div className="flex-1 min-w-0">
        {/* Step nav */}
        <div className="border-b border-border mb-6">
          <div className="flex">
            {BUILD_STEPS.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setBuildStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px",
                  buildStep === step.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center",
                  buildStep === step.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                )}>
                  {i + 1}
                </span>
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Client */}
        <div className={buildStep !== "client" ? "hidden" : ""}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">1</span>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-gray-900">Client</p>
              <p className="text-[12px] text-gray-400">Who is this estimate for?</p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Contact import coming soon")}
              className="flex items-center gap-1.5 text-[12px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Import from Contacts
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelBase}>Name</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Full name" className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>Email</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@email.com" className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>Phone</label>
              <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(512) 555-0000" className={inputBase} />
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className={buildStep !== "job" ? "hidden" : ""}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">2</span>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Job Details</p>
              <p className="text-[12px] text-gray-400">What work is being estimated?</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelBase}>Job Title</label>
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Kitchen Remodel, Roof Repair..." className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectBase}>
                <option value="">Select...</option>
                <option value="Remodeling">Remodeling</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Roofing">Roofing</option>
                <option value="HVAC">HVAC</option>
                <option value="Painting">Painting</option>
                <option value="Flooring">Flooring</option>
                <option value="Concrete">Concrete</option>
                <option value="Fencing">Fencing</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className={labelBase}>Job Site Address</label>
            <input value={jobAddress} onChange={(e) => setJobAddress(e.target.value)} placeholder="Full street address" className={inputBase} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelBase}>Timeline</label>
              <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className={selectBase}>
                <option value="" disabled>Select...</option>
                {TIMELINE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelBase}>Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>Valid Until</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputBase} />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className={buildStep !== "items" ? "hidden" : ""}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">3</span>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Line Items</p>
              <p className="text-[12px] text-gray-400">Materials, labor, and other charges</p>
            </div>
          </div>

          <div className="overflow-hidden bg-white ring-1 ring-gray-200">
            {/* Category tabs — top nav */}
            <div className="flex border-b border-gray-200">
              {(["Materials", "Labor", "Equipment", "Other"] as LineItemCategory[]).map((g) => {
                const count = lineItems.filter((li) => li.group === g && li.description).length;
                return (
                  <button
                    key={g}
                    onClick={() => setActiveGroup(g)}
                    className={cn(
                      "flex items-center gap-1.5 px-5 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px",
                      activeGroup === g
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {g}
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                        activeGroup === g ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_110px_100px_40px] gap-3 px-5 py-3 bg-gray-50">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Qty</span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Rate</span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Amount</span>
              <span />
            </div>

            {/* Line items for active group */}
            {lineItems.map((item, i) => {
              if (item.group !== activeGroup) return null;
              return (
                <div key={i} className="grid grid-cols-[1fr_80px_110px_100px_40px] gap-3 px-5 py-3 items-center border-t border-gray-100">
                  <input
                    value={item.description}
                    onChange={(e) => updateLine(i, "description", e.target.value)}
                    placeholder="What was done or supplied..."
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  />
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateLine(i, "quantity", e.target.value)}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-2 text-[14px] text-gray-900 text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[13px]">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-7 pr-2 text-[14px] text-gray-900 text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>
                  <span className="text-[14px] font-semibold text-gray-900 text-right tabular-nums">
                    {lineTotal(item) > 0 ? formatCurrency(lineTotal(item)) : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    disabled={lineItems.length === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* Ghost row — type to add */}
            <div className="grid grid-cols-[1fr_80px_110px_100px_40px] gap-3 px-5 py-3 items-center border-t border-dashed border-gray-200 bg-gray-50/30">
              <input
                placeholder={`Add ${activeGroup.toLowerCase()} item...`}
                className="h-10 rounded-lg border border-dashed border-gray-200 bg-transparent px-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent focus:bg-white focus:border-solid"
                onFocus={() => {
                  // If there isn't already an empty item for this group, add one
                  const hasEmpty = lineItems.some((li) => li.group === activeGroup && !li.description);
                  if (!hasEmpty) addLine(activeGroup);
                }}
                onChange={(e) => {
                  // Find or create the empty item for this group and update it
                  const emptyIdx = lineItems.findIndex((li) => li.group === activeGroup && !li.description);
                  if (emptyIdx >= 0) {
                    updateLine(emptyIdx, "description", e.target.value);
                  }
                }}
                value=""
              />
              <span className="text-[13px] text-gray-300 text-right">—</span>
              <span className="text-[13px] text-gray-300 text-right">—</span>
              <span className="text-[13px] text-gray-300 text-right">—</span>
              <span />
            </div>

            {/* Footer — total */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => addLine(activeGroup)} className="text-[13px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </button>
                <span className="text-[11px] text-gray-400">
                  {lineItems.filter((li) => li.description).length} items across {new Set(lineItems.filter((li) => li.description).map((li) => li.group)).size} categories
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[12px] text-gray-400 font-medium">Total</span>
                <span className="text-[24px] font-bold text-gray-900 tabular-nums">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* FairPrice market context */}
          {category && grandTotal > 0 && (() => {
          const fp = getEstimateFairPrice(category, grandTotal);
          if (!fp) return null;
          const isBelow = fp.pct <= -8;
          const isAbove = fp.pct >= 8;
          return (
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
              <BarChart3 className="w-5 h-5 text-brand-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FairPrice Market Rate</p>
                <p className="text-sm font-bold text-gray-900 tabular-nums">
                  {formatCurrency(fp.low)} &ndash; {formatCurrency(fp.high)}
                </p>
              </div>
              <span className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-1 border whitespace-nowrap",
                isBelow ? "text-brand-700 bg-brand-50 border-brand-100"
                  : isAbove ? "text-amber-700 bg-amber-50 border-amber-100"
                  : "text-gray-600 bg-white border-gray-200"
              )}>
                {isBelow ? <TrendingDown className="w-3 h-3" /> : isAbove ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {isBelow ? `${Math.abs(fp.pct)}% below market` : isAbove ? `${fp.pct}% above market` : "At market rate"}
              </span>
            </div>
          );
          })()}
        </div>

        {/* Terms */}
        <div className={buildStep !== "terms" ? "hidden" : ""}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">4</span>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Terms & Notes</p>
              <p className="text-[12px] text-gray-400">Payment schedule and scope details</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelBase}>Payment Terms</label>
              <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className={selectBase}>
                <option value="50-50">50% deposit / 50% on completion</option>
                <option value="thirds">1/3 deposit / 1/3 mid / 1/3 completion</option>
                <option value="milestone">Milestone-based payments</option>
                <option value="completion">100% on completion</option>
                <option value="net30">Net 30</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className={labelBase}>Scope of Work</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the full scope — materials, approach, what's included..." className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow resize-none min-h-[80px]" />
          </div>
          <div>
            <label className={labelBase}>Exclusions</label>
            <textarea value={exclusions} onChange={(e) => setExclusions(e.target.value)} placeholder="What is NOT included..." className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow resize-none min-h-[60px]" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 pb-8">
          <Button onClick={() => toast.success("Estimate created")} className="gap-2 h-11 px-6 text-[14px]">
            <Send className="w-4 h-4" />
            Send Estimate
          </Button>
          <Button onClick={() => toast.success("Estimate saved as draft")} variant="outline" className="h-11 px-6 text-[14px]">Save as Draft</Button>
        </div>
      </div>

      {/* Right: Live PDF Preview */}
      <div className="w-[480px] flex-shrink-0 sticky top-0">
        <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Live Preview</p>
        <div className="bg-white rounded-lg shadow-[0_4px_30px_-6px_rgba(0,0,0,0.15)] ring-1 ring-gray-200/80 overflow-hidden transform scale-[0.95] origin-top-right">
          {/* Accent bar */}
          <div className="h-1.5 bg-brand-600" />
          <div className="px-6 pt-4 pb-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <NextImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100" />
                <div>
                  <p className="text-[12px] font-bold text-gray-900">Johnson & Sons Construction</p>
                  <p className="text-[8px] text-gray-400">Marcus Johnson — TX #R21445</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[18px] font-bold text-gray-900 leading-none">ESTIMATE</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{today}</p>
              </div>
            </div>

            <div className="h-px bg-gray-200 mb-3" />

            {/* Client + Job */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-0.5">Prepared For</p>
                <p className="text-[11px] font-bold text-gray-900">{clientName || "Client Name"}</p>
                <p className="text-[9px] text-gray-400">{jobTitle || "Job Title"}</p>
                {jobAddress && <p className="text-[8px] text-gray-400 mt-0.5">{jobAddress}</p>}
              </div>
              <div className="text-right">
                {category && <p className="text-[9px] text-gray-400">{category}</p>}
                {timeline && <p className="text-[9px] text-gray-400">{TIMELINE_OPTIONS.find((o) => o.value === timeline)?.label}</p>}
                {startDate && <p className="text-[9px] text-gray-400">Start: {startDate}</p>}
              </div>
            </div>

            {/* Line items */}
            {filledItems.length > 0 ? (
              <>
                <table className="w-full mb-3">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-[7px] font-bold text-gray-400 uppercase tracking-[0.1em] px-2 py-1.5 rounded-l">Item</th>
                      <th className="text-right text-[7px] font-bold text-gray-400 uppercase tracking-[0.1em] px-2 py-1.5 w-[30px]">Qty</th>
                      <th className="text-right text-[7px] font-bold text-gray-400 uppercase tracking-[0.1em] px-2 py-1.5 w-[50px]">Rate</th>
                      <th className="text-right text-[7px] font-bold text-gray-400 uppercase tracking-[0.1em] px-2 py-1.5 w-[55px] rounded-r">Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filledItems.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="text-[9px] text-gray-900 px-2 py-1.5">{item.description}</td>
                        <td className="text-[9px] text-gray-400 px-2 py-1.5 text-right tabular-nums">{item.quantity}</td>
                        <td className="text-[9px] text-gray-400 px-2 py-1.5 text-right tabular-nums">{formatCurrency(parseFloat(item.unitPrice) || 0)}</td>
                        <td className="text-[9px] text-gray-900 font-semibold px-2 py-1.5 text-right tabular-nums">{formatCurrency(lineTotal(item))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mb-3">
                  <div className="flex justify-between py-2 px-2.5 bg-gray-900 rounded-md w-[140px]">
                    <span className="text-[10px] font-bold text-white">Total</span>
                    <span className="text-[12px] font-bold text-white tabular-nums">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-[10px] text-gray-300">Add line items to see them here</p>
              </div>
            )}

            {/* Terms */}
            {(notes || paymentTerms) && (
              <div className="bg-gray-50 rounded-md px-3 py-2 mb-3">
                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-0.5">Terms</p>
                <p className="text-[8px] text-gray-500 leading-relaxed">{PAYMENT_LABELS[paymentTerms]}{notes ? `. ${notes}` : ""}</p>
                {exclusions && (
                  <>
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.1em] mt-1.5 mb-0.5">Exclusions</p>
                    <p className="text-[8px] text-gray-500 leading-relaxed">{exclusions}</p>
                  </>
                )}
              </div>
            )}

            {/* Signatures */}
            <div className="flex gap-4 mb-3">
              <div className="flex-1">
                <div className="border-b border-gray-300 pb-0.5 mb-0.5">
                  <p className="text-[10px] text-gray-900 italic" style={{ fontFamily: 'Georgia, serif' }}>Marcus Johnson</p>
                </div>
                <p className="text-[7px] text-gray-400">Contractor</p>
              </div>
              <div className="flex-1">
                <div className="border-b border-gray-300 pb-0.5 mb-0.5"><p className="text-[10px]">&nbsp;</p></div>
                <p className="text-[7px] text-gray-400">Client Acceptance</p>
              </div>
              <div className="w-[60px]">
                <div className="border-b border-gray-300 pb-0.5 mb-0.5"><p className="text-[10px]">&nbsp;</p></div>
                <p className="text-[7px] text-gray-400">Date</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-[7px] text-gray-400">marcus@johnson.com — (512) 555-0100</p>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-brand-600 flex items-center justify-center">
                  <span className="text-white text-[5px] font-bold">FTW</span>
                </div>
                <p className="text-[7px] text-gray-400">FairTradeWorker</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calculator Tab ──────────────────────────────────────────────────────────

const JOB_TEMPLATES: Record<string, { sections: { name: string; items: { desc: string; qty: string; unit: string; unitCost: string }[] }[] }> = {
  custom: { sections: [{ name: "General", items: [{ desc: "", qty: "1", unit: "ea", unitCost: "" }] }] },
  kitchen: {
    sections: [
      { name: "Demo & Prep", items: [
        { desc: "Demo existing cabinets & counters", qty: "1", unit: "job", unitCost: "2500" },
        { desc: "Haul-off & disposal", qty: "1", unit: "job", unitCost: "800" },
        { desc: "Floor protection", qty: "1", unit: "job", unitCost: "200" },
      ]},
      { name: "Cabinets & Countertops", items: [
        { desc: "Cabinets (stock/semi-custom)", qty: "1", unit: "set", unitCost: "8000" },
        { desc: "Countertops — quartz", qty: "40", unit: "sqft", unitCost: "85" },
        { desc: "Backsplash tile", qty: "30", unit: "sqft", unitCost: "18" },
      ]},
      { name: "Plumbing", items: [
        { desc: "Rough-in (sink relocation)", qty: "1", unit: "job", unitCost: "1800" },
        { desc: "Sink + faucet install", qty: "1", unit: "ea", unitCost: "450" },
        { desc: "Dishwasher hookup", qty: "1", unit: "ea", unitCost: "250" },
      ]},
      { name: "Electrical", items: [
        { desc: "New circuits (GFCI outlets)", qty: "4", unit: "ea", unitCost: "175" },
        { desc: "Under-cabinet lighting", qty: "1", unit: "job", unitCost: "600" },
        { desc: "Recessed lights", qty: "6", unit: "ea", unitCost: "125" },
      ]},
      { name: "Flooring", items: [
        { desc: "Tile / LVP flooring", qty: "150", unit: "sqft", unitCost: "8" },
        { desc: "Floor prep & leveling", qty: "1", unit: "job", unitCost: "400" },
      ]},
      { name: "Labor", items: [
        { desc: "General labor", qty: "120", unit: "hr", unitCost: "65" },
      ]},
    ],
  },
  bathroom: {
    sections: [
      { name: "Demo", items: [
        { desc: "Demo existing fixtures & tile", qty: "1", unit: "job", unitCost: "1500" },
        { desc: "Disposal", qty: "1", unit: "job", unitCost: "400" },
      ]},
      { name: "Plumbing", items: [
        { desc: "Rough-in plumbing", qty: "1", unit: "job", unitCost: "2200" },
        { desc: "Fixture install (toilet, sink, shower)", qty: "1", unit: "set", unitCost: "1200" },
      ]},
      { name: "Tile & Surfaces", items: [
        { desc: "Shower tile (walls)", qty: "80", unit: "sqft", unitCost: "14" },
        { desc: "Floor tile", qty: "50", unit: "sqft", unitCost: "10" },
        { desc: "Waterproofing membrane", qty: "1", unit: "job", unitCost: "450" },
      ]},
      { name: "Fixtures & Finishes", items: [
        { desc: "Vanity + mirror", qty: "1", unit: "ea", unitCost: "1800" },
        { desc: "Shower door (frameless)", qty: "1", unit: "ea", unitCost: "900" },
        { desc: "Hardware & accessories", qty: "1", unit: "set", unitCost: "350" },
      ]},
      { name: "Electrical", items: [
        { desc: "GFCI outlets", qty: "2", unit: "ea", unitCost: "150" },
        { desc: "Exhaust fan", qty: "1", unit: "ea", unitCost: "280" },
        { desc: "Vanity lighting", qty: "1", unit: "ea", unitCost: "200" },
      ]},
      { name: "Labor", items: [
        { desc: "General labor", qty: "60", unit: "hr", unitCost: "65" },
      ]},
    ],
  },
  roofing: {
    sections: [
      { name: "Tear-Off", items: [
        { desc: "Remove existing shingles", qty: "30", unit: "sq", unitCost: "75" },
        { desc: "Disposal / dumpster", qty: "1", unit: "job", unitCost: "600" },
      ]},
      { name: "Materials", items: [
        { desc: "Architectural shingles", qty: "30", unit: "sq", unitCost: "120" },
        { desc: "Underlayment (synthetic)", qty: "30", unit: "sq", unitCost: "25" },
        { desc: "Ice & water shield", qty: "6", unit: "sq", unitCost: "55" },
        { desc: "Ridge vent", qty: "40", unit: "lf", unitCost: "8" },
        { desc: "Drip edge & flashing", qty: "1", unit: "job", unitCost: "450" },
      ]},
      { name: "Labor", items: [
        { desc: "Roofing crew", qty: "30", unit: "sq", unitCost: "85" },
        { desc: "Cleanup", qty: "1", unit: "job", unitCost: "300" },
      ]},
    ],
  },
  painting: {
    sections: [
      { name: "Prep", items: [
        { desc: "Wall prep (patch, sand, prime)", qty: "1", unit: "job", unitCost: "600" },
        { desc: "Masking & protection", qty: "1", unit: "job", unitCost: "200" },
      ]},
      { name: "Materials", items: [
        { desc: "Paint (premium)", qty: "12", unit: "gal", unitCost: "55" },
        { desc: "Primer", qty: "4", unit: "gal", unitCost: "35" },
        { desc: "Supplies (rollers, tape, etc.)", qty: "1", unit: "set", unitCost: "120" },
      ]},
      { name: "Labor", items: [
        { desc: "Painting labor", qty: "40", unit: "hr", unitCost: "55" },
        { desc: "Trim & detail work", qty: "12", unit: "hr", unitCost: "65" },
      ]},
    ],
  },
  concrete: {
    sections: [
      { name: "Site Prep", items: [
        { desc: "Demo existing concrete", qty: "800", unit: "sqft", unitCost: "3" },
        { desc: "Grading & compaction", qty: "800", unit: "sqft", unitCost: "1.50" },
        { desc: "Gravel base (4\")", qty: "10", unit: "cuyd", unitCost: "45" },
      ]},
      { name: "Concrete", items: [
        { desc: "Concrete (4000 PSI)", qty: "12", unit: "cuyd", unitCost: "165" },
        { desc: "Rebar / wire mesh", qty: "800", unit: "sqft", unitCost: "1.25" },
        { desc: "Forms & stakes", qty: "1", unit: "job", unitCost: "400" },
        { desc: "Finishing (broom / stamp)", qty: "800", unit: "sqft", unitCost: "2" },
      ]},
      { name: "Labor", items: [
        { desc: "Concrete crew", qty: "24", unit: "hr", unitCost: "75" },
      ]},
    ],
  },
};

const TEMPLATE_OPTIONS = [
  { value: "custom", label: "Blank / Custom" },
  { value: "kitchen", label: "Kitchen Remodel" },
  { value: "bathroom", label: "Bathroom Renovation" },
  { value: "roofing", label: "Roof Replacement" },
  { value: "painting", label: "Interior Painting" },
  { value: "concrete", label: "Concrete / Flatwork" },
  { value: "deck", label: "Deck Build" },
  { value: "fencing", label: "Fence Install" },
  { value: "flooring", label: "Flooring Install" },
  { value: "hvac", label: "HVAC System" },
  { value: "electrical", label: "Electrical Panel Upgrade" },
  { value: "plumbing", label: "Plumbing Repipe" },
  { value: "siding", label: "Siding Replacement" },
  { value: "drywall", label: "Drywall Repair / Hang" },
  { value: "landscaping", label: "Landscaping" },
  { value: "demo", label: "Demolition" },
];

const UNIT_OPTIONS = ["ea", "sqft", "lf", "sq", "cuyd", "gal", "hr", "day", "job", "set"];

interface CalcItem { desc: string; qty: string; unit: string; unitCost: string }
interface CalcSection { name: string; items: CalcItem[] }

function CalculatorTab() {
  const [calcMode, setCalcMode] = useState<"estimate" | "material" | "labor" | "markup" | "sqft">("estimate");
  const [template, setTemplate] = useState("custom");
  const [sections, setSections] = useState<CalcSection[]>(
    JSON.parse(JSON.stringify(JOB_TEMPLATES.custom.sections))
  );
  const [margin, setMargin] = useState("20");
  const [wasteFactor, setWasteFactor] = useState("10");
  const [taxRate, setTaxRate] = useState("8.25");
  const [permitCost, setPermitCost] = useState("");
  const [contingency, setContingency] = useState("5");

  // Material calculator state
  const [materialType, setMaterialType] = useState("flooring");
  const [materialSqft, setMaterialSqft] = useState("");
  const [concLength, setConcLength] = useState("");
  const [concWidth, setConcWidth] = useState("");
  const [concDepth, setConcDepth] = useState("");

  // Labor calculator state
  const [numWorkers, setNumWorkers] = useState("2");
  const [hourlyRate, setHourlyRate] = useState("35");
  const [estDays, setEstDays] = useState("5");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [overtimeEnabled, setOvertimeEnabled] = useState(false);

  // Markup/Margin calculator state
  const [markupCost, setMarkupCost] = useState("");
  const [markupPct, setMarkupPct] = useState("30");
  const [markupMode, setMarkupMode] = useState<"markup" | "margin">("markup");

  // Per Sq Ft calculator state
  const [sqftTotalCost, setSqftTotalCost] = useState("");
  const [sqftTotal, setSqftTotal] = useState("");

  const loadTemplate = (key: string) => {
    setTemplate(key);
    const tpl = JOB_TEMPLATES[key];
    if (tpl) setSections(JSON.parse(JSON.stringify(tpl.sections)));
  };

  const updateItem = (si: number, ii: number, field: keyof CalcItem, value: string) => {
    setSections((prev) =>
      prev.map((sec, s) =>
        s === si
          ? { ...sec, items: sec.items.map((item, i) => (i === ii ? { ...item, [field]: value } : item)) }
          : sec
      )
    );
  };

  const addItem = (si: number) => {
    setSections((prev) =>
      prev.map((sec, s) =>
        s === si ? { ...sec, items: [...sec.items, { desc: "", qty: "1", unit: "ea", unitCost: "" }] } : sec
      )
    );
  };

  const removeItem = (si: number, ii: number) => {
    setSections((prev) =>
      prev.map((sec, s) =>
        s === si ? { ...sec, items: sec.items.filter((_, i) => i !== ii) } : sec
      )
    );
  };

  const addSection = () => {
    setSections((prev) => [...prev, { name: "New Section", items: [{ desc: "", qty: "1", unit: "ea", unitCost: "" }] }]);
  };

  const removeSection = (si: number) => {
    setSections((prev) => prev.filter((_, i) => i !== si));
  };

  const renameSection = (si: number, name: string) => {
    setSections((prev) => prev.map((sec, i) => (i === si ? { ...sec, name } : sec)));
  };

  const itemTotal = (item: CalcItem) => (parseFloat(item.qty) || 0) * (parseFloat(item.unitCost) || 0);

  const sectionTotal = (sec: CalcSection) => sec.items.reduce((sum, item) => sum + itemTotal(item), 0);

  const materialsSubtotal = sections.reduce((sum, sec) => sum + sectionTotal(sec), 0);
  const wasteAmt = materialsSubtotal * ((parseFloat(wasteFactor) || 0) / 100);
  const subtotalWithWaste = materialsSubtotal + wasteAmt;
  const tax = subtotalWithWaste * ((parseFloat(taxRate) || 0) / 100);
  const permits = parseFloat(permitCost) || 0;
  const subtotalBeforeMargin = subtotalWithWaste + tax + permits;
  const contingencyAmt = subtotalBeforeMargin * ((parseFloat(contingency) || 0) / 100);
  const subtotalWithContingency = subtotalBeforeMargin + contingencyAmt;
  const marginPct = parseFloat(margin) || 0;
  const marginAmt = subtotalWithContingency * (marginPct / 100);
  const grandTotal = subtotalWithContingency + marginAmt;

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const allItems = sections.flatMap((s) => s.items.filter((i) => i.desc && parseFloat(i.unitCost) > 0));

  const inputBase = "w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow tabular-nums";

  // Material calculator results
  const matSqft = parseFloat(materialSqft) || 0;
  const materialResults = (() => {
    switch (materialType) {
      case "flooring": {
        const withWaste = matSqft * 1.1;
        return [
          { label: "Tile (16 sqft/box)", value: `${Math.ceil(withWaste / 16)} boxes` },
          { label: "LVP (24 sqft/carton)", value: `${Math.ceil(withWaste / 24)} cartons` },
          { label: "Hardwood (20 sqft/box)", value: `${Math.ceil(withWaste / 20)} boxes` },
          { label: "Includes 10% waste", value: `${Math.round(withWaste)} sqft total` },
        ];
      }
      case "drywall": {
        const sheets = Math.ceil(matSqft / 32);
        return [
          { label: "4x8 Sheets", value: `${sheets} sheets` },
          { label: "Tape (linear ft)", value: `${Math.round(sheets * 12)} ft` },
          { label: "Joint compound", value: `${Math.ceil(sheets / 8)} buckets` },
        ];
      }
      case "paint": {
        const gallons = Math.ceil((matSqft * 2) / 400);
        const primer = Math.ceil(matSqft / 400);
        return [
          { label: "Paint (2 coats, 400 sqft/gal)", value: `${gallons} gallons` },
          { label: "Primer (1 coat)", value: `${primer} gallons` },
        ];
      }
      case "concrete": {
        const l = parseFloat(concLength) || 0;
        const w = parseFloat(concWidth) || 0;
        const d = parseFloat(concDepth) || 0;
        const cubicYards = (l * w * (d / 12)) / 27;
        return [
          { label: "Dimensions", value: `${l}' x ${w}' x ${d}"` },
          { label: "Cubic yards needed", value: cubicYards > 0 ? `${cubicYards.toFixed(2)} cu yd` : "---" },
        ];
      }
      case "roofing": {
        const squares = matSqft / 100;
        return [
          { label: "Squares", value: `${squares.toFixed(1)} squares` },
          { label: "Shingle bundles (3/square)", value: `${Math.ceil(squares * 3)} bundles` },
          { label: "Underlayment rolls", value: `${Math.ceil(squares / 2.2)} rolls` },
        ];
      }
      default:
        return [];
    }
  })();

  // Labor calculator results
  const workers = parseFloat(numWorkers) || 0;
  const rate = parseFloat(hourlyRate) || 0;
  const days = parseFloat(estDays) || 0;
  const hpd = parseFloat(hoursPerDay) || 0;
  const totalLaborHours = workers * days * hpd;
  const regularHoursPerDay = Math.min(hpd, 8);
  const overtimeHoursPerDay = overtimeEnabled ? Math.max(hpd - 8, 0) : 0;
  const dailyCostPerWorker = (regularHoursPerDay * rate) + (overtimeHoursPerDay * rate * 1.5);
  const totalLaborCost = workers * days * dailyCostPerWorker;
  const costPerDay = workers * dailyCostPerWorker;

  // Markup/Margin calculator results
  const cost = parseFloat(markupCost) || 0;
  const pct = parseFloat(markupPct) || 0;
  const markupCalc = (() => {
    if (cost <= 0 || pct <= 0) return null;
    if (markupMode === "markup") {
      const sellPrice = cost * (1 + pct / 100);
      const profit = sellPrice - cost;
      const effectiveMargin = (profit / sellPrice) * 100;
      return { sellPrice, profit, effectiveMarkup: pct, effectiveMargin, formula: `Sell = Cost x (1 + Markup%) = ${formatCurrency(cost)} x ${(1 + pct / 100).toFixed(3)}` };
    } else {
      const sellPrice = cost / (1 - pct / 100);
      const profit = sellPrice - cost;
      const effectiveMarkup = (profit / cost) * 100;
      return { sellPrice, profit, effectiveMarkup, effectiveMargin: pct, formula: `Sell = Cost / (1 - Margin%) = ${formatCurrency(cost)} / ${(1 - pct / 100).toFixed(3)}` };
    }
  })();

  // Per sqft calculator
  const sqftCost = parseFloat(sqftTotalCost) || 0;
  const sqftArea = parseFloat(sqftTotal) || 0;
  const costPerSqft = sqftArea > 0 ? sqftCost / sqftArea : 0;

  const SQFT_RANGES = [
    { type: "Kitchen remodel", low: 75, high: 250 },
    { type: "Bathroom remodel", low: 125, high: 350 },
    { type: "Room addition", low: 100, high: 400 },
    { type: "Painting (interior)", low: 2, high: 6 },
    { type: "Flooring", low: 3, high: 15 },
    { type: "Roofing", low: 4, high: 12 },
    { type: "Concrete", low: 6, high: 20 },
    { type: "Deck", low: 15, high: 45 },
  ];

  return (
    <div>
      {/* Calculator mode tabs */}
      <div className="border-b border-border mb-5">
        <div className="flex">
          {[
            { id: "estimate", label: "Full Estimate" },
            { id: "material", label: "Material Calc" },
            { id: "labor", label: "Labor Hours" },
            { id: "markup", label: "Markup / Margin" },
            { id: "sqft", label: "Per Sq Ft" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCalcMode(tab.id as typeof calcMode)}
              className={cn(
                "px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px",
                calcMode === tab.id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material Calculator */}
      {calcMode === "material" && (
        <div className="max-w-xl space-y-5">
          <div>
            <p className="text-[15px] font-bold text-gray-900 mb-1">Material Calculator</p>
            <p className="text-[12px] text-gray-400 mb-4">Quick quantities for common materials</p>
            <label className="text-[11px] font-semibold text-gray-900 block mb-1">Material Type</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="h-11 w-full max-w-sm rounded-lg border border-gray-200 bg-white px-3.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
            >
              <option value="flooring">Flooring</option>
              <option value="drywall">Drywall</option>
              <option value="paint">Paint</option>
              <option value="concrete">Concrete</option>
              <option value="roofing">Roofing</option>
            </select>
          </div>

          {materialType === "concrete" ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-900 block mb-1">Length (ft)</label>
                <input type="number" min="0" value={concLength} onChange={(e) => setConcLength(e.target.value)} placeholder="0" className={inputBase} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-900 block mb-1">Width (ft)</label>
                <input type="number" min="0" value={concWidth} onChange={(e) => setConcWidth(e.target.value)} placeholder="0" className={inputBase} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-900 block mb-1">Depth (inches)</label>
                <input type="number" min="0" value={concDepth} onChange={(e) => setConcDepth(e.target.value)} placeholder="4" className={inputBase} />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-semibold text-gray-900 block mb-1">
                {materialType === "drywall" ? "Wall Area (sqft)" : materialType === "roofing" ? "Roof Area (sqft)" : "Square Footage"}
              </label>
              <input type="number" min="0" value={materialSqft} onChange={(e) => setMaterialSqft(e.target.value)} placeholder="0" className={cn(inputBase, "max-w-[200px]")} />
            </div>
          )}

          {(matSqft > 0 || (materialType === "concrete" && (parseFloat(concLength) || 0) > 0)) && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-[13px] font-bold text-gray-900">Results</p>
              </div>
              <div className="divide-y divide-gray-100">
                {materialResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] text-gray-600">{r.label}</span>
                    <span className="text-[14px] font-bold text-gray-900 tabular-nums">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Labor Hours Calculator */}
      {calcMode === "labor" && (
        <div className="max-w-xl space-y-5">
          <div>
            <p className="text-[15px] font-bold text-gray-900 mb-1">Labor Hours Calculator</p>
            <p className="text-[12px] text-gray-400 mb-4">Calculate total labor cost for a crew</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-900 block mb-1">Number of Workers</label>
              <input type="number" min="1" value={numWorkers} onChange={(e) => setNumWorkers(e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-900 block mb-1">Hourly Rate ($)</label>
              <input type="number" min="0" step="0.50" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-900 block mb-1">Estimated Days</label>
              <input type="number" min="1" value={estDays} onChange={(e) => setEstDays(e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-900 block mb-1">Hours Per Day</label>
              <input type="number" min="1" max="16" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} className={inputBase} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOvertimeEnabled(!overtimeEnabled)}
              className={cn(
                "w-10 h-5 rounded-full transition-colors relative",
                overtimeEnabled ? "bg-brand-600" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                overtimeEnabled ? "translate-x-5" : "translate-x-0.5"
              )} />
            </button>
            <span className="text-[13px] text-gray-600">Overtime (1.5x after 8 hrs/day)</span>
          </div>

          {totalLaborHours > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-[13px] font-bold text-gray-900">Breakdown</p>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-gray-600">Total labor hours</span>
                  <span className="text-[14px] font-bold text-gray-900 tabular-nums">{totalLaborHours.toLocaleString()} hrs</span>
                </div>
                {overtimeEnabled && overtimeHoursPerDay > 0 && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] text-gray-600">Overtime hours/day (per worker)</span>
                    <span className="text-[14px] font-bold text-amber-600 tabular-nums">{overtimeHoursPerDay} hrs at 1.5x</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-gray-600">Cost per day</span>
                  <span className="text-[14px] font-bold text-gray-900 tabular-nums">{formatCurrency(costPerDay)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
                  <span className="text-[13px] font-bold text-white">Total labor cost</span>
                  <span className="text-[18px] font-bold text-white tabular-nums">{formatCurrency(totalLaborCost)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Markup / Margin Calculator */}
      {calcMode === "markup" && (
        <div className="max-w-xl space-y-5">
          <div>
            <p className="text-[15px] font-bold text-gray-900 mb-1">Markup / Margin Calculator</p>
            <p className="text-[12px] text-gray-400 mb-4">Know your numbers -- markup and margin are not the same thing</p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-900 block mb-1">Your Cost</label>
            <div className="relative max-w-[200px]">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-[12px]">$</span>
              <input type="number" min="0" step="0.01" value={markupCost} onChange={(e) => setMarkupCost(e.target.value)} placeholder="0.00" className={cn(inputBase, "pl-6")} />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setMarkupMode("markup")}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-medium transition-colors border",
                markupMode === "markup" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              Markup %
            </button>
            <button
              onClick={() => setMarkupMode("margin")}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-medium transition-colors border",
                markupMode === "margin" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              Margin %
            </button>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-900 block mb-1">
              Desired {markupMode === "markup" ? "Markup" : "Margin"} %
            </label>
            <div className="relative max-w-[200px]">
              <input type="number" min="0" max="99" value={markupPct} onChange={(e) => setMarkupPct(e.target.value)} className={cn(inputBase, "pr-7")} />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-[12px]">%</span>
            </div>
          </div>

          {markupCalc && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-[13px] font-bold text-gray-900">Results</p>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
                  <span className="text-[13px] font-bold text-white">Sell Price</span>
                  <span className="text-[18px] font-bold text-white tabular-nums">{formatCurrency(markupCalc.sellPrice)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-gray-600">Profit</span>
                  <span className="text-[14px] font-bold text-brand-600 tabular-nums">{formatCurrency(markupCalc.profit)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-gray-600">Effective Markup</span>
                  <span className="text-[14px] font-bold text-gray-900 tabular-nums">{markupCalc.effectiveMarkup.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-gray-600">Effective Margin</span>
                  <span className="text-[14px] font-bold text-gray-900 tabular-nums">{markupCalc.effectiveMargin.toFixed(1)}%</span>
                </div>
                <div className="px-4 py-3 bg-gray-50">
                  <p className="text-[11px] text-gray-500 font-mono">{markupCalc.formula}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Per Sq Ft Calculator */}
      {calcMode === "sqft" && (
        <div className="max-w-xl space-y-5">
          <div>
            <p className="text-[15px] font-bold text-gray-900 mb-1">Cost Per Square Foot</p>
            <p className="text-[12px] text-gray-400 mb-4">See how your price stacks up against typical ranges</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-900 block mb-1">Total Project Cost</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-[12px]">$</span>
                <input type="number" min="0" value={sqftTotalCost} onChange={(e) => setSqftTotalCost(e.target.value)} placeholder="0" className={cn(inputBase, "pl-6")} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-900 block mb-1">Total Square Footage</label>
              <input type="number" min="0" value={sqftTotal} onChange={(e) => setSqftTotal(e.target.value)} placeholder="0" className={inputBase} />
            </div>
          </div>

          {costPerSqft > 0 && (
            <div className="bg-gray-900 rounded-lg px-5 py-4 flex items-center justify-between">
              <span className="text-[13px] font-bold text-white">Your Cost Per Sq Ft</span>
              <span className="text-[24px] font-bold text-white tabular-nums">${costPerSqft.toFixed(2)}</span>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <p className="text-[13px] font-bold text-gray-900">Typical $/sqft by Project Type</p>
            </div>
            <div className="divide-y divide-gray-100">
              {SQFT_RANGES.map((r) => (
                <div key={r.type} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[13px] text-gray-600">{r.type}</span>
                  <span className="text-[13px] font-semibold text-gray-900 tabular-nums">${r.low} - ${r.high}/sqft</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Estimate Calculator (existing) */}
      {calcMode === "estimate" && (
    <div className="flex gap-6 items-start">
      {/* Left: Calculator Form */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Template selector */}
        <div>
          <p className="text-[15px] font-bold text-gray-900 mb-1">Job Template</p>
          <p className="text-[12px] text-gray-400 mb-3">Start from a template or build from scratch</p>
          <select
            value={template}
            onChange={(e) => loadTemplate(e.target.value)}
            className="h-11 w-full max-w-sm rounded-lg border border-gray-200 bg-white px-3.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          >
            {TEMPLATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Sections */}
        {sections.map((sec, si) => (
          <div key={si} className="rounded-xl ring-1 ring-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
              <input
                value={sec.name}
                onChange={(e) => renameSection(si, e.target.value)}
                className="text-[13px] font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0"
              />
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-gray-900 tabular-nums">{formatCurrency(sectionTotal(sec))}</span>
                {sections.length > 1 && (
                  <button onClick={() => removeSection(si)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px_85px_80px_32px] gap-1.5 px-4 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-center">Unit</span>
              <span className="text-right">Cost</span>
              <span className="text-right">Total</span>
              <span />
            </div>
            {sec.items.map((item, ii) => (
              <div key={ii} className="grid grid-cols-[1fr_60px_60px_85px_80px_32px] gap-1.5 px-4 py-1 items-center border-t border-gray-100">
                <input value={item.desc} onChange={(e) => updateItem(si, ii, "desc", e.target.value)} placeholder="Item..." className={inputBase} />
                <input type="number" min="0" value={item.qty} onChange={(e) => updateItem(si, ii, "qty", e.target.value)} className={cn(inputBase, "text-right px-2")} />
                <select value={item.unit} onChange={(e) => updateItem(si, ii, "unit", e.target.value)} className="h-9 text-[11px] text-center rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent">
                  {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[11px]">$</span>
                  <input type="number" min="0" step="0.01" value={item.unitCost} onChange={(e) => updateItem(si, ii, "unitCost", e.target.value)} className={cn(inputBase, "text-right pl-5 pr-2")} />
                </div>
                <span className="text-[13px] font-semibold text-gray-900 text-right tabular-nums">{itemTotal(item) > 0 ? formatCurrency(itemTotal(item)) : "—"}</span>
                <button onClick={() => removeItem(si, ii)} disabled={sec.items.length === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-20">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div className="px-4 py-2.5 border-t border-gray-100">
              <button onClick={() => addItem(si)} className="text-[13px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
          </div>
        ))}

        <button onClick={addSection} className="text-[13px] font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
          <Plus className="w-4 h-4" /> Add Section
        </button>

        {/* Adjustments */}
        <div>
          <p className="text-[15px] font-bold text-gray-900 mb-3">Adjustments</p>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Waste", value: wasteFactor, set: setWasteFactor, suffix: "%" },
              { label: "Tax", value: taxRate, set: setTaxRate, suffix: "%" },
              { label: "Permits", value: permitCost, set: setPermitCost, prefix: "$" },
              { label: "Contingency", value: contingency, set: setContingency, suffix: "%" },
              { label: "Margin", value: margin, set: setMargin, suffix: "%" },
            ].map((adj) => (
              <div key={adj.label}>
                <label className="text-[11px] font-semibold text-gray-900 block mb-1">{adj.label}</label>
                <div className="relative">
                  {adj.prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-[12px]">{adj.prefix}</span>}
                  <input
                    type="number" min="0" value={adj.value}
                    onChange={(e) => adj.set(e.target.value)}
                    className={cn(inputBase, "h-10", adj.prefix ? "pl-6" : "", adj.suffix ? "pr-7" : "")}
                  />
                  {adj.suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-[12px]">{adj.suffix}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 pb-8">
          <Button className="gap-2 h-11 px-6 text-[14px]">
            <FileText className="w-4 h-4" />
            Convert to Estimate
          </Button>
          <p className="text-[12px] text-gray-400">Pre-fills a new estimate with these line items and totals.</p>
        </div>
      </div>

      {/* Right: Live Breakdown */}
      <div className="w-[340px] flex-shrink-0 sticky top-0">
        <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Live Breakdown</p>
        <div className="bg-white rounded-lg shadow-[0_4px_30px_-6px_rgba(0,0,0,0.15)] ring-1 ring-gray-200/80 overflow-hidden">
          <div className="h-1.5 bg-brand-600" />
          <div className="px-5 pt-4 pb-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <NextImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100" />
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Johnson & Sons</p>
                  <p className="text-[8px] text-gray-400">Cost Calculator</p>
                </div>
              </div>
              <p className="text-[9px] text-gray-400">{today}</p>
            </div>

            {/* Section breakdown */}
            <div className="space-y-2 mb-4">
              {sections.map((sec, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-900">{sec.name}</span>
                    <span className="text-[12px] font-bold text-gray-900 tabular-nums">{formatCurrency(sectionTotal(sec))}</span>
                  </div>
                  <div className="ml-2 mt-0.5 space-y-0.5">
                    {sec.items.filter((i) => i.desc && parseFloat(i.unitCost) > 0).map((item, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-400 truncate mr-2">{item.desc}</span>
                        <span className="text-[9px] text-gray-500 tabular-nums flex-shrink-0">{formatCurrency(itemTotal(item))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-200 mb-3" />

            {/* Totals */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-900 tabular-nums">{formatCurrency(materialsSubtotal)}</span>
              </div>
              {wasteAmt > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Waste ({wasteFactor}%)</span>
                  <span className="text-gray-500 tabular-nums">+{formatCurrency(wasteAmt)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Tax ({taxRate}%)</span>
                  <span className="text-gray-500 tabular-nums">+{formatCurrency(tax)}</span>
                </div>
              )}
              {permits > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Permits</span>
                  <span className="text-gray-500 tabular-nums">+{formatCurrency(permits)}</span>
                </div>
              )}
              {contingencyAmt > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Contingency ({contingency}%)</span>
                  <span className="text-gray-500 tabular-nums">+{formatCurrency(contingencyAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Margin ({marginPct}%)</span>
                <span className="text-brand-600 font-semibold tabular-nums">+{formatCurrency(marginAmt)}</span>
              </div>
            </div>

            {/* Bid price */}
            <div className="flex justify-between py-3 px-3 bg-gray-900 rounded-lg">
              <span className="text-[13px] font-bold text-white">Bid Price</span>
              <span className="text-[18px] font-bold text-white tabular-nums">{formatCurrency(grandTotal)}</span>
            </div>

            {/* Margin insight */}
            <div className="mt-3 text-center">
              <p className="text-[10px] text-gray-400">Your profit: <span className="font-bold text-brand-600">{formatCurrency(marginAmt)}</span> ({marginPct}% margin)</p>
              {materialsSubtotal > 0 && <p className="text-[9px] text-gray-400 mt-0.5">Markup on cost: {((grandTotal / materialsSubtotal - 1) * 100).toFixed(1)}%</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
      )}
    </div>
  );
}

// ─── Estimate Agent ──────────────────────────────────────────────────────────

interface AgentMessage {
  id: string;
  role: "user" | "agent" | "tool";
  content: string;
  timestamp: string;
  toolName?: string;
  toolStatus?: "running" | "complete";
  attachments?: { name: string; type: string }[];
}

const TOOL_LABELS: Record<string, { label: string; icon: string }> = {
  generate_estimate_pdf: { label: "Generating Estimate", icon: "FileText" },
  generate_change_order: { label: "Creating Change Order", icon: "FileText" },
  calculate_material_takeoff: { label: "Calculating Materials", icon: "Wrench" },
  calculate_markup_margin: { label: "Calculating Pricing", icon: "DollarSign" },
  lookup_building_code: { label: "Looking Up Code", icon: "FileText" },
  generate_punch_list: { label: "Building Punch List", icon: "CheckCircle2" },
  generate_project_schedule: { label: "Creating Schedule", icon: "Calendar" },
  generate_proposal: { label: "Writing Proposal", icon: "FileText" },
};

const STARTER_PROMPTS = [
  "I need an estimate for a kitchen remodel — 200 sqft, full gut, Austin TX",
  "What's the material cost for a 30-square roof replacement?",
  "Help me price a bathroom renovation with custom tile work",
  "Build me a change order for adding recessed lighting",
  "What are the code requirements for a residential deck in Texas?",
  "Calculate markup and margin for a $45,000 job",
];

function ProGate({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="h-[calc(100vh-180px)] overflow-y-auto">
      {/* Hero */}
      <div className="pt-4 pb-8 mb-6 border-b border-gray-200">
        <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wider mb-4">Pro Feature</p>
        <h2 className="text-[38px] font-bold text-gray-900 tracking-tight leading-tight mb-3">
          Estimate Agent
        </h2>
        <p className="text-[17px] text-gray-400 leading-relaxed mb-8 max-w-[520px]">
          Tell it what you need. Get a full estimate back. Voice, text, or upload — it handles everything.
        </p>
        <div className="flex items-center gap-5">
          <button
            onClick={onUnlock}
            className="h-12 px-8 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-bold transition-colors"
          >
            Start 14-Day Free Trial
          </button>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-gray-900 tabular-nums">$49</span>
            <span className="text-[14px] text-gray-400">/mo after trial</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[
          { title: "Voice & Text", desc: "Describe your project hands-free on the job site or type it out at your desk" },
          { title: "Instant Estimates", desc: "Full line-item breakdowns with current material pricing and labor rates" },
          { title: "Material Takeoffs", desc: "Automated quantity calculations with waste factors and supplier notes" },
          { title: "Building Codes", desc: "IRC code requirements for Texas — footings, guardrails, electrical, structural" },
          { title: "Change Orders", desc: "Scope changes mid-project get turned into professional documents instantly" },
          { title: "Markup & Margin", desc: "Real margin math — never confuse markup percentage with actual profit again" },
        ].map((feat) => (
          <div key={feat.title} className="py-4">
            <p className="text-[16px] font-bold text-gray-900 mb-1.5">{feat.title}</p>
            <p className="text-[13px] text-gray-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      {/* Social proof bar */}
      <div className="flex items-center gap-8 py-4">
        <div>
          <p className="text-[22px] font-bold text-gray-900 tabular-nums">5,200+</p>
          <p className="text-[12px] text-gray-400">Training estimates</p>
        </div>
        <div>
          <p className="text-[22px] font-bold text-gray-900 tabular-nums">8</p>
          <p className="text-[12px] text-gray-400">Built-in tools</p>
        </div>
        <div>
          <p className="text-[22px] font-bold text-gray-900">Texas</p>
          <p className="text-[12px] text-gray-400">Regional pricing</p>
        </div>
        <div>
          <p className="text-[22px] font-bold text-gray-900">30 sec</p>
          <p className="text-[12px] text-gray-400">Avg estimate time</p>
        </div>
        <div className="ml-auto">
          <p className="text-[12px] text-gray-400">No credit card required. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}

function EstimateAgentTab() {
  const [isPro, setIsPro] = useState(true);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content: "I'm your AI estimation assistant powered by ConstructionAI. I can generate detailed estimates, calculate material takeoffs, look up building codes, create change orders, and more.\n\nTell me about your project — you can type, talk, or upload notes and I'll build the estimate for you.",
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const now = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const callAgent = async (userMsg: string) => {
    setIsThinking(true);

    // Detect tool call from keywords for UI indicator
    const lowerMsg = userMsg.toLowerCase();
    let toolName = "";
    if (lowerMsg.includes("estimate") || lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("how much")) {
      toolName = "generate_estimate_pdf";
    } else if (lowerMsg.includes("material") || lowerMsg.includes("takeoff") || lowerMsg.includes("order")) {
      toolName = "calculate_material_takeoff";
    } else if (lowerMsg.includes("code") || lowerMsg.includes("inspection") || lowerMsg.includes("permit")) {
      toolName = "lookup_building_code";
    } else if (lowerMsg.includes("change order") || lowerMsg.includes("scope change")) {
      toolName = "generate_change_order";
    } else if (lowerMsg.includes("markup") || lowerMsg.includes("margin") || lowerMsg.includes("profit")) {
      toolName = "calculate_markup_margin";
    } else if (lowerMsg.includes("schedule") || lowerMsg.includes("timeline")) {
      toolName = "generate_project_schedule";
    } else if (lowerMsg.includes("punch list") || lowerMsg.includes("closeout")) {
      toolName = "generate_punch_list";
    } else if (lowerMsg.includes("proposal")) {
      toolName = "generate_proposal";
    }

    // Show tool indicator
    if (toolName) {
      setMessages((prev) => [...prev, {
        id: `tool-${Date.now()}`,
        role: "tool",
        content: TOOL_LABELS[toolName]?.label || "Processing",
        timestamp: now(),
        toolName,
        toolStatus: "running",
      }]);
    }

    try {
      // Call ConstructionAI via Elixir backend (FairGate → RunPod)
      const { estimate, raw } = await api.getAIEstimate(userMsg);
      const response = raw || (estimate ? JSON.stringify(estimate, null, 2) : "I couldn't generate a response. Could you provide more details about the project?");

      // Mark tool as complete
      if (toolName) {
        setMessages((prev) => prev.map((m) =>
          m.toolName === toolName && m.toolStatus === "running"
            ? { ...m, toolStatus: "complete" as const }
            : m
        ));
      }

      setMessages((prev) => [...prev, {
        id: `agent-${Date.now()}`,
        role: "agent",
        content: response,
        timestamp: now(),
      }]);
    } catch {
      // Fallback — API not available
      if (toolName) {
        setMessages((prev) => prev.map((m) =>
          m.toolName === toolName && m.toolStatus === "running"
            ? { ...m, toolStatus: "complete" as const }
            : m
        ));
      }

      setMessages((prev) => [...prev, {
        id: `agent-${Date.now()}`,
        role: "agent",
        content: "I'm having trouble connecting to ConstructionAI right now. Please try again in a moment, or provide more details about your project and I'll generate the estimate as soon as the connection is restored.",
        timestamp: now(),
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: now(),
      attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    callAgent(input.trim());
    setInput("");
    setUploadedFiles([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map((f) => ({ name: f.name, type: f.type }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate voice transcription
      setTimeout(() => {
        setInput("I need an estimate for a 1,500 square foot bathroom renovation in Round Rock. Client wants walk-in shower with frameless glass, heated floors, and dual vanity.");
      }, 500);
    } else {
      setIsRecording(true);
    }
  };

  if (!isPro) {
    return <ProGate onUnlock={() => setIsPro(true)} />;
  }

  return (
    <div className="flex h-[calc(100vh-180px)]">
      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0 max-w-4xl">
        {/* Agent header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-gray-900">Estimate Agent</h2>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-brand-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5" />Pro
                </span>
              </div>
              <p className="text-[13px] text-gray-400">Powered by ConstructionAI</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-gray-400">
            <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> Voice</span>
            <span className="flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" /> Upload</span>
            <span className="flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5" /> 8 Tools</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/80 p-5 space-y-5 mb-3">
          {messages.map((msg) => {
            if (msg.role === "tool") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className={cn(
                    "flex items-center gap-2 text-[12px] font-medium px-4 py-2 rounded-full",
                    msg.toolStatus === "complete"
                      ? "bg-brand-50 text-brand-700"
                      : "bg-gray-50 text-gray-500"
                  )}>
                    {msg.toolStatus === "running" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {msg.content}
                  </div>
                </div>
              );
            }

            const isAgent = msg.role === "agent";
            return (
              <div key={msg.id} className={cn("flex gap-3", isAgent ? "items-start" : "items-start flex-row-reverse")}>
                {!isAgent && (
                  <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-700 text-[12px] font-bold">MJ</span>
                  </div>
                )}
                <div className={cn("max-w-[80%]", !isAgent && "items-end")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap",
                    isAgent
                      ? "bg-gray-50 text-gray-800 rounded-tl-md"
                      : "bg-gray-900 text-white rounded-tr-md"
                  )}>
                    {msg.content}
                  </div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.attachments.map((att, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 rounded-lg px-2.5 py-1">
                          {att.type.startsWith("image") ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          {att.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className={cn("text-[11px] text-gray-400 mt-1.5 px-1", !isAgent && "text-right")}>{msg.timestamp}</p>
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[11px] font-bold">AI</span>
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-md px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Uploaded files */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {uploadedFiles.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-700 bg-white ring-1 ring-gray-200 rounded-lg px-3 py-1.5">
                {f.type.startsWith("image") ? <ImageIcon className="w-3.5 h-3.5 text-gray-400" /> : <FileText className="w-3.5 h-3.5 text-gray-400" />}
                {f.name}
                <button onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 ml-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/80 px-4 py-3">
          <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <Paperclip className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={toggleRecording}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-xl transition-colors",
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            )}
          >
            {isRecording ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={isRecording ? "Listening..." : "Describe your project or ask about costs..."}
            className={cn("flex-1 text-[14px] bg-transparent outline-none placeholder:text-gray-300", isRecording && "text-red-500 placeholder:text-red-400")}
            disabled={isRecording}
          />
          <Button onClick={handleSend} disabled={!input.trim() && uploadedFiles.length === 0} className="gap-2 h-10 px-5 rounded-xl">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>

    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function EstimatesPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam === "my-estimates" ? "my-estimates" : tabParam === "calculator" ? "calculator" : "new";

  const [estimates, setEstimates] = useState<Estimate[]>(mockEstimates);

  useEffect(() => {
    fetchEstimates().then(setEstimates);
  }, []);

  const sent = estimates.filter((e) => e.status === "sent" || e.status === "viewed").length;
  const accepted = estimates.filter((e) => e.status === "accepted").length;
  const totalValue = estimates.reduce((sum, e) => sum + e.amount, 0);

  const ESTIMATES_NAV = [
    { id: "new", label: "New Estimate", icon: Plus, pro: false },
    { id: "my-estimates", label: "My Estimates", icon: List, pro: false },
    { id: "calculator", label: "Calculator", icon: Calculator, pro: false },
    { id: "agent", label: "Estimate Agent", icon: Hammer, pro: true },
  ];

  const resolvedDefault = tabParam === "my-estimates" ? "my-estimates" : tabParam === "calculator" ? "calculator" : tabParam === "agent" ? "agent" : "new";
  const [activeSection, setActiveSection] = useState(resolvedDefault);

  const renderSection = () => {
    switch (activeSection) {
      case "agent": return <EstimateAgentTab />;
      case "new": return <NewEstimateTab />;
      case "my-estimates": return <MyEstimatesTab estimates={estimates} />;
      case "calculator": return <CalculatorTab />;
      default: return <EstimateAgentTab />;
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 bg-white border-b border-border">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Estimates</h1>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        <nav className="w-44 flex-shrink-0 bg-white border-r border-border py-3 px-2 overflow-y-auto">
          {ESTIMATES_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const badge = item.id === "my-estimates" ? estimates.length : null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors mb-0.5",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.pro && (
                    <span className={cn("text-[8px] font-bold uppercase tracking-wide px-1 py-0.5 rounded", isActive ? "bg-white/20 text-white" : "bg-brand-100 text-brand-600")}>
                      Pro
                    </span>
                  )}
                </div>
                {badge != null && badge > 0 && (
                  <span className={cn("text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center", isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500")}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

export default function EstimatesPage() {
  return (
    <Suspense>
      <EstimatesPageContent />
    </Suspense>
  );
}
