"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  CalendarDays,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  AlertCircle,
  Upload,
  CheckSquare,
  MessageSquare,
  Camera,
  X,
  Trash2,
  LayoutDashboard,
  FileText,
  Calendar,
  Wrench,
  ClipboardList,
  Pencil,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@shared/components/app-header";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Progress } from "@shared/ui/progress";
import { Separator } from "@shared/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@shared/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/ui/dialog";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";
import { fetchProjects } from "@shared/lib/data";

// ─── Mock data ────────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: "j1",
    name: "Kitchen Remodel - Full Gut",
    client: "Michael Brown",
    contractValue: 38500,
    startDate: "2026-03-10",
    estimatedEnd: "2026-04-25",
    progress: 52,
    milestones: [
      { label: "Demo complete", done: true },
      { label: "Rough-in (plumb/elec)", done: true },
      { label: "Cabinet install", done: true },
      { label: "Countertops", done: false },
      { label: "Tile & flooring", done: false },
      { label: "Final walkthrough", done: false },
    ],
    changeOrders: 2,
    hoursThisWeek: 34,
    punchListComplete: 5,
    punchListTotal: 12,
  },
  {
    id: "j2",
    name: "Bathroom Reno",
    client: "Sarah Williams",
    contractValue: 15200,
    startDate: "2026-03-14",
    estimatedEnd: "2026-04-05",
    progress: 35,
    milestones: [
      { label: "Demo complete", done: true },
      { label: "Plumbing rough-in", done: true },
      { label: "Tile & waterproofing", done: false },
      { label: "Vanity & fixtures", done: false },
      { label: "Final walkthrough", done: false },
    ],
    changeOrders: 1,
    hoursThisWeek: 20,
    punchListComplete: 1,
    punchListTotal: 8,
  },
  {
    id: "j3",
    name: "Deck Build",
    client: "Robert Johnson",
    contractValue: 22000,
    startDate: "2026-03-13",
    estimatedEnd: "2026-04-10",
    progress: 40,
    milestones: [
      { label: "Footings & posts", done: true },
      { label: "Framing", done: true },
      { label: "Decking boards", done: false },
      { label: "Railing & stairs", done: false },
      { label: "Final walkthrough", done: false },
    ],
    changeOrders: 1,
    hoursThisWeek: 28,
    punchListComplete: 0,
    punchListTotal: 5,
  },
  {
    id: "j4",
    name: "Roof Replacement",
    client: "Patricia Taylor",
    contractValue: 13500,
    startDate: "2026-03-15",
    estimatedEnd: "2026-03-22",
    progress: 80,
    milestones: [
      { label: "Tear-off complete", done: true },
      { label: "OSB & underlayment", done: true },
      { label: "Shingles", done: true },
      { label: "Flashings & ridge", done: false },
      { label: "Final inspection", done: false },
    ],
    changeOrders: 1,
    hoursThisWeek: 16,
    punchListComplete: 2,
    punchListTotal: 4,
  },
];

// ─── Change Orders data ───────────────────────────────────────────────────────

type COStatus = "Approved" | "Pending" | "Declined";

interface ChangeOrder {
  id: string;
  description: string;
  amount: number;
  status: COStatus;
  date: string;
  labor: number;
  materials: number;
  reason: string;
}

const ALL_COS: Record<string, ChangeOrder[]> = {
  j1: [
    { id: "CO-001", description: "Add under-cabinet lighting", amount: 1200, status: "Approved", date: "2026-03-05", labor: 400, materials: 800, reason: "Client requested after cabinet installation was complete." },
    { id: "CO-002", description: "Upgrade to quartz from laminate", amount: 3800, status: "Pending", date: "2026-03-12", labor: 800, materials: 3000, reason: "Client changed mind on countertop material after seeing samples." },
  ],
  j2: [
    { id: "CO-003", description: "Move shower drain 6 inches", amount: 450, status: "Approved", date: "2026-03-08", labor: 350, materials: 100, reason: "Required to center drain within new shower footprint." },
  ],
  j3: [
    { id: "CO-005", description: "Composite railing upgrade (declined)", amount: 2100, status: "Declined", date: "2026-03-10", labor: 600, materials: 1500, reason: "Client declined after reviewing pricing." },
  ],
  j4: [
    { id: "CO-004", description: "Replace 4 sheets OSB", amount: 680, status: "Pending", date: "2026-03-15", labor: 280, materials: 400, reason: "Found compromised OSB during tear-off not visible during inspection." },
  ],
};

// ─── Daily Log data ───────────────────────────────────────────────────────────

const WEATHER_OPTIONS = [
  { label: "Clear", icon: Sun },
  { label: "Cloudy", icon: Cloud },
  { label: "Rain", icon: CloudRain },
  { label: "Snow", icon: Snowflake },
  { label: "Wind", icon: Wind },
];

const CREW_NAMES = ["Marcus", "Tony", "David", "Alex", "Maria"];

const WEEK_DAYS = [
  { short: "Mon", date: "2026-03-17", num: "17" },
  { short: "Tue", date: "2026-03-18", num: "18" },
  { short: "Wed", date: "2026-03-19", num: "19" },
  { short: "Thu", date: "2026-03-20", num: "20" },
  { short: "Fri", date: "2026-03-21", num: "21" },
];

interface LogEntry {
  id: string;
  date: string;
  weather: string;
  temp: string;
  crew: string[];
  hours: string;
  workPerformed: string;
  materialsDelivered: string;
  issues: string;
  safetyIncidents: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: "log-1", date: "2026-03-18", weather: "Clear", temp: "72", crew: ["Marcus", "Tony", "David"], hours: "9", workPerformed: "Completed upper cabinet installation on north wall. Set and leveled all 8 boxes. Started crown molding prep cuts.", materialsDelivered: "Crown molding — 3 bundles (16 LF each).", issues: "Soffit framing was 1/2\" out of square — had to shim two cabinet runs.", safetyIncidents: "" },
  { id: "log-2", date: "2026-03-17", weather: "Cloudy", temp: "65", crew: ["Marcus", "Tony", "David", "Alex"], hours: "10", workPerformed: "Demo complete on lower cabinets. Subfloor inspection revealed no rot. Started upper cabinet run layout.", materialsDelivered: "Upper cabinet boxes staged in dining room.", issues: "Found old galvanized pipe — added to scope (CO-002).", safetyIncidents: "" },
];

// ─── Schedule data ────────────────────────────────────────────────────────────

const CREW = ["Marcus Johnson", "Tony Rivera", "David Park", "Alex Torres", "Maria Castillo"];
const DAYS = ["Mon 3/17", "Tue 3/18", "Wed 3/19", "Thu 3/20", "Fri 3/21"];

const PROJECT_COLORS: Record<string, string> = {
  "Kitchen Remodel - Full Gut": "bg-blue-50 border-blue-200 text-blue-800",
  "Bathroom Reno":              "bg-purple-50 border-purple-200 text-purple-800",
  "Deck Build":                 "bg-teal-50 border-teal-200 text-teal-800",
  "Roof Replacement":           "bg-orange-50 border-orange-200 text-orange-800",
};

interface Assignment { project: string; time: string; }

