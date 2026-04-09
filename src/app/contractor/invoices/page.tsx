"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Send,
  Download,
  FileText,
  Eye,
  X,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/ui/dialog";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";
import { toast } from "sonner";
import { fetchInvoices, createInvoice, updateInvoice } from "@shared/lib/data";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue";

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  project: string;
  client: { name: string; email: string; address: string };
  milestone: string;
  milestoneNumber: number;
  totalMilestones: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: LineItem[];
  subtotal: number;
  platformFee: number;
  total: number;
  notes?: string;
  paymentTerms: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-001",
    project: "Kitchen Remodel",
    client: {
      name: "Michael Brown",
      email: "michael@brown.com",
      address: "4821 Ridgeview Dr, Oxford, MS 78731",
    },
    milestone: "Demo complete",
    milestoneNumber: 1,
    totalMilestones: 6,
    issueDate: "2026-02-15",
    dueDate: "2026-03-01",
    status: "paid",
    lineItems: [
      { description: "Kitchen demolition — cabinets, countertops, flooring", quantity: 1, rate: 2200, amount: 2200 },
      { description: "Debris haul-off (2 loads)", quantity: 2, rate: 450, amount: 900 },
      { description: "Plumbing disconnect & cap", quantity: 1, rate: 650, amount: 650 },
      { description: "Electrical disconnect & make safe", quantity: 1, rate: 550, amount: 550 },
      { description: "Dumpster rental (20-yd)", quantity: 1, rate: 700, amount: 700 },
    ],
    subtotal: 5000,
    platformFee: 150,
    total: 5150,
    notes: "Demo completed on schedule. All utilities safely capped and inspected.",
    paymentTerms: "50% upfront, 50% on completion",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-002",
    project: "Kitchen Remodel",
    client: {
      name: "Michael Brown",
      email: "michael@brown.com",
      address: "4821 Ridgeview Dr, Oxford, MS 78731",
    },
    milestone: "Rough-in",
    milestoneNumber: 2,
    totalMilestones: 6,
    issueDate: "2026-03-01",
    dueDate: "2026-03-15",
    status: "paid",
    lineItems: [
      { description: "Plumbing rough-in — supply & drain relocation", quantity: 1, rate: 2800, amount: 2800 },
      { description: "Electrical rough-in — 6 new circuits, panel upgrade", quantity: 1, rate: 2400, amount: 2400 },
      { description: "HVAC duct modifications", quantity: 1, rate: 1200, amount: 1200 },
      { description: "Framing — island header, wall removal", quantity: 1, rate: 1500, amount: 1500 },
      { description: "Permits & inspections", quantity: 1, rate: 600, amount: 600 },
    ],
    subtotal: 8500,
    platformFee: 255,
    total: 8755,
    notes: "All rough-in inspections passed. Ready for drywall.",
    paymentTerms: "Net 14",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-003",
    project: "Kitchen Remodel",
    client: {
      name: "Michael Brown",
      email: "michael@brown.com",
      address: "4821 Ridgeview Dr, Oxford, MS 78731",
    },
    milestone: "Cabinet install",
    milestoneNumber: 3,
    totalMilestones: 6,
    issueDate: "2026-03-18",
    dueDate: "2026-04-01",
    status: "sent",
    lineItems: [
      { description: "Cabinet delivery & staging", quantity: 1, rate: 400, amount: 400 },
      { description: "Base cabinet installation (12 units)", quantity: 12, rate: 185, amount: 2220 },
      { description: "Wall cabinet installation (8 units)", quantity: 8, rate: 210, amount: 1680 },
      { description: "Island cabinet assembly & install", quantity: 1, rate: 1200, amount: 1200 },
      { description: "Hardware & trim", quantity: 1, rate: 850, amount: 850 },
      { description: "Crown molding — kitchen perimeter", quantity: 1, rate: 650, amount: 650 },
    ],
    subtotal: 7000,
    platformFee: 210,
    total: 7210,
    notes: "Cabinets are Kraftmaid Maple, color: Dove White. Client approved final layout 3/16.",
    paymentTerms: "Net 14",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-004",
    project: "Bathroom Reno",
    client: {
      name: "Sarah Williams",
      email: "sarah@williams.com",
      address: "119 Lakeshore Ln, Sardis Lake, MS 38668",
    },
    milestone: "Demo complete",
    milestoneNumber: 1,
    totalMilestones: 4,
    issueDate: "2026-03-05",
    dueDate: "2026-03-19",
    status: "paid",
    lineItems: [
      { description: "Bathroom demolition — tile, vanity, tub surround", quantity: 1, rate: 1100, amount: 1100 },
      { description: "Plumbing disconnect", quantity: 1, rate: 450, amount: 450 },
      { description: "Debris removal & cleanup", quantity: 1, rate: 350, amount: 350 },
      { description: "Subfloor inspection & repair", quantity: 1, rate: 600, amount: 600 },
    ],
    subtotal: 2500,
    platformFee: 75,
    total: 2575,
    paymentTerms: "50% upfront, 50% on completion",
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-005",
    project: "Roof Replacement",
    client: {
      name: "Robert Johnson",
      email: "robert@johnson.com",
      address: "7700 MoPac Expy, Oxford, MS 78749",
    },
    milestone: "Shingles",
    milestoneNumber: 3,
    totalMilestones: 4,
    issueDate: "2026-02-28",
    dueDate: "2026-03-14",
    status: "overdue",
    lineItems: [
      { description: "Architectural shingles (30 sq) — GAF Timberline HDZ", quantity: 30, rate: 85, amount: 2550 },
      { description: "Starter strip & ridge cap", quantity: 1, rate: 320, amount: 320 },
      { description: "Shingle installation labor", quantity: 30, rate: 28, amount: 840 },
      { description: "Nail & fastener material", quantity: 1, rate: 145, amount: 145 },
      { description: "Cleanup & magnet sweep", quantity: 1, rate: 145, amount: 145 },
    ],
    subtotal: 4000,
    platformFee: 120,
    total: 4120,
    notes: "14 days past due. Second reminder sent 3/21.",
    paymentTerms: "Net 14",
  },
];

