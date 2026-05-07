"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Plus,
  Upload,
  CheckSquare,
  MessageSquare,
  Camera,
  X,
  Trash2,
  LayoutDashboard,
  FileText,
  Calendar,
  Check,
  ArrowRight,
  Download,
  Cloud,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Progress } from "@shared/ui/progress";
import { Separator } from "@shared/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/ui/dialog";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";
import {
  createProjectChangeOrder,
  createProjectDocument,
  createProjectExpense,
  createProjectPunchItem,
  fetchProjectChangeOrders,
  fetchProjectDocuments,
  fetchProjectExpenses,
  fetchProjectPunchItems,
  fetchProjects,
  updateProject as persistProject,
} from "@shared/lib/data";
import { api } from "@shared/lib/realtime";
import { toast } from "sonner";
import { usePageTitle } from "@shared/hooks/use-page-title";
import { PostSubJobDialog } from "./components/post-sub-job-dialog";
import { CreateProjectDialog } from "./components/create-project-dialog";

// ─── Mock data ────────────────────────────────────────────────────────────────

type MilestoneStatus = "paid" | "complete" | "in_progress" | "pending" | "delayed";

/** UI lifecycle for sidebar / API sync (distinct from milestone or job API enums). */
type ProjectListStatus = "active" | "complete";

interface Milestone {
  label: string;
  done: boolean;
  amount: number;
  status: MilestoneStatus;
  completedDate?: string;
  note?: string;
}

