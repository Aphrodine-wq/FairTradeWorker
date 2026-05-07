"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FolderOpen,
  FileText,
  MessageSquare,
  Star,
  ChevronRight,
  Clock,
  User,
  X,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/ui/dialog";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";
import { fetchClients, createClient, updateClient, removeClient } from "@shared/lib/data";
import { toast } from "sonner";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Mock Data ───────────────────────────────────────────────────────────────

interface ClientInvoice {
  number: string;
  amount: number;
  status: "paid" | "sent" | "overdue";
  date: string;
}

interface ClientJob {
  title: string;
  amount: number;
  status: string;
  date: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  propertyType: string;
  source: string;
  totalRevenue: number;
  totalPaid: number;
  outstanding: number;
  totalJobs: number;
  activeJobs: number;
  rating: number | null;
  lastActivity: string;
  firstContact: string;
  status: "active" | "past" | "lead";
  notes: string;
  tags: string[];
  jobs: ClientJob[];
  invoices: ClientInvoice[];
  communications: { type: string; date: string; summary: string }[];
}

const CLIENTS: Client[] = [
  {
    id: "c1", name: "Michael Brown", email: "michael@brown.com", phone: "(512) 555-0147",
    address: "4821 Ridgeline Dr", city: "Oxford, MS", propertyType: "Single Family", source: "FairTradeWorker",
    totalRevenue: 38500, totalPaid: 19250, outstanding: 19250, totalJobs: 1, activeJobs: 1,
    rating: 5, lastActivity: "2026-03-20", firstContact: "2026-02-28", status: "active",
    notes: "Prefers morning communication. Wants to discuss patio addition after kitchen is done. Very responsive — usually replies within an hour.",
    tags: ["Repeat Potential", "High Value", "Residential"],
    jobs: [
      { title: "Kitchen Remodel - Full Gut", amount: 38500, status: "In Progress", date: "2026-03-10" },
    ],
    invoices: [
      { number: "INV-2026-001", amount: 19250, status: "paid", date: "2026-03-01" },
      { number: "INV-2026-002", amount: 19250, status: "sent", date: "2026-03-15" },
    ],
    communications: [
      { type: "Message", date: "2026-03-20", summary: "Discussed countertop template scheduling" },
      { type: "Site Visit", date: "2026-03-18", summary: "Reviewed cabinet install, client happy with progress" },
      { type: "Phone", date: "2026-03-12", summary: "Confirmed tile selection — subway white matte" },
    ],
  },
  {
    id: "c2", name: "Sarah Williams", email: "sarah@williams.com", phone: "(210) 555-0293",
    address: "7744 Stone Oak Pkwy", city: "Hattiesburg, MS", propertyType: "Single Family", source: "Referral",
    totalRevenue: 15200, totalPaid: 7600, outstanding: 7600, totalJobs: 1, activeJobs: 1,
    rating: 5, lastActivity: "2026-03-19", firstContact: "2026-03-01", status: "active",
    notes: "Very detail-oriented. Wants photo updates every 2 days. Has a dog — keep gate closed. Mentioned master bedroom reno as a future project.",
    tags: ["Detail-Oriented", "Referral", "Future Work"],
    jobs: [
      { title: "Bathroom Renovation", amount: 15200, status: "In Progress", date: "2026-03-14" },
    ],
    invoices: [
      { number: "INV-2026-003", amount: 7600, status: "paid", date: "2026-03-05" },
      { number: "INV-2026-006", amount: 7600, status: "sent", date: "2026-03-20" },
    ],
    communications: [
      { type: "Message", date: "2026-03-19", summary: "Asked about tile selection for shower niche" },
      { type: "Phone", date: "2026-03-14", summary: "Confirmed start date and demo scope" },
      { type: "Estimate", date: "2026-03-10", summary: "Sent bathroom reno estimate — accepted same day" },
    ],
  },
  {
    id: "c3", name: "Robert Johnson", email: "robert@johnson.com", phone: "(512) 555-0831",
    address: "1290 Pecan Creek Dr", city: "Oxford, MS", propertyType: "Single Family", source: "FairTradeWorker",
    totalRevenue: 22000, totalPaid: 0, outstanding: 22000, totalJobs: 1, activeJobs: 1,
    rating: null, lastActivity: "2026-03-18", firstContact: "2026-03-05", status: "active",
    notes: "Invoice overdue 6 days — follow up. Wants composite decking, not wood. Said he'll pay after framing is done but framing finished last week.",
    tags: ["Payment Issue", "Follow Up"],
    jobs: [
      { title: "Deck Build", amount: 22000, status: "In Progress", date: "2026-03-13" },
    ],
    invoices: [
      { number: "INV-2026-004", amount: 11000, status: "overdue", date: "2026-02-28" },
    ],
    communications: [
      { type: "Message", date: "2026-03-18", summary: "Sent payment reminder — no response yet" },
      { type: "Site Visit", date: "2026-03-15", summary: "Framing complete, reviewed deck board layout" },
    ],
  },
  {
    id: "c4", name: "Patricia Taylor", email: "patricia@taylor.com", phone: "(713) 555-0412",
    address: "15230 Cypress Creek", city: "Jackson, MS", propertyType: "Single Family", source: "Google",
    totalRevenue: 13500, totalPaid: 0, outstanding: 13500, totalJobs: 1, activeJobs: 1,
    rating: null, lastActivity: "2026-03-16", firstContact: "2026-03-08", status: "active",
    notes: "Roof replacement. City inspection scheduled for March 27. She's out of town until the 25th — communicate via email only.",
    tags: ["Residential", "Email Only"],
    jobs: [
      { title: "Roof Replacement", amount: 13500, status: "In Progress", date: "2026-03-15" },
    ],
    invoices: [
      { number: "INV-2026-005", amount: 13500, status: "sent", date: "2026-03-16" },
    ],
    communications: [
      { type: "Email", date: "2026-03-16", summary: "Sent invoice and inspection date confirmation" },
      { type: "Phone", date: "2026-03-08", summary: "Initial call — described roof leak, scheduled site visit" },
    ],
  },
  {
    id: "c5", name: "David Park", email: "david@park.com", phone: "(512) 555-0667",
    address: "3401 Barton Springs Rd", city: "Oxford, MS", propertyType: "Single Family", source: "FairTradeWorker",
    totalRevenue: 0, totalPaid: 0, outstanding: 0, totalJobs: 0, activeJobs: 0,
    rating: null, lastActivity: "2026-03-17", firstContact: "2026-03-15", status: "lead",
    notes: "Sent estimate for garage conversion — $27,500. Waiting on response. Said he's getting 2 other bids.",
    tags: ["Competitive Bid", "Garage"],
    jobs: [],
    invoices: [],
    communications: [
      { type: "Estimate", date: "2026-03-17", summary: "Sent garage conversion estimate — $27,500" },
      { type: "Site Visit", date: "2026-03-15", summary: "Measured garage, discussed insulation and HVAC options" },
    ],
  },
  {
    id: "c6", name: "Amanda Torres", email: "amanda@torres.com", phone: "(512) 555-0198",
    address: "890 Lakeway Blvd", city: "Water Valley, MS", propertyType: "Single Family", source: "FairTradeWorker",
    totalRevenue: 0, totalPaid: 0, outstanding: 0, totalJobs: 0, activeJobs: 0,
    rating: null, lastActivity: "2026-03-15", firstContact: "2026-03-12", status: "lead",
    notes: "Patio cover + outdoor kitchen. High budget — not price sensitive. Viewed estimate twice. Follow up this week.",
    tags: ["High Value", "Outdoor Living", "Hot Lead"],
    jobs: [],
    invoices: [],
    communications: [
      { type: "Estimate", date: "2026-03-15", summary: "Sent patio cover + outdoor kitchen estimate — $41,200" },
      { type: "Site Visit", date: "2026-03-12", summary: "Walked backyard, discussed gas line routing and cover design" },
    ],
  },
  {
    id: "c7", name: "Chris Martinez", email: "chris@martinez.com", phone: "(512) 555-0544",
    address: "2100 Oak Hill Dr", city: "Starkville, MS", propertyType: "Single Family", source: "Referral",
    totalRevenue: 0, totalPaid: 0, outstanding: 0, totalJobs: 0, activeJobs: 0,
    rating: null, lastActivity: "2026-03-09", firstContact: "2026-03-02", status: "past",
    notes: "Declined fence estimate ($6,750). Said budget was too high — may come back in summer. Referred by Kevin Nguyen.",
    tags: ["Declined", "Summer Potential"],
    jobs: [],
    invoices: [],
    communications: [
      { type: "Estimate", date: "2026-03-09", summary: "Estimate declined — too expensive" },
      { type: "Site Visit", date: "2026-03-05", summary: "Measured 150 LF fence line, discussed cedar vs composite" },
    ],
  },
  {
    id: "c8", name: "Kevin Nguyen", email: "kevin@nguyen.com", phone: "(512) 555-0376",
    address: "1845 Sam Bass Rd", city: "Starkville, MS", propertyType: "Single Family", source: "FairTradeWorker",
    totalRevenue: 0, totalPaid: 0, outstanding: 0, totalJobs: 0, activeJobs: 0,
    rating: null, lastActivity: "2026-03-20", firstContact: "2026-03-18", status: "lead",
    notes: "HVAC estimate walkthrough today at 3:30p. System is 18 years old, probably needs full replacement. Referred Chris Martinez to us.",
    tags: ["HVAC", "New Lead"],
    jobs: [],
    invoices: [],
    communications: [
      { type: "Phone", date: "2026-03-18", summary: "Initial call — described HVAC issues, scheduled walkthrough" },
    ],
  },
];