const SCHEDULE: (Assignment | null)[][] = [
  [
    { project: "Kitchen Remodel - Full Gut", time: "7a–4p" },
    { project: "Kitchen Remodel - Full Gut", time: "7a–4p" },
    { project: "Kitchen Remodel - Full Gut", time: "7a–4p" },
    { project: "Roof Replacement", time: "7a–3p" },
    { project: "Roof Replacement", time: "7a–2p" },
  ],
  [
    { project: "Bathroom Reno", time: "8a–4p" },
    { project: "Bathroom Reno", time: "8a–4p" },
    { project: "Kitchen Remodel - Full Gut", time: "7a–4p" },
    { project: "Kitchen Remodel - Full Gut", time: "7a–4p" },
    null,
  ],
  [
    { project: "Roof Replacement", time: "7a–3p" },
    { project: "Roof Replacement", time: "7a–3p" },
    { project: "Roof Replacement", time: "7a–3p" },
    { project: "Deck Build", time: "8a–5p" },
    { project: "Deck Build", time: "8a–5p" },
  ],
  [
    { project: "Deck Build", time: "8a–5p" },
    { project: "Deck Build", time: "8a–5p" },
    { project: "Deck Build", time: "8a–5p" },
    null,
    null,
  ],
  [
    null,
    null,
    null,
    null,
    null,
  ],
];

// ─── Punch List data ──────────────────────────────────────────────────────────

type Priority = "high" | "medium" | "low";
type ItemStatus = "open" | "in-progress" | "completed";

interface PunchItem { id: string; description: string; location: string; priority: Priority; status: ItemStatus; assignedTo: string; }

const ALL_PUNCH: Record<string, PunchItem[]> = {
  j1: [
    { id: "p1", description: "Fix slow-close on upper cabinet door", location: "Kitchen", priority: "high", status: "in-progress", assignedTo: "Marcus" },
    { id: "p2", description: "Touch up paint on cabinet trim", location: "Kitchen", priority: "medium", status: "open", assignedTo: "Marcus" },
    { id: "p3", description: "Caulk gap at backsplash to wall", location: "Kitchen", priority: "low", status: "completed", assignedTo: "Tony" },
    { id: "p4", description: "Replace missing grout near dishwasher", location: "Kitchen", priority: "medium", status: "open", assignedTo: "Tony" },
    { id: "p5", description: "Adjust drawer slide — bottom left", location: "Kitchen", priority: "high", status: "open", assignedTo: "Marcus" },
  ],
  j2: [
    { id: "p6", description: "Re-caulk shower door threshold", location: "Bath", priority: "medium", status: "open", assignedTo: "Tony" },
    { id: "p7", description: "Adjust mirror alignment", location: "Bath", priority: "low", status: "completed", assignedTo: "Marcus" },
  ],
  j3: [],
  j4: [
    { id: "p8", description: "Seal around pipe boots", location: "Exterior", priority: "high", status: "open", assignedTo: "David" },
    { id: "p9", description: "Touch up ridge cap ends", location: "Exterior", priority: "low", status: "completed", assignedTo: "Alex" },
  ],
};

// ─── Job Costing data ─────────────────────────────────────────────────────────

interface CostCategory { category: string; estimated: number; actual: number; }

const ALL_COSTING: Record<string, CostCategory[]> = {
  j1: [
    { category: "Labor",          estimated: 12000, actual: 13200 },
    { category: "Materials",      estimated: 16000, actual: 15400 },
    { category: "Equipment",      estimated: 800,   actual: 650 },
    { category: "Subcontractors", estimated: 5000,  actual: 5800 },
    { category: "Permits",        estimated: 600,   actual: 580 },
  ],
  j2: [
    { category: "Labor",          estimated: 4800, actual: 4400 },
    { category: "Materials",      estimated: 5200, actual: 5050 },
    { category: "Subcontractors", estimated: 2200, actual: 2200 },
    { category: "Permits",        estimated: 350,  actual: 350 },
  ],
  j3: [
    { category: "Labor",     estimated: 7000, actual: 8100 },
    { category: "Materials", estimated: 9500, actual: 9200 },
    { category: "Permits",   estimated: 250,  actual: 250 },
  ],
  j4: [
    { category: "Labor",     estimated: 3200, actual: 3200 },
    { category: "Materials", estimated: 7100, actual: 7480 },
    { category: "Permits",   estimated: 200,  actual: 200 },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: COStatus }) {
  if (status === "Approved") return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" />Approved</Badge>;
  if (status === "Pending") return <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
  return <Badge variant="danger" className="gap-1"><AlertTriangle className="w-3 h-3" />Declined</Badge>;
}

function WeatherIcon({ weather }: { weather: string }) {
  const opt = WEATHER_OPTIONS.find((w) => w.label === weather);
  if (!opt) return null;
  const Icon = opt.icon;
  return <Icon className="w-3.5 h-3.5" />;
}

function VarianceCell({ estimated, actual }: { estimated: number; actual: number }) {
  if (estimated === 0 && actual === 0) return <span className="text-gray-300 text-sm">—</span>;
  const variance = actual - estimated;
  const pct = estimated > 0 ? ((variance / estimated) * 100).toFixed(1) : "0";
  const over = variance > 0;
  return (
    <div className={cn("flex flex-col", over ? "text-red-600" : "text-brand-600")}>
      <span className="text-sm font-semibold">{over ? "+" : ""}{formatCurrency(variance)}</span>
      <span className="text-xs">{over ? "+" : ""}{pct}%</span>
    </div>
  );
}

// ─── Tab components ───────────────────────────────────────────────────────────

// Mock per-project next steps
const NEXT_STEPS: Record<string, { label: string; action: string }[]> = {
  j1: [
    { label: "Countertops", action: "Order countertop slab from supplier — quartz upgrade pending CO-002 approval" },
    { label: "Tile & flooring", action: "Schedule tile delivery and confirm installer availability" },
    { label: "Final walkthrough", action: "Coordinate final walkthrough date with Michael" },
  ],
  j2: [
    { label: "Tile & waterproofing", action: "Apply Schluter membrane before tile set — inspector scheduled Thu" },
    { label: "Vanity & fixtures", action: "Confirm vanity delivery ETA with supplier" },
    { label: "Final walkthrough", action: "Schedule plumbing inspection after fixtures are set" },
  ],
  j3: [
    { label: "Decking boards", action: "Pick up composite decking boards — 14 squares needed" },
    { label: "Railing & stairs", action: "Confirm railing post layout with Robert before install" },
    { label: "Final walkthrough", action: "Schedule city inspection for completed deck" },
  ],
  j4: [
    { label: "Flashings & ridge", action: "Install step flashings at chimney and all wall transitions" },
    { label: "Final inspection", action: "Call city inspector to book final roof inspection" },
  ],
};

const PROJECT_DOCS: Record<string, { name: string; type: string; size: string }[]> = {
  j1: [
    { name: "Signed Contract", type: "PDF", size: "284 KB" },
    { name: "Change Order #1 — Under-cabinet lighting", type: "PDF", size: "91 KB" },
    { name: "Change Order #2 — Quartz upgrade", type: "PDF", size: "88 KB" },
    { name: "Certificate of Insurance", type: "PDF", size: "156 KB" },
    { name: "Building Permit", type: "PDF", size: "72 KB" },
  ],
  j2: [
    { name: "Signed Contract", type: "PDF", size: "261 KB" },
    { name: "Change Order #1 — Drain relocation", type: "PDF", size: "78 KB" },
    { name: "Certificate of Insurance", type: "PDF", size: "156 KB" },
  ],
  j3: [
    { name: "Signed Contract", type: "PDF", size: "247 KB" },
    { name: "Change Order #1 — Composite railing (Declined)", type: "PDF", size: "82 KB" },
    { name: "Certificate of Insurance", type: "PDF", size: "156 KB" },
    { name: "Deck Permit", type: "PDF", size: "68 KB" },
  ],
  j4: [
    { name: "Signed Contract", type: "PDF", size: "239 KB" },
    { name: "Change Order #1 — OSB replacement", type: "PDF", size: "74 KB" },
    { name: "Certificate of Insurance", type: "PDF", size: "156 KB" },
  ],
};

