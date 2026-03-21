"use client";

import React, { useState } from "react";
import {
  Check,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  CalendarDays,
  Shield,
  Plus,
  Upload,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ClipboardCheck,
} from "lucide-react";
import { AppHeader } from "@shared/components/app-header";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Badge } from "@shared/ui/badge";
import { Progress } from "@shared/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@shared/ui/tabs";
import { Separator } from "@shared/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/ui/dialog";
import { cn, formatCurrency, formatDate } from "@shared/lib/utils";
import { mockProjects, type Project } from "@shared/lib/mock-data";

// ─── Active Tab ────────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const completedMilestones = project.milestones.filter((m) => m.completed).length;
  const budgetPct = Math.min(100, Math.round((project.spent / project.budget) * 100));
  const overBudget = project.spent > project.budget;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
              <Badge variant="info">In Progress</Badge>
            </div>
            <p className="text-sm text-gray-500">{project.contractor}</p>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex-shrink-0 w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500">
              {completedMilestones}/{project.milestones.length} milestones
            </span>
            <span className="text-xs font-semibold text-brand-600">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-surface rounded-lg">
            <DollarSign className="h-3.5 w-3.5 text-gray-400 mx-auto mb-0.5" />
            <p className="text-xs font-semibold text-gray-900">{formatCurrency(project.budget)}</p>
            <p className="text-xs text-gray-400">Budget</p>
          </div>
          <div className="p-2 bg-surface rounded-lg">
            <CalendarDays className="h-3.5 w-3.5 text-gray-400 mx-auto mb-0.5" />
            <p className="text-xs font-semibold text-gray-900">{formatDate(project.startDate)}</p>
            <p className="text-xs text-gray-400">Started</p>
          </div>
          <div className="p-2 bg-surface rounded-lg">
            <Clock className="h-3.5 w-3.5 text-gray-400 mx-auto mb-0.5" />
            <p className="text-xs font-semibold text-gray-900">{formatDate(project.estimatedEnd)}</p>
            <p className="text-xs text-gray-400">Est. End</p>
          </div>
        </div>

        {expanded && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Milestones</p>
                <div className="space-y-2">
                  {project.milestones.map((milestone, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      {milestone.completed ? (
                        <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                          <Circle className="h-2 w-2 text-gray-300" />
                        </div>
                      )}
                      <span className={cn("text-sm", milestone.completed ? "text-gray-700" : "text-gray-400")}>
                        {milestone.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Budget</p>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Usage</span>
                    <span className={cn("font-semibold", overBudget ? "text-red-500" : "text-gray-900")}>{budgetPct}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn("h-full rounded-full", overBudget ? "bg-red-500" : "bg-brand-600")}
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-gray-400">
                    <span>{formatCurrency(project.spent)} spent</span>
                    <span>{formatCurrency(project.budget)} total</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Warranties Tab ────────────────────────────────────────────────────────────

type CoverageType = "Manufacturer" | "Workmanship" | "Lifetime";
type WarrantyStatus = "active" | "expiring" | "expired" | "lifetime";

interface Warranty {
  id: string;
  item: string;
  coverageType: CoverageType;
  expiresYear: number | null;
  contractor: string;
  contractorPhone: string;
  contractorEmail: string;
  project: string;
  startDate: string;
  description: string;
  exclusions: string;
  claimProcess: string;
  documentName: string | null;
}

const TODAY_YEAR = 2026;

const MOCK_WARRANTIES: Warranty[] = [
  {
    id: "w1", item: "Owens Corning Platinum Roof Warranty", coverageType: "Manufacturer", expiresYear: 2051,
    contractor: "Mitchell Roofing Co.", contractorPhone: "(512) 555-0142", contractorEmail: "james@mitchellroofing.com",
    project: "Full Roof Replacement", startDate: "2026-01-14",
    description: "Owens Corning Platinum Protection limited lifetime warranty covering manufacturing defects in Timberline HDZ shingles, ridge cap, and underlayment system. Labor warranty included through Mitchell Roofing for 25 years.",
    exclusions: "Does not cover damage from acts of nature (hail, wind exceeding 130 mph), improper modifications, or failure to maintain gutters and ventilation.",
    claimProcess: "Contact Mitchell Roofing Co. first for labor-related issues. For manufacturer defects, call Owens Corning Warranty at 1-800-438-7465 with warranty registration number OC-2026-TX-44821.",
    documentName: "OwensCorning_Platinum_Warranty_2026.pdf",
  },
  {
    id: "w2", item: "Kohler Faucet Limited Lifetime Warranty", coverageType: "Lifetime", expiresYear: null,
    contractor: "Johnson & Sons Construction", contractorPhone: "(512) 555-0119", contractorEmail: "marcus@johnsonandsons.com",
    project: "Kitchen Remodel", startDate: "2026-03-01",
    description: "Kohler limited lifetime warranty on all faucet parts and finishes against defects in materials and workmanship for as long as the original purchaser owns their home.",
    exclusions: "Does not cover damage from misuse, accident, or repair by anyone other than an authorized Kohler service provider. Finish warranty excludes harsh cleaners.",
    claimProcess: "Call Kohler Customer Service at 1-800-456-4537 with model number K-99261-VS and proof of purchase.",
    documentName: "Kohler_Lifetime_Warranty_Card.pdf",
  },
  {
    id: "w3", item: "Quartz Countertop 15-Year Warranty", coverageType: "Manufacturer", expiresYear: 2041,
    contractor: "Johnson & Sons Construction", contractorPhone: "(512) 555-0119", contractorEmail: "marcus@johnsonandsons.com",
    project: "Kitchen Remodel", startDate: "2026-03-01",
    description: "Cambria 15-year limited warranty on Calacatta Laza quartz countertops against cracking, warping, or staining under normal residential use.",
    exclusions: "Does not cover chips or cracks from impact, heat damage from pots placed directly on surface, or harsh chemicals. Cutting on the surface voids the warranty.",
    claimProcess: "Document damage with photos. Contact Cambria at 1-866-226-2742 with warranty card number CAM-26-TX-9914.",
    documentName: "Cambria_15yr_Warranty_2026.pdf",
  },
  {
    id: "w4", item: "HVAC Equipment 10-Year Warranty", coverageType: "Manufacturer", expiresYear: 2036,
    contractor: "Pending — HVAC Installation", contractorPhone: "—", contractorEmail: "—",
    project: "HVAC System Replacement", startDate: "2026-03-28",
    description: "Carrier 10-year parts warranty on the Infinity Series 24-SEER2 heat pump system. Requires annual professional maintenance to maintain warranty validity.",
    exclusions: "Warranty void if system is not registered within 90 days of installation. Does not cover refrigerant recharge, filters, labor, or damage from improper installation.",
    claimProcess: "Contact your licensed Carrier dealer first. If unresolved, call Carrier Customer Support at 1-800-227-7437.",
    documentName: null,
  },
  {
    id: "w5", item: "Interior Paint Workmanship 2-Year", coverageType: "Workmanship", expiresYear: 2028,
    contractor: "Thompson Painting & Finishes", contractorPhone: "(817) 555-0088", contractorEmail: "lisa@thompsonpainting.com",
    project: "Interior Painting", startDate: "2026-01-20",
    description: "Thompson Painting 2-year workmanship warranty covering peeling, blistering, or premature failure of paint adhesion on all interior walls, ceilings, and trim.",
    exclusions: "Does not cover damage from water leaks, structural movement, or intentional damage. Normal wear and scuffs are not covered.",
    claimProcess: "Contact Lisa Thompson directly. Send photos of the issue — Thompson Painting will schedule an inspection within 5 business days.",
    documentName: "Thompson_Painting_Warranty_2026.pdf",
  },
];

function getWarrantyStatus(w: Warranty): WarrantyStatus {
  if (w.expiresYear === null) return "lifetime";
  if (w.expiresYear < TODAY_YEAR) return "expired";
  if (w.expiresYear - TODAY_YEAR <= 1) return "expiring";
  return "active";
}

const WARRANTY_STATUS_CONFIG: Record<
  WarrantyStatus,
  { label: string; icon: React.FC<{ className?: string }>; bar: string; text: string; badge: string; bg: string }
> = {
  active: { label: "Active", icon: CheckCircle2, bar: "bg-brand-600", text: "text-brand-600", badge: "bg-brand-50 text-brand-700 border-brand-200", bg: "bg-brand-50" },
  expiring: { label: "Expiring Soon", icon: AlertTriangle, bar: "bg-amber-500", text: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200", bg: "bg-amber-50" },
  expired: { label: "Expired", icon: XCircle, bar: "bg-red-500", text: "text-red-500", badge: "bg-red-50 text-red-700 border-red-200", bg: "bg-red-50" },
  lifetime: { label: "Lifetime", icon: Shield, bar: "bg-violet-600", text: "text-violet-600", badge: "bg-violet-50 text-violet-700 border-violet-200", bg: "bg-violet-50" },
};

const COVERAGE_BADGE: Record<CoverageType, string> = {
  Manufacturer: "bg-blue-50 text-blue-700 border-blue-200",
  Workmanship: "bg-gray-100 text-gray-600 border-gray-200",
  Lifetime: "bg-violet-50 text-violet-700 border-violet-200",
};

function WarrantyRow({ warranty }: { warranty: Warranty }) {
  const [expanded, setExpanded] = useState(false);
  const status = getWarrantyStatus(warranty);
  const cfg = WARRANTY_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  const yrs = warranty.expiresYear ? warranty.expiresYear - TODAY_YEAR : null;

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div className={cn("h-0.5", cfg.bar)} />
      <div
        className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg mt-0.5", cfg.bg)}>
          <Icon className={cn("h-4 w-4", cfg.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-snug">{warranty.item}</p>
              <p className="text-xs text-gray-500 mt-0.5">{warranty.project}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn("text-xs font-medium border rounded-full px-2.5 py-0.5", COVERAGE_BADGE[warranty.coverageType])}>
                {warranty.coverageType}
              </span>
              <span className={cn("text-xs font-medium border rounded-full px-2.5 py-0.5", cfg.badge)}>
                {cfg.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {warranty.expiresYear === null
                ? "Lifetime coverage"
                : yrs !== null && yrs > 0
                ? `Expires ${warranty.expiresYear} — ${yrs} yr${yrs !== 1 ? "s" : ""} remaining`
                : `Expired ${warranty.expiresYear}`}
            </span>
            <span>{warranty.contractor}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-400 mt-1">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Coverage</p>
            <p className="text-sm text-gray-700 leading-relaxed">{warranty.description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Exclusions</p>
            <p className="text-sm text-gray-600 leading-relaxed">{warranty.exclusions}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">How to File a Claim</p>
            <p className="text-sm text-gray-700 leading-relaxed">{warranty.claimProcess}</p>
          </div>
          <Separator />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contractor Contact</p>
              <p className="text-sm font-semibold text-gray-900">{warranty.contractor}</p>
              {warranty.contractorPhone !== "—" && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {warranty.contractorPhone}
                </div>
              )}
              {warranty.contractorEmail !== "—" && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {warranty.contractorEmail}
                </div>
              )}
            </div>
            {warranty.documentName && (
              <button className="flex items-center gap-2 text-sm text-brand-600 font-medium border border-brand-200 bg-brand-50 rounded-lg px-3 py-2 hover:bg-brand-100 transition-colors">
                <FileText className="h-4 w-4" />
                {warranty.documentName}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddWarrantyDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Warranty
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Warranty Record</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Item / Product Name</label>
            <Input placeholder="e.g. Owens Corning Timberline HDZ Shingles" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Coverage Type</label>
              <select className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600">
                <option>Manufacturer</option>
                <option>Workmanship</option>
                <option>Lifetime</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Project</label>
              <Input placeholder="e.g. Kitchen Remodel" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Start Date</label>
              <Input type="date" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">End Date</label>
              <Input type="date" placeholder="Leave blank for Lifetime" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contractor</label>
            <Input placeholder="Company or contractor name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Coverage Description</label>
            <Textarea placeholder="What does this warranty cover?" className="resize-none" rows={3} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Warranty Document</label>
            <div className="flex items-center gap-3 border border-dashed border-gray-300 rounded-lg px-4 py-4 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/30 transition-colors cursor-pointer">
              <Upload className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Upload warranty document</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG up to 10MB</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <Button className="flex-1">Save Warranty</Button>
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Inspections Tab ───────────────────────────────────────────────────────────

type InspectionStatus = "Passed" | "Failed" | "Scheduled" | "Rescheduled";

interface Inspection {
  id: string;
  date: string;
  type: string;
  project: string;
  status: InspectionStatus;
  inspector: string;
  notes: string;
  failItems?: string[];
}

const MOCK_INSPECTIONS: Inspection[] = [
  { id: "i1", date: "2026-02-20", type: "Foundation", project: "Kitchen Remodel", status: "Passed", inspector: "City of Austin — Building Dept.", notes: "Foundation slab and subfloor reinforcement approved. No deficiencies noted. Work may proceed to framing." },
  { id: "i2", date: "2026-02-28", type: "Framing", project: "Kitchen Remodel", status: "Passed", inspector: "City of Austin — Building Dept.", notes: "Framing inspection passed. Soffit removal and load transfer header approved. Joist spans confirmed per plan." },
  {
    id: "i3", date: "2026-03-08", type: "Rough Plumbing", project: "Kitchen Remodel", status: "Failed",
    inspector: "City of Austin — Building Dept.",
    notes: "Failed — pressure test dropped on island drain connection. Drain slope at dishwasher tie-in insufficient at 1/8\" per foot.",
    failItems: ["Island drain pressure test failed — re-solder and re-test required", "Dishwasher drain slope insufficient (1/8\"/ft, requires 1/4\"/ft minimum)"],
  },
  { id: "i4", date: "2026-03-15", type: "Rough Plumbing (Re-inspection)", project: "Kitchen Remodel", status: "Passed", inspector: "City of Austin — Building Dept.", notes: "Re-inspection passed. Both deficiencies corrected. Pressure test held at 80 PSI for 15 minutes." },
  { id: "i5", date: "2026-03-12", type: "Rough Electrical", project: "Kitchen Remodel", status: "Passed", inspector: "City of Austin — Building Dept.", notes: "All rough-in wiring approved. Dedicated 20A circuits confirmed. AFCI breakers verified." },
  { id: "i6", date: "2026-04-10", type: "Final", project: "Kitchen Remodel", status: "Scheduled", inspector: "City of Austin — Building Dept.", notes: "Final inspection scheduled for completion of all finish work." },
  { id: "i7", date: "2026-03-10", type: "Rough Plumbing", project: "Bathroom Renovation", status: "Rescheduled", inspector: "City of San Antonio — Development Services", notes: "Original date 3/5 rescheduled at inspector's request — department backlog." },
  { id: "i8", date: "2026-04-15", type: "Final", project: "Bathroom Renovation", status: "Scheduled", inspector: "City of San Antonio — Development Services", notes: "Final inspection pending completion of tile and fixture installation." },
];

const INSPECTION_STATUS_CONFIG: Record<
  InspectionStatus,
  { icon: React.FC<{ className?: string }>; bar: string; bg: string; text: string; badgeBg: string; label: string }
> = {
  Passed: { icon: CheckCircle2, bar: "bg-brand-600", bg: "bg-brand-50", text: "text-brand-600", badgeBg: "bg-brand-50 text-brand-700 border-brand-200", label: "Passed" },
  Failed: { icon: XCircle, bar: "bg-red-500", bg: "bg-red-50", text: "text-red-500", badgeBg: "bg-red-50 text-red-700 border-red-200", label: "Failed" },
  Scheduled: { icon: Clock, bar: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-500", badgeBg: "bg-blue-50 text-blue-700 border-blue-200", label: "Scheduled" },
  Rescheduled: { icon: RefreshCw, bar: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-600", badgeBg: "bg-amber-50 text-amber-700 border-amber-200", label: "Rescheduled" },
};

const INSPECTION_TYPES = ["Foundation", "Framing", "Rough Plumbing", "Rough Electrical", "Insulation", "Drywall", "Final", "Other"];

function InspectionCard({ inspection }: { inspection: Inspection }) {
  const cfg = INSPECTION_STATUS_CONFIG[inspection.status];
  const Icon = cfg.icon;

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full z-10", cfg.bg)}>
          <Icon className={cn("h-4 w-4", cfg.text)} />
        </div>
      </div>
      <div className="flex-1 mb-6">
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className={cn("h-0.5", cfg.bar)} />
          <div className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-gray-900">{inspection.type}</p>
                  <span className={cn("text-xs font-medium border rounded-full px-2.5 py-0.5", cfg.badgeBg)}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{inspection.project}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(inspection.date)}
              </div>
            </div>

            {inspection.status === "Failed" && inspection.failItems && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                <p className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Items Requiring Correction
                </p>
                <ul className="space-y-1">
                  {inspection.failItems.map((item, i) => (
                    <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                      <span className="mt-1 h-1 w-1 rounded-full bg-red-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-gray-600 mt-2.5 leading-relaxed">{inspection.notes}</p>
            <p className="text-xs text-gray-400 mt-2">{inspection.inspector}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleInspectionDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Schedule Inspection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Inspection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Project</label>
            <select className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600">
              <option>Kitchen Remodel</option>
              <option>Bathroom Renovation</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Inspection Type</label>
            <select className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600">
              {INSPECTION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Preferred Date</label>
            <Input type="date" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Notes</label>
            <Textarea placeholder="Any relevant notes for the inspection..." className="resize-none" rows={3} />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <Button className="flex-1">Schedule</Button>
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const activeProjects = mockProjects.filter((p) => p.status === "in_progress");

  const inspections = MOCK_INSPECTIONS;
  const passed = inspections.filter((i) => i.status === "Passed").length;
  const failed = inspections.filter((i) => i.status === "Failed").length;
  const scheduled = inspections.filter((i) => i.status === "Scheduled").length;
  const rescheduled = inspections.filter((i) => i.status === "Rescheduled").length;
  const total = inspections.length;
  const inspProjects = Array.from(new Set(inspections.map((i) => i.project)));
  const grouped = inspProjects.map((p) => ({
    project: p,
    items: inspections.filter((i) => i.project === p),
  }));

  return (
    <div className="p-8">
      <AppHeader
        title="Projects"
        subtitle="Track your active builds, warranties, and inspections."
      />

      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active ({activeProjects.length})</TabsTrigger>
          <TabsTrigger value="warranties">Warranties</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
        </TabsList>

        {/* Active Projects */}
        <TabsContent value="active" className="space-y-4">
          {activeProjects.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No active projects.</div>
          ) : (
            activeProjects.map((project) => <ProjectCard key={project.id} project={project} />)
          )}
        </TabsContent>

        {/* Warranties */}
        <TabsContent value="warranties">
          <div className="flex justify-end mb-4">
            <AddWarrantyDialog />
          </div>
          <div className="space-y-3">
            {MOCK_WARRANTIES.map((w) => <WarrantyRow key={w.id} warranty={w} />)}
          </div>
        </TabsContent>

        {/* Inspections */}
        <TabsContent value="inspections">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-brand-600" />
              <p className="text-sm font-semibold text-gray-900">
                {passed} of {total} inspection{total !== 1 ? "s" : ""} passed
                {scheduled > 0 && <span className="font-normal text-gray-600"> — {scheduled} scheduled</span>}
                {failed > 0 && <span className="font-normal text-red-600"> — {failed} failed</span>}
              </p>
            </div>
            <ScheduleInspectionDialog />
          </div>

          <div className="space-y-8">
            {grouped.map(({ project, items }) => (
              <div key={project}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-bold text-gray-900">{project}</h2>
                  <Separator className="flex-1" />
                  <span className="text-xs text-gray-400">
                    {items.filter((i) => i.status === "Passed").length}/{items.length} passed
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-[17px] top-4 bottom-10 w-px bg-gray-200 z-0" />
                  <div className="space-y-0">
                    {items.map((inspection) => <InspectionCard key={inspection.id} inspection={inspection} />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