// ─── Projects & Milestones for Create Flow ────────────────────────────────────

const PROJECTS_WITH_MILESTONES = [
  {
    name: "Kitchen Remodel",
    client: { name: "Michael Brown", email: "michael@brown.com", address: "4821 Ridgeview Dr, Oxford, MS 78731" },
    milestones: [
      { name: "Demo complete", number: 1, total: 6, amount: 5000, invoiced: true },
      { name: "Rough-in", number: 2, total: 6, amount: 8500, invoiced: true },
      { name: "Cabinet install", number: 3, total: 6, amount: 7000, invoiced: true },
      { name: "Countertops & tile", number: 4, total: 6, amount: 6500, invoiced: false },
      { name: "Fixtures & appliances", number: 5, total: 6, amount: 4200, invoiced: false },
      { name: "Final walkthrough", number: 6, total: 6, amount: 3000, invoiced: false },
    ],
  },
  {
    name: "Bathroom Reno",
    client: { name: "Sarah Williams", email: "sarah@williams.com", address: "119 Lakeshore Ln, Sardis Lake, MS 38668" },
    milestones: [
      { name: "Demo complete", number: 1, total: 4, amount: 2500, invoiced: true },
      { name: "Plumbing & tile", number: 2, total: 4, amount: 3800, invoiced: false },
      { name: "Fixtures & vanity", number: 3, total: 4, amount: 2200, invoiced: false },
      { name: "Final punch list", number: 4, total: 4, amount: 1500, invoiced: false },
    ],
  },
  {
    name: "Roof Replacement",
    client: { name: "Robert Johnson", email: "robert@johnson.com", address: "7700 MoPac Expy, Oxford, MS 78749" },
    milestones: [
      { name: "Tear-off", number: 1, total: 4, amount: 3500, invoiced: false },
      { name: "Underlayment & flashing", number: 2, total: 4, amount: 2800, invoiced: false },
      { name: "Shingles", number: 3, total: 4, amount: 4000, invoiced: true },
      { name: "Final inspection & cleanup", number: 4, total: 4, amount: 2200, invoiced: false },
    ],
  },
];

const PAYMENT_TERMS_OPTIONS = [
  "50% upfront, 50% on completion",
  "Net 14",
  "Net 30",
  "Due on receipt",
  "3 equal payments",
];

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  InvoiceStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: "success" | "info" | "danger" | "secondary" | "warning";
  }