const STATUS_BADGE: Record<string, "default" | "success" | "secondary"> = {
  active: "success",
  lead: "default",
  past: "secondary",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  usePageTitle("Clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "lead" | "past">("all");
  const [selectedId, setSelectedId] = useState<string>("");
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientStatus, setClientStatus] = useState<"lead" | "active" | "past">("lead");
  const [clientNotes, setClientNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchClients().then((apiClients) => {
      const mapped = apiClients.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email || "",
        phone: c.phone || "",
        address: c.address || "",
        city: "",
        propertyType: "",
        source: "",
        totalRevenue: 0,
        totalPaid: 0,
        outstanding: 0,
        totalJobs: 0,
        activeJobs: 0,
        rating: null,
        lastActivity: c.created_at,
        firstContact: c.created_at,
        status: "active" as const,
        notes: c.notes || "",
        tags: [],
        jobs: [],
        invoices: [],
        communications: [],
      }));
      setClients(mapped);
      setSelectedId(mapped[0]?.id ?? "");
    });
  }, []);

  function resetCreateForm() {
    setFirstName("");
    setLastName("");
    setClientEmail("");
    setClientPhone("");
    setClientAddress("");
    setClientStatus("lead");
    setClientNotes("");
  }

  async function handleCreateClient() {
    const name = `${firstName} ${lastName}`.trim();
    if (!name) {
      toast.error("Please enter a client name");
      return;
    }
    const created = await createClient({
      name,
      email: clientEmail || undefined,
      phone: clientPhone || undefined,
      address: clientAddress || undefined,
      notes: clientNotes || undefined,
    });
    if (!created) {
      toast.error("Could not create client");
      return;
    }
    const now = new Date().toISOString();
    const next: Client = {
      id: created.id,
      name: created.name || name,
      email: created.email || "",
      phone: created.phone || "",
      address: created.address || "",
      city: "",
      propertyType: "",
      source: "FairTradeWorker",
      totalRevenue: 0,
      totalPaid: 0,
      outstanding: 0,
      totalJobs: 0,
      activeJobs: 0,
      rating: null,
      lastActivity: now,
      firstContact: now,
      status: clientStatus,
      notes: created.notes || clientNotes || "",
      tags: [],
      jobs: [],
      invoices: [],
      communications: [],
    };
    setClients((prev) => [next, ...prev]);
    setSelectedId(next.id);
    setAddClientOpen(false);
    resetCreateForm();
    toast.success("Client created");
  }

  const filtered = clients
    .filter((c) => filter === "all" || c.status === filter)
    .filter((c) =>
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    );

  const selected = clients.find((c) => c.id === selectedId) || null;
  const totalClientRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
  const activeCount = clients.filter((c) => c.status === "active").length;
  const leadCount = clients.filter((c) => c.status === "lead").length;

  async function handleSaveSelectedNotes() {
    if (!selected) return;
    setSavingNotes(true);
    const updated = await updateClient(selected.id, { notes: selected.notes });
    setSavingNotes(false);
    if (updated) toast.success("Client notes saved");
    else toast.error("Could not save notes to backend");
  }

  async function handleDeleteSelectedClient() {
    if (!selected) return;
    const ok = await removeClient(selected.id);
    if (!ok) {
      toast.error("Could not delete client");
      return;
    }
    setClients((prev) => {
      const nextList = prev.filter((c) => c.id !== selected.id);
      if (nextList[0]) setSelectedId(nextList[0].id);
      return nextList;
    });
    toast.success("Client deleted");
  }

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Clients</h1>
          <Dialog
            open={addClientOpen}
            onOpenChange={(open) => {
              setAddClientOpen(open);
              if (!open) resetCreateForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden bg-white rounded-sm">
              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <DialogHeader>
                  <DialogTitle className="text-[20px] font-bold text-gray-900">Add New Client</DialogTitle>
                </DialogHeader>
                <p className="text-[13px] text-gray-600 mt-1">Add a client to your CRM to track jobs, invoices, and communication.</p>
              </div>

              <div className="px-6 pb-6">
                {/* Avatar placeholder */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-sm bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-gray-300" />
                  </div>
                  <div>
                    <button className="text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors">Upload photo</button>
                    <p className="text-[11px] text-gray-600 mt-0.5">Optional — helps you recognize clients fast</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12px] font-semibold text-gray-900 block mb-1.5">First Name</label>
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" placeholder="John" className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow" />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-gray-900 block mb-1.5">Last Name</label>
                      <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" placeholder="Smith" className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow" />
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="text-[12px] font-semibold text-gray-900 block mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" placeholder="john@example.com" className="w-full h-10 rounded-sm border border-gray-200 bg-white pl-10 pr-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-gray-900 block mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} type="tel" placeholder="(512) 555-0000" className="w-full h-10 rounded-sm border border-gray-200 bg-white pl-10 pr-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow" />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-[12px] font-semibold text-gray-900 block mb-1.5">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} type="text" placeholder="1234 Main St, Oxford, MS 78701" className="w-full h-10 rounded-sm border border-gray-200 bg-white pl-10 pr-3 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow" />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-[12px] font-semibold text-gray-900 block mb-1.5">Status</label>
                    <select value={clientStatus} onChange={(e) => setClientStatus(e.target.value as "lead" | "active" | "past")} className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow appearance-none">
                      <option value="lead">Lead</option>
                      <option value="active">Active</option>
                      <option value="past">Past</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[12px] font-semibold text-gray-900 block mb-1.5">Notes</label>
                    <textarea value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} rows={3} placeholder="Any details about this client..." className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow resize-none" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <Button className="gap-2 min-w-[120px]" onClick={handleCreateClient}>
                    <Plus className="w-4 h-4" />
                    Add Client
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-[1400px]">
          {/* Stats */}
          <div className="flex gap-6 mb-6">
            <div>
              <p className="text-[13px] text-gray-600">Total Revenue</p>
              <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{formatCurrency(totalClientRevenue)}</p>
            </div>
            <div>
              <p className="text-[13px] text-gray-600">Active Clients</p>
              <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{activeCount}</p>
            </div>
            <div>
              <p className="text-[13px] text-gray-600">Leads</p>
              <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{leadCount}</p>
            </div>
            <div>
              <p className="text-[13px] text-gray-600">Total Clients</p>
              <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{clients.length}</p>
            </div>
          </div>

          {/* Filters + Search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {(["all", "active", "lead", "past"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "text-[13px] font-medium px-3 py-1.5 rounded-sm transition-colors",
                    filter === f
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 rounded-sm border border-gray-200 bg-white pl-9 pr-3 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 w-[220px]"
              />
            </div>
          </div>

          {/* List + Detail */}
          <div className="flex gap-5">
            {/* Client list */}
            <div className="flex-1 space-y-1.5">
              {filtered.map((client) => {
                const isSelected = client.id === selectedId;
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedId(client.id)}
                    className={cn(
                      "w-full text-left rounded-sm p-4 transition-all",
                      isSelected
                        ? "bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] ring-1 ring-gray-200"
                        : "bg-white hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-sm bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-brand-700 text-[13px] font-bold">
                            {client.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-gray-900">{client.name}</p>
                          <p className="text-[12px] text-gray-600">{client.city}</p>
                        </div>
                      </div>
                      <Badge variant={STATUS_BADGE[client.status]} className="text-[11px]">
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 ml-12">
                      {client.totalRevenue > 0 && (
                        <span className="text-[13px] font-bold text-gray-900 tabular-nums">{formatCurrency(client.totalRevenue)}</span>
                      )}
                      {client.totalJobs > 0 && (
                        <span className="text-[12px] text-gray-600">{client.totalJobs} job{client.totalJobs > 1 ? "s" : ""}</span>
                      )}
                      <span className="text-[11px] text-gray-600">{formatDate(client.lastActivity)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="w-[460px] flex-shrink-0 bg-white rounded-sm shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] ring-1 ring-gray-200 self-start sticky top-5 overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-5 pb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-sm bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-700 text-[20px] font-bold">
                        {selected.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[20px] font-bold text-gray-900">{selected.name}</p>
                        <Badge variant={STATUS_BADGE[selected.status]} className="text-[11px]">
                          {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[12px] text-gray-600">{selected.propertyType}</span>
                        <span className="text-[12px] text-gray-600">via {selected.source}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium text-gray-700 bg-gray-100 rounded-sm px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="px-6 py-4 bg-gray-50 space-y-2">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <span className="text-[13px] text-gray-900">{selected.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <span className="text-[13px] text-gray-900">{selected.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <span className="text-[13px] text-gray-900">{selected.address}, {selected.city}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <span className="text-[12px] text-gray-600">Client since {formatDate(selected.firstContact)} — Last active {formatDate(selected.lastActivity)}</span>
                  </div>
                </div>

                <div className="px-6 py-5">
                  {/* Financials */}
                  <div className="grid grid-cols-4 gap-3 mb-5 pb-5 border-b border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-600">Revenue</p>
                      <p className="text-[17px] font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{formatCurrency(selected.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600">Paid</p>
                      <p className="text-[17px] font-bold text-emerald-950 tabular-nums leading-tight mt-0.5">{formatCurrency(selected.totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600">Outstanding</p>
                      <p className={cn("text-[17px] font-bold tabular-nums leading-tight mt-0.5", selected.outstanding > 0 ? "text-amber-600" : "text-gray-900")}>{formatCurrency(selected.outstanding)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600">Rating</p>
                      {selected.rating ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <p className="text-[17px] font-bold text-gray-900 tabular-nums leading-tight">{selected.rating}</p>
                        </div>
                      ) : (
                        <p className="text-[13px] text-gray-300 mt-1">—</p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-5 pb-5 border-b border-gray-100">
                    <p className="text-[13px] font-bold text-gray-900 mb-2">Notes</p>
                    <textarea
                      value={selected.notes}
                      onChange={(e) => {
                        const value = e.target.value;
                        setClients((prev) => prev.map((c) => (c.id === selected.id ? { ...c, notes: value } : c)));
                      }}
                      rows={3}
                      className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  {/* Job history */}
                  {selected.jobs.length > 0 && (
                    <div className="mb-5 pb-5 border-b border-gray-100">
                      <p className="text-[13px] font-bold text-gray-900 mb-2">Jobs</p>
                      <div className="space-y-2.5">
                        {selected.jobs.map((job, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div>
                              <p className="text-[13px] font-semibold text-gray-900">{job.title}</p>
                              <p className="text-[11px] text-gray-600">{job.status} — Started {formatDate(job.date)}</p>
                            </div>
                            <p className="text-[14px] font-bold text-gray-900 tabular-nums">{formatCurrency(job.amount)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invoices */}
                  {selected.invoices.length > 0 && (
                    <div className="mb-5 pb-5 border-b border-gray-100">
                      <p className="text-[13px] font-bold text-gray-900 mb-2">Invoices</p>
                      <div className="space-y-2">
                        {selected.invoices.map((inv, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] text-gray-700 font-mono">{inv.number}</span>
                              <Badge
                                variant={inv.status === "paid" ? "success" : inv.status === "overdue" ? "danger" : "info"}
                                className="text-[9px]"
                              >
                                {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-[13px] font-bold text-gray-900 tabular-nums">{formatCurrency(inv.amount)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Communication history */}
                  {selected.communications.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[13px] font-bold text-gray-900 mb-2">Recent Activity</p>
                      <div className="space-y-3">
                        {selected.communications.map((comm, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-1 rounded-sm bg-gray-200 flex-shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-gray-900">{comm.type}</span>
                                <span className="text-[10px] text-gray-600">{formatDate(comm.date)}</span>
                              </div>
                              <p className="text-[12px] text-gray-700 mt-0.5">{comm.summary}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" className="flex-1 gap-2 text-[13px]">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 text-[13px]">
                      <FileText className="w-4 h-4" />
                      New Estimate
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 text-[13px]">
                      <DollarSign className="w-4 h-4" />
                      Invoice
                    </Button>
                    <Button variant="outline" className="gap-2 text-[13px]" onClick={handleSaveSelectedNotes} disabled={savingNotes}>
                      {savingNotes ? "Saving..." : "Save Notes"}
                    </Button>
                    <Button variant="destructive" className="gap-2 text-[13px]" onClick={handleDeleteSelectedClient}>
                      <X className="w-4 h-4" />
                      Delete
                    </Button>
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