const PROJECTS = [
  {
    id: "j1",
    name: "Kitchen Remodel - Full Gut",
    client: "Michael Brown",
    description: "Full gut and rebuild — demo, plumbing, electrical, cabinets, countertops, tile, flooring.",
    contractValue: 38500,
    spent: 0,
    status: "active" as ProjectListStatus,
    startDate: "2026-03-10",
    estimatedEnd: "2026-04-25",
    progress: 52,
    milestones: [
      { label: "Demo complete", done: true, amount: 5000, status: "paid" as MilestoneStatus, completedDate: "2026-03-14", note: "Full gut demo finished — all debris hauled same day. Subfloor in good shape." },
      { label: "Rough-in (plumb/elec)", done: true, amount: 8500, status: "paid" as MilestoneStatus, completedDate: "2026-03-19", note: "Found old galvanized pipe behind wall — replaced with PEX. Added to CO-002." },
      { label: "Cabinet install", done: true, amount: 7000, status: "complete" as MilestoneStatus, completedDate: "2026-03-24", note: "All 8 upper boxes set and leveled. Crown molding prepped for next phase." },
      { label: "Countertops", done: false, amount: 6500, status: "in_progress" as MilestoneStatus },
      { label: "Tile & flooring", done: false, amount: 7500, status: "pending" as MilestoneStatus },
      { label: "Final walkthrough", done: false, amount: 4000, status: "pending" as MilestoneStatus },
    ] satisfies Milestone[],
    changeOrders: 2,
    hoursThisWeek: 34,
    punchListComplete: 5,
    punchListTotal: 12,
  },
  {
    id: "j2",
    name: "Bathroom Reno",
    client: "Sarah Williams",
    description: "Strip to studs, re-plumb, waterproof, tile, new vanity and fixtures.",
    contractValue: 15200,
    spent: 0,
    status: "active" as ProjectListStatus,
    startDate: "2026-03-14",
    estimatedEnd: "2026-04-05",
    progress: 35,
    milestones: [
      { label: "Demo complete", done: true, amount: 2500, status: "paid" as MilestoneStatus, completedDate: "2026-03-17", note: "Bathroom stripped to studs. No mold found behind tile." },
      { label: "Plumbing rough-in", done: true, amount: 3500, status: "complete" as MilestoneStatus, completedDate: "2026-03-21", note: "Moved shower drain 6 inches per CO-003. All copper replaced with PEX." },
      { label: "Tile & waterproofing", done: false, amount: 4200, status: "in_progress" as MilestoneStatus },
      { label: "Vanity & fixtures", done: false, amount: 3000, status: "pending" as MilestoneStatus },
      { label: "Final walkthrough", done: false, amount: 2000, status: "pending" as MilestoneStatus },
    ] satisfies Milestone[],
    changeOrders: 1,
    hoursThisWeek: 20,
    punchListComplete: 1,
    punchListTotal: 8,
  },
  {
    id: "j3",
    name: "Deck Build",
    client: "Robert Johnson",
    description: "New 400 sqft composite deck — footings, framing, boards, railing, stairs.",
    contractValue: 22000,
    spent: 0,
    status: "active" as ProjectListStatus,
    startDate: "2026-03-13",
    estimatedEnd: "2026-04-10",
    progress: 40,
    milestones: [
      { label: "Footings & posts", done: true, amount: 4500, status: "paid" as MilestoneStatus, completedDate: "2026-03-16", note: "8 footings poured — 12\" sonotubes, 24\" depth. Inspector signed off." },
      { label: "Framing", done: true, amount: 6000, status: "complete" as MilestoneStatus, completedDate: "2026-03-22", note: "All joists and ledger board secured. Lag bolts torqued to spec." },
      { label: "Decking boards", done: false, amount: 5500, status: "in_progress" as MilestoneStatus },
      { label: "Railing & stairs", done: false, amount: 4000, status: "pending" as MilestoneStatus },
      { label: "Final walkthrough", done: false, amount: 2000, status: "pending" as MilestoneStatus },
    ] satisfies Milestone[],
    changeOrders: 1,
    hoursThisWeek: 28,
    punchListComplete: 0,
    punchListTotal: 5,
  },
  {
    id: "j4",
    name: "Roof Replacement",
    client: "Patricia Taylor",
    description: "30-square tear-off and re-roof — GAF Timberline HDZ, new flashings, ridge vent.",
    contractValue: 13500,
    spent: 0,
    status: "active" as ProjectListStatus,
    startDate: "2026-03-15",
    estimatedEnd: "2026-03-22",
    progress: 80,
    milestones: [
      { label: "Tear-off complete", done: true, amount: 3000, status: "paid" as MilestoneStatus, completedDate: "2026-03-16", note: "Full tear-off to decking. Found 4 sheets compromised OSB — see CO-004." },
      { label: "OSB & underlayment", done: true, amount: 3500, status: "paid" as MilestoneStatus, completedDate: "2026-03-17", note: "Replaced bad OSB, ice & water shield at eaves and valleys." },
      { label: "Shingles", done: true, amount: 4000, status: "complete" as MilestoneStatus, completedDate: "2026-03-19", note: "GAF Timberline HDZ installed — all 30 squares. Ridge vent prepped." },
      { label: "Flashings & ridge", done: false, amount: 2000, status: "in_progress" as MilestoneStatus },
      { label: "Final inspection", done: false, amount: 1000, status: "pending" as MilestoneStatus },
    ] satisfies Milestone[],
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
          <p className="text-[13px] text-gray-600 mt-1">{completedMilestones} of {project.milestones.length} milestones</p>
        </div>
        <div className="flex-1 pt-2">
          <div className="h-3 bg-gray-100 rounded-sm overflow-hidden mb-2">
            <div className="h-full bg-brand-600 rounded-sm" style={{ width: `${project.progress}%` }} />
          </div>
          <div className="flex justify-between text-[12px] text-gray-600">
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
              <span className={cn("text-[14px] flex-1", m.done ? "text-gray-600" : "text-gray-900 font-medium")}>{m.label}</span>
              {m.done && <span className="text-[12px] text-brand-600 font-medium">Complete</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps + Project Notes row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Next Steps */}
        <div className="bg-white border border-border rounded-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Next Steps</p>
          <div className="space-y-3">
            {nextSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-sm bg-amber-50 border border-amber-200 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-amber-600">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{step.label}</p>
                  <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{step.action}</p>
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
        <div className="bg-white border border-border rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Project Notes</p>
            <span className="text-xs text-gray-600">Saved locally</span>
          </div>
          <Textarea
            placeholder="Jot quick notes about this project — supplier contacts, site access codes, special instructions..."
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none text-sm"
          />
          {notes && (
            <p className="text-xs text-gray-600 mt-2">{notes.length} characters</p>
          )}
        </div>
      </div>

    </div>
  );
}





/* CalendarView and ScheduleTab removed — schedule routes to MilestoneScheduleTab */

function ChangeOrdersTab({ projectId }: { projectId: string }) {
  const [cos, setCos] = useState<ChangeOrder[]>(ALL_COS[projectId] ?? []);
  const [selected, setSelected] = useState<ChangeOrder | null>(null);
  const [newCOOpen, setNewCOOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [labor, setLabor] = useState("");
  const [materials, setMaterials] = useState("");
  const [reason, setReason] = useState("");

  const total = (parseFloat(labor) || 0) + (parseFloat(materials) || 0);

  useEffect(() => {
    fetchProjectChangeOrders(projectId).then((rows) => {
      if (!Array.isArray(rows) || rows.length === 0) return;
      setCos(
        rows.map((co: any, idx: number) => ({
          id: co.id || `CO-${idx + 1}`,
          description: co.description || "Change order",
          amount: Number(co.amount || 0),
          status: (co.status || "Pending") as COStatus,
          date: co.date || new Date().toISOString().split("T")[0],
          labor: Number(co.labor || 0),
          materials: Number(co.materials || 0),
          reason: co.reason || "",
        }))
      );
    });
  }, [projectId]);

  if (cos.length === 0) {
    return (
      <div className="bg-white border border-border rounded-sm py-12 text-center">
        <p className="text-gray-600 text-sm">No change orders for this project.</p>
        <Button className="gap-2 mt-4" onClick={() => setNewCOOpen(true)}><Plus className="w-4 h-4" />New Change Order</Button>
        <Dialog open={newCOOpen} onOpenChange={setNewCOOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>New Change Order</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900">Description of Change</label>
                <Input placeholder="e.g. Add recessed lighting" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-700 mb-1 block">Labor ($)</label><Input type="number" placeholder="0.00" value={labor} onChange={(e) => setLabor(e.target.value)} /></div>
                <div><label className="text-xs text-gray-700 mb-1 block">Materials ($)</label><Input type="number" placeholder="0.00" value={materials} onChange={(e) => setMaterials(e.target.value)} /></div>
              </div>
              {total > 0 && <p className="text-sm font-semibold text-gray-900">Total: {formatCurrency(total)}</p>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900">Reason</label>
                <Textarea placeholder="Explain what triggered this change..." rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <Button
                className="w-full"
                disabled={!description || total === 0}
                onClick={async () => {
                  await createProjectChangeOrder(projectId, { description, labor: Number(labor || 0), materials: Number(materials || 0), reason });
                  const next: ChangeOrder = {
                    id: `CO-${Date.now()}`,
                    description,
                    amount: total,
                    status: "Pending",
                    date: new Date().toISOString().split("T")[0],
                    labor: Number(labor || 0),
                    materials: Number(materials || 0),
                    reason,
                  };
                  setCos((prev) => [next, ...prev]);
                  setNewCOOpen(false);
                }}
              >
                Send Change Order
              </Button>
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
                <label className="text-sm font-medium text-gray-900">Description</label>
                <Input placeholder="e.g. Add recessed lighting" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-700 mb-1 block">Labor ($)</label><Input type="number" placeholder="0.00" value={labor} onChange={(e) => setLabor(e.target.value)} /></div>
                <div><label className="text-xs text-gray-700 mb-1 block">Materials ($)</label><Input type="number" placeholder="0.00" value={materials} onChange={(e) => setMaterials(e.target.value)} /></div>
              </div>
              {total > 0 && <p className="text-sm font-semibold text-gray-900">Total: {formatCurrency(total)}</p>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900">Reason</label>
                <Textarea placeholder="Explain what triggered this change..." rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <Button className="w-full" disabled={!description || total === 0}>Send Change Order</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <div className="bg-white border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-gray-50 grid grid-cols-[80px_2fr_110px_120px_120px] gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
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
              <span className="text-gray-600 text-xs">{formatDate(co.date)}</span>
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
              <div className="flex items-center justify-between"><StatusBadge status={selected.status} /><span className="text-xs text-gray-600">{formatDate(selected.date)}</span></div>
              <Separator />
              <div><p className="text-xs font-semibold text-gray-700 uppercase mb-2">Reason</p><p className="text-sm text-gray-900 leading-relaxed">{selected.reason}</p></div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase mb-3">Cost Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-800">Labor</span><span className="font-medium">{formatCurrency(selected.labor)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-800">Materials</span><span className="font-medium">{formatCurrency(selected.materials)}</span></div>
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

  useEffect(() => {
    fetchProjectPunchItems(projectId).then((rows) => {
      if (!Array.isArray(rows) || rows.length === 0) return;
      setItems(
        rows.map((item: any, idx: number) => ({
          id: item.id || `p-${idx}`,
          description: item.description || "Punch list item",
          location: item.location || "—",
          priority: (item.priority || "medium") as Priority,
          status: (item.status || "open") as ItemStatus,
          assignedTo: item.assignedTo || "Unassigned",
        }))
      );
    });
  }, [projectId]);

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
    void createProjectPunchItem(projectId, {
      description: newItem.description,
      location: newItem.location,
      priority: newItem.priority,
      status: newItem.status,
      assignedTo: newItem.assignedTo,
    });
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
    <div className="bg-gray-50 border border-border rounded-sm p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-900">New Punch Item</p>
        <button onClick={handleCancelAdd} className="text-gray-600 hover:text-gray-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
          <Input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="e.g. Caulk gap behind toilet"
            onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(); if (e.key === "Escape") handleCancelAdd(); }}
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Location</label>
          <Input
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="e.g. Master Bath"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Assigned To</label>
          <Input
            value={newAssignedTo}
            onChange={(e) => setNewAssignedTo(e.target.value)}
            placeholder="e.g. Marcus"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Priority</label>
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as Priority)}
            className="w-full h-9 rounded-sm border border-input bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring"
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
          <div className="bg-white border border-border rounded-sm py-12 text-center">
            <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-sm mb-4">No punch list items for this project yet.</p>
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
      <div className="bg-white border border-border rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900">{completed} of {items.length} items complete</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-700">{pct}% — {items.length - completed} remaining</span>
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
        <div className="bg-brand-50 border border-brand-200 rounded-sm px-5 py-4 flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-brand-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-brand-800">Ready for Final Walkthrough</p>
            <p className="text-xs text-brand-700 mt-0.5">All {items.length} items complete. Schedule the final walkthrough with your client.</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-border rounded-sm overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_100px_80px_100px_100px_44px_36px] gap-3 px-4 py-3 border-b border-border bg-gray-50">
          <div />
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Description</div>
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Location</div>
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Priority</div>
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</div>
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Assigned</div>
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Photo</div>
          <div />
        </div>
        <div className="divide-y divide-border">
          {sorted.map((item) => (
            <div key={item.id} className={cn("grid grid-cols-[40px_1fr_100px_80px_100px_100px_44px_36px] gap-3 px-4 py-3 items-center", item.status === "completed" && "bg-gray-50")}>
              <button onClick={() => toggleStatus(item.id)} className="flex items-center justify-center hover:opacity-70 transition-opacity" title="Click to advance status">
                {item.status === "completed" ? <CheckCircle2 className="w-5 h-5 text-brand-600" /> : item.status === "in-progress" ? <Clock className="w-5 h-5 text-amber-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
              </button>
              <span className={cn("text-sm", item.status === "completed" ? "line-through text-gray-600" : "text-gray-900")}>{item.description}</span>
              <span className="text-xs text-gray-700">{item.location}</span>
              <div>
                {item.priority === "high" ? <Badge variant="danger">High</Badge> : item.priority === "medium" ? <Badge variant="warning">Medium</Badge> : <Badge variant="secondary">Low</Badge>}
              </div>
              <div>
                {item.status === "completed" ? <Badge variant="success">Done</Badge> : item.status === "in-progress" ? <Badge variant="warning">In Progress</Badge> : <Badge variant="outline">Open</Badge>}
              </div>
              <span className="text-xs font-medium text-gray-900">{item.assignedTo}</span>
              <button className="flex items-center justify-center text-gray-300 hover:text-gray-700 transition-colors" title="Attach photo">
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

// Recent expenses per project (mock)
const EXPENSE_CATEGORIES = ["Labor", "Materials", "Equipment", "Subcontractor", "Permits", "Overhead", "Other"] as const;
type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

const CATEGORY_BADGE_STYLE: Record<ExpenseCategory, string> = {
  Labor: "bg-blue-50 text-blue-700 border-blue-200",
  Materials: "bg-amber-50 text-amber-700 border-amber-200",
  Equipment: "bg-purple-50 text-purple-700 border-purple-200",
  Subcontractor: "bg-teal-50 text-teal-700 border-teal-200",
  Permits: "bg-gray-50 text-gray-700 border-gray-200",
  Overhead: "bg-red-50 text-red-700 border-red-200",
  Other: "bg-gray-50 text-gray-600 border-gray-200",
};

interface Expense {
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  milestone?: string;
  vendor?: string;
}

const ALL_EXPENSES: Record<string, Expense[]> = {
  j1: [
    { date: "Mar 24", description: "Quartz countertop slab deposit", amount: 2800, category: "Materials", milestone: "Countertops", vendor: "ABC Stone" },
    { date: "Mar 22", description: "Tile — porcelain 12x24 (14 boxes)", amount: 1260, category: "Materials", milestone: "Tile & flooring" },
    { date: "Mar 20", description: "Plumber — rough-in labor", amount: 1400, category: "Subcontractor", milestone: "Rough-in (plumb/elec)" },
    { date: "Mar 18", description: "Cabinet hardware — pulls + hinges", amount: 340, category: "Materials", milestone: "Cabinet install" },
    { date: "Mar 15", description: "Dumpster rental — 20yd", amount: 480, category: "Equipment", milestone: "Demo complete" },
  ],
  j2: [
    { date: "Mar 23", description: "Schluter membrane + accessories", amount: 620, category: "Materials", milestone: "Tile & waterproofing" },
    { date: "Mar 21", description: "Vanity — 48in double sink", amount: 1350, category: "Materials", milestone: "Vanity & fixtures" },
    { date: "Mar 19", description: "Tile — subway 3x6 white (22 boxes)", amount: 440, category: "Materials", milestone: "Tile & waterproofing" },
  ],
  j3: [
    { date: "Mar 24", description: "Composite decking — Trex Enhance", amount: 3200, category: "Materials", milestone: "Decking boards" },
    { date: "Mar 22", description: "Post brackets + concrete", amount: 480, category: "Materials", milestone: "Footings & posts" },
    { date: "Mar 20", description: "Permit fee — deck construction", amount: 250, category: "Permits" },
  ],
  j4: [
    { date: "Mar 23", description: "Architectural shingles — 28 squares", amount: 4200, category: "Materials", milestone: "Shingles" },
    { date: "Mar 21", description: "Ice & water shield + underlayment", amount: 860, category: "Materials", milestone: "OSB & underlayment" },
    { date: "Mar 19", description: "Ridge vent + pipe boots", amount: 320, category: "Materials", milestone: "Flashings & ridge" },
  ],
};

function CostsTab({ projectId, project }: { projectId: string; project: typeof PROJECTS[0] }) {
  const categories = ALL_COSTING[projectId] ?? [];
  const [expenses, setExpenses] = useState<Expense[]>(ALL_EXPENSES[projectId] ?? []);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState<ExpenseCategory>("Materials");
  const [expMilestone, setExpMilestone] = useState("");
  const [expVendor, setExpVendor] = useState("");

  const totalEstimated = categories.reduce((s, c) => s + c.estimated, 0);
  const totalActual = categories.reduce((s, c) => s + c.actual, 0);
  const remaining = totalEstimated - totalActual;
  const milestones = project.milestones as Milestone[];

  useEffect(() => {
    fetchProjectExpenses(projectId).then((rows) => {
      if (!Array.isArray(rows) || rows.length === 0) return;
      setExpenses(
        rows.map((exp: any) => ({
          date: exp.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          description: exp.description || "Expense",
          amount: Number(exp.amount || 0),
          category: (exp.category || "Other") as ExpenseCategory,
          milestone: exp.milestone || undefined,
          vendor: exp.vendor || undefined,
        }))
      );
    });
  }, [projectId]);

  function handleAddExpense() {
    if (!expDesc.trim() || !expAmount) return;
    const newExp: Expense = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      description: expDesc.trim(),
      amount: parseFloat(expAmount) || 0,
      category: expCategory,
      milestone: expMilestone || undefined,
      vendor: expVendor.trim() || undefined,
    };
    setExpenses((prev) => [newExp, ...prev]);
    void createProjectExpense(projectId, {
      date: newExp.date,
      description: newExp.description,
      amount: newExp.amount,
      category: newExp.category,
      milestone: newExp.milestone,
      vendor: newExp.vendor,
    });
    setExpDesc("");
    setExpAmount("");
    setExpCategory("Materials");
    setExpMilestone("");
    setExpVendor("");
    setShowAddExpense(false);
    toast.success("Expense added");
  }

  return (
    <div className="space-y-6 max-w-[800px]">
      {/* Summary cards — 3 across */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-sm border border-border p-5">
          <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">Budget</p>
          <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight mt-1">{formatCurrency(totalEstimated)}</p>
        </div>
        <div className="bg-white rounded-sm border border-border p-5">
          <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">Spent</p>
          <p className="text-[28px] font-bold text-gray-900 tabular-nums leading-tight mt-1">{formatCurrency(totalActual)}</p>
        </div>
        <div className="bg-white rounded-sm border border-border p-5">
          <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">Remaining</p>
          <p className={cn("text-[28px] font-bold tabular-nums leading-tight mt-1", remaining >= 0 ? "text-brand-600" : "text-red-600")}>{formatCurrency(Math.abs(remaining))}</p>
          {remaining < 0 && <p className="text-[12px] font-semibold text-red-600 mt-0.5">Over budget</p>}
        </div>
      </div>

      {/* Cost breakdown with progress bars */}
      <div className="bg-white rounded-sm border border-border p-5">
        <p className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">Cost Breakdown</p>
        <div className="space-y-4">
          {categories.map((cat) => {
            const pct = cat.estimated > 0 ? Math.round((cat.actual / cat.estimated) * 100) : 0;
            const isOver = cat.actual > cat.estimated;
            return (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] font-semibold text-gray-900">{cat.category}</span>
                  <span className="text-[14px] tabular-nums text-gray-700">
                    <span className="font-semibold text-gray-900">{formatCurrency(cat.actual)}</span>
                    {" / "}
                    {formatCurrency(cat.estimated)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-sm overflow-hidden">
                    <div
                      className={cn("h-full rounded-sm transition-all duration-500", isOver ? "bg-red-500" : "bg-brand-600")}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className={cn("text-[13px] font-bold tabular-nums w-[40px] text-right", isOver ? "text-red-600" : "text-gray-800")}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent expenses */}
      <div className="bg-white rounded-sm border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">Recent Expenses</p>
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-[12px]" onClick={() => setShowAddExpense(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </Button>
        </div>

        {/* Add Expense Dialog */}
        <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900">Description</label>
                <Input value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="e.g. Tile — porcelain 12x24" autoFocus />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900">Amount ($)</label>
                <Input type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900">Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className="w-full h-9 rounded-sm border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900">Milestone</label>
                <select
                  value={expMilestone}
                  onChange={(e) => setExpMilestone(e.target.value)}
                  className="w-full h-9 rounded-sm border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="">None</option>
                  {milestones.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900">
                  Vendor <span className="text-xs text-gray-600 font-normal">(optional)</span>
                </label>
                <Input value={expVendor} onChange={(e) => setExpVendor(e.target.value)} placeholder="e.g. ABC Supply" />
              </div>
              <Button className="w-full" disabled={!expDesc.trim() || !expAmount} onClick={handleAddExpense}>
                Add Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-0">
          {expenses.map((exp, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-[13px] text-gray-600 tabular-nums w-[52px] flex-shrink-0">{exp.date}</span>
                <div className="min-w-0 flex-1">
                  <span className="text-[14px] text-gray-900 truncate block">{exp.description}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", CATEGORY_BADGE_STYLE[exp.category])}>{exp.category}</span>
                    {exp.milestone && <span className="text-[11px] text-gray-600">{exp.milestone}</span>}
                    {exp.vendor && <span className="text-[11px] text-gray-600">/ {exp.vendor}</span>}
                  </div>
                </div>
              </div>
              <span className="text-[14px] font-semibold text-gray-900 tabular-nums flex-shrink-0 ml-4">{formatCurrency(exp.amount)}</span>
            </div>
          ))}
          {expenses.length === 0 && (
            <p className="text-[13px] text-gray-600 text-center py-6">No expenses recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Milestones Tab ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; color: string; bg: string }> = {
  paid:        { label: "Paid",        color: "text-emerald-950",  bg: "bg-emerald-950/10 border-emerald-800/30" },
  complete:    { label: "Complete",    color: "text-blue-700",     bg: "bg-blue-100 border-blue-300" },
  in_progress: { label: "In Progress", color: "text-brand-700",   bg: "bg-brand-50 border-brand-200" },
  pending:     { label: "Pending",     color: "text-gray-700",    bg: "bg-gray-50 border-gray-200" },
  delayed:     { label: "Delayed",     color: "text-red-700",     bg: "bg-red-50 border-red-200" },
};

function MilestonesTab({
  project,
  onUpdate,
  initialExpandIndex,
}: {
  project: typeof PROJECTS[0];
  onUpdate: (milestones: Milestone[]) => void;
  initialExpandIndex?: number | null;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(initialExpandIndex ?? null);
  const [submitNote, setSubmitNote] = useState("");
  const [subJobDialog, setSubJobDialog] = useState<{ open: boolean; milestoneIndex: number; label: string; amount: number } | null>(null);
  const milestones = project.milestones as Milestone[];

  const totalAmount = milestones.reduce((s, m) => s + m.amount, 0);
  const paidAmount = milestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0);
  const completeAmount = milestones.filter((m) => m.status === "complete").reduce((s, m) => s + m.amount, 0);
  const releasedAmount = paidAmount + completeAmount;
  const pct = totalAmount > 0 ? Math.round((releasedAmount / totalAmount) * 100) : 0;

  function submitMilestone(index: number) {
    const updated = milestones.map((m, i) => i === index ? { ...m, done: true, status: "complete" as MilestoneStatus, completedDate: new Date().toISOString().split("T")[0], note: submitNote || undefined } : m);
    onUpdate(updated);
    setExpandedIndex(null);
    setSubmitNote("");
  }

  function addMilestone() {
    if (!newLabel.trim()) return;
    const amount = parseInt(newAmount) || 0;
    onUpdate([...milestones, { label: newLabel.trim(), done: false, amount, status: "pending" as MilestoneStatus }]);
    setNewLabel("");
    setNewAmount("");
    setShowAdd(false);
  }

  function removeMilestone(index: number) {
    onUpdate(milestones.filter((_, i) => i !== index));
  }

  function toggleExpand(index: number) {
    setExpandedIndex(expandedIndex === index ? null : index);
    setSubmitNote(milestones[index]?.note || "");
  }

  return (
    <div className="p-6">
      {/* Finance summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-sm border border-border p-4">
          <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">Contract</p>
          <p className="text-xl font-bold text-gray-900 tabular-nums mt-1">{formatCurrency(project.contractValue)}</p>
        </div>
        <div className="bg-white rounded-sm border border-border p-4">
          <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">Released</p>
          <p className="text-xl font-bold text-emerald-950 tabular-nums mt-1">{formatCurrency(releasedAmount)}</p>
        </div>
        <div className="bg-white rounded-sm border border-border p-4">
          <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">Remaining</p>
          <p className="text-xl font-bold text-gray-900 tabular-nums mt-1">{formatCurrency(totalAmount - releasedAmount)}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium text-gray-800">Escrow progress</span>
          <span className="text-[13px] font-bold text-gray-900 tabular-nums">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-sm overflow-hidden flex">
          {paidAmount > 0 && <div className="bg-emerald-600 transition-all duration-500" style={{ width: `${(paidAmount / totalAmount) * 100}%` }} />}
          {completeAmount > 0 && <div className="bg-blue-600 transition-all duration-500" style={{ width: `${(completeAmount / totalAmount) * 100}%` }} />}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-emerald-600" /><span className="text-[11px] text-gray-600">Paid</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-blue-600" /><span className="text-[11px] text-gray-600">Complete</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-gray-200" /><span className="text-[11px] text-gray-600">Remaining</span></div>
        </div>
      </div>

      {/* Milestone list */}
      <div className="space-y-2 mb-4">
        {milestones.map((m, i) => {
          const cfg = STATUS_CONFIG[m.status];
          const isExpanded = expandedIndex === i;
          const canExpand = m.status !== "pending";
          return (
            <div
              key={`${m.label}-${i}`}
              className={cn(
                "group rounded-sm border bg-white transition-all",
                m.status === "in_progress" ? "border-brand-200 shadow-sm" : "border-border"
              )}
            >
              {/* Row */}
              <div
                className={cn("flex items-center gap-4 px-5 py-4", canExpand && "cursor-pointer")}
                onClick={() => canExpand && toggleExpand(i)}
              >
                <div className={cn(
                  "w-7 h-7 rounded-sm flex items-center justify-center shrink-0",
                  m.status === "paid" || m.status === "complete" ? "bg-emerald-950/10" : m.status === "in_progress" ? "bg-brand-50" : m.status === "delayed" ? "bg-red-50" : "bg-gray-50"
                )}>
                  {(m.status === "paid" || m.status === "complete") && <Check className="w-4 h-4 text-emerald-950" strokeWidth={2.5} />}
                  {m.status === "in_progress" && <div className="w-2.5 h-2.5 rounded-sm bg-brand-600 animate-pulse" />}
                  {m.status === "pending" && <Circle className="w-4 h-4 text-gray-300" />}
                  {m.status === "delayed" && <AlertTriangle className="w-4 h-4 text-red-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn("text-[15px] font-medium leading-tight", m.status === "paid" ? "text-gray-600" : "text-gray-900")}>{m.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded border", cfg.bg, cfg.color)}>{cfg.label}</span>
                    {m.completedDate && <span className="text-[11px] text-gray-600">{m.completedDate}</span>}
                  </div>
                </div>

                <p className={cn("text-[15px] font-bold tabular-nums shrink-0", m.status === "paid" ? "text-emerald-950" : "text-gray-900")}>{formatCurrency(m.amount)}</p>

                {/* Post Sub Job button for in_progress / pending milestones */}
                {(m.status === "in_progress" || m.status === "pending") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubJobDialog({ open: true, milestoneIndex: i, label: m.label, amount: m.amount });
                    }}
                    className="shrink-0 flex items-center gap-1 h-6 px-2 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                    title="Find a sub for this milestone"
                  >
                    <Users className="w-3 h-3" />
                    Post Sub
                  </button>
                )}

                <div className="shrink-0 w-8 flex justify-end">
                  {canExpand && (
                    <ChevronDown className={cn("w-4 h-4 text-gray-600 transition-transform", isExpanded && "rotate-180")} />
                  )}
                  {m.status === "pending" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeMilestone(i); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border">
                  {/* Photos section */}
                  <div className="mt-4 mb-4">
                    <p className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider mb-2">Photos</p>
                    <div className="grid grid-cols-4 gap-2">
                      {(m.status === "paid" || m.status === "complete") ? (
                        <>
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="aspect-square rounded-sm bg-gray-100 border border-border flex items-center justify-center">
                              <Camera className="w-5 h-5 text-gray-300" />
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          <button className="aspect-square rounded-sm border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-brand-400 hover:bg-brand-50/30 transition-colors">
                            <Upload className="w-5 h-5 text-gray-300" />
                            <span className="text-[10px] text-gray-600">Upload</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Note */}
                  {(m.status === "paid" || m.status === "complete") && m.note && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-sm">
                      <p className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider mb-1">Contractor note</p>
                      <p className="text-[13px] text-gray-800">{m.note}</p>
                    </div>
                  )}

                  {/* Submit form for in_progress */}
                  {m.status === "in_progress" && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider mb-2">Add a note for the homeowner</p>
                        <textarea
                          value={submitNote}
                          onChange={(e) => setSubmitNote(e.target.value)}
                          placeholder="Describe what was completed, any changes, or things to note..."
                          rows={3}
                          className="w-full rounded-sm border border-border px-3 py-2 text-[13px] text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1 resize-none"
                        />
                      </div>
                      <button
                        onClick={() => submitMilestone(i)}
                        className="w-full h-10 rounded-sm bg-brand-600 text-white text-[13px] font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Submit for Homeowner Review
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Complete confirmation */}
                  {m.status === "complete" && (
                    <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-sm border border-blue-300">
                      <Check className="w-4 h-4 text-blue-700 shrink-0" />
                      <p className="text-[13px] text-blue-700">Milestone complete. Payment processing.</p>
                    </div>
                  )}

                  {/* Paid confirmation */}
                  {m.status === "paid" && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-950/10 rounded-sm border border-emerald-800/30">
                      <Check className="w-4 h-4 text-emerald-950 shrink-0" />
                      <p className="text-[13px] text-emerald-950">Payment of {formatCurrency(m.amount)} released to your account.</p>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add milestone */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 rounded-sm border border-dashed border-gray-200 py-3 text-[13px] font-medium text-gray-600 hover:text-gray-800 hover:border-gray-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add milestone
        </button>
      ) : (
        <div className="rounded-sm border border-brand-200 bg-white p-4 space-y-3">
          <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Milestone name" className="w-full h-10 rounded-sm border border-border px-3 text-[14px] text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1" autoFocus />
          <input type="text" inputMode="numeric" value={newAmount} onChange={(e) => setNewAmount(e.target.value.replace(/\D/g, ""))} placeholder="Amount ($)" className="w-full h-10 rounded-sm border border-border px-3 text-[14px] text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1" />
          <div className="flex gap-2">
            <button onClick={addMilestone} disabled={!newLabel.trim()} className="flex-1 h-9 rounded-sm bg-brand-600 text-white text-[13px] font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40">Add Milestone</button>
            <button onClick={() => { setShowAdd(false); setNewLabel(""); setNewAmount(""); }} className="h-9 px-4 rounded-sm border border-border text-[13px] font-medium text-gray-800 hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Post Sub Job Dialog */}
      {subJobDialog && (
        <PostSubJobDialog
          open={subJobDialog.open}
          onOpenChange={(open) => {
            if (!open) setSubJobDialog(null);
          }}
          milestoneLabel={subJobDialog.label}
          milestoneAmount={subJobDialog.amount}
          milestoneIndex={subJobDialog.milestoneIndex}
          projectId={project.id}
          projectName={project.name}
          projectCategory="General Contracting"
          projectLocation="Oxford, MS"
          onSubmit={async (payload) => {
            try {
              await api.createSubJob(payload);
              return true;
            } catch {
              toast.error("Could not post sub job");
              return false;
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Milestone Schedule Tab ──────────────────────────────────────────────────

function MilestoneScheduleTab({ project }: { project: typeof PROJECTS[0] }) {
  const milestones = project.milestones as Milestone[];
  const startDate = new Date(project.startDate);

  return (
    <div className="p-6 max-w-3xl">
      <h3 className="text-base font-bold text-gray-900 mb-1">Schedule</h3>
      <p className="text-[13px] text-gray-600 mb-6">
        {project.name} &middot; {project.startDate} to {project.estimatedEnd}
      </p>

      <div className="space-y-0">
        {milestones.map((m, i) => {
          const cfg = STATUS_CONFIG[m.status];
          // Estimate date spread across project timeline
          const totalDays = Math.max(1, Math.ceil((new Date(project.estimatedEnd).getTime() - startDate.getTime()) / 86400000));
          const dayOffset = Math.round((i / milestones.length) * totalDays);
          const estDate = new Date(startDate.getTime() + dayOffset * 86400000);
          const dateStr = estDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const isLast = i === milestones.length - 1;

          return (
            <div key={`${m.label}-${i}`} className="flex gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center w-10 shrink-0">
                <div className={cn(
                  "w-3 h-3 rounded-sm border-2 shrink-0 mt-1.5",
                  m.status === "paid" || m.status === "complete" ? "bg-emerald-600 border-emerald-600"
                    : m.status === "in_progress" ? "bg-brand-600 border-brand-600"
                    : "bg-white border-gray-300"
                )} />
                {!isLast && <div className={cn("w-px flex-1 min-h-[40px]", m.done ? "bg-emerald-950/15" : "bg-gray-200")} />}
              </div>

              {/* Content */}
              <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={cn("text-[14px] font-medium", m.done ? "text-gray-600" : "text-gray-900")}>{m.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded border", cfg.bg, cfg.color)}>{cfg.label}</span>
                      <span className="text-[12px] text-gray-600">{m.completedDate || dateStr}</span>
                    </div>
                  </div>
                  <span className={cn("text-[14px] font-bold tabular-nums", m.status === "paid" ? "text-emerald-950" : "text-gray-900")}>
                    {formatCurrency(m.amount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

const MOCK_DOCUMENTS = [
  { id: "d1", name: "Contract — Kitchen Remodel", type: "contract", size: "2.4 MB", date: "2026-03-08", status: "signed" },
  { id: "d2", name: "Change Order #1", type: "change_order", size: "1.1 MB", date: "2026-03-15", status: "approved" },
  { id: "d3", name: "Change Order #2", type: "change_order", size: "890 KB", date: "2026-03-20", status: "pending" },
  { id: "d4", name: "Insurance Certificate", type: "insurance", size: "540 KB", date: "2026-03-08", status: "verified" },
  { id: "d5", name: "Permit — Building", type: "permit", size: "1.8 MB", date: "2026-03-10", status: "approved" },
  { id: "d6", name: "Inspection Report", type: "inspection", size: "3.2 MB", date: "2026-03-22", status: "passed" },
];

const DOC_STATUS_STYLE: Record<string, { label: string; className: string }> = {
  signed: { label: "Signed", className: "bg-emerald-950/10 text-emerald-950 border-emerald-800/20" },
  approved: { label: "Approved", className: "bg-blue-50 text-blue-700 border-blue-200" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  verified: { label: "Verified", className: "bg-emerald-950/10 text-emerald-950 border-emerald-800/20" },
  passed: { label: "Passed", className: "bg-emerald-950/10 text-emerald-950 border-emerald-800/20" },
};

const DOC_TYPE_LABEL: Record<string, string> = {
  contract: "Contract",
  change_order: "Change Order",
  insurance: "Insurance",
  permit: "Permit",
  inspection: "Inspection",
};

function DocumentsTab({ projectId }: { projectId: string }) {
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);

  useEffect(() => {
    fetchProjectDocuments(projectId).then((rows) => {
      if (!Array.isArray(rows) || rows.length === 0) return;
      setDocuments(
        rows.map((doc: any, idx: number) => ({
          id: doc.id || `d-${idx}`,
          name: doc.name || "Document",
          type: doc.type || "other",
          size: doc.size || "—",
          date: doc.date || new Date().toISOString().split("T")[0],
          status: doc.status || "pending",
        }))
      );
    });
  }, [projectId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-gray-700">{documents.length} documents</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Google Drive integration coming soon")}
            className="h-8 px-3 text-[12px] font-medium rounded-sm border border-border text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Cloud className="w-3.5 h-3.5" />
            Connect Google Drive
          </button>
          <Button
            size="sm"
            className="h-8 text-[12px] gap-1.5"
            onClick={() => {
              void createProjectDocument(projectId, { name: "New Document", type: "other" });
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-border overflow-hidden">
        {documents.map((doc, i) => {
          const status = DOC_STATUS_STYLE[doc.status] || DOC_STATUS_STYLE.pending;
          const typeLabel = DOC_TYPE_LABEL[doc.type] || doc.type;
          return (
            <div
              key={doc.id}
              className={cn(
                "flex items-center gap-4 px-4 py-3 hover:bg-gray-50/80 transition-colors",
                i < documents.length - 1 && "border-b border-border"
              )}
            >
              <div className="w-8 h-8 rounded-sm bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">{doc.size}</p>
              </div>
              <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {typeLabel}
              </span>
              <span className="text-[12px] text-gray-600 tabular-nums w-[80px] text-right">{doc.date}</span>
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded border min-w-[70px] text-center", status.className)}>
                {status.label}
              </span>
              <button
                className="flex items-center justify-center w-7 h-7 rounded-sm hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-sm border border-border p-4 mt-4">
        <p className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider mb-3">Connected Storage</p>
        <div className="flex items-center gap-3 p-3 bg-white rounded-sm border border-border">
          <div className="w-9 h-9 rounded-sm bg-blue-50 flex items-center justify-center">
            <Cloud className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-gray-900">Google Drive</p>
            <p className="text-[11px] text-gray-600">Not connected</p>
          </div>
          <button onClick={() => toast.info("Google Drive integration coming soon")} className="text-[12px] font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PROJECT_NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "milestones", label: "Milestones", icon: CheckCircle2 },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "costs", label: "Costs", icon: DollarSign },
  { id: "documents", label: "Documents", icon: FileText },
];

export default function ProjectsPage() {
  usePageTitle("Projects");
  const [projects, setProjects] = useState<typeof PROJECTS>([]);
  const searchParams = useSearchParams();
  const paramProject = searchParams.get("project");
  const paramTab = searchParams.get("tab");
  const paramMilestone = searchParams.get("milestone");

  const [selectedProjectId, setSelectedProjectId] = useState(paramProject || "");
  const [activeSection, setActiveSection] = useState(paramTab || "overview");
  const [initialMilestoneIndex] = useState(paramMilestone ? parseInt(paramMilestone) : null);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  useEffect(() => {
    fetchProjects().then((apiProjects) => {
      const normalizeMoney = (value: unknown, fallback = 0) =>
        typeof value === "number" ? (value > 100000 ? value / 100 : value) : fallback;
      const mapped = (Array.isArray(apiProjects) ? apiProjects : []).map((apiProject: any) => {
        const budget = normalizeMoney(apiProject.budget, 0);
        const spent = normalizeMoney(apiProject.spent, 0);
        const milestones = Array.isArray(apiProject.milestones) ? apiProject.milestones : [];
        return {
          id: apiProject.id,
          name: apiProject.name || "Project",
          client: apiProject.client?.name || apiProject.homeowner?.name || "Client",
          description: apiProject.description || "",
          contractValue: budget,
          spent,
          status: apiProject.status === "completed" ? "complete" as const : "active" as const,
          startDate: apiProject.startDate || apiProject.created_at || new Date().toISOString().split("T")[0],
          estimatedEnd: apiProject.estimatedEnd || apiProject.dueDate || new Date().toISOString().split("T")[0],
          progress: budget > 0 ? Math.max(0, Math.min(100, Math.round((spent / budget) * 100))) : 0,
          milestones: milestones.map((m: any) => ({
            label: m.label || m.name || "Milestone",
            done: Boolean(m.done),
            amount: Number(m.amount || 0),
            status: (m.status || "pending") as MilestoneStatus,
            completedDate: m.completedDate,
            note: m.note,
          })),
          changeOrders: 0,
          hoursThisWeek: 0,
          punchListComplete: 0,
          punchListTotal: 0,
        };
      });
      setProjects(mapped);
      setSelectedProjectId((current) => current || mapped[0]?.id || "");
    });
  }, []);

  const project = projects.find((p) => p.id === selectedProjectId) ?? null;
  if (!project) {
    return (
      <div className="flex flex-col min-h-full bg-surface">
        <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Projects</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">No projects yet</p>
            <p className="text-xs text-gray-600 mt-1">Projects will appear here once they exist in your account.</p>
          </div>
        </div>
      </div>
    );
  }
  const clientInfo = CLIENT_INFO[project.id] ?? { phone: "(512) 555-0000", email: "client@email.com", preferred: "Text" };
  const coCount = ALL_COS[selectedProjectId]?.length ?? 0;

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <OverviewTab project={project} />;
      case "milestones": return <MilestonesTab project={project} initialExpandIndex={initialMilestoneIndex} onUpdate={(ms: Milestone[]) => {
        const progress = ms.length > 0 ? Math.round(ms.filter((m) => m.done).length / ms.length * 100) : 0;
        const status = progress >= 100 ? "completed" : "in_progress";
        const spent = ms
          .filter((m) => m.status === "paid" || m.status === "complete")
          .reduce((sum, m) => sum + m.amount, 0);
        setProjects((prev) => prev.map((p) => p.id === selectedProjectId ? { ...p, milestones: ms as typeof p.milestones, progress } : p));
        void persistProject(selectedProjectId, {
          spent: Math.round(spent * 100),
          status,
        });
      }} />;
      case "schedule": return <MilestoneScheduleTab project={project} />;
      case "change-orders": return <ChangeOrdersTab projectId={selectedProjectId} />;
      case "punch-list": return <PunchListTab projectId={selectedProjectId} />;
      case "costs": return <CostsTab projectId={selectedProjectId} project={project} />;
      case "documents": return <DocumentsTab projectId={selectedProjectId} />;
      default: return <OverviewTab project={project} />;
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Projects</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2" onClick={() => setCreateProjectOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              New Project
            </Button>
            <Link href="/contractor/messages">
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Message {project.client.split(" ")[0]}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        {/* Project list sidebar */}
        <div className="hidden md:flex w-48 flex-shrink-0 bg-white border-r border-gray-200 flex-col overflow-y-auto">
          <div className="py-3 px-2 space-y-0.5">
            {projects.map((p) => {
              const isSelected = p.id === selectedProjectId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={cn(
                    "w-full text-left rounded-sm px-2.5 py-2 transition-colors text-[12px] font-medium truncate",
                    isSelected
                      ? "bg-brand-600 text-white"
                      : "text-gray-900 hover:bg-gray-50"
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
          <div className="px-0 pt-0 pb-0 border-b border-gray-200 bg-[#F7F8FA]">
            <div className="mb-4 bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-6">
                  <h2 className="text-[23px] font-bold text-gray-900 leading-tight">{project.client}</h2>
                  <span className="text-[21px] font-bold text-gray-900 tabular-nums">{formatCurrency(project.contractValue)}</span>
                </div>
                <span className="text-[15px] text-gray-500">{formatDate(project.startDate)} — {formatDate(project.estimatedEnd)}</span>
              </div>
              {project.description && (
                <p className="text-[13px] text-gray-500 mt-1.5">{project.description}</p>
              )}
              <div className="flex items-center gap-8 mt-3 pt-3 border-t border-gray-100 text-[14px]">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-semibold text-gray-900">{clientInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Email</span>
                  <span className="font-semibold text-gray-900">{clientInfo.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Preferred</span>
                  <span className="font-semibold text-gray-900">{clientInfo.preferred}</span>
                </div>
              </div>
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
                        : "border-transparent text-gray-600 hover:text-gray-800"
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

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onCreated={(newProject) => {
          setProjects((prev) => [...prev, newProject]);
          setSelectedProjectId(newProject.id);
          setActiveSection("overview");
          toast.success("Project created");
        }}
      />
    </div>
  );
}