> = {
  paid: { label: "Paid", icon: CheckCircle2, badge: "success" },
  sent: { label: "Sent", icon: Send, badge: "info" },
  viewed: { label: "Viewed", icon: Eye, badge: "warning" },
  draft: { label: "Draft", icon: FileText, badge: "secondary" },
  overdue: { label: "Overdue", icon: AlertCircle, badge: "danger" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  usePageTitle("Invoices");
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("inv-3");
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [createProject, setCreateProject] = useState("");
  const [createMilestone, setCreateMilestone] = useState("");
  const [createLineItems, setCreateLineItems] = useState<LineItem[]>([]);
  const [createNotes, setCreateNotes] = useState("");
  const [createPaymentTerms, setCreatePaymentTerms] = useState("Net 14");

  useEffect(() => {
    fetchInvoices().then((apiInvoices) => {
      if (apiInvoices.length > 0) {
        setInvoices(
          apiInvoices.map((inv: any) => ({
            id: inv.id,
            invoiceNumber: inv.invoice_number || inv.id,
            project: inv.project_id || "",
            client: {
              name: inv.client?.name || "Unknown",
              email: inv.client?.email || "",
              address: inv.client?.address || "",
            },
            milestone: "",
            milestoneNumber: 0,
            totalMilestones: 0,
            issueDate: inv.created_at,
            dueDate: inv.due_date,
            status: inv.status as InvoiceStatus,
            lineItems: [],
            subtotal:
              typeof inv.amount === "number" && inv.amount > 1000
                ? inv.amount / 100
                : inv.amount,
            platformFee: 0,
            total:
              typeof inv.amount === "number" && inv.amount > 1000
                ? inv.amount / 100
                : inv.amount,
            paymentTerms: "Net 14",
          }))
        );
      }
    });
  }, []);

  const selectedProject = PROJECTS_WITH_MILESTONES.find(
    (p) => p.name === createProject
  );
  const availableMilestones =
    selectedProject?.milestones.filter((m) => !m.invoiced) || [];

  const filtered = invoices
    .filter((inv) => filter === "all" || inv.status === filter)
    .filter(
      (inv) =>
        search === "" ||
        inv.client.name.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.project.toLowerCase().includes(search.toLowerCase())
    );

  const selected = invoices.find((inv) => inv.id === selectedId) || null;

  function openCreateDialog() {
    setCreateProject("");
    setCreateMilestone("");
    setCreateLineItems([]);
    setCreateNotes("");
    setCreatePaymentTerms("Net 14");
    setCreateOpen(true);
  }

  function handleProjectChange(projectName: string) {
    setCreateProject(projectName);
    setCreateMilestone("");
    setCreateLineItems([]);
  }

  function handleMilestoneChange(milestoneName: string) {
    setCreateMilestone(milestoneName);
    const proj = PROJECTS_WITH_MILESTONES.find((p) => p.name === createProject);
    const ms = proj?.milestones.find((m) => m.name === milestoneName);
    if (ms) {
      setCreateLineItems([
        {
          description: `${milestoneName} — ${createProject}`,
          quantity: 1,
          rate: ms.amount,
          amount: ms.amount,
        },
      ]);
    }
  }

  function addLineItem() {
    setCreateLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  }

  function updateLineItem(
    index: number,
    field: keyof LineItem,
    value: string | number
  ) {
    setCreateLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      })
    );
  }

  function removeLineItem(index: number) {
    setCreateLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateInvoice() {
    if (!createProject || !createMilestone || createLineItems.length === 0) {
      toast.error("Select a project, milestone, and add at least one line item");
      return;
    }

    const proj = PROJECTS_WITH_MILESTONES.find((p) => p.name === createProject);
    const ms = proj?.milestones.find((m) => m.name === createMilestone);
    if (!proj || !ms) return;

    const subtotal = createLineItems.reduce((sum, item) => sum + item.amount, 0);
    const platformFee = Math.round(subtotal * 0.03 * 100) / 100;
    const total = subtotal + platformFee;
    const nextNumber = invoices.length + 1;

    const created = await createInvoice({
      invoice_number: `INV-${String(nextNumber).padStart(3, "0")}`,
      amount: Math.round(total * 100),
      notes: createNotes || undefined,
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      project_id: undefined,
      client_id: undefined,
    });

    const newInvoice: Invoice = {
      id: created?.id || `inv-${nextNumber}`,
      invoiceNumber: created?.invoice_number || `INV-${String(nextNumber).padStart(3, "0")}`,
      project: createProject,
      client: proj.client,
      milestone: createMilestone,
      milestoneNumber: ms.number,
      totalMilestones: ms.total,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "draft",
      lineItems: createLineItems,
      subtotal,
      platformFee,
      total,
      notes: createNotes || undefined,
      paymentTerms: createPaymentTerms,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setSelectedId(newInvoice.id);
    setCreateOpen(false);
    if (created) {
      toast.success(`Invoice ${newInvoice.invoiceNumber} created`);
    } else {
      toast.error("Invoice API unavailable. Saved locally only");
    }
  }

  async function handleSendInvoice(id: string) {
    const updated = await updateInvoice(id, { status: "sent" });
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "sent" as InvoiceStatus } : inv))
    );
    if (updated) toast.success("Invoice sent to client");
    else toast.error("Could not update invoice status in backend");
  }

  async function handleMarkPaid(id: string) {
    const updated = await updateInvoice(id, { status: "paid" });
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" as InvoiceStatus } : inv))
    );
    if (updated) toast.success("Invoice marked as paid");
    else toast.error("Could not update invoice status in backend");
  }

  function handleDownloadPdf() {
    toast.success("PDF download started");
  }

  const daysUntilDue = (dueDate: string) =>
    Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
            Invoices
          </h1>
          <Button className="gap-2 shadow-sm" onClick={openCreateDialog}>
            <Plus className="w-4 h-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: Invoice list */}
        <div className="w-[380px] flex-shrink-0 border-r border-border bg-white flex flex-col">
          {/* Filters */}
          <div className="px-4 pt-4 pb-3 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 rounded-sm border border-gray-200 bg-white pl-9 pr-3 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="appearance-none w-full h-9 rounded-sm border border-gray-200 bg-white px-3 pr-8 text-[13px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
              >
                <option value="all">All ({invoices.length})</option>
                <option value="sent">Sent ({invoices.filter((inv) => inv.status === "sent").length})</option>
                <option value="paid">Paid ({invoices.filter((inv) => inv.status === "paid").length})</option>
                <option value="overdue">Overdue ({invoices.filter((inv) => inv.status === "overdue").length})</option>
                <option value="draft">Draft ({invoices.filter((inv) => inv.status === "draft").length})</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Invoice rows */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-4 py-12 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No invoices found</p>
              </div>
            )}
            {filtered.map((inv) => {
              const config = STATUS_CONFIG[inv.status];
              const isSelected = inv.id === selectedId;
              const due = daysUntilDue(inv.dueDate);

              return (
                <button
                  key={inv.id}
                  onClick={() => setSelectedId(inv.id)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 border-b border-gray-100 transition-colors",
                    isSelected
                      ? "bg-brand-50 border-l-2 border-l-brand-600"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold text-gray-900">
                        {inv.invoiceNumber}
                      </p>
                      <Badge
                        variant={config.badge}
                        className="text-[10px] py-0 px-1.5"
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-[15px] font-bold text-gray-900 tabular-nums">
                      {formatCurrency(inv.total)}
                    </p>
                  </div>
                  <p className="text-[12px] text-gray-800 truncate">
                    {inv.project} — {inv.milestone}
                  </p>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    {inv.client.name}
                    {" · "}
                    {inv.status === "paid"
                      ? `Paid`
                      : inv.status === "overdue"
                        ? `${Math.abs(due)}d overdue`
                        : inv.status === "draft"
                          ? "Not sent"
                          : `Due ${formatDate(inv.dueDate)}`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Invoice preview */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  Select an invoice to preview
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-[560px] mx-auto">
              {/* Action buttons */}
              <div className="flex gap-2 mb-4">
                {selected.status === "draft" && (
                  <Button
                    onClick={() => handleSendInvoice(selected.id)}
                    className="flex-1 gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Invoice
                  </Button>
                )}
                {(selected.status === "sent" || selected.status === "viewed") && (
                  <Button
                    onClick={() => handleMarkPaid(selected.id)}
                    className="flex-1 gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Mark as Paid
                  </Button>
                )}
                {selected.status === "overdue" && (
                  <>
                    <Button
                      onClick={() => {
                        toast.success("Payment reminder sent");
                      }}
                      className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <Send className="w-4 h-4" />
                      Send Reminder
                    </Button>
                    <Button
                      onClick={() => handleMarkPaid(selected.id)}
                      variant="outline"
                      className="gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Mark Paid
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleDownloadPdf}
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              </div>

              {/* Paper document */}
              <div className="bg-white rounded-sm shadow-[0_4px_30px_-6px_rgba(0,0,0,0.15)] ring-1 ring-gray-200/80 overflow-hidden">
                {/* Top accent */}
                <div className="h-1.5 bg-brand-600" />

                <div className="px-8 pt-6 pb-7">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3.5">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                        alt="Marcus Johnson"
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-sm object-cover ring-2 ring-gray-100"
                      />
                      <div>
                        <p className="text-[16px] font-bold text-gray-900 leading-tight">
                          Johnson & Sons Construction
                        </p>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Marcus Johnson — Owner
                        </p>
                        <p className="text-[10px] text-gray-600">
                          MS License #R21909 — Fully Insured
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[28px] font-bold text-gray-900 tracking-tight leading-none">
                        INVOICE
                      </p>
                      <p className="text-[12px] text-gray-600 mt-1">
                        {selected.invoiceNumber}
                      </p>
                      <Badge
                        variant={STATUS_CONFIG[selected.status].badge}
                        className="text-[10px] py-0.5 px-2.5 mt-1.5"
                      >
                        {STATUS_CONFIG[selected.status].label}
                      </Badge>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 mb-5" />

                  {/* Bill To + From + Dates */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1.5">
                        Bill To
                      </p>
                      <p className="text-[13px] font-bold text-gray-900">
                        {selected.client.name}
                      </p>
                      <p className="text-[10px] text-gray-700 mt-0.5 leading-relaxed">
                        {selected.client.email}
                        <br />
                        {selected.client.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1.5">
                        Project
                      </p>
                      <p className="text-[13px] font-bold text-gray-900">
                        {selected.project}
                      </p>
                      <p className="text-[10px] text-gray-700 mt-0.5 leading-relaxed">
                        Milestone {selected.milestoneNumber} of{" "}
                        {selected.totalMilestones} — {selected.milestone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1.5">
                        Details
                      </p>
                      <div className="space-y-1.5">
                        <div>
                          <p className="text-[9px] text-gray-600">Issued</p>
                          <p className="text-[11px] font-semibold text-gray-900">
                            {formatDate(selected.issueDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-600">Due</p>
                          <p className="text-[11px] font-semibold text-gray-900">
                            {formatDate(selected.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Line items table */}
                  <table className="w-full mb-5">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] px-3 py-2.5 rounded-sm-lg">
                          Description
                        </th>
                        <th className="text-right text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] px-3 py-2.5 w-[45px]">
                          Qty
                        </th>
                        <th className="text-right text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] px-3 py-2.5 w-[70px]">
                          Rate
                        </th>
                        <th className="text-right text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] px-3 py-2.5 w-[80px] rounded-sm-lg">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.lineItems.map((item, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="text-[11px] text-gray-900 px-3 py-2.5">
                            {item.description}
                          </td>
                          <td className="text-[11px] text-gray-700 px-3 py-2.5 text-right tabular-nums">
                            {item.quantity}
                          </td>
                          <td className="text-[11px] text-gray-700 px-3 py-2.5 text-right tabular-nums">
                            {formatCurrency(item.rate)}
                          </td>
                          <td className="text-[11px] text-gray-900 font-semibold px-3 py-2.5 text-right tabular-nums">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="flex justify-end mb-6">
                    <div className="w-[220px]">
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="text-[10px] text-gray-600">
                          Subtotal
                        </span>
                        <span className="text-[11px] text-gray-900 tabular-nums">
                          {formatCurrency(selected.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="text-[10px] text-gray-600">
                          Platform fee (3%)
                        </span>
                        <span className="text-[11px] text-gray-900 tabular-nums">
                          {formatCurrency(selected.platformFee)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2.5 px-3 bg-gray-900 rounded-sm mt-1.5">
                        <span className="text-[12px] font-bold text-white">
                          Total Due
                        </span>
                        <span className="text-[16px] font-bold text-white tabular-nums">
                          {formatCurrency(selected.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment terms */}
                  <div className="bg-gray-50 rounded-sm px-4 py-3 mb-5">
                    <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1">
                      Payment Terms
                    </p>
                    <p className="text-[10px] text-gray-700 leading-relaxed">
                      {selected.paymentTerms}. A 1.5% monthly late fee applies
                      to balances past due.
                    </p>
                  </div>

                  {/* Notes */}
                  {selected.notes && (
                    <div className="bg-gray-50 rounded-sm px-4 py-3 mb-5">
                      <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1">
                        Notes
                      </p>
                      <p className="text-[10px] text-gray-700 leading-relaxed">
                        {selected.notes}
                      </p>
                    </div>
                  )}

                  {/* QuickBooks note */}
                  <div className="bg-brand-50 rounded-sm px-4 py-3 mb-5 border border-brand-100">
                    <p className="text-[10px] text-brand-700 font-medium">
                      Payment processed via QuickBooks Online. Client will
                      receive a secure payment link by email.
                    </p>
                  </div>

                  {/* Signature line */}
                  <div className="flex gap-8 mb-5">
                    <div className="flex-1">
                      <div className="border-b border-gray-300 pb-1 mb-1">
                        <p
                          className="text-[13px] text-gray-900 italic"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          Marcus Johnson
                        </p>
                      </div>
                      <p className="text-[9px] text-gray-600">
                        Contractor Signature
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="border-b border-gray-300 pb-1 mb-1">
                        <p className="text-[13px] text-gray-300">&nbsp;</p>
                      </div>
                      <p className="text-[9px] text-gray-600">
                        Client Signature
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-[9px] text-gray-600">
                      <p>marcus@johnson.com — (512) 555-0100</p>
                      <p>4200 South Congress Ave, Oxford, MS 78745</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-brand-600 flex items-center justify-center">
                        <span className="text-white text-[6px] font-bold">
                          FTW
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-600">
                        FairTradeWorker
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>
              Generate an invoice from a project milestone
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Project select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                Project
              </label>
              <select
                value={createProject}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                <option value="">Select a project</option>
                {PROJECTS_WITH_MILESTONES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} — {p.client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Milestone select */}
            {createProject && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                  Milestone
                </label>
                {availableMilestones.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    All milestones have been invoiced
                  </p>
                ) : (
                  <select
                    value={createMilestone}
                    onChange={(e) => handleMilestoneChange(e.target.value)}
                    className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    <option value="">Select a milestone</option>
                    {availableMilestones.map((m) => (
                      <option key={m.name} value={m.name}>
                        Milestone {m.number} of {m.total} — {m.name} (
                        {formatCurrency(m.amount)})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Line items */}
            {createLineItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                    Line Items
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={addLineItem}
                  >
                    <Plus className="w-3 h-3" />
                    Add Item
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="text-[10px] font-bold text-gray-600 uppercase tracking-wide px-3 py-2">
                          Description
                        </th>
                        <th className="text-[10px] font-bold text-gray-600 uppercase tracking-wide px-3 py-2 w-[60px]">
                          Qty
                        </th>
                        <th className="text-[10px] font-bold text-gray-600 uppercase tracking-wide px-3 py-2 w-[90px]">
                          Rate
                        </th>
                        <th className="text-[10px] font-bold text-gray-600 uppercase tracking-wide px-3 py-2 w-[90px] text-right">
                          Amount
                        </th>
                        <th className="w-[36px]" />
                      </tr>
                    </thead>
                    <tbody>
                      {createLineItems.map((item, i) => (
                        <tr
                          key={i}
                          className="border-t border-gray-100"
                        >
                          <td className="px-2 py-1.5">
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                updateLineItem(i, "description", e.target.value)
                              }
                              className="h-8 text-[12px] border-0 shadow-none px-1"
                              placeholder="Description"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateLineItem(
                                  i,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                              className="h-8 text-[12px] border-0 shadow-none px-1 text-right"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) =>
                                updateLineItem(
                                  i,
                                  "rate",
                                  Number(e.target.value)
                                )
                              }
                              className="h-8 text-[12px] border-0 shadow-none px-1 text-right"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            <span className="text-[12px] font-semibold text-gray-900 tabular-nums">
                              {formatCurrency(item.amount)}
                            </span>
                          </td>
                          <td className="px-1 py-1.5">
                            <button
                              onClick={() => removeLineItem(i)}
                              className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Subtotal in form */}
                  <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 flex justify-between">
                    <span className="text-[11px] text-gray-700">Subtotal</span>
                    <span className="text-[13px] font-bold text-gray-900 tabular-nums">
                      {formatCurrency(
                        createLineItems.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        )
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 bg-gray-50 px-3 py-1.5 flex justify-between">
                    <span className="text-[11px] text-gray-600">
                      Platform fee (3%)
                    </span>
                    <span className="text-[11px] text-gray-700 tabular-nums">
                      {formatCurrency(
                        Math.round(
                          createLineItems.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          ) *
                            0.03 *
                            100
                        ) / 100
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment terms */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                Payment Terms
              </label>
              <select
                value={createPaymentTerms}
                onChange={(e) => setCreatePaymentTerms(e.target.value)}
                className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {PAYMENT_TERMS_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                Notes (optional)
              </label>
              <Textarea
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                placeholder="Additional notes for the client..."
                className="text-[13px] resize-none"
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvoice}
                disabled={
                  !createProject ||
                  !createMilestone ||
                  createLineItems.length === 0
                }
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Create as Draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
