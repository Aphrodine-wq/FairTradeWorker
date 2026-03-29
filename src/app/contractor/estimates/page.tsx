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
import { usePageTitle } from "@shared/hooks/use-page-title";

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
          <div className="w-9 h-9 rounded-none bg-gray-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-gray-900 truncate">
              {est.jobTitle}
            </p>
            <div className="flex items-center gap-3 mt-0.5 text-[12px] text-gray-600">
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
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="flex items-center justify-end gap-2 mb-3">
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-none border border-border text-[12px] font-medium text-gray-800 hover:bg-gray-50 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-none border border-border text-[12px] font-medium text-gray-800 hover:bg-gray-50 transition-colors">
              <Send className="w-3.5 h-3.5" />
              Send to Client
            </button>
          </div>
          {/* PDF-style document */}
          <div className="bg-white rounded-none shadow-[0_4px_30px_-6px_rgba(0,0,0,0.15)] ring-1 ring-gray-200/80 overflow-hidden max-w-[600px]">
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
                    className="w-11 h-11 rounded-none object-cover ring-2 ring-gray-100"
                  />
                  <div>
                    <p className="text-[14px] font-bold text-gray-900 leading-tight">Johnson & Sons Construction</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">Marcus Johnson — Owner</p>
                    <p className="text-[9px] text-gray-600">TX License #R21445 — Fully Insured</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[24px] font-bold text-gray-900 tracking-tight leading-none">ESTIMATE</p>
                  <p className="text-[11px] text-gray-600 mt-1">EST-{est.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="h-px bg-gray-200 mb-5" />

              {/* Prepared For + From + Dates */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1.5">Prepared For</p>
                  <p className="text-[13px] font-bold text-gray-900">{est.clientName}</p>
                  <p className="text-[10px] text-gray-700 mt-0.5">{est.jobTitle}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1.5">From</p>
                  <p className="text-[10px] text-gray-700 leading-relaxed">
                    Johnson & Sons Construction<br />
                    4200 South Congress Ave<br />
                    Austin, TX 78745<br />
                    (512) 555-0100
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1.5">Details</p>
                  <div className="space-y-1.5">
                    <div>
                      <p className="text-[9px] text-gray-600">Date</p>
                      <p className="text-[11px] font-semibold text-gray-900">{formatDate(est.createdDate)}</p>
                    </div>
                    {est.sentDate && (
                      <div>
                        <p className="text-[9px] text-gray-600">Sent</p>
                        <p className="text-[11px] font-semibold text-gray-900">{formatDate(est.sentDate)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] text-gray-600">Valid For</p>
                      <p className="text-[11px] font-semibold text-gray-900">30 Days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <table className="w-full mb-4">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] px-3 py-2 rounded-none-lg">Description</th>
                    <th className="text-right text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] px-3 py-2 w-[40px]">Qty</th>
                    <th className="text-right text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] px-3 py-2 w-[60px]">Rate</th>
                    <th className="text-right text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] px-3 py-2 w-[70px] rounded-none-lg">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {est.lineItems.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="text-[11px] text-gray-900 px-3 py-2">{item.description}</td>
                      <td className="text-[11px] text-gray-700 px-3 py-2 text-right tabular-nums">{item.quantity}</td>
                      <td className="text-[11px] text-gray-700 px-3 py-2 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-[11px] text-gray-900 font-semibold px-3 py-2 text-right tabular-nums">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="flex justify-end mb-5">
                <div className="w-[200px]">
                  <div className="flex justify-between py-1.5 px-3">
                    <span className="text-[10px] text-gray-600">Subtotal</span>
                    <span className="text-[11px] text-gray-900 tabular-nums">{formatCurrency(est.amount)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 px-3 bg-gray-900 rounded-none mt-1.5">
                    <span className="text-[12px] font-bold text-white">Total</span>
                    <span className="text-[15px] font-bold text-white tabular-nums">{formatCurrency(est.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gray-50 rounded-none px-4 py-3 mb-5">
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1">Terms & Conditions</p>
                <p className="text-[10px] text-gray-700 leading-relaxed">This estimate is valid for 30 days from the date above. A 50% deposit is required to schedule and begin work. Remaining balance is due upon substantial completion. Price is subject to change if project scope changes after acceptance.</p>
              </div>

              {/* Signature lines */}
              <div className="flex gap-6 mb-5">
                <div className="flex-1">
                  <div className="border-b border-gray-300 pb-1 mb-1">
                    <p className="text-[12px] text-gray-900 italic" style={{ fontFamily: 'Georgia, serif' }}>Marcus Johnson</p>
                  </div>
                  <p className="text-[9px] text-gray-600">Contractor Signature</p>
                </div>
                <div className="flex-1">
                  <div className="border-b border-gray-300 pb-1 mb-1">
                    <p className="text-[12px] text-gray-300">&nbsp;</p>
                  </div>
                  <p className="text-[9px] text-gray-600">Client Acceptance</p>
                </div>
                <div className="w-[100px]">
                  <div className="border-b border-gray-300 pb-1 mb-1">
                    <p className="text-[12px] text-gray-300">&nbsp;</p>
                  </div>
                  <p className="text-[9px] text-gray-600">Date</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-[9px] text-gray-600">
                  <p>marcus@johnson.com — (512) 555-0100</p>
                  <p>4200 South Congress Ave, Austin, TX 78745</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-brand-600 flex items-center justify-center">
                    <span className="text-white text-[6px] font-bold">FTW</span>
                  </div>
                  <p className="text-[9px] text-gray-600">FairTradeWorker</p>
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
        <div className="py-12 text-center text-sm text-gray-600">
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

const SAVED_CONTACTS = [
  { name: "Michael Brown", email: "michael@brown.com", phone: "(512) 555-0147" },
  { name: "Sarah Williams", email: "sarah@williams.com", phone: "(210) 555-0293" },
  { name: "Robert Johnson", email: "robert@johnson.com", phone: "(512) 555-0831" },
  { name: "Patricia Taylor", email: "patricia@taylor.com", phone: "(713) 555-0412" },
  { name: "David Park", email: "david@park.com", phone: "(512) 555-0667" },
  { name: "Amanda Torres", email: "amanda@torres.com", phone: "(512) 555-0198" },
  { name: "Chris Martinez", email: "chris@martinez.com", phone: "(512) 555-0544" },
];

function NewEstimateTab() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [showContacts, setShowContacts] = useState(false);
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

  const inputBase = "w-full h-11 rounded-none border border-gray-200 bg-white px-3.5 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow";
  const selectBase = "h-11 w-full rounded-none border border-gray-200 bg-white px-3.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow appearance-none";
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
                    : "border-transparent text-gray-600 hover:text-gray-800"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-none text-[10px] font-bold flex items-center justify-center",
                  buildStep === step.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
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
            <span className="w-7 h-7 rounded-none bg-brand-600 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">1</span>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-gray-900">Client</p>
              <p className="text-[12px] text-gray-600">Who is this estimate for?</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowContacts(!showContacts)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Import from Contacts
                <ChevronDown className={cn("w-3 h-3 transition-transform", showContacts && "rotate-180")} />
              </button>
              {showContacts && (
                <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 shadow-lg z-20 max-h-64 overflow-y-auto">
                  {SAVED_CONTACTS.filter((c) =>
                    !clientName || c.name.toLowerCase().includes(clientName.toLowerCase())
                  ).map((contact) => (
                    <button
                      key={contact.email}
                      type="button"
                      onClick={() => {
                        setClientName(contact.name);
                        setClientEmail(contact.email);
                        setClientPhone(contact.phone);
                        setShowContacts(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="text-[13px] font-semibold text-gray-900">{contact.name}</p>
                      <p className="text-[11px] text-gray-500">{contact.email} -- {contact.phone}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
            <span className="w-7 h-7 rounded-none bg-brand-600 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">2</span>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Job Details</p>
              <p className="text-[12px] text-gray-600">What work is being estimated?</p>
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
            <span className="w-7 h-7 rounded-none bg-brand-600 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">3</span>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Line Items</p>
              <p className="text-[12px] text-gray-600">Materials, labor, and other charges</p>
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
                        : "border-transparent text-gray-600 hover:text-gray-800"
                    )}
                  >
                    {g}
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px] font-bold rounded-none px-1.5 py-0.5 min-w-[18px] text-center",
                        activeGroup === g ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_60px_90px_80px_36px] xl:grid-cols-[1fr_80px_110px_100px_40px] gap-2 xl:gap-3 px-4 xl:px-5 py-3 bg-gray-50">
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Description</span>
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider text-right">Qty</span>
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider text-right">Rate</span>
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider text-right">Amount</span>
              <span />
            </div>

            {/* Line items for active group */}
            {lineItems.map((item, i) => {
              if (item.group !== activeGroup) return null;
              return (
                <div key={i} className="grid grid-cols-[1fr_60px_90px_80px_36px] xl:grid-cols-[1fr_80px_110px_100px_40px] gap-2 xl:gap-3 px-4 xl:px-5 py-3 items-center border-t border-gray-100">
                  <input
                    value={item.description}
                    onChange={(e) => updateLine(i, "description", e.target.value)}
                    placeholder="What was done or supplied..."
                    className="h-10 rounded-none border border-gray-200 bg-white px-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  />
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateLine(i, "quantity", e.target.value)}
                    className="h-10 rounded-none border border-gray-200 bg-white px-2 text-[14px] text-gray-900 text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[13px]">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
                      className="h-10 w-full rounded-none border border-gray-200 bg-white pl-7 pr-2 text-[14px] text-gray-900 text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>
                  <span className="text-[14px] font-semibold text-gray-900 text-right tabular-nums">
                    {lineTotal(item) > 0 ? formatCurrency(lineTotal(item)) : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    disabled={lineItems.length === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-none text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* Ghost row — type to add */}
            <div className="grid grid-cols-[1fr_60px_90px_80px_36px] xl:grid-cols-[1fr_80px_110px_100px_40px] gap-2 xl:gap-3 px-4 xl:px-5 py-3 items-center border-t border-dashed border-gray-200 bg-gray-50/30">
              <input
                placeholder={`Add ${activeGroup.toLowerCase()} item...`}
                className="h-10 rounded-none border border-dashed border-gray-200 bg-transparent px-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent focus:bg-white focus:border-solid"
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
                <span className="text-[11px] text-gray-600">
                  {lineItems.filter((li) => li.description).length} items across {new Set(lineItems.filter((li) => li.description).map((li) => li.group)).size} categories
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[12px] text-gray-600 font-medium">Total</span>
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
            <div className="flex items-center gap-3 rounded-none bg-gray-50 border border-gray-200 px-4 py-3">
              <BarChart3 className="w-5 h-5 text-brand-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">FairPrice Market Rate</p>
                <p className="text-sm font-bold text-gray-900 tabular-nums">
                  {formatCurrency(fp.low)} &ndash; {formatCurrency(fp.high)}
                </p>
              </div>
              <span className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold rounded-none px-2.5 py-1 border whitespace-nowrap",
                isBelow ? "text-brand-700 bg-brand-50 border-brand-100"
                  : isAbove ? "text-amber-700 bg-amber-50 border-amber-100"
                  : "text-gray-800 bg-white border-gray-200"
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
            <span className="w-7 h-7 rounded-none bg-brand-600 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">4</span>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Terms & Notes</p>
              <p className="text-[12px] text-gray-600">Payment schedule and scope details</p>
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
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the full scope — materials, approach, what's included..." className="w-full rounded-none border border-gray-200 bg-white px-3.5 py-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow resize-none min-h-[80px]" />
          </div>
          <div>
            <label className={labelBase}>Exclusions</label>
            <textarea value={exclusions} onChange={(e) => setExclusions(e.target.value)} placeholder="What is NOT included..." className="w-full rounded-none border border-gray-200 bg-white px-3.5 py-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow resize-none min-h-[60px]" />
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
      <div className="hidden xl:block w-[380px] 2xl:w-[480px] flex-shrink-0 sticky top-0">
        <p className="text-[12px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Live Preview</p>
        <div className="bg-white rounded-none shadow-[0_4px_30px_-6px_rgba(0,0,0,0.15)] ring-1 ring-gray-200/80 overflow-hidden transform scale-[0.95] origin-top-right">
          {/* Accent bar */}
          <div className="h-1.5 bg-brand-600" />
          <div className="px-6 pt-4 pb-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <NextImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" alt="" width={36} height={36} className="w-9 h-9 rounded-none object-cover ring-2 ring-gray-100" />
                <div>
                  <p className="text-[12px] font-bold text-gray-900">Johnson & Sons Construction</p>
                  <p className="text-[8px] text-gray-600">Marcus Johnson — TX #R21445</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[18px] font-bold text-gray-900 leading-none">ESTIMATE</p>
                <p className="text-[9px] text-gray-600 mt-0.5">{today}</p>
              </div>
            </div>

            <div className="h-px bg-gray-200 mb-3" />

            {/* Client + Job */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[7px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-0.5">Prepared For</p>
                <p className="text-[11px] font-bold text-gray-900">{clientName || "Client Name"}</p>
                <p className="text-[9px] text-gray-600">{jobTitle || "Job Title"}</p>
                {jobAddress && <p className="text-[8px] text-gray-600 mt-0.5">{jobAddress}</p>}
              </div>
              <div className="text-right">
                {category && <p className="text-[9px] text-gray-600">{category}</p>}
                {timeline && <p className="text-[9px] text-gray-600">{TIMELINE_OPTIONS.find((o) => o.value === timeline)?.label}</p>}
                {startDate && <p className="text-[9px] text-gray-600">Start: {startDate}</p>}
              </div>
            </div>

            {/* Line items */}
            {filledItems.length > 0 ? (
              <>
                <table className="w-full mb-3">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-[7px] font-bold text-gray-600 uppercase tracking-[0.1em] px-2 py-1.5 rounded-none">Item</th>
                      <th className="text-right text-[7px] font-bold text-gray-600 uppercase tracking-[0.1em] px-2 py-1.5 w-[30px]">Qty</th>
                      <th className="text-right text-[7px] font-bold text-gray-600 uppercase tracking-[0.1em] px-2 py-1.5 w-[50px]">Rate</th>
                      <th className="text-right text-[7px] font-bold text-gray-600 uppercase tracking-[0.1em] px-2 py-1.5 w-[55px] rounded-none">Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filledItems.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="text-[9px] text-gray-900 px-2 py-1.5">{item.description}</td>
                        <td className="text-[9px] text-gray-600 px-2 py-1.5 text-right tabular-nums">{item.quantity}</td>
                        <td className="text-[9px] text-gray-600 px-2 py-1.5 text-right tabular-nums">{formatCurrency(parseFloat(item.unitPrice) || 0)}</td>
                        <td className="text-[9px] text-gray-900 font-semibold px-2 py-1.5 text-right tabular-nums">{formatCurrency(lineTotal(item))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mb-3">
                  <div className="flex justify-between py-2 px-2.5 bg-gray-900 rounded-none w-[140px]">
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
              <div className="bg-gray-50 rounded-none px-3 py-2 mb-3">
                <p className="text-[7px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-0.5">Terms</p>
                <p className="text-[8px] text-gray-700 leading-relaxed">{PAYMENT_LABELS[paymentTerms]}{notes ? `. ${notes}` : ""}</p>
                {exclusions && (
                  <>
                    <p className="text-[7px] font-bold text-gray-600 uppercase tracking-[0.1em] mt-1.5 mb-0.5">Exclusions</p>
                    <p className="text-[8px] text-gray-700 leading-relaxed">{exclusions}</p>
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
                <p className="text-[7px] text-gray-600">Contractor</p>
              </div>
              <div className="flex-1">
                <div className="border-b border-gray-300 pb-0.5 mb-0.5"><p className="text-[10px]">&nbsp;</p></div>
                <p className="text-[7px] text-gray-600">Client Acceptance</p>
              </div>
              <div className="w-[60px]">
                <div className="border-b border-gray-300 pb-0.5 mb-0.5"><p className="text-[10px]">&nbsp;</p></div>
                <p className="text-[7px] text-gray-600">Date</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-[7px] text-gray-600">marcus@johnson.com — (512) 555-0100</p>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-brand-600 flex items-center justify-center">
                  <span className="text-white text-[5px] font-bold">FTW</span>
                </div>
                <p className="text-[7px] text-gray-600">FairTradeWorker</p>
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
        { desc: "Dumpster rental (10 yd)", qty: "1", unit: "ea", unitCost: "450" },
      ]},
      { name: "Cabinets & Countertops", items: [
        { desc: "Cabinets (stock/semi-custom)", qty: "1", unit: "set", unitCost: "8000" },
        { desc: "Cabinet hardware (knobs & pulls)", qty: "30", unit: "ea", unitCost: "12" },
        { desc: "Countertops — quartz", qty: "40", unit: "sqft", unitCost: "85" },
        { desc: "Backsplash tile", qty: "30", unit: "sqft", unitCost: "18" },
        { desc: "Cabinet painting / refinishing", qty: "1", unit: "job", unitCost: "1200" },
      ]},
      { name: "Plumbing", items: [
        { desc: "Rough-in (sink relocation)", qty: "1", unit: "job", unitCost: "1800" },
        { desc: "Sink + faucet install", qty: "1", unit: "ea", unitCost: "450" },
        { desc: "Dishwasher hookup", qty: "1", unit: "ea", unitCost: "250" },
        { desc: "Under-sink plumbing (supply & drain)", qty: "1", unit: "ea", unitCost: "350" },
        { desc: "Garbage disposal install", qty: "1", unit: "ea", unitCost: "275" },
      ]},
      { name: "Electrical", items: [
        { desc: "New circuits (GFCI outlets)", qty: "4", unit: "ea", unitCost: "175" },
        { desc: "Under-cabinet lighting", qty: "1", unit: "job", unitCost: "600" },
        { desc: "Recessed lights", qty: "6", unit: "ea", unitCost: "125" },
        { desc: "Range hood install & venting", qty: "1", unit: "ea", unitCost: "650" },
      ]},
      { name: "Appliances", items: [
        { desc: "Appliance allowance (fridge, range, DW, micro)", qty: "1", unit: "set", unitCost: "4500" },
      ]},
      { name: "Flooring", items: [
        { desc: "Tile / LVP flooring", qty: "150", unit: "sqft", unitCost: "8" },
        { desc: "Floor prep & leveling", qty: "1", unit: "job", unitCost: "400" },
      ]},
      { name: "Finishing", items: [
        { desc: "Touch-up paint (walls & trim)", qty: "1", unit: "job", unitCost: "350" },
        { desc: "Final clean", qty: "1", unit: "job", unitCost: "300" },
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
        { desc: "Caulking & grout sealing", qty: "1", unit: "job", unitCost: "200" },
      ]},
      { name: "Fixtures & Finishes", items: [
        { desc: "Vanity + mirror", qty: "1", unit: "ea", unitCost: "1800" },
        { desc: "Shower door (frameless)", qty: "1", unit: "ea", unitCost: "900" },
        { desc: "Hardware & accessories", qty: "1", unit: "set", unitCost: "350" },
        { desc: "Towel bar & accessories install", qty: "1", unit: "set", unitCost: "175" },
        { desc: "Medicine cabinet", qty: "1", unit: "ea", unitCost: "350" },
        { desc: "Heated floor mat", qty: "50", unit: "sqft", unitCost: "15" },
      ]},
      { name: "Electrical", items: [
        { desc: "GFCI outlets", qty: "2", unit: "ea", unitCost: "150" },
        { desc: "Exhaust fan", qty: "1", unit: "ea", unitCost: "280" },
        { desc: "Vanity lighting", qty: "1", unit: "ea", unitCost: "200" },
      ]},
      { name: "Finishing", items: [
        { desc: "Paint touch-up (walls & ceiling)", qty: "1", unit: "job", unitCost: "300" },
        { desc: "Final clean", qty: "1", unit: "job", unitCost: "200" },
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
        { desc: "Inspect & replace damaged decking", qty: "4", unit: "ea", unitCost: "85" },
      ]},
      { name: "Materials", items: [
        { desc: "Architectural shingles", qty: "30", unit: "sq", unitCost: "120" },
        { desc: "Underlayment (synthetic)", qty: "30", unit: "sq", unitCost: "25" },
        { desc: "Ice & water shield", qty: "6", unit: "sq", unitCost: "55" },
        { desc: "Ridge vent", qty: "40", unit: "lf", unitCost: "8" },
        { desc: "Drip edge & flashing", qty: "1", unit: "job", unitCost: "450" },
        { desc: "Pipe boot replacement", qty: "4", unit: "ea", unitCost: "45" },
        { desc: "Skylight flashing kit", qty: "1", unit: "ea", unitCost: "250" },
        { desc: "Expansion joint material", qty: "20", unit: "lf", unitCost: "6" },
      ]},
      { name: "Ventilation & Extras", items: [
        { desc: "Attic ventilation check & repair", qty: "1", unit: "job", unitCost: "350" },
        { desc: "Gutter re-hang & re-seal", qty: "120", unit: "lf", unitCost: "6" },
      ]},
      { name: "Labor", items: [
        { desc: "Roofing crew", qty: "30", unit: "sq", unitCost: "85" },
        { desc: "Cleanup", qty: "1", unit: "job", unitCost: "300" },
      ]},
      { name: "Documentation", items: [
        { desc: "Warranty documentation & registration", qty: "1", unit: "job", unitCost: "150" },
      ]},
    ],
  },
  painting: {
    sections: [
      { name: "Prep", items: [
        { desc: "Wall prep (patch, sand, prime)", qty: "1", unit: "job", unitCost: "600" },
        { desc: "Masking & protection", qty: "1", unit: "job", unitCost: "200" },
        { desc: "Caulk gaps & cracks", qty: "1", unit: "job", unitCost: "175" },
      ]},
      { name: "Materials", items: [
        { desc: "Paint (premium)", qty: "12", unit: "gal", unitCost: "55" },
        { desc: "Ceiling paint", qty: "4", unit: "gal", unitCost: "45" },
        { desc: "Primer", qty: "4", unit: "gal", unitCost: "35" },
        { desc: "Supplies (rollers, tape, etc.)", qty: "1", unit: "set", unitCost: "120" },
      ]},
      { name: "Walls & Ceilings", items: [
        { desc: "Wall painting (2 coats)", qty: "1800", unit: "sqft", unitCost: "1.50" },
        { desc: "Ceiling painting", qty: "900", unit: "sqft", unitCost: "1.25" },
        { desc: "Accent wall", qty: "2", unit: "ea", unitCost: "150" },
      ]},
      { name: "Trim & Detail", items: [
        { desc: "Door painting (per door)", qty: "8", unit: "ea", unitCost: "85" },
        { desc: "Baseboard painting", qty: "200", unit: "lf", unitCost: "2.50" },
        { desc: "Cabinet painting", qty: "1", unit: "job", unitCost: "1200" },
        { desc: "Window trim painting", qty: "10", unit: "ea", unitCost: "45" },
      ]},
      { name: "Labor", items: [
        { desc: "Painting labor", qty: "40", unit: "hr", unitCost: "55" },
        { desc: "Trim & detail work", qty: "12", unit: "hr", unitCost: "65" },
        { desc: "Final touch-up walk", qty: "4", unit: "hr", unitCost: "55" },
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
        { desc: "Saw cuts / control joints", qty: "120", unit: "lf", unitCost: "3.50" },
        { desc: "Expansion joint material", qty: "60", unit: "lf", unitCost: "4" },
        { desc: "Sealer application", qty: "800", unit: "sqft", unitCost: "0.75" },
      ]},
      { name: "Labor", items: [
        { desc: "Concrete crew", qty: "24", unit: "hr", unitCost: "75" },
        { desc: "Cleanup & haul-off", qty: "1", unit: "job", unitCost: "400" },
      ]},
    ],
  },
  deck: {
    sections: [
      { name: "Footings & Foundation", items: [
        { desc: "Layout & string lines", qty: "1", unit: "job", unitCost: "150" },
        { desc: "Sonotube footings (12\" dia, 36\" deep)", qty: "9", unit: "ea", unitCost: "85" },
        { desc: "Concrete for footings", qty: "1.5", unit: "cuyd", unitCost: "165" },
        { desc: "Post bases (Simpson PBS44A)", qty: "9", unit: "ea", unitCost: "18" },
        { desc: "Ledger board + flashing", qty: "16", unit: "lf", unitCost: "12" },
      ]},
      { name: "Framing", items: [
        { desc: "6x6 pressure treated posts", qty: "9", unit: "ea", unitCost: "42" },
        { desc: "2x10 PT joists (16\" OC)", qty: "24", unit: "ea", unitCost: "28" },
        { desc: "2x10 PT beam (doubled)", qty: "32", unit: "lf", unitCost: "6" },
        { desc: "Joist hangers & hardware", qty: "1", unit: "set", unitCost: "175" },
        { desc: "Blocking & bridging", qty: "1", unit: "job", unitCost: "120" },
      ]},
      { name: "Decking", items: [
        { desc: "Composite decking (Trex or equiv)", qty: "320", unit: "sqft", unitCost: "8.50" },
        { desc: "Hidden fastener system", qty: "320", unit: "sqft", unitCost: "1.25" },
        { desc: "Fascia board (composite)", qty: "60", unit: "lf", unitCost: "5" },
      ]},
      { name: "Railing & Stairs", items: [
        { desc: "Composite railing system", qty: "56", unit: "lf", unitCost: "35" },
        { desc: "Stair stringers (3-tread)", qty: "3", unit: "ea", unitCost: "45" },
        { desc: "Stair treads (composite)", qty: "3", unit: "ea", unitCost: "65" },
        { desc: "Post caps", qty: "12", unit: "ea", unitCost: "22" },
      ]},
      { name: "Finishing", items: [
        { desc: "Post trim wraps", qty: "9", unit: "ea", unitCost: "35" },
        { desc: "Under-deck cleanup & grading", qty: "1", unit: "job", unitCost: "250" },
        { desc: "Permit fees", qty: "1", unit: "ea", unitCost: "350" },
      ]},
      { name: "Labor", items: [
        { desc: "Deck build crew", qty: "48", unit: "hr", unitCost: "70" },
        { desc: "Final inspection prep", qty: "2", unit: "hr", unitCost: "70" },
      ]},
    ],
  },
  fencing: {
    sections: [
      { name: "Site Prep", items: [
        { desc: "Survey / locate property pins", qty: "1", unit: "job", unitCost: "200" },
        { desc: "Call 811 utility locate", qty: "1", unit: "job", unitCost: "0" },
        { desc: "Clear fence line (brush removal)", qty: "200", unit: "lf", unitCost: "2" },
        { desc: "Remove existing fence (if applicable)", qty: "200", unit: "lf", unitCost: "3" },
        { desc: "Disposal / haul-off", qty: "1", unit: "job", unitCost: "350" },
      ]},
      { name: "Materials", items: [
        { desc: "4x4 pressure treated posts (8 ft)", qty: "25", unit: "ea", unitCost: "18" },
        { desc: "2x4 PT rails (top & bottom)", qty: "50", unit: "ea", unitCost: "9" },
        { desc: "6 ft cedar or PT pickets", qty: "400", unit: "ea", unitCost: "4.50" },
        { desc: "Post caps", qty: "25", unit: "ea", unitCost: "8" },
        { desc: "Concrete (post set)", qty: "25", unit: "ea", unitCost: "6" },
        { desc: "Gate kit (single walk gate)", qty: "1", unit: "ea", unitCost: "185" },
        { desc: "Gate kit (double drive gate)", qty: "1", unit: "ea", unitCost: "375" },
      ]},
      { name: "Hardware", items: [
        { desc: "Galvanized screws (5 lb box)", qty: "4", unit: "ea", unitCost: "32" },
        { desc: "Gate hinges (heavy duty)", qty: "2", unit: "set", unitCost: "28" },
        { desc: "Gate latch hardware", qty: "2", unit: "ea", unitCost: "22" },
        { desc: "Post brackets (if needed)", qty: "4", unit: "ea", unitCost: "12" },
      ]},
      { name: "Labor", items: [
        { desc: "Post hole digging & setting", qty: "25", unit: "ea", unitCost: "35" },
        { desc: "Rail & picket install", qty: "200", unit: "lf", unitCost: "8" },
        { desc: "Gate hang & adjust", qty: "2", unit: "ea", unitCost: "150" },
        { desc: "Stain / seal application", qty: "200", unit: "lf", unitCost: "2.50" },
      ]},
    ],
  },
  flooring: {
    sections: [
      { name: "Demo & Prep", items: [
        { desc: "Remove existing flooring", qty: "800", unit: "sqft", unitCost: "2" },
        { desc: "Remove baseboards (save for reinstall)", qty: "200", unit: "lf", unitCost: "1.50" },
        { desc: "Disposal & haul-off", qty: "1", unit: "job", unitCost: "400" },
        { desc: "Floor leveling compound", qty: "800", unit: "sqft", unitCost: "0.75" },
        { desc: "Moisture testing", qty: "1", unit: "job", unitCost: "150" },
      ]},
      { name: "Underlayment", items: [
        { desc: "Underlayment (foam or cork)", qty: "800", unit: "sqft", unitCost: "0.65" },
        { desc: "Vapor barrier (if on slab)", qty: "800", unit: "sqft", unitCost: "0.30" },
      ]},
      { name: "Materials", items: [
        { desc: "LVP / hardwood / tile (material)", qty: "880", unit: "sqft", unitCost: "5.50" },
        { desc: "Waste factor (10%)", qty: "80", unit: "sqft", unitCost: "5.50" },
        { desc: "Adhesive (if glue-down)", qty: "4", unit: "gal", unitCost: "38" },
      ]},
      { name: "Transitions & Trim", items: [
        { desc: "Transition strips (T-mold, reducer)", qty: "6", unit: "ea", unitCost: "28" },
        { desc: "Quarter round / shoe mold", qty: "200", unit: "lf", unitCost: "1.75" },
        { desc: "Stair nosing", qty: "3", unit: "ea", unitCost: "35" },
        { desc: "Threshold plates", qty: "4", unit: "ea", unitCost: "18" },
        { desc: "Reinstall baseboards", qty: "200", unit: "lf", unitCost: "2" },
      ]},
      { name: "Labor", items: [
        { desc: "Flooring installation", qty: "800", unit: "sqft", unitCost: "3.50" },
        { desc: "Stair installation", qty: "3", unit: "ea", unitCost: "120" },
        { desc: "Final clean & inspection", qty: "1", unit: "job", unitCost: "200" },
      ]},
    ],
  },
  hvac: {
    sections: [
      { name: "Equipment", items: [
        { desc: "AC condenser unit (3 ton, 16 SEER)", qty: "1", unit: "ea", unitCost: "3200" },
        { desc: "Air handler / furnace", qty: "1", unit: "ea", unitCost: "2400" },
        { desc: "Evaporator coil", qty: "1", unit: "ea", unitCost: "850" },
        { desc: "Refrigerant line set", qty: "30", unit: "lf", unitCost: "12" },
        { desc: "Condensate drain line & pump", qty: "1", unit: "ea", unitCost: "175" },
        { desc: "Filter rack & filters", qty: "1", unit: "ea", unitCost: "85" },
      ]},
      { name: "Ductwork", items: [
        { desc: "Flex duct (6-10 in)", qty: "150", unit: "lf", unitCost: "8" },
        { desc: "Sheet metal trunk line", qty: "40", unit: "lf", unitCost: "22" },
        { desc: "Supply registers", qty: "10", unit: "ea", unitCost: "25" },
        { desc: "Return air grilles", qty: "3", unit: "ea", unitCost: "35" },
        { desc: "Duct sealing (mastic & tape)", qty: "1", unit: "job", unitCost: "350" },
        { desc: "Duct insulation", qty: "150", unit: "lf", unitCost: "3" },
      ]},
      { name: "Electrical", items: [
        { desc: "Disconnect box (outdoor)", qty: "1", unit: "ea", unitCost: "85" },
        { desc: "Whip & conduit to condenser", qty: "1", unit: "ea", unitCost: "120" },
        { desc: "Breaker (30-60 amp)", qty: "1", unit: "ea", unitCost: "65" },
      ]},
      { name: "Controls", items: [
        { desc: "Programmable thermostat", qty: "1", unit: "ea", unitCost: "250" },
        { desc: "Thermostat wiring", qty: "50", unit: "lf", unitCost: "2.50" },
        { desc: "Zone dampers (if multi-zone)", qty: "2", unit: "ea", unitCost: "185" },
      ]},
      { name: "Labor", items: [
        { desc: "HVAC install crew", qty: "24", unit: "hr", unitCost: "85" },
        { desc: "System startup & charge", qty: "4", unit: "hr", unitCost: "95" },
        { desc: "Duct leak testing", qty: "1", unit: "job", unitCost: "250" },
      ]},
      { name: "Permits & Inspections", items: [
        { desc: "Mechanical permit", qty: "1", unit: "ea", unitCost: "250" },
        { desc: "EPA refrigerant disposal", qty: "1", unit: "ea", unitCost: "75" },
        { desc: "Equipment warranty registration", qty: "1", unit: "ea", unitCost: "0" },
      ]},
    ],
  },
  electrical: {
    sections: [
      { name: "Panel & Breakers", items: [
        { desc: "200A main panel (Square D / Eaton)", qty: "1", unit: "ea", unitCost: "1800" },
        { desc: "Panel mounting & bonding", qty: "1", unit: "job", unitCost: "350" },
        { desc: "Main breaker (200A)", qty: "1", unit: "ea", unitCost: "120" },
        { desc: "Branch breakers (15-50A)", qty: "20", unit: "ea", unitCost: "18" },
        { desc: "AFCI breakers", qty: "8", unit: "ea", unitCost: "45" },
        { desc: "Grounding rod & wire", qty: "2", unit: "ea", unitCost: "65" },
      ]},
      { name: "Wiring", items: [
        { desc: "14/2 Romex (15A circuits)", qty: "500", unit: "lf", unitCost: "0.55" },
        { desc: "12/2 Romex (20A circuits)", qty: "300", unit: "lf", unitCost: "0.75" },
        { desc: "10/3 wire (dryer / range)", qty: "50", unit: "lf", unitCost: "2.25" },
        { desc: "6/3 wire (subpanel / large loads)", qty: "30", unit: "lf", unitCost: "4.50" },
        { desc: "Wire staples, connectors, boxes", qty: "1", unit: "set", unitCost: "250" },
      ]},
      { name: "Fixtures & Devices", items: [
        { desc: "Standard outlets", qty: "30", unit: "ea", unitCost: "8" },
        { desc: "GFCI outlets", qty: "6", unit: "ea", unitCost: "22" },
        { desc: "Light switches (single pole)", qty: "15", unit: "ea", unitCost: "6" },
        { desc: "3-way switches", qty: "4", unit: "ea", unitCost: "12" },
        { desc: "Dimmer switches", qty: "3", unit: "ea", unitCost: "28" },
        { desc: "Recessed light cans", qty: "12", unit: "ea", unitCost: "35" },
        { desc: "Smoke / CO detectors (hardwired)", qty: "6", unit: "ea", unitCost: "38" },
        { desc: "Outdoor weatherproof box & cover", qty: "2", unit: "ea", unitCost: "25" },
      ]},
      { name: "Labor", items: [
        { desc: "Electrician (journeyman)", qty: "40", unit: "hr", unitCost: "90" },
        { desc: "Electrician helper", qty: "40", unit: "hr", unitCost: "45" },
        { desc: "Final testing & labeling", qty: "4", unit: "hr", unitCost: "90" },
      ]},
      { name: "Permits & Inspections", items: [
        { desc: "Electrical permit", qty: "1", unit: "ea", unitCost: "275" },
        { desc: "Utility coordination / meter pull", qty: "1", unit: "job", unitCost: "200" },
      ]},
    ],
  },
  plumbing: {
    sections: [
      { name: "Pipe & Fittings", items: [
        { desc: "PEX tubing (3/4\" main)", qty: "100", unit: "lf", unitCost: "2.25" },
        { desc: "PEX tubing (1/2\" branches)", qty: "200", unit: "lf", unitCost: "1.50" },
        { desc: "PEX fittings & crimp rings", qty: "1", unit: "set", unitCost: "175" },
        { desc: "Manifold (hot & cold)", qty: "1", unit: "ea", unitCost: "120" },
        { desc: "Shut-off valves (quarter turn)", qty: "12", unit: "ea", unitCost: "15" },
        { desc: "ABS/PVC drain pipe (2-4\")", qty: "80", unit: "lf", unitCost: "4.50" },
        { desc: "Drain fittings (wyes, elbows, cleanouts)", qty: "1", unit: "set", unitCost: "200" },
        { desc: "Pipe hangers & supports", qty: "1", unit: "set", unitCost: "85" },
      ]},
      { name: "Fixtures", items: [
        { desc: "Kitchen faucet", qty: "1", unit: "ea", unitCost: "280" },
        { desc: "Bathroom faucets", qty: "2", unit: "ea", unitCost: "180" },
        { desc: "Toilet (comfort height)", qty: "2", unit: "ea", unitCost: "275" },
        { desc: "Shower valve & trim kit", qty: "1", unit: "ea", unitCost: "350" },
        { desc: "Hose bibbs (outdoor)", qty: "2", unit: "ea", unitCost: "65" },
      ]},
      { name: "Water Heater", items: [
        { desc: "50 gal tank water heater", qty: "1", unit: "ea", unitCost: "1200" },
        { desc: "Expansion tank", qty: "1", unit: "ea", unitCost: "85" },
        { desc: "Water heater pan & drain", qty: "1", unit: "ea", unitCost: "45" },
        { desc: "Gas line / connector (if gas)", qty: "1", unit: "ea", unitCost: "120" },
        { desc: "Flue / venting", qty: "1", unit: "ea", unitCost: "150" },
      ]},
      { name: "Labor", items: [
        { desc: "Licensed plumber", qty: "32", unit: "hr", unitCost: "95" },
        { desc: "Plumber helper", qty: "32", unit: "hr", unitCost: "45" },
        { desc: "Pressure test & inspection", qty: "4", unit: "hr", unitCost: "95" },
      ]},
      { name: "Permits & Inspections", items: [
        { desc: "Plumbing permit", qty: "1", unit: "ea", unitCost: "250" },
        { desc: "Water meter turn-on fee", qty: "1", unit: "ea", unitCost: "75" },
      ]},
    ],
  },
  siding: {
    sections: [
      { name: "Demo", items: [
        { desc: "Remove existing siding", qty: "1500", unit: "sqft", unitCost: "1.50" },
        { desc: "Remove & reset trim pieces", qty: "1", unit: "job", unitCost: "400" },
        { desc: "Disposal & dumpster", qty: "1", unit: "job", unitCost: "500" },
        { desc: "Inspect sheathing / repair rot", qty: "1", unit: "job", unitCost: "600" },
      ]},
      { name: "Materials", items: [
        { desc: "Vinyl / fiber cement siding", qty: "1650", unit: "sqft", unitCost: "4.50" },
        { desc: "House wrap (Tyvek)", qty: "1650", unit: "sqft", unitCost: "0.50" },
        { desc: "Starter strip", qty: "150", unit: "lf", unitCost: "1.25" },
        { desc: "J-channel", qty: "200", unit: "lf", unitCost: "1.50" },
        { desc: "Inside / outside corners", qty: "16", unit: "ea", unitCost: "18" },
        { desc: "Nails & fasteners", qty: "1", unit: "set", unitCost: "120" },
      ]},
      { name: "Trim & Flashing", items: [
        { desc: "Window trim / casing", qty: "12", unit: "ea", unitCost: "55" },
        { desc: "Door trim", qty: "3", unit: "ea", unitCost: "75" },
        { desc: "Soffit panels", qty: "100", unit: "sqft", unitCost: "5" },
        { desc: "Fascia board", qty: "120", unit: "lf", unitCost: "6" },
        { desc: "Flashing (step & kick-out)", qty: "1", unit: "job", unitCost: "350" },
        { desc: "Caulk & sealant", qty: "12", unit: "ea", unitCost: "8" },
      ]},
      { name: "Labor", items: [
        { desc: "Siding install crew", qty: "48", unit: "hr", unitCost: "70" },
        { desc: "Trim & detail work", qty: "16", unit: "hr", unitCost: "75" },
        { desc: "Cleanup", qty: "1", unit: "job", unitCost: "250" },
      ]},
    ],
  },
  drywall: {
    sections: [
      { name: "Materials", items: [
        { desc: "Drywall sheets (4x8, 1/2\")", qty: "60", unit: "ea", unitCost: "14" },
        { desc: "Drywall sheets (4x12, 1/2\")", qty: "20", unit: "ea", unitCost: "18" },
        { desc: "Moisture-resistant (green board)", qty: "8", unit: "ea", unitCost: "18" },
        { desc: "Drywall screws (25 lb box)", qty: "2", unit: "ea", unitCost: "35" },
        { desc: "Corner bead (metal / vinyl)", qty: "20", unit: "ea", unitCost: "4" },
        { desc: "Joint compound (5 gal)", qty: "6", unit: "ea", unitCost: "18" },
        { desc: "Joint tape (paper)", qty: "4", unit: "ea", unitCost: "5" },
        { desc: "Mesh tape (for patches)", qty: "2", unit: "ea", unitCost: "8" },
      ]},
      { name: "Taping & Finishing", items: [
        { desc: "First coat (tape & bed)", qty: "2400", unit: "sqft", unitCost: "0.50" },
        { desc: "Second coat (skim)", qty: "2400", unit: "sqft", unitCost: "0.40" },
        { desc: "Final coat & sand", qty: "2400", unit: "sqft", unitCost: "0.35" },
        { desc: "Texture application (knockdown / orange peel)", qty: "2400", unit: "sqft", unitCost: "0.45" },
        { desc: "Prime (PVA primer)", qty: "2400", unit: "sqft", unitCost: "0.20" },
      ]},
      { name: "Labor", items: [
        { desc: "Hang drywall", qty: "2400", unit: "sqft", unitCost: "0.75" },
        { desc: "Lift rental (if needed)", qty: "2", unit: "day", unitCost: "85" },
        { desc: "Cleanup & dust control", qty: "1", unit: "job", unitCost: "250" },
      ]},
    ],
  },
  landscaping: {
    sections: [
      { name: "Site Prep", items: [
        { desc: "Clear & grub existing vegetation", qty: "1", unit: "job", unitCost: "1200" },
        { desc: "Rough grading", qty: "2000", unit: "sqft", unitCost: "0.75" },
        { desc: "Topsoil import (screened)", qty: "8", unit: "cuyd", unitCost: "55" },
        { desc: "Fine grading & leveling", qty: "2000", unit: "sqft", unitCost: "0.50" },
        { desc: "Haul-off debris", qty: "1", unit: "job", unitCost: "400" },
      ]},
      { name: "Hardscape", items: [
        { desc: "Paver patio", qty: "200", unit: "sqft", unitCost: "14" },
        { desc: "Paver base (crushed stone + sand)", qty: "200", unit: "sqft", unitCost: "3" },
        { desc: "Retaining wall (segmental block)", qty: "50", unit: "sqft", unitCost: "28" },
        { desc: "Walkway pavers", qty: "80", unit: "sqft", unitCost: "12" },
        { desc: "Edging (steel or aluminum)", qty: "150", unit: "lf", unitCost: "4.50" },
      ]},
      { name: "Plantings", items: [
        { desc: "Shade trees (2\" caliper)", qty: "2", unit: "ea", unitCost: "350" },
        { desc: "Ornamental trees", qty: "3", unit: "ea", unitCost: "185" },
        { desc: "Shrubs (3-5 gal)", qty: "20", unit: "ea", unitCost: "45" },
        { desc: "Perennials (1 gal)", qty: "40", unit: "ea", unitCost: "12" },
        { desc: "Sod (Bermuda / St. Augustine)", qty: "1200", unit: "sqft", unitCost: "0.85" },
        { desc: "Mulch (hardwood, 3\" deep)", qty: "8", unit: "cuyd", unitCost: "55" },
      ]},
      { name: "Irrigation", items: [
        { desc: "Irrigation controller (8-zone)", qty: "1", unit: "ea", unitCost: "250" },
        { desc: "Sprinkler heads (pop-up)", qty: "24", unit: "ea", unitCost: "18" },
        { desc: "Drip line (planter beds)", qty: "200", unit: "lf", unitCost: "1.50" },
        { desc: "PVC main line & valves", qty: "1", unit: "job", unitCost: "450" },
        { desc: "Backflow preventer", qty: "1", unit: "ea", unitCost: "175" },
      ]},
      { name: "Labor", items: [
        { desc: "Landscape crew", qty: "48", unit: "hr", unitCost: "55" },
        { desc: "Hardscape crew", qty: "24", unit: "hr", unitCost: "65" },
        { desc: "Irrigation install", qty: "16", unit: "hr", unitCost: "70" },
        { desc: "Final cleanup & walkthrough", qty: "4", unit: "hr", unitCost: "55" },
      ]},
    ],
  },
  demo: {
    sections: [
      { name: "Interior Demo", items: [
        { desc: "Drywall removal", qty: "1500", unit: "sqft", unitCost: "1.75" },
        { desc: "Flooring removal (tile / hardwood / carpet)", qty: "800", unit: "sqft", unitCost: "2" },
        { desc: "Cabinet & fixture removal", qty: "1", unit: "job", unitCost: "800" },
        { desc: "Ceiling removal (drywall / drop tile)", qty: "500", unit: "sqft", unitCost: "1.50" },
        { desc: "Door & trim removal", qty: "12", unit: "ea", unitCost: "35" },
        { desc: "Insulation removal", qty: "500", unit: "sqft", unitCost: "1.25" },
      ]},
      { name: "Structural", items: [
        { desc: "Non-bearing wall removal", qty: "3", unit: "ea", unitCost: "450" },
        { desc: "Bearing wall removal (w/ temp shoring)", qty: "1", unit: "ea", unitCost: "2500" },
        { desc: "Concrete / slab cutting", qty: "20", unit: "lf", unitCost: "12" },
        { desc: "Deck / porch tear-down", qty: "1", unit: "job", unitCost: "1200" },
      ]},
      { name: "Haul-Off", items: [
        { desc: "Dumpster rental (20 yd roll-off)", qty: "2", unit: "ea", unitCost: "550" },
        { desc: "Additional dump runs", qty: "1", unit: "ea", unitCost: "350" },
        { desc: "Hazmat testing (asbestos / lead)", qty: "1", unit: "job", unitCost: "400" },
        { desc: "Recycling / salvage credit", qty: "1", unit: "job", unitCost: "-200" },
      ]},
      { name: "Labor", items: [
        { desc: "Demo crew", qty: "40", unit: "hr", unitCost: "55" },
        { desc: "Equipment rental (skid steer / jackhammer)", qty: "2", unit: "day", unitCost: "350" },
        { desc: "Site cleanup & broom sweep", qty: "8", unit: "hr", unitCost: "45" },
      ]},
      { name: "Permits & Safety", items: [
        { desc: "Demolition permit", qty: "1", unit: "ea", unitCost: "300" },
        { desc: "Utility disconnect (gas / water / electric)", qty: "1", unit: "job", unitCost: "250" },
        { desc: "Dust barrier / containment setup", qty: "1", unit: "job", unitCost: "350" },
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
  const [calcMode, setCalcMode] = useState<"estimate" | "material" | "labor" | "markup" | "sqft" | "trade">("estimate");
  const [tradeType, setTradeType] = useState<"roofing" | "concrete" | "framing" | "paint" | "fencing">("roofing");

  // Trade takeoff state
  const [tradeRoofArea, setTradeRoofArea] = useState("");
  const [tradeRoofPitch, setTradeRoofPitch] = useState(1.05);
  const [tradeConcL, setTradeConcL] = useState("");
  const [tradeConcW, setTradeConcW] = useState("");
  const [tradeConcD, setTradeConcD] = useState("");
  const [tradeWallL, setTradeWallL] = useState("");
  const [tradeWallH, setTradeWallH] = useState("");
  const [tradeStud, setTradeStud] = useState<16 | 24>(16);
  const [tradePaintL, setTradePaintL] = useState("");
  const [tradePaintW, setTradePaintW] = useState("");
  const [tradePaintH, setTradePaintH] = useState("");
  const [tradePaintDoors, setTradePaintDoors] = useState("");
  const [tradePaintWins, setTradePaintWins] = useState("");
  const [tradeFenceLF, setTradeFenceLF] = useState("");
  const [tradeFenceH, setTradeFenceH] = useState<4 | 6 | 8>(6);
  const [tradeFenceSpacing, setTradeFenceSpacing] = useState<6 | 8>(8);
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

  const inputBase = "w-full h-9 rounded-none border border-gray-200 bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow tabular-nums";

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
            { id: "trade", label: "Trade Takeoff" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCalcMode(tab.id as typeof calcMode)}
              className={cn(
                "px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px",
                calcMode === tab.id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-600 hover:text-gray-800"
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
            <p className="text-[12px] text-gray-600 mb-4">Quick quantities for common materials</p>
            <label className="text-[11px] font-semibold text-gray-900 block mb-1">Material Type</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="h-11 w-full max-w-sm rounded-none border border-gray-200 bg-white px-3.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
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
            <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-[13px] font-bold text-gray-900">Results</p>
              </div>
              <div className="divide-y divide-gray-100">
                {materialResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] text-gray-800">{r.label}</span>
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
            <p className="text-[12px] text-gray-600 mb-4">Calculate total labor cost for a crew</p>
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
                "w-10 h-5 rounded-none transition-colors relative",
                overtimeEnabled ? "bg-brand-600" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-none absolute top-0.5 transition-transform shadow-sm",
                overtimeEnabled ? "translate-x-5" : "translate-x-0.5"
              )} />
            </button>
            <span className="text-[13px] text-gray-800">Overtime (1.5x after 8 hrs/day)</span>
          </div>

          {totalLaborHours > 0 && (
            <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-[13px] font-bold text-gray-900">Breakdown</p>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-gray-800">Total labor hours</span>
                  <span className="text-[14px] font-bold text-gray-900 tabular-nums">{totalLaborHours.toLocaleString()} hrs</span>
                </div>
                {overtimeEnabled && overtimeHoursPerDay > 0 && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] text-gray-800">Overtime hours/day (per worker)</span>
                    <span className="text-[14px] font-bold text-amber-600 tabular-nums">{overtimeHoursPerDay} hrs at 1.5x</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-gray-800">Cost per day</span>
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
            <p className="text-[12px] text-gray-600 mb-4">Know your numbers -- markup and margin are not the same thing</p>
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
                "px-4 py-2 rounded-none text-[13px] font-medium transition-colors border",
                markupMode === "markup" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-800 hover:bg-gray-50"
              )}
            >
              Markup %
            </button>
            <button
              onClick={() => setMarkupMode("margin")}
              className={cn(
                "px-4 py-2 rounded-none text-[13px] font-medium transition-colors border",
                markupMode === "margin" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-800 hover:bg-gray-50"
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
            <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-[13px] font-bold text-gray-900">Results</p>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
                  <span className="text-[13px] font-bold text-white">Sell Price</span>
                  <span className="text-[18px] font-bold text-white tabular-nums">{formatCurrency(markupCalc.sellPrice)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-gray-800">Profit</span>
                  <span className="text-[14px] font-bold text-brand-600 tabular-nums">{formatCurrency(markupCalc.profit)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-gray-800">Effective Markup</span>
                  <span className="text-[14px] font-bold text-gray-900 tabular-nums">{markupCalc.effectiveMarkup.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-gray-800">Effective Margin</span>
                  <span className="text-[14px] font-bold text-gray-900 tabular-nums">{markupCalc.effectiveMargin.toFixed(1)}%</span>
                </div>
                <div className="px-4 py-3 bg-gray-50">
                  <p className="text-[11px] text-gray-700 font-mono">{markupCalc.formula}</p>
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
            <p className="text-[12px] text-gray-600 mb-4">See how your price stacks up against typical ranges</p>
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
            <div className="bg-gray-900 rounded-none px-5 py-4 flex items-center justify-between">
              <span className="text-[13px] font-bold text-white">Your Cost Per Sq Ft</span>
              <span className="text-[24px] font-bold text-white tabular-nums">${costPerSqft.toFixed(2)}</span>
            </div>
          )}

          <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <p className="text-[13px] font-bold text-gray-900">Typical $/sqft by Project Type</p>
            </div>
            <div className="divide-y divide-gray-100">
              {SQFT_RANGES.map((r) => (
                <div key={r.type} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[13px] text-gray-800">{r.type}</span>
                  <span className="text-[13px] font-semibold text-gray-900 tabular-nums">${r.low} - ${r.high}/sqft</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trade Takeoff Calculator */}
      {calcMode === "trade" && (
        <div className="max-w-3xl space-y-5">
          <div>
            <p className="text-[15px] font-bold text-gray-900 mb-1">Trade Takeoff</p>
            <p className="text-[12px] text-gray-600 mb-4">Field-accurate material quantities with cost ranges by trade</p>
          </div>
          <div className="flex gap-2 mb-4">
            {(["roofing", "concrete", "framing", "paint", "fencing"] as const).map((t) => (
              <button key={t} onClick={() => setTradeType(t)} className={cn("px-3 py-1.5 text-[12px] font-medium border transition-colors capitalize", tradeType === t ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")}>
                {t}
              </button>
            ))}
          </div>

          {tradeType === "roofing" && (() => {
            const sqFt = parseFloat(tradeRoofArea) || 0;
            const adjusted = sqFt * tradeRoofPitch;
            const squares = adjusted / 100;
            const bundles = Math.ceil(squares * 3);
            const underlayment = Math.ceil(squares / 4);
            const ridgeVent = Math.round(adjusted * 0.1);
            const dripEdge = Math.round(Math.sqrt(adjusted) * 4);
            const starterStrip = Math.ceil(dripEdge / 105);
            const iceWater = Math.ceil((adjusted * 0.1) / 75);
            const nails = Math.ceil(bundles * 0.8);
            const ready = sqFt > 0;
            return (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Roof Area (sq ft)</label><input type="number" placeholder="2800" value={tradeRoofArea} onChange={(e) => setTradeRoofArea(e.target.value)} className={inputBase} /></div>
                  <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Roof Pitch</label>
                    <select className={inputBase} value={tradeRoofPitch} onChange={(e) => setTradeRoofPitch(parseFloat(e.target.value))}>
                      <option value={1.0}>Flat (1.00)</option><option value={1.05}>4/12 (1.05)</option><option value={1.12}>6/12 (1.12)</option><option value={1.20}>8/12 (1.20)</option><option value={1.30}>10/12 (1.30)</option><option value={1.41}>12/12 (1.41)</option>
                    </select>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 space-y-2">
                  <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-2">Material Summary</p>
                  {!ready ? <p className="text-[12px] text-gray-500">Enter measurements to see results</p> : (
                    <div className="space-y-1.5 text-[12px]">
                      {[
                        ["Adjusted Sq Ft", `${adjusted.toFixed(0)} sq ft`, null],
                        ["Squares", `${squares.toFixed(2)}`, null],
                        ["Shingle bundles", `${bundles}`, `${formatCurrency(bundles * 32)}--${formatCurrency(bundles * 55)}`],
                        ["Underlayment rolls", `${underlayment}`, `${formatCurrency(underlayment * 22)}--${formatCurrency(underlayment * 38)}`],
                        ["Ridge vent", `${ridgeVent} LF`, `${formatCurrency(ridgeVent * 2)}--${formatCurrency(ridgeVent * 4)}`],
                        ["Drip edge", `${dripEdge} LF`, `${formatCurrency(dripEdge)}--${formatCurrency(dripEdge * 2)}`],
                        ["Starter strip", `${starterStrip} rolls`, `${formatCurrency(starterStrip * 65)}--${formatCurrency(starterStrip * 90)}`],
                        ["Ice & water shield", `${iceWater} rolls`, `${formatCurrency(iceWater * 85)}--${formatCurrency(iceWater * 130)}`],
                        ["Coil nails (boxes)", `${nails}`, `${formatCurrency(nails * 28)}--${formatCurrency(nails * 42)}`],
                      ].map(([label, value, cost]) => (
                        <div key={label as string} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                          <span className="text-gray-700">{label}</span>
                          <div className="text-right"><span className="font-semibold text-gray-900">{value}</span>{cost && <p className="text-[10px] text-gray-500">{cost}</p>}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {tradeType === "concrete" && (() => {
            const l = parseFloat(tradeConcL) || 0; const w = parseFloat(tradeConcW) || 0; const d = parseFloat(tradeConcD) || 0;
            const cuYd = (l * w * (d / 12)) / 27 * 1.1;
            const bags = Math.ceil(cuYd * 45);
            const rebar = Math.ceil((l * w * 2) / 20);
            const form = Math.ceil((l + w) * 2);
            const base = parseFloat((l * w * (4 / 12) / 27 * 1.5).toFixed(1));
            const ready = l > 0 && w > 0 && d > 0;
            return (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Length (ft)</label><input type="number" placeholder="20" value={tradeConcL} onChange={(e) => setTradeConcL(e.target.value)} className={inputBase} /></div>
                    <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Width (ft)</label><input type="number" placeholder="12" value={tradeConcW} onChange={(e) => setTradeConcW(e.target.value)} className={inputBase} /></div>
                  </div>
                  <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Thickness (in)</label><input type="number" placeholder="4" value={tradeConcD} onChange={(e) => setTradeConcD(e.target.value)} className={inputBase} /></div>
                  <p className="text-[10px] text-gray-500">Includes 10% waste factor</p>
                </div>
                <div className="bg-white border border-gray-200 p-4 space-y-2">
                  <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-2">Material Summary</p>
                  {!ready ? <p className="text-[12px] text-gray-500">Enter measurements to see results</p> : (
                    <div className="space-y-1.5 text-[12px]">
                      {[
                        ["Cubic yards (w/ waste)", `${cuYd.toFixed(2)} CY`, `${formatCurrency(cuYd * 130)}--${formatCurrency(cuYd * 175)}`],
                        ["80 lb bags (small jobs)", `${bags} bags`, `${formatCurrency(bags * 6)}--${formatCurrency(bags * 8)}`],
                        ["Rebar sticks (20 LF)", `${rebar} sticks`, `${formatCurrency(rebar * 9)}--${formatCurrency(rebar * 14)}`],
                        ["Form board", `${form} LF`, `${formatCurrency(form)}--${formatCurrency(form * 2)}`],
                        ["Base material", `${base} tons`, `${formatCurrency(base * 18)}--${formatCurrency(base * 28)}`],
                      ].map(([label, value, cost]) => (
                        <div key={label as string} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                          <span className="text-gray-700">{label}</span>
                          <div className="text-right"><span className="font-semibold text-gray-900">{value}</span>{cost && <p className="text-[10px] text-gray-500">{cost}</p>}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {tradeType === "framing" && (() => {
            const l = parseFloat(tradeWallL) || 0; const h = parseFloat(tradeWallH) || 0;
            const studs = l > 0 ? Math.ceil((l / (tradeStud / 12)) + 1) + Math.ceil(l / 8) : 0;
            const plateLF = Math.ceil(l * 3); const plates = Math.ceil(plateLF / 16);
            const headers = Math.ceil(l / 8); const sheathing = Math.ceil((l * h) / 32);
            const ready = l > 0 && h > 0;
            return (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Wall Length (ft)</label><input type="number" placeholder="32" value={tradeWallL} onChange={(e) => setTradeWallL(e.target.value)} className={inputBase} /></div>
                  <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Wall Height (ft)</label><input type="number" placeholder="9" value={tradeWallH} onChange={(e) => setTradeWallH(e.target.value)} className={inputBase} /></div>
                  <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Stud Spacing</label>
                    <div className="flex gap-2">{([16, 24] as const).map((s) => (<button key={s} onClick={() => setTradeStud(s)} className={cn("flex-1 h-9 border text-[12px] font-medium", tradeStud === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200")}>{s}&quot; OC</button>))}</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 space-y-2">
                  <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-2">Material Summary</p>
                  {!ready ? <p className="text-[12px] text-gray-500">Enter measurements to see results</p> : (
                    <div className="space-y-1.5 text-[12px]">
                      {[
                        ["Studs", `${studs}`, `${formatCurrency(studs * 6)}--${formatCurrency(studs * 10)}`],
                        ["Plates", `${plateLF} LF / ${plates} sticks`, `${formatCurrency(plates * 7)}--${formatCurrency(plates * 11)}`],
                        ["Headers", `${headers}`, `${formatCurrency(headers * 25)}--${formatCurrency(headers * 60)}`],
                        ["Sheathing (4x8)", `${sheathing} sheets`, `${formatCurrency(sheathing * 22)}--${formatCurrency(sheathing * 38)}`],
                      ].map(([label, value, cost]) => (
                        <div key={label as string} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                          <span className="text-gray-700">{label}</span>
                          <div className="text-right"><span className="font-semibold text-gray-900">{value}</span>{cost && <p className="text-[10px] text-gray-500">{cost}</p>}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {tradeType === "paint" && (() => {
            const l = parseFloat(tradePaintL) || 0; const w = parseFloat(tradePaintW) || 0; const h = parseFloat(tradePaintH) || 0;
            const d = parseInt(tradePaintDoors) || 0; const win = parseInt(tradePaintWins) || 0;
            const wallArea = (2 * (l + w) * h) - (d * 20) - (win * 15);
            const ceilArea = l * w; const totalArea = Math.max(0, wallArea) + ceilArea;
            const gal1 = Math.ceil(totalArea / 400); const gal2 = gal1 * 2;
            const tape = Math.ceil((2 * (l + w)) / 60); const drops = Math.ceil((l * w) / 120);
            const ready = l > 0 && w > 0 && h > 0;
            return (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">L (ft)</label><input type="number" placeholder="16" value={tradePaintL} onChange={(e) => setTradePaintL(e.target.value)} className={inputBase} /></div>
                    <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">W (ft)</label><input type="number" placeholder="14" value={tradePaintW} onChange={(e) => setTradePaintW(e.target.value)} className={inputBase} /></div>
                    <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">H (ft)</label><input type="number" placeholder="9" value={tradePaintH} onChange={(e) => setTradePaintH(e.target.value)} className={inputBase} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Doors</label><input type="number" placeholder="2" value={tradePaintDoors} onChange={(e) => setTradePaintDoors(e.target.value)} className={inputBase} /></div>
                    <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Windows</label><input type="number" placeholder="3" value={tradePaintWins} onChange={(e) => setTradePaintWins(e.target.value)} className={inputBase} /></div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 space-y-2">
                  <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-2">Material Summary</p>
                  {!ready ? <p className="text-[12px] text-gray-500">Enter measurements to see results</p> : (
                    <div className="space-y-1.5 text-[12px]">
                      {[
                        ["Wall area (net)", `${Math.max(0, wallArea).toFixed(0)} sq ft`, null],
                        ["Ceiling area", `${ceilArea.toFixed(0)} sq ft`, null],
                        ["Paint -- 1 coat", `${gal1} gal`, `${formatCurrency(gal1 * 35)}--${formatCurrency(gal1 * 65)}`],
                        ["Paint -- 2 coats", `${gal2} gal`, `${formatCurrency(gal2 * 35)}--${formatCurrency(gal2 * 65)}`],
                        ["Painter's tape", `${tape} rolls`, `${formatCurrency(tape * 6)}--${formatCurrency(tape * 10)}`],
                        ["Drop cloths", `${drops}`, `${formatCurrency(drops * 12)}--${formatCurrency(drops * 22)}`],
                      ].map(([label, value, cost]) => (
                        <div key={label as string} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                          <span className="text-gray-700">{label}</span>
                          <div className="text-right"><span className="font-semibold text-gray-900">{value}</span>{cost && <p className="text-[10px] text-gray-500">{cost}</p>}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {tradeType === "fencing" && (() => {
            const lf = parseFloat(tradeFenceLF) || 0;
            const posts = lf > 0 ? Math.ceil(lf / tradeFenceSpacing) + 1 : 0;
            const pickets = Math.ceil(lf * 12 / 3.5);
            const bays = lf > 0 ? Math.ceil(lf / tradeFenceSpacing) : 0;
            const rails = bays * (tradeFenceH >= 6 ? 3 : 2);
            const concrete = posts * (tradeFenceH >= 6 ? 3 : 2);
            const gates = Math.ceil(lf / 100);
            const ready = lf > 0;
            return (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Linear Feet</label><input type="number" placeholder="200" value={tradeFenceLF} onChange={(e) => setTradeFenceLF(e.target.value)} className={inputBase} /></div>
                  <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Fence Height</label>
                    <div className="flex gap-2">{([4, 6, 8] as const).map((h) => (<button key={h} onClick={() => setTradeFenceH(h)} className={cn("flex-1 h-9 border text-[12px] font-medium", tradeFenceH === h ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200")}>{h} ft</button>))}</div>
                  </div>
                  <div><label className="text-[11px] font-semibold text-gray-900 block mb-1">Post Spacing</label>
                    <div className="flex gap-2">{([6, 8] as const).map((s) => (<button key={s} onClick={() => setTradeFenceSpacing(s)} className={cn("flex-1 h-9 border text-[12px] font-medium", tradeFenceSpacing === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200")}>{s} ft OC</button>))}</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 space-y-2">
                  <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-2">Material Summary</p>
                  {!ready ? <p className="text-[12px] text-gray-500">Enter measurements to see results</p> : (
                    <div className="space-y-1.5 text-[12px]">
                      {[
                        ["Posts", `${posts}`, `${formatCurrency(posts * 12)}--${formatCurrency(posts * 22)}`],
                        ["Pickets", `${pickets}`, `${formatCurrency(pickets * 3)}--${formatCurrency(pickets * 8)}`],
                        ["Rails", `${rails}`, `${formatCurrency(rails * 8)}--${formatCurrency(rails * 14)}`],
                        ["Concrete bags", `${concrete}`, `${formatCurrency(concrete * 6)}--${formatCurrency(concrete * 8)}`],
                        ["Gate hardware", `${gates} sets`, `${formatCurrency(gates * 45)}--${formatCurrency(gates * 120)}`],
                      ].map(([label, value, cost]) => (
                        <div key={label as string} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                          <span className="text-gray-700">{label}</span>
                          <div className="text-right"><span className="font-semibold text-gray-900">{value}</span>{cost && <p className="text-[10px] text-gray-500">{cost}</p>}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
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
          <p className="text-[12px] text-gray-600 mb-3">Start from a template or build from scratch</p>
          <select
            value={template}
            onChange={(e) => loadTemplate(e.target.value)}
            className="h-11 w-full max-w-sm rounded-none border border-gray-200 bg-white px-3.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          >
            {TEMPLATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Sections */}
        {sections.map((sec, si) => (
          <div key={si} className="rounded-none ring-1 ring-gray-200 overflow-hidden">
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
            <div className="grid grid-cols-[1fr_50px_50px_70px_65px_28px] xl:grid-cols-[1fr_60px_60px_85px_80px_32px] gap-1 xl:gap-1.5 px-3 xl:px-4 py-2 text-[9px] font-bold text-gray-600 uppercase tracking-wider">
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-center">Unit</span>
              <span className="text-right">Cost</span>
              <span className="text-right">Total</span>
              <span />
            </div>
            {sec.items.map((item, ii) => (
              <div key={ii} className="grid grid-cols-[1fr_50px_50px_70px_65px_28px] xl:grid-cols-[1fr_60px_60px_85px_80px_32px] gap-1 xl:gap-1.5 px-3 xl:px-4 py-1 items-center border-t border-gray-100">
                <input value={item.desc} onChange={(e) => updateItem(si, ii, "desc", e.target.value)} placeholder="Item..." className={inputBase} />
                <input type="number" min="0" value={item.qty} onChange={(e) => updateItem(si, ii, "qty", e.target.value)} className={cn(inputBase, "text-right px-2")} />
                <select value={item.unit} onChange={(e) => updateItem(si, ii, "unit", e.target.value)} className="h-9 text-[11px] text-center rounded-none border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent">
                  {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[11px]">$</span>
                  <input type="number" min="0" step="0.01" value={item.unitCost} onChange={(e) => updateItem(si, ii, "unitCost", e.target.value)} className={cn(inputBase, "text-right pl-5 pr-2")} />
                </div>
                <span className="text-[13px] font-semibold text-gray-900 text-right tabular-nums">{itemTotal(item) > 0 ? formatCurrency(itemTotal(item)) : "—"}</span>
                <button onClick={() => removeItem(si, ii)} disabled={sec.items.length === 1} className="w-8 h-8 flex items-center justify-center rounded-none text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-20">
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

        <button onClick={addSection} className="text-[13px] font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
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
          <p className="text-[12px] text-gray-600">Pre-fills a new estimate with these line items and totals.</p>
        </div>
      </div>

      {/* Right: Live Breakdown */}
      <div className="hidden xl:block w-[280px] 2xl:w-[340px] flex-shrink-0 sticky top-0">
        <p className="text-[12px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Live Breakdown</p>
        <div className="bg-white rounded-none shadow-[0_4px_30px_-6px_rgba(0,0,0,0.15)] ring-1 ring-gray-200/80 overflow-hidden">
          <div className="h-1.5 bg-brand-600" />
          <div className="px-5 pt-4 pb-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <NextImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" alt="" width={32} height={32} className="w-8 h-8 rounded-none object-cover ring-2 ring-gray-100" />
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Johnson & Sons</p>
                  <p className="text-[8px] text-gray-600">Cost Calculator</p>
                </div>
              </div>
              <p className="text-[9px] text-gray-600">{today}</p>
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
                        <span className="text-[9px] text-gray-600 truncate mr-2">{item.desc}</span>
                        <span className="text-[9px] text-gray-700 tabular-nums flex-shrink-0">{formatCurrency(itemTotal(item))}</span>
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
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 tabular-nums">{formatCurrency(materialsSubtotal)}</span>
              </div>
              {wasteAmt > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-600">Waste ({wasteFactor}%)</span>
                  <span className="text-gray-700 tabular-nums">+{formatCurrency(wasteAmt)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-600">Tax ({taxRate}%)</span>
                  <span className="text-gray-700 tabular-nums">+{formatCurrency(tax)}</span>
                </div>
              )}
              {permits > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-600">Permits</span>
                  <span className="text-gray-700 tabular-nums">+{formatCurrency(permits)}</span>
                </div>
              )}
              {contingencyAmt > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-600">Contingency ({contingency}%)</span>
                  <span className="text-gray-700 tabular-nums">+{formatCurrency(contingencyAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-600">Margin ({marginPct}%)</span>
                <span className="text-brand-600 font-semibold tabular-nums">+{formatCurrency(marginAmt)}</span>
              </div>
            </div>

            {/* Bid price */}
            <div className="flex justify-between py-3 px-3 bg-gray-900 rounded-none">
              <span className="text-[13px] font-bold text-white">Bid Price</span>
              <span className="text-[18px] font-bold text-white tabular-nums">{formatCurrency(grandTotal)}</span>
            </div>

            {/* Margin insight */}
            <div className="mt-3 text-center">
              <p className="text-[10px] text-gray-600">Your profit: <span className="font-bold text-brand-600">{formatCurrency(marginAmt)}</span> ({marginPct}% margin)</p>
              {materialsSubtotal > 0 && <p className="text-[9px] text-gray-600 mt-0.5">Markup on cost: {((grandTotal / materialsSubtotal - 1) * 100).toFixed(1)}%</p>}
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
        <p className="text-[17px] text-gray-600 leading-relaxed mb-8 max-w-[520px]">
          Tell it what you need. Get a full estimate back. Voice, text, or upload — it handles everything.
        </p>
        <div className="flex items-center gap-5">
          <button
            onClick={onUnlock}
            className="h-12 px-8 rounded-none bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-bold transition-colors"
          >
            Start 14-Day Free Trial
          </button>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-gray-900 tabular-nums">$49</span>
            <span className="text-[14px] text-gray-600">/mo after trial</span>
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
            <p className="text-[13px] text-gray-600 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      {/* Social proof bar */}
      <div className="flex items-center gap-8 py-4">
        <div>
          <p className="text-[22px] font-bold text-gray-900 tabular-nums">5,200+</p>
          <p className="text-[12px] text-gray-600">Training estimates</p>
        </div>
        <div>
          <p className="text-[22px] font-bold text-gray-900 tabular-nums">8</p>
          <p className="text-[12px] text-gray-600">Built-in tools</p>
        </div>
        <div>
          <p className="text-[22px] font-bold text-gray-900">Texas</p>
          <p className="text-[12px] text-gray-600">Regional pricing</p>
        </div>
        <div>
          <p className="text-[22px] font-bold text-gray-900">30 sec</p>
          <p className="text-[12px] text-gray-600">Avg estimate time</p>
        </div>
        <div className="ml-auto">
          <p className="text-[12px] text-gray-600">No credit card required. Cancel anytime.</p>
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
                <span className="text-[10px] font-bold uppercase tracking-wide bg-brand-600 text-white px-2 py-0.5 rounded-none flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5" />Pro
                </span>
              </div>
              <p className="text-[13px] text-gray-600">Powered by ConstructionAI</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-gray-600">
            <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> Voice</span>
            <span className="flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" /> Upload</span>
            <span className="flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5" /> 8 Tools</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-none bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/80 p-5 space-y-5 mb-3">
          {messages.map((msg) => {
            if (msg.role === "tool") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className={cn(
                    "flex items-center gap-2 text-[12px] font-medium px-4 py-2 rounded-none",
                    msg.toolStatus === "complete"
                      ? "bg-brand-50 text-brand-700"
                      : "bg-gray-50 text-gray-700"
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
                  <div className="w-9 h-9 rounded-none bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-700 text-[12px] font-bold">MJ</span>
                  </div>
                )}
                <div className={cn("max-w-[80%]", !isAgent && "items-end")}>
                  <div className={cn(
                    "px-4 py-3 rounded-none text-[14px] leading-relaxed whitespace-pre-wrap",
                    isAgent
                      ? "bg-gray-50 text-gray-900 rounded-none-md"
                      : "bg-gray-900 text-white rounded-none-md"
                  )}>
                    {msg.content}
                  </div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.attachments.map((att, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-800 bg-gray-100 rounded-none px-2.5 py-1">
                          {att.type.startsWith("image") ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          {att.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className={cn("text-[11px] text-gray-600 mt-1.5 px-1", !isAgent && "text-right")}>{msg.timestamp}</p>
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-none bg-gray-900 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[11px] font-bold">AI</span>
              </div>
              <div className="bg-gray-50 rounded-none rounded-none-md px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-none animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-none animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-none animate-bounce" style={{ animationDelay: "300ms" }} />
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
              <span key={i} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-900 bg-white ring-1 ring-gray-200 rounded-none px-3 py-1.5">
                {f.type.startsWith("image") ? <ImageIcon className="w-3.5 h-3.5 text-gray-600" /> : <FileText className="w-3.5 h-3.5 text-gray-600" />}
                {f.name}
                <button onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 ml-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 bg-white rounded-none shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/80 px-4 py-3">
          <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 flex items-center justify-center rounded-none text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <Paperclip className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={toggleRecording}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-none transition-colors",
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
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
          <Button onClick={handleSend} disabled={!input.trim() && uploadedFiles.length === 0} className="gap-2 h-10 px-5 rounded-none">
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
        <nav className="w-44 xl:w-56 flex-shrink-0 bg-white border-r border-border py-3 px-2 overflow-y-auto">
          {ESTIMATES_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const badge = item.id === "my-estimates" ? estimates.length : null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center justify-between rounded-none px-2.5 py-2 text-[13px] font-medium transition-colors mb-0.5",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
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
                  <span className={cn("text-[10px] font-bold rounded-none px-1.5 py-0.5 min-w-[20px] text-center", isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700")}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto p-4 xl:p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

export default function EstimatesPage() {
  usePageTitle("Estimates");
  return (
    <Suspense>
      <EstimatesPageContent />
    </Suspense>
  );
}