const CLIENT_INFO: Record<string, { phone: string; email: string; preferred: string }> = {
  j1: { phone: "(512) 555-0392", email: "michael@email.com", preferred: "Text" },
  j2: { phone: "(512) 555-0147", email: "sarah.w@email.com", preferred: "Email" },
  j3: { phone: "(512) 555-0281", email: "robert.j@email.com", preferred: "Call" },
  j4: { phone: "(512) 555-0534", email: "patricia.t@email.com", preferred: "Text" },
};

function OverviewTab({ project }: { project: typeof PROJECTS[0] }) {
  const [notes, setNotes] = useState("");

  const clientInfo = CLIENT_INFO[project.id] ?? { phone: "(512) 555-0000", email: "client@email.com", preferred: "Text" };
  const nextSteps = (NEXT_STEPS[project.id] ?? []).slice(0, 3);
  const docs = PROJECT_DOCS[project.id] ?? [];

  // Timeline math
  const start = new Date(project.startDate);
  const end = new Date(project.estimatedEnd);
  const today = new Date("2026-03-20");
  const totalDays = Math.max((end.getTime() - start.getTime()) / 86400000, 1);
  const elapsedDays = Math.min(Math.max((today.getTime() - start.getTime()) / 86400000, 0), totalDays);
  const todayPct = Math.round((elapsedDays / totalDays) * 100);

  // Place milestone dots evenly across the timeline
  const milestonePositions = project.milestones.map((m, i) => ({
    ...m,
    pct: Math.round(((i + 1) / project.milestones.length) * 100),
  }));

  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  const completedMilestones = project.milestones.filter((m) => m.done).length;

  return (
    <div className="space-y-6 max-w-[900px]">
      {/* Progress hero */}
      <div className="flex items-start gap-8">
        <div>
          <p className="text-[42px] font-bold text-gray-900 tabular-nums leading-none">{project.progress}%</p>
          <p className="text-[13px] text-gray-400 mt-1">{completedMilestones} of {project.milestones.length} milestones</p>
        </div>
        <div className="flex-1 pt-2">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-brand-600 rounded-full" style={{ width: `${project.progress}%` }} />
          </div>
          <div className="flex justify-between text-[12px] text-gray-400">
            <span>{formatDate(project.startDate)}</span>
            <span>{daysLeft > 0 ? `${daysLeft} days remaining` : "Overdue"}</span>
            <span>{formatDate(project.estimatedEnd)}</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <p className="text-[15px] font-bold text-gray-900 mb-3">Milestones</p>
        <div className="space-y-2">
          {project.milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              {m.done
                ? <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />
                : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
              <span className={cn("text-[14px] flex-1", m.done ? "text-gray-400" : "text-gray-900 font-medium")}>{m.label}</span>
              {m.done && <span className="text-[12px] text-brand-600 font-medium">Complete</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps + Client — side by side */}
      <div className="grid grid-cols-2 gap-6">
        {/* Next Steps */}
        <div>
          <p className="text-[15px] font-bold text-gray-900 mb-3">Next Steps</p>
          <div className="space-y-3">
            {nextSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">{step.label}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{step.action}</p>
                </div>
              </div>
            ))}
            {nextSteps.length === 0 && (
              <p className="text-[13px] text-brand-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Ready for final walkthrough</p>
            )}
          </div>
        </div>

        {/* Client */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[15px] font-bold text-gray-900">Client</p>
            <Link href="/contractor/messages" className="text-[13px] font-medium text-brand-600 hover:text-brand-700 transition-colors">Message</Link>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[16px] font-bold text-gray-900">{project.client}</p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-[13px] text-gray-400">Phone</span>
              <span className="text-[14px] font-medium text-gray-900">{clientInfo.phone}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-[13px] text-gray-400">Email</span>
              <span className="text-[14px] font-medium text-gray-900">{clientInfo.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[13px] text-gray-400">Preferred</span>
              <span className="text-[14px] font-medium text-gray-900">{clientInfo.preferred}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps + Project Notes row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Next Steps */}
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Next Steps</p>
          <div className="space-y-3">
            {nextSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-amber-600">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{step.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.action}</p>
                </div>
              </div>
            ))}
            {nextSteps.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-brand-600">
                <CheckCircle2 className="w-4 h-4" />
                All milestones complete — ready for final walkthrough.
              </div>
            )}
          </div>
        </div>

        {/* Project Notes */}
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Project Notes</p>
            <span className="text-xs text-gray-400">Saved locally</span>
          </div>
          <Textarea
            placeholder="Jot quick notes about this project — supplier contacts, site access codes, special instructions..."
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none text-sm"
          />
          {notes && (
            <p className="text-xs text-gray-400 mt-2">{notes.length} characters</p>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-900">Documents</p>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Upload className="w-3.5 h-3.5" />
            Upload
          </Button>
        </div>
        <div className="divide-y divide-border">
          {docs.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-red-600">PDF</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-xs text-gray-500">{doc.type} &middot; {doc.size}</p>
              </div>
              <button className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors flex-shrink-0">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DailyLogTab({ projectId }: { projectId: string }) {
  const [selectedDate, setSelectedDate] = useState("2026-03-19");
  const [weather, setWeather] = useState("Clear");
  const [temp, setTemp] = useState("");
  const [crew, setCrew] = useState<string[]>([]);
  const [hours, setHours] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [materialsDelivered, setMaterialsDelivered] = useState("");
  const [issues, setIssues] = useState("");
  const [safetyIncidents, setSafetyIncidents] = useState("");
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggleCrew(name: string) {
    setCrew((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
  }

  function handleSave() {
    if (!workPerformed) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      {/* Week pills */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500 mr-1">Week of Mar 17:</span>
        {WEEK_DAYS.map((d) => (
          <button key={d.date} onClick={() => setSelectedDate(d.date)} className={cn("flex flex-col items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors", selectedDate === d.date ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-700 border-border hover:bg-gray-50")}>
            <span className="text-xs">{d.short}</span>
            <span className="font-bold">{d.num}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-5">
        {/* Entry form */}
        <div className="bg-white border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Log Entry — {formatDate(selectedDate)}</h3>
            {saved && <span className="flex items-center gap-1.5 text-xs text-brand-600 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Saved</span>}
          </div>
          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Hours Worked</label>
              <Input type="number" placeholder="8" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Temperature (°F)</label>
              <Input type="number" placeholder="72" value={temp} onChange={(e) => setTemp(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Weather</label>
            <div className="flex gap-1.5 flex-wrap">
              {WEATHER_OPTIONS.map((w) => {
                const Icon = w.icon;
                return (
                  <button key={w.label} onClick={() => setWeather(w.label)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors", weather === w.label ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-border hover:bg-gray-50")}>
                    <Icon className="w-3.5 h-3.5" />{w.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Crew on Site</label>
            <div className="flex flex-wrap gap-2">
              {CREW_NAMES.map((name) => (
                <button key={name} onClick={() => toggleCrew(name)} className={cn("px-3 py-1.5 rounded-full border text-sm font-medium transition-colors", crew.includes(name) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-border hover:bg-gray-50")}>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Work Performed</label>
            <Textarea placeholder="Describe all work completed today..." rows={3} value={workPerformed} onChange={(e) => setWorkPerformed(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Materials Delivered</label>
              <Textarea placeholder="Materials received..." rows={2} value={materialsDelivered} onChange={(e) => setMaterialsDelivered(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Issues / Delays</label>
              <Textarea placeholder="Problems or delays..." rows={2} value={issues} onChange={(e) => setIssues(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              Safety Incidents <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <Textarea className={cn(safetyIncidents && "border-red-300")} placeholder="Document any incidents, near-misses, or first aid..." rows={2} value={safetyIncidents} onChange={(e) => setSafetyIncidents(e.target.value)} />
            {safetyIncidents && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Safety incidents are flagged in the log</p>}
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-brand-300 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Drop photos or click to upload</p>
          </div>

          <Button className="w-full" disabled={!workPerformed} onClick={handleSave}>Save Log Entry</Button>
        </div>

        {/* Recent entries */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Recent Entries</h3>
          {MOCK_LOGS.map((log) => (
            <div key={log.id} className="bg-white border border-border rounded-xl overflow-hidden">
              <button className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{formatDate(log.date)}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <WeatherIcon weather={log.weather} />{log.weather} / {log.temp}°F
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{log.crew.join(", ")}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{log.hours} hrs</span>
                </div>
                {expanded !== log.id && <p className="text-xs text-gray-600 mt-1.5 truncate">{log.workPerformed}</p>}
              </button>
              {expanded === log.id && (
                <div className="px-4 pb-4 space-y-2.5 border-t border-border pt-3">
                  <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Work Performed</p><p className="text-xs text-gray-700 leading-relaxed">{log.workPerformed}</p></div>
                  {log.materialsDelivered && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Materials</p><p className="text-xs text-gray-700">{log.materialsDelivered}</p></div>}
                  {log.issues && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Issues</p><p className="text-xs text-gray-700">{log.issues}</p></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const DAILY_DETAILS: Record<string, { weather: string; high: number; deliveries: string[]; notes: string }> = {
  "Mon 3/17": { weather: "Clear", high: 78, deliveries: ["Cabinet boxes — Kitchen Remodel"], notes: "Marcus covering both Kitchen + Roof crew lead" },
  "Tue 3/18": { weather: "Clear", high: 82, deliveries: [], notes: "" },
  "Wed 3/19": { weather: "Partly Cloudy", high: 75, deliveries: ["Quartz countertop slab — Kitchen Remodel", "Composite decking — Deck Build"], notes: "City inspector scheduled 1pm for Kitchen rough-in" },
  "Thu 3/20": { weather: "Rain", high: 68, deliveries: ["Shingle pallets — Roof Replacement"], notes: "Rain expected — move roofing crew to interior prep if needed" },
  "Fri 3/21": { weather: "Clear", high: 80, deliveries: [], notes: "Half day — Maria off" },
};

const WEATHER_ICONS: Record<string, string> = {
  "Clear": "text-amber-500",
  "Partly Cloudy": "text-gray-400",
  "Rain": "text-blue-500",
  "Overcast": "text-gray-500",
};

// ─── Calendar View ───────────────────────────────────────────────────────────

interface CalEvent {
  label: string;
  type: "work" | "inspection" | "delivery" | "meeting" | "milestone";
  time: string;
  endTime?: string;
  crew?: string[];
  location?: string;
  notes?: string;
  project?: string;
}

const CALENDAR_EVENTS: Record<string, CalEvent[]> = {
  "2026-03-10": [
    { label: "Kitchen demo start", type: "work", time: "7:00a", endTime: "4:00p", crew: ["Marcus", "Tony", "David"], location: "4821 Ridgeline Dr, Austin", project: "Kitchen Remodel" },
  ],
  "2026-03-11": [
    { label: "Kitchen demo day 2", type: "work", time: "7:00a", endTime: "4:00p", crew: ["Marcus", "Tony"], project: "Kitchen Remodel" },
  ],
  "2026-03-12": [
    { label: "Plumbing rough-in", type: "work", time: "7:00a", endTime: "3:00p", crew: ["Marcus", "David"], project: "Kitchen Remodel" },
    { label: "Permit pickup — Deck", type: "meeting", time: "10:00a", notes: "City of Austin permits office", project: "Deck Build" },
  ],
  "2026-03-13": [
    { label: "Deck footings pour", type: "work", time: "8:00a", endTime: "2:00p", crew: ["Tony", "Alex"], location: "1290 Pecan Creek Dr, Austin", project: "Deck Build" },
    { label: "Electrical rough-in", type: "work", time: "7:00a", endTime: "4:00p", crew: ["Marcus", "David"], project: "Kitchen Remodel" },
  ],
  "2026-03-14": [
    { label: "Bathroom demo", type: "work", time: "7:00a", endTime: "3:00p", crew: ["Marcus", "Tony"], location: "7744 Stone Oak Pkwy, SA", project: "Bathroom Renovation" },
    { label: "Deck framing", type: "work", time: "7:00a", endTime: "4:00p", crew: ["Alex", "David"], project: "Deck Build" },
  ],
  "2026-03-15": [
    { label: "Roof tear-off", type: "work", time: "6:30a", endTime: "5:00p", crew: ["David", "Alex", "Tony"], location: "15230 Cypress Creek, Houston", project: "Roof Replacement" },
    { label: "Demo complete", type: "milestone", time: "—", notes: "Kitchen Remodel — demo phase signed off", project: "Kitchen Remodel" },
  ],
  "2026-03-17": [
    { label: "Cabinet delivery", type: "delivery", time: "10:00a", endTime: "11:00a", notes: "ABC Supply — 42 boxes, check for damage before signing", project: "Kitchen Remodel" },
    { label: "Electrical inspection", type: "inspection", time: "2:00p", endTime: "3:00p", location: "4821 Ridgeline Dr, Austin", notes: "City inspector — have permits and rough-in photos ready", project: "Kitchen Remodel" },
    { label: "Shingle delivery", type: "delivery", time: "8:00a", notes: "30 squares GAF Timberline HDZ", project: "Roof Replacement" },
  ],
  "2026-03-18": [
    { label: "Cabinet install", type: "work", time: "7:00a", endTime: "5:00p", crew: ["Marcus", "Tony"], project: "Kitchen Remodel" },
    { label: "Bathroom plumbing rough-in", type: "work", time: "7:00a", endTime: "3:00p", crew: ["David"], project: "Bathroom Renovation" },
    { label: "Roof shingles day 1", type: "work", time: "6:30a", endTime: "5:00p", crew: ["Alex"], project: "Roof Replacement" },
  ],
  "2026-03-19": [
    { label: "Tile delivery", type: "delivery", time: "9:00a", endTime: "10:00a", notes: "Subway white matte — 30 boxes + shower niche pieces", project: "Bathroom Renovation" },
    { label: "Cabinet install day 2", type: "work", time: "7:00a", endTime: "4:00p", crew: ["Marcus", "Tony"], project: "Kitchen Remodel" },
    { label: "Deck board delivery", type: "delivery", time: "11:00a", notes: "Composite — verify color match", project: "Deck Build" },
  ],
  "2026-03-20": [
    { label: "Framing inspection", type: "inspection", time: "1:00p", endTime: "2:00p", location: "4821 Ridgeline Dr, Austin", notes: "Bring permit docs, insurance cert, and ladder", project: "Kitchen Remodel" },
    { label: "Client meeting — Brown", type: "meeting", time: "3:30p", endTime: "4:30p", location: "4821 Ridgeline Dr, Austin", notes: "Review cabinet install, discuss countertop template date", project: "Kitchen Remodel" },
    { label: "HVAC estimate walkthrough", type: "meeting", time: "5:00p", endTime: "6:00p", location: "1845 Sam Bass Rd, Round Rock", notes: "Kevin Nguyen — measure ductwork, check attic access" },
  ],
  "2026-03-21": [
    { label: "Deck boards install", type: "work", time: "7:00a", endTime: "5:00p", crew: ["Tony", "Alex"], project: "Deck Build" },
    { label: "Bathroom tile start", type: "work", time: "7:00a", endTime: "4:00p", crew: ["Marcus"], project: "Bathroom Renovation" },
  ],
  "2026-03-22": [
    { label: "Roof replacement complete", type: "milestone", time: "—", notes: "All shingles, flashing, and ridge done. Ready for final inspection.", project: "Roof Replacement" },
  ],
  "2026-03-24": [
    { label: "Countertop template", type: "work", time: "9:00a", endTime: "11:00a", notes: "Fabricator on-site to template quartz", project: "Kitchen Remodel" },
    { label: "Deck railing materials", type: "delivery", time: "8:00a", notes: "60 LF aluminum railing system", project: "Deck Build" },
  ],
  "2026-03-25": [
    { label: "Tile install — shower", type: "work", time: "7:00a", endTime: "5:00p", crew: ["Marcus", "Tony"], project: "Bathroom Renovation" },
    { label: "Deck railing install", type: "work", time: "7:00a", endTime: "4:00p", crew: ["Alex", "David"], project: "Deck Build" },
  ],
  "2026-03-26": [
    { label: "Tile grout + cleanup", type: "work", time: "7:00a", endTime: "2:00p", crew: ["Marcus"], project: "Bathroom Renovation" },
    { label: "Plumbing inspection", type: "inspection", time: "10:00a", location: "7744 Stone Oak Pkwy, SA", project: "Bathroom Renovation" },
  ],
  "2026-03-27": [
    { label: "Final roof inspection", type: "inspection", time: "10:00a", endTime: "11:00a", location: "15230 Cypress Creek, Houston", notes: "City inspector — have all permits and warranty docs", project: "Roof Replacement" },
    { label: "Vanity + fixtures install", type: "work", time: "7:00a", endTime: "3:00p", crew: ["Marcus", "David"], project: "Bathroom Renovation" },
  ],
  "2026-03-28": [
    { label: "Deck stairs + finish", type: "work", time: "7:00a", endTime: "4:00p", crew: ["Tony", "Alex"], project: "Deck Build" },
    { label: "Kitchen flooring start", type: "work", time: "7:00a", endTime: "5:00p", crew: ["Marcus", "David"], project: "Kitchen Remodel" },
  ],
  "2026-03-31": [
    { label: "Countertop install", type: "delivery", time: "8:00a", endTime: "12:00p", notes: "Fabricator installing quartz — keep kitchen clear", project: "Kitchen Remodel" },
    { label: "Deck walkthrough", type: "meeting", time: "2:00p", endTime: "3:00p", location: "1290 Pecan Creek Dr, Austin", notes: "Final walkthrough with Robert Johnson", project: "Deck Build" },
  ],
};

const EVENT_COLORS: Record<string, string> = {
  work: "bg-brand-600",
  inspection: "bg-amber-500",
  delivery: "bg-blue-500",
  meeting: "bg-violet-500",
  milestone: "bg-gray-900",
};

const EVENT_TEXT_COLORS: Record<string, string> = {
  work: "text-brand-600",
  inspection: "text-amber-600",
  delivery: "text-blue-600",
  meeting: "text-violet-600",
  milestone: "text-gray-900",
};

function CalendarView({ project }: { project: typeof PROJECTS[0] }) {
  const [month, setMonth] = useState(2);
  const [year, setYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-03-20");
  const [view, setView] = useState<"month" | "week">("month");

  const monthName = new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = "2026-03-20";

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const selectedEvents = selectedDate ? CALENDAR_EVENTS[selectedDate] || [] : [];

  // Week view — get 7 days around selected date
  const getWeekDays = () => {
    const d = selectedDate ? new Date(selectedDate + "T12:00:00") : new Date("2026-03-20T12:00:00");
    const dayOfWeek = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    });
  };

  // Stats
  const allMonthEvents = Object.entries(CALENDAR_EVENTS)
    .filter(([d]) => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
    .flatMap(([, evts]) => evts);
  const workDays = new Set(Object.entries(CALENDAR_EVENTS)
    .filter(([d]) => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
    .filter(([, evts]) => evts.some((e) => e.type === "work"))
    .map(([d]) => d)).size;
  const inspectionCount = allMonthEvents.filter((e) => e.type === "inspection").length;
  const deliveryCount = allMonthEvents.filter((e) => e.type === "delivery").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <h2 className="text-[22px] font-bold text-gray-900">{monthName}</h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Month stats */}
          <div className="flex items-center gap-4 mr-4 text-[13px]">
            <span className="text-gray-400">{workDays} work days</span>
            <span className="text-gray-400">{inspectionCount} inspections</span>
            <span className="text-gray-400">{deliveryCount} deliveries</span>
          </div>
          {/* View toggle */}
          <div className="flex rounded-lg ring-1 ring-gray-200 overflow-hidden">
            <button onClick={() => setView("month")} className={cn("px-3 py-1.5 text-[13px] font-medium transition-colors", view === "month" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50")}>Month</button>
            <button onClick={() => setView("week")} className={cn("px-3 py-1.5 text-[13px] font-medium transition-colors", view === "week" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50")}>Week</button>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Calendar */}
        <div className="flex-1">
          {view === "month" ? (
            <>
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="bg-gray-50 px-2 py-2 text-center text-[11px] font-bold text-gray-400">{d}</div>
                ))}
                {days.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} className="bg-white min-h-[90px]" />;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const events = CALENDAR_EVENTS[dateStr] || [];
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;
                  const isProjectRange = dateStr >= project.startDate && dateStr <= project.estimatedEnd;
                  const isWeekend = (firstDay + day - 1) % 7 === 0 || (firstDay + day - 1) % 7 === 6;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        "bg-white min-h-[90px] px-1.5 pt-1.5 pb-1 text-left hover:bg-gray-50 transition-colors relative",
                        isSelected && "ring-2 ring-gray-900 ring-inset z-10",
                        isProjectRange && !isSelected && "bg-brand-50/20",
                        isWeekend && !isSelected && !isProjectRange && "bg-gray-50/50"
                      )}
                    >
                      <span className={cn(
                        "text-[13px] tabular-nums inline-flex items-center justify-center w-6 h-6 rounded-full",
                        isToday ? "bg-gray-900 text-white font-bold" : isWeekend ? "text-gray-400 font-medium" : "text-gray-900 font-medium"
                      )}>
                        {day}
                      </span>
                      <div className="mt-0.5 space-y-0.5">
                        {events.slice(0, 3).map((ev, j) => (
                          <div key={j} className={cn("text-[8px] font-medium truncate rounded px-1 py-0.5", `${EVENT_COLORS[ev.type]}/10`, EVENT_TEXT_COLORS[ev.type])}>
                            {ev.label}
                          </div>
                        ))}
                        {events.length > 3 && (
                          <span className="text-[8px] text-gray-400 px-1">+{events.length - 3} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 mt-3">
                {Object.entries(EVENT_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", color)} />
                    <span className="text-[11px] text-gray-400 capitalize">{type}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="w-4 h-2 rounded bg-brand-50/40" />
                  <span className="text-[11px] text-gray-400">Project range</span>
                </div>
              </div>
            </>
          ) : (
            /* Week view */
            <div className="space-y-0">
              {getWeekDays().map((dateStr) => {
                const d = new Date(dateStr + "T12:00:00");
                const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                const dayNum = d.getDate();
                const events = CALENDAR_EVENTS[dateStr] || [];
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "w-full flex gap-4 px-4 py-3 text-left border-b border-gray-100 last:border-0 transition-colors",
                      isSelected ? "bg-gray-50" : "hover:bg-gray-50/50"
                    )}
                  >
                    <div className="w-12 flex-shrink-0 text-center pt-0.5">
                      <p className="text-[11px] text-gray-400 font-medium">{dayName}</p>
                      <p className={cn(
                        "text-[20px] font-bold tabular-nums leading-tight",
                        isToday ? "text-brand-600" : "text-gray-900"
                      )}>{dayNum}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      {events.length > 0 ? (
                        <div className="space-y-1.5">
                          {events.map((ev, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", EVENT_COLORS[ev.type])} />
                              <span className="text-[13px] font-medium text-gray-900 truncate">{ev.label}</span>
                              <span className="text-[12px] text-gray-400 flex-shrink-0">{ev.time}{ev.endTime ? `–${ev.endTime}` : ""}</span>
                              {ev.crew && <span className="text-[11px] text-gray-400 flex-shrink-0">{ev.crew.join(", ")}</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[13px] text-gray-300 pt-1">No events</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Day detail panel */}
        <div className="w-[300px] flex-shrink-0">
          <div className="sticky top-0">
            <h3 className="text-[18px] font-bold text-gray-900 mb-1">
              {selectedDate ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Select a day"}
            </h3>
            {selectedDate && (
              <p className="text-[13px] text-gray-400 mb-4">{selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""} scheduled</p>
            )}

            {selectedEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedEvents.map((ev, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 ring-1 ring-gray-200/80">
                    <div className="flex items-start gap-3 mb-2">
                      <span className={cn("w-3 h-3 rounded-full flex-shrink-0 mt-1", EVENT_COLORS[ev.type])} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-gray-900">{ev.label}</p>
                        <p className="text-[12px] text-gray-400 capitalize">{ev.type}{ev.project ? ` — ${ev.project}` : ""}</p>
                      </div>
                    </div>
                    <div className="ml-6 space-y-1.5">
                      {ev.time !== "—" && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-[13px] text-gray-600">{ev.time}{ev.endTime ? ` — ${ev.endTime}` : ""}</span>
                        </div>
                      )}
                      {ev.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-[13px] text-gray-600">{ev.location}</span>
                        </div>
                      )}
                      {ev.crew && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-[13px] text-gray-600">{ev.crew.join(", ")}</span>
                        </div>
                      )}
                      {ev.notes && (
                        <p className="text-[12px] text-gray-400 leading-relaxed mt-1">{ev.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200/80 text-center">
                <p className="text-[14px] text-gray-400">No events scheduled</p>
                <p className="text-[12px] text-gray-300 mt-1">Click a day to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab() {
  const [schedule, setSchedule] = useState<(Assignment | null)[][]>(
    SCHEDULE.map((row) => [...row])
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [addingEntry, setAddingEntry] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [newProject, setNewProject] = useState("");
  const [newCrew, setNewCrew] = useState("");
  const [newTime, setNewTime] = useState("");
  const [editProject, setEditProject] = useState("");
  const [editTime, setEditTime] = useState("");

  const clearCell = (ri: number, di: number) => {
    setSchedule((prev) => prev.map((row, r) => r === ri ? row.map((cell, d) => d === di ? null : cell) : row));
  };

  const saveEdit = () => {
    if (!editingCell || !editProject) return;
    setSchedule((prev) =>
      prev.map((row, r) =>
        r === editingCell.row
          ? row.map((cell, d) => d === editingCell.col ? { project: editProject, time: editTime || "7a–4p" } : cell)
          : row
      )
    );
    setEditingCell(null);
    setEditProject("");
    setEditTime("");
  };

  const startEdit = (ri: number, di: number, assignment: Assignment | null) => {
    setEditingCell({ row: ri, col: di });
    setEditProject(assignment?.project || "");
    setEditTime(assignment?.time || "7a–4p");
  };

  // Crew hours summary
  const crewHours = CREW.map((member, ri) => {
    const assigned = schedule[ri].filter((a) => a !== null).length;
    return { name: member, daysAssigned: assigned, hoursEst: assigned * 8 };
  });

  // Conflict detection — same crew member on 2 projects same day
  const conflicts: { crew: string; day: string; projects: string[] }[] = [];
  // (In real app this would check for actual overlaps — mock has 1 assignment per cell so no conflicts currently)

  const detail = selectedDay ? DAILY_DETAILS[selectedDay] : null;

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-white hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-900">This Week — Mon Mar 17 – Fri Mar 21, 2026</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-white hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddingEntry(true)}>
          <Plus className="w-3.5 h-3.5" />Add Entry
        </Button>
      </div>

      {/* Add entry form */}
      {addingEntry && (
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">New Schedule Entry</p>
            <button onClick={() => setAddingEntry(false)} className="text-gray-400 hover:text-gray-600"><AlertCircle className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Project</label>
              <select value={newProject} onChange={(e) => setNewProject(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600">
                <option value="">Select...</option>
                {Object.keys(PROJECT_COLORS).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Crew Member</label>
              <select value={newCrew} onChange={(e) => setNewCrew(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600">
                <option value="">Select...</option>
                {CREW.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Day</label>
              <select className="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600">
                <option value="">Select...</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Time</label>
              <div className="flex items-center gap-2">
                <Input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="7a–4p" className="h-9 text-sm" />
                <Button size="sm">Add</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PROJECT_COLORS).map(([p, cls]) => (
          <div key={p} className={cn("px-2.5 py-1 rounded-md border text-xs font-medium", cls)}>{p}</div>
        ))}
      </div>

      {/* Weekly grid */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[180px_repeat(5,1fr)] border-b border-border bg-gray-50">
          <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Crew Member</div>
          {DAYS.map((d) => {
            const dd = DAILY_DETAILS[d];
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(selectedDay === d ? null : d)}
                className={cn(
                  "px-3 py-3 text-left border-l border-border transition-colors",
                  selectedDay === d ? "bg-brand-50" : "hover:bg-gray-100"
                )}
              >
                <p className="text-xs font-semibold text-gray-700">{d}</p>
                {dd && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={cn("text-[10px] font-medium", WEATHER_ICONS[dd.weather] || "text-gray-400")}>{dd.weather}</span>
                    <span className="text-[10px] text-gray-400">{dd.high}°F</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {CREW.map((member, ri) => (
          <div key={member} className={cn("grid grid-cols-[180px_repeat(5,1fr)] items-stretch", ri < CREW.length - 1 && "border-b border-border")}>
            <div className="px-4 py-3 flex items-center gap-2 border-r border-border">
              <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 leading-tight">{member.split(" ")[0]}</p>
                <p className="text-[11px] text-gray-400">{member.split(" ")[1]}</p>
              </div>
            </div>
            {schedule[ri].map((assignment, di) => {
              const colorClass = assignment ? (PROJECT_COLORS[assignment.project] ?? "bg-gray-50 border-gray-200 text-gray-700") : "";
              const isSelected = selectedDay === DAYS[di];
              const isEditing = editingCell?.row === ri && editingCell?.col === di;
              return (
                <div key={di} className={cn("px-2 py-2.5", di > 0 && "border-l border-border", isSelected && "bg-brand-50/50")}>
                  {isEditing ? (
                    <div className="h-14 flex flex-col gap-1 justify-center">
                      <select value={editProject} onChange={(e) => setEditProject(e.target.value)} className="h-6 text-[11px] rounded border border-border bg-white px-1 focus:outline-none focus:ring-1 focus:ring-brand-600">
                        <option value="">None</option>
                        {Object.keys(PROJECT_COLORS).map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <div className="flex gap-1">
                        <input value={editTime} onChange={(e) => setEditTime(e.target.value)} className="h-5 flex-1 text-[10px] rounded border border-border px-1 focus:outline-none focus:ring-1 focus:ring-brand-600" />
                        <button onClick={saveEdit} className="text-brand-600 hover:text-brand-700"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingCell(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ) : assignment ? (
                    <div className={cn("group relative h-14 flex flex-col justify-center px-2.5 rounded-lg border text-xs cursor-pointer", colorClass)} onClick={() => startEdit(ri, di, assignment)}>
                      <p className="font-semibold leading-tight truncate">{assignment.project}</p>
                      <p className="text-[11px] opacity-70 mt-0.5">{assignment.time}</p>
                      <button onClick={(e) => { e.stopPropagation(); clearCell(ri, di); }} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500" title="Remove">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-14 flex items-center justify-center rounded-lg border border-dashed border-gray-200 cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-colors" onClick={() => startEdit(ri, di, null)}>
                      <span className="text-xs text-gray-300">Available</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Day detail panel */}
      {selectedDay && detail && (
        <div className="bg-white border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">{selectedDay} — Day Details</h3>
            <button onClick={() => setSelectedDay(null)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Weather</p>
              <p className={cn("text-sm font-semibold", WEATHER_ICONS[detail.weather] || "text-gray-700")}>{detail.weather}, {detail.high}°F</p>
              {detail.weather === "Rain" && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">Outdoor work may be affected</p>
              )}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Crew on Site</p>
              <div className="flex flex-wrap gap-1">
                {CREW.map((member, ri) => {
                  const dayIdx = DAYS.indexOf(selectedDay);
                  const assigned = dayIdx >= 0 && schedule[ri][dayIdx] !== null;
                  if (!assigned) return null;
                  return (
                    <span key={member} className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                      {member.split(" ")[0]}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Active Projects</p>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const dayIdx = DAYS.indexOf(selectedDay);
                  const projects = new Set<string>();
                  schedule.forEach((row) => { if (dayIdx >= 0 && row[dayIdx]) projects.add(row[dayIdx]!.project); });
                  return Array.from(projects).map((p) => {
                    const cls = PROJECT_COLORS[p] || "bg-gray-50 border-gray-200 text-gray-700";
                    return <span key={p} className={cn("text-xs font-medium px-2 py-0.5 rounded border", cls)}>{p}</span>;
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Deliveries */}
          {detail.deliveries.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-2">Material Deliveries</p>
              <div className="space-y-1.5">
                {detail.deliveries.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {detail.notes && (
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-600">{detail.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Crew hours summary */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Crew Hours This Week</p>
        </div>
        <div className="divide-y divide-border">
          {crewHours.map((ch) => (
            <div key={ch.name} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-900">{ch.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">{ch.daysAssigned} of 5 days</span>
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full" style={{ width: `${(ch.daysAssigned / 5) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-900 tabular-nums w-12 text-right">{ch.hoursEst}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChangeOrdersTab({ projectId }: { projectId: string }) {
  const cos = ALL_COS[projectId] ?? [];
  const [selected, setSelected] = useState<ChangeOrder | null>(null);
  const [newCOOpen, setNewCOOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [labor, setLabor] = useState("");
  const [materials, setMaterials] = useState("");
  const [reason, setReason] = useState("");

  const total = (parseFloat(labor) || 0) + (parseFloat(materials) || 0);

  if (cos.length === 0) {
    return (
      <div className="bg-white border border-border rounded-xl py-12 text-center">
        <p className="text-gray-400 text-sm">No change orders for this project.</p>
        <Button className="gap-2 mt-4" onClick={() => setNewCOOpen(true)}><Plus className="w-4 h-4" />New Change Order</Button>
        <Dialog open={newCOOpen} onOpenChange={setNewCOOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>New Change Order</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Description of Change</label>
                <Input placeholder="e.g. Add recessed lighting" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Labor ($)</label><Input type="number" placeholder="0.00" value={labor} onChange={(e) => setLabor(e.target.value)} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Materials ($)</label><Input type="number" placeholder="0.00" value={materials} onChange={(e) => setMaterials(e.target.value)} /></div>
              </div>
              {total > 0 && <p className="text-sm font-semibold text-gray-900">Total: {formatCurrency(total)}</p>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <Textarea placeholder="Explain what triggered this change..." rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <Button className="w-full" disabled={!description || total === 0}>Send Change Order</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={newCOOpen} onOpenChange={setNewCOOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />New Change Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>New Change Order</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input placeholder="e.g. Add recessed lighting" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Labor ($)</label><Input type="number" placeholder="0.00" value={labor} onChange={(e) => setLabor(e.target.value)} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Materials ($)</label><Input type="number" placeholder="0.00" value={materials} onChange={(e) => setMaterials(e.target.value)} /></div>
              </div>
              {total > 0 && <p className="text-sm font-semibold text-gray-900">Total: {formatCurrency(total)}</p>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <Textarea placeholder="Explain what triggered this change..." rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <Button className="w-full" disabled={!description || total === 0}>Send Change Order</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-gray-50 grid grid-cols-[80px_2fr_110px_120px_120px] gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>CO #</span>
            <span>Description</span>
            <span>Amount</span>
            <span>Date</span>
            <span>Status</span>
          </div>
          {cos.map((co, i) => (
            <div
              key={co.id}
              onClick={() => setSelected(co)}
              className={cn("grid grid-cols-[80px_2fr_110px_120px_120px] gap-4 px-5 py-3.5 items-center text-sm cursor-pointer hover:bg-gray-50 transition-colors", i < cos.length - 1 && "border-b border-border")}
            >
              <span className="font-mono text-xs font-bold text-brand-600">{co.id}</span>
              <span className="text-gray-900 truncate">{co.description}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(co.amount)}</span>
              <span className="text-gray-400 text-xs">{formatDate(co.date)}</span>
              <StatusBadge status={co.status} />
            </div>
          ))}
        </div>
        {selected && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">{selected.id}</span>
                <DialogTitle className="text-base">{selected.description}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between"><StatusBadge status={selected.status} /><span className="text-xs text-gray-400">{formatDate(selected.date)}</span></div>
              <Separator />
              <div><p className="text-xs font-semibold text-gray-500 uppercase mb-2">Reason</p><p className="text-sm text-gray-700 leading-relaxed">{selected.reason}</p></div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Cost Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Labor</span><span className="font-medium">{formatCurrency(selected.labor)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Materials</span><span className="font-medium">{formatCurrency(selected.materials)}</span></div>
                  <Separator />
                  <div className="flex justify-between text-sm font-bold"><span>Total</span><span>{formatCurrency(selected.amount)}</span></div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function PunchListTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<PunchItem[]>(ALL_PUNCH[projectId] ?? []);
  const [newDesc, setNewDesc] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newAssignedTo, setNewAssignedTo] = useState("");

  function toggleStatus(id: string) {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const next: ItemStatus = item.status === "open" ? "in-progress" : item.status === "in-progress" ? "completed" : "open";
      return { ...item, status: next };
    }));
  }

  function handleAddItem() {
    if (!newDesc.trim()) return;
    const newItem: PunchItem = {
      id: `p-${Date.now()}`,
      description: newDesc.trim(),
      location: newLocation.trim() || "—",
      priority: newPriority,
      status: "open",
      assignedTo: newAssignedTo.trim() || "Unassigned",
    };
    setItems((prev) => [...prev, newItem]);
    setNewDesc("");
    setNewLocation("");
    setNewPriority("medium");
    setNewAssignedTo("");
    setAddOpen(false);
  }

  function handleCancelAdd() {
    setNewDesc("");
    setNewLocation("");
    setNewPriority("medium");
    setNewAssignedTo("");
    setAddOpen(false);
  }

  const completed = items.filter((i) => i.status === "completed").length;
  const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...items].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const addForm = addOpen && (
    <div className="bg-gray-50 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-900">New Punch Item</p>
        <button onClick={handleCancelAdd} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
          <Input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="e.g. Caulk gap behind toilet"
            onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(); if (e.key === "Escape") handleCancelAdd(); }}
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
          <Input
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="e.g. Master Bath"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Assigned To</label>
          <Input
            value={newAssignedTo}
            onChange={(e) => setNewAssignedTo(e.target.value)}
            placeholder="e.g. Marcus"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as Priority)}
            className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={handleAddItem} disabled={!newDesc.trim()}>Add Item</Button>
        <Button size="sm" variant="ghost" onClick={handleCancelAdd}>Cancel</Button>
      </div>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        {addForm}
        {!addOpen && (
          <div className="bg-white border border-border rounded-xl py-12 text-center">
            <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-4">No punch list items for this project yet.</p>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add First Item
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900">{completed} of {items.length} items complete</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{pct}% — {items.length - completed} remaining</span>
            {!addOpen && (
              <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Item
              </Button>
            )}
          </div>
        </div>
        <Progress value={pct} />
      </div>

      {addForm}

      {pct === 100 && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-brand-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-brand-800">Ready for Final Walkthrough</p>
            <p className="text-xs text-brand-700 mt-0.5">All {items.length} items complete. Schedule the final walkthrough with your client.</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_100px_80px_100px_100px_44px_36px] gap-3 px-4 py-3 border-b border-border bg-gray-50">
          <div />
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Photo</div>
          <div />
        </div>
        <div className="divide-y divide-border">
          {sorted.map((item) => (
            <div key={item.id} className={cn("grid grid-cols-[40px_1fr_100px_80px_100px_100px_44px_36px] gap-3 px-4 py-3 items-center", item.status === "completed" && "bg-gray-50")}>
              <button onClick={() => toggleStatus(item.id)} className="flex items-center justify-center hover:opacity-70 transition-opacity" title="Click to advance status">
                {item.status === "completed" ? <CheckCircle2 className="w-5 h-5 text-brand-600" /> : item.status === "in-progress" ? <Clock className="w-5 h-5 text-amber-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
              </button>
              <span className={cn("text-sm", item.status === "completed" ? "line-through text-gray-400" : "text-gray-900")}>{item.description}</span>
              <span className="text-xs text-gray-500">{item.location}</span>
              <div>
                {item.priority === "high" ? <Badge variant="danger">High</Badge> : item.priority === "medium" ? <Badge variant="warning">Medium</Badge> : <Badge variant="secondary">Low</Badge>}
              </div>
              <div>
                {item.status === "completed" ? <Badge variant="success">Done</Badge> : item.status === "in-progress" ? <Badge variant="warning">In Progress</Badge> : <Badge variant="outline">Open</Badge>}
              </div>
              <span className="text-xs font-medium text-gray-700">{item.assignedTo}</span>
              <button className="flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors" title="Attach photo">
                <Camera className="w-4 h-4" />
              </button>
              <button onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))} className="flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors" title="Delete item">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobCostingTab({ projectId, project }: { projectId: string; project: typeof PROJECTS[0] }) {
  const categories = ALL_COSTING[projectId] ?? [];
  const totalEstimated = categories.reduce((s, c) => s + c.estimated, 0);
  const totalActual = categories.reduce((s, c) => s + c.actual, 0);
  const totalVariance = totalActual - totalEstimated;
  const overBudget = totalVariance > 0;
  const profit = project.contractValue - totalActual;
  const profitPct = project.contractValue > 0 ? ((profit / project.contractValue) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-5 max-w-[800px]">
      {/* Summary row */}
      <div className="flex items-start gap-8 pb-5 border-b border-gray-200">
        <div>
          <p className="text-[12px] text-gray-400">Contract</p>
          <p className="text-[24px] font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{formatCurrency(project.contractValue)}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-400">Estimated Cost</p>
          <p className="text-[24px] font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{formatCurrency(totalEstimated)}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-400">Actual Cost</p>
          <p className="text-[24px] font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{formatCurrency(totalActual)}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-400">Net Profit</p>
          <p className={cn("text-[24px] font-bold tabular-nums leading-tight mt-0.5", profit >= 0 ? "text-brand-600" : "text-red-600")}>{formatCurrency(profit)}</p>
          <p className={cn("text-[12px] font-semibold mt-0.5", profit >= 0 ? "text-brand-600" : "text-red-600")}>{profitPct}% margin</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 rounded-l-lg">Category</th>
            <th className="text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Estimated</th>
            <th className="text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Actual</th>
            <th className="text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 rounded-r-lg">Variance</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const variance = cat.actual - cat.estimated;
            const isOver = variance > 0;
            return (
              <tr key={cat.category} className="border-b border-gray-100 last:border-0">
                <td className="text-[14px] font-semibold text-gray-900 px-4 py-3.5">{cat.category}</td>
                <td className="text-[14px] text-gray-500 px-4 py-3.5 text-right tabular-nums">{formatCurrency(cat.estimated)}</td>
                <td className="text-[14px] font-semibold text-gray-900 px-4 py-3.5 text-right tabular-nums">{formatCurrency(cat.actual)}</td>
                <td className={cn("text-[14px] font-semibold px-4 py-3.5 text-right tabular-nums", isOver ? "text-red-600" : "text-brand-600")}>
                  {isOver ? "+" : ""}{formatCurrency(Math.abs(variance))}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50">
            <td className="text-[14px] font-bold text-gray-900 px-4 py-3.5 rounded-l-lg">Total</td>
            <td className="text-[14px] font-bold text-gray-900 px-4 py-3.5 text-right tabular-nums">{formatCurrency(totalEstimated)}</td>
            <td className="text-[14px] font-bold text-gray-900 px-4 py-3.5 text-right tabular-nums">{formatCurrency(totalActual)}</td>
            <td className={cn("text-[14px] font-bold px-4 py-3.5 text-right tabular-nums rounded-r-lg", overBudget ? "text-red-600" : "text-brand-600")}>
              {overBudget ? "+" : ""}{formatCurrency(Math.abs(totalVariance))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PROJECT_NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "daily-log", label: "Daily Log", icon: FileText },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "job-costing", label: "Job Costing", icon: TrendingUp },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState("j1");
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    fetchProjects().then((apiProjects) => {
      if (apiProjects.length > 0) {
        // API projects supplement the inline mock data when available
        // For now, keep inline data since API shape differs from page needs
      }
    });
  }, []);

  const project = projects.find((p) => p.id === selectedProjectId)!;
  const coCount = ALL_COS[selectedProjectId]?.length ?? 0;

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <OverviewTab project={project} />;
      case "calendar": return <CalendarView project={project} />;
      case "daily-log": return <DailyLogTab projectId={selectedProjectId} />;
      case "schedule": return <ScheduleTab />;
      case "change-orders": return <ChangeOrdersTab projectId={selectedProjectId} />;
      case "punch-list": return <PunchListTab projectId={selectedProjectId} />;
      case "job-costing": return <JobCostingTab projectId={selectedProjectId} project={project} />;
      default: return <OverviewTab project={project} />;
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Projects</h1>
          <Link href="/contractor/messages">
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Message {project.client.split(" ")[0]}
            </Button>
          </Link>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        {/* Project list sidebar */}
        <div className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="py-3 px-3 space-y-0.5">
            {projects.map((p) => {
              const isSelected = p.id === selectedProjectId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={cn(
                    "w-full text-left rounded-lg px-3 py-2.5 transition-colors text-[13px] font-medium truncate",
                    isSelected
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Info bar + tabs */}
          <div className="px-6 pt-4 pb-0 bg-white border-b border-gray-200">
            <div className="flex items-center gap-6 mb-3">
              <span className="text-[14px] font-semibold text-gray-900">{project.client}</span>
              <span className="text-[14px] font-semibold text-gray-900 tabular-nums">{formatCurrency(project.contractValue)}</span>
              <span className="text-[13px] text-gray-400">{formatDate(project.startDate)} — {formatDate(project.estimatedEnd)}</span>
            </div>
            <div className="flex gap-1">
              {PROJECT_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px",
                      isActive
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
