"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Camera,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  DollarSign,
  Check,
  Send,
  HardHat,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Textarea } from "@shared/ui/textarea";
import { cn, formatCurrency } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Types ──────────────────────────────────────────────────────────────────

type MilestoneStatus = "paid" | "approved" | "submitted" | "in_progress" | "pending";

interface ProjectMilestone {
  id: string;
  label: string;
  amount: number;
  status: MilestoneStatus;
  completedDate?: string;
  photos: string[];
  contractorNote?: string;
}

interface Project {
  id: string;
  name: string;
  contractor: string;
  contractValue: number;
  milestones: ProjectMilestone[];
}

// ─── Status Config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; color: string; bg: string }> = {
  paid:        { label: "Paid",        color: "text-emerald-950",  bg: "bg-emerald-950/10 border-emerald-800/20" },
  approved:    { label: "Approved",    color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  submitted:   { label: "Review",      color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  in_progress: { label: "In Progress", color: "text-brand-700",  bg: "bg-brand-50 border-brand-200" },
  pending:     { label: "Pending",     color: "text-gray-700",   bg: "bg-gray-50 border-gray-200" },
};

const VERIFICATION_ITEMS = [
  "Work matches the agreed scope",
  "Site is clean and materials removed",
  "Quality meets expectations",
  "No damage to surrounding areas",
];

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Kitchen Remodel - Full Gut",
    contractor: "J&R Construction LLC",
    contractValue: 38500,
    milestones: [
      {
        id: "m1",
        label: "Demo complete",
        amount: 5000,
        status: "paid",
        completedDate: "2026-03-14",
        photos: ["/photos/demo-1.jpg", "/photos/demo-2.jpg"],
        contractorNote: "All demolition completed. Removed old cabinets, countertops, flooring, and drywall. Hauled 3 loads to dump.",
      },
      {
        id: "m2",
        label: "Rough-in (plumbing & electrical)",
        amount: 8500,
        status: "approved",
        completedDate: "2026-03-19",
        photos: ["/photos/rough-1.jpg", "/photos/rough-2.jpg", "/photos/rough-3.jpg"],
        contractorNote: "All rough plumbing and electrical done. Passed city inspection on 3/18. Inspector signed off on permits.",
      },
      {
        id: "m3",
        label: "Cabinet installation",
        amount: 7000,
        status: "submitted",
        completedDate: "2026-03-24",
        photos: ["/photos/cabinets-1.jpg", "/photos/cabinets-2.jpg"],
        contractorNote: "All upper and lower cabinets installed and leveled. Hardware mounted. Soft-close hinges on all doors. Ready for countertop template.",
      },
      {
        id: "m4",
        label: "Countertops & backsplash",
        amount: 6500,
        status: "in_progress",
        photos: [],
      },
      {
        id: "m5",
        label: "Final walkthrough & punch list",
        amount: 11500,
        status: "pending",
        photos: [],
      },
    ],
  },
  {
    id: "p2",
    name: "Master Bathroom Renovation",
    contractor: "Summit Builders",
    contractValue: 22000,
    milestones: [
      {
        id: "m6",
        label: "Demo & prep",
        amount: 3500,
        status: "paid",
        completedDate: "2026-03-12",
        photos: ["/photos/bath-demo-1.jpg"],
        contractorNote: "Bathroom fully gutted. Subfloor inspected and in good condition. No water damage found.",
      },
      {
        id: "m7",
        label: "Plumbing rough-in",
        amount: 4500,
        status: "paid",
        completedDate: "2026-03-17",
        photos: ["/photos/bath-plumb-1.jpg", "/photos/bath-plumb-2.jpg"],
        contractorNote: "New supply lines and drain relocated for freestanding tub. Shower valve set at 48 inches. Passed inspection.",
      },
      {
        id: "m8",
        label: "Tile & waterproofing",
        amount: 6000,
        status: "submitted",
        completedDate: "2026-03-24",
        photos: ["/photos/bath-tile-1.jpg", "/photos/bath-tile-2.jpg", "/photos/bath-tile-3.jpg"],
        contractorNote: "Kerdi waterproofing membrane on all shower walls and floor. Porcelain tile installed with 1/16\" grout lines. Niche built at 48\" height.",
      },
      {
        id: "m9",
        label: "Fixtures & vanity",
        amount: 5000,
        status: "in_progress",
        photos: [],
      },
      {
        id: "m10",
        label: "Final details & cleanup",
        amount: 3000,
        status: "pending",
        photos: [],
      },
    ],
  },
];

// ─── Page Component ─────────────────────────────────────────────────────────

export default function HomeownerMilestonesPage() {
  usePageTitle("Milestones");
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function updateMilestoneStatus(projectId: string, milestoneId: string, status: MilestoneStatus) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              milestones: p.milestones.map((m) =>
                m.id === milestoneId ? { ...m, status } : m
              ),
            }
          : p
      )
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
        <p className="text-[14px] text-gray-700 mt-1">Review and approve contractor work</p>
      </div>

      {/* Project Sections */}
      <div className="space-y-8">
        {projects.map((project) => (
          <ProjectSection
            key={project.id}
            project={project}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
            onApprove={(milestoneId) => updateMilestoneStatus(project.id, milestoneId, "approved")}
            onRequestChanges={(milestoneId) => updateMilestoneStatus(project.id, milestoneId, "in_progress")}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Project Section ────────────────────────────────────────────────────────

function ProjectSection({
  project,
  expandedId,
  onToggle,
  onApprove,
  onRequestChanges,
}: {
  project: Project;
  expandedId: string | null;
  onToggle: (id: string) => void;
  onApprove: (milestoneId: string) => void;
  onRequestChanges: (milestoneId: string) => void;
}) {
  const milestones = project.milestones;
  const totalAmount = milestones.reduce((s, m) => s + m.amount, 0);
  const paidAmount = milestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0);
  const approvedAmount = milestones.filter((m) => m.status === "approved").reduce((s, m) => s + m.amount, 0);
  const releasedAmount = paidAmount + approvedAmount;
  const pct = totalAmount > 0 ? Math.round((releasedAmount / totalAmount) * 100) : 0;
  const submittedCount = milestones.filter((m) => m.status === "submitted").length;

  return (
    <div className="rounded-sm border border-border bg-white">
      {/* Project Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-gray-900">{project.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[13px] text-gray-700">{project.contractor}</span>
              <span className="text-gray-300">|</span>
              <span className="text-[13px] font-medium text-gray-900 tabular-nums">{formatCurrency(project.contractValue)}</span>
            </div>
          </div>
          {submittedCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-sm px-3 py-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[12px] font-medium text-amber-700">
                {submittedCount} awaiting review
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-gray-800">Escrow progress</span>
            <span className="text-[13px] font-bold text-gray-900 tabular-nums">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-sm overflow-hidden flex">
            {paidAmount > 0 && (
              <div
                className="bg-emerald-700 transition-all duration-500"
                style={{ width: `${(paidAmount / totalAmount) * 100}%` }}
              />
            )}
            {approvedAmount > 0 && (
              <div
                className="bg-blue-400 transition-all duration-500"
                style={{ width: `${(approvedAmount / totalAmount) * 100}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-emerald-700" />
              <span className="text-[11px] text-gray-600">Paid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-blue-400" />
              <span className="text-[11px] text-gray-600">Approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-gray-200" />
              <span className="text-[11px] text-gray-600">Remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone List */}
      <div className="divide-y divide-border">
        {milestones.map((m) => (
          <MilestoneRow
            key={m.id}
            milestone={m}
            isExpanded={expandedId === m.id}
            onToggle={() => onToggle(m.id)}
            onApprove={() => onApprove(m.id)}
            onRequestChanges={() => onRequestChanges(m.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Milestone Row ──────────────────────────────────────────────────────────

function MilestoneRow({
  milestone,
  isExpanded,
  onToggle,
  onApprove,
  onRequestChanges,
}: {
  milestone: ProjectMilestone;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
}) {
  const cfg = STATUS_CONFIG[milestone.status];
  const isSubmitted = milestone.status === "submitted";
  const isCompleted = milestone.status === "paid" || milestone.status === "approved";
  const isWaiting = milestone.status === "pending" || milestone.status === "in_progress";

  return (
    <div
      className={cn(
        "transition-colors",
        isSubmitted && "bg-amber-50/30"
      )}
    >
      {/* Row header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        {/* Status icon */}
        <div
          className={cn(
            "w-7 h-7 rounded-sm flex items-center justify-center shrink-0",
            milestone.status === "paid" ? "bg-emerald-950/10" :
            milestone.status === "approved" ? "bg-blue-50" :
            milestone.status === "submitted" ? "bg-amber-50" :
            milestone.status === "in_progress" ? "bg-brand-50" :
            "bg-gray-50"
          )}
        >
          {milestone.status === "paid" && <DollarSign className="w-4 h-4 text-emerald-950" strokeWidth={2.5} />}
          {milestone.status === "approved" && <Check className="w-4 h-4 text-blue-600" strokeWidth={2.5} />}
          {milestone.status === "submitted" && <AlertCircle className="w-4 h-4 text-amber-600" />}
          {milestone.status === "in_progress" && <Clock className="w-4 h-4 text-brand-600" />}
          {milestone.status === "pending" && <Circle className="w-3.5 h-3.5 text-gray-600" />}
        </div>

        {/* Label + badge + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-gray-900 truncate">{milestone.label}</span>
            <span
              className={cn(
                "inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-medium",
                cfg.bg,
                cfg.color
              )}
            >
              {cfg.label}
            </span>
          </div>
          {milestone.completedDate && (
            <span className="text-[12px] text-gray-600 mt-0.5 block">
              Completed {milestone.completedDate}
            </span>
          )}
        </div>

        {/* Amount */}
        <span className="text-[14px] font-semibold text-gray-900 tabular-nums shrink-0">
          {formatCurrency(milestone.amount)}
        </span>

        {/* Expand icon */}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />
        )}
      </button>

      {/* Expanded Detail */}
      {isExpanded && (
        <MilestoneDetail
          milestone={milestone}
          isSubmitted={isSubmitted}
          isCompleted={isCompleted}
          isWaiting={isWaiting}
          onApprove={onApprove}
          onRequestChanges={onRequestChanges}
        />
      )}
    </div>
  );
}

// ─── Milestone Detail (Expanded) ────────────────────────────────────────────

function MilestoneDetail({
  milestone,
  isSubmitted,
  isCompleted,
  isWaiting,
  onApprove,
  onRequestChanges,
}: {
  milestone: ProjectMilestone;
  isSubmitted: boolean;
  isCompleted: boolean;
  isWaiting: boolean;
  onApprove: () => void;
  onRequestChanges: () => void;
}) {
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false]);
  const [showChangesInput, setShowChangesInput] = useState(false);
  const [changesNote, setChangesNote] = useState("");
  const allChecked = checks.every(Boolean);

  function toggleCheck(index: number) {
    setChecks((prev) => prev.map((c, i) => (i === index ? !c : c)));
  }

  function handleRequestChanges() {
    if (changesNote.trim()) {
      setShowChangesInput(false);
      setChangesNote("");
      onRequestChanges();
    }
  }

  return (
    <div className="px-6 pb-5 pt-1">
      {/* Photos grid */}
      <div className="mb-4">
        <p className="text-[12px] font-medium text-gray-700 uppercase tracking-wider mb-2">Photos</p>
        {milestone.photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {milestone.photos.map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-sm bg-gray-100 border border-border flex items-center justify-center"
              >
                <Camera className="w-6 h-6 text-gray-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[13px] text-gray-600 py-3">
            <Camera className="w-4 h-4" />
            <span>No photos uploaded yet</span>
          </div>
        )}
      </div>

      {/* Contractor note */}
      {milestone.contractorNote && (
        <div className="mb-4">
          <p className="text-[12px] font-medium text-gray-700 uppercase tracking-wider mb-2">
            Contractor Notes
          </p>
          <div className="bg-gray-50 rounded-sm border border-border px-4 py-3">
            <p className="text-[13px] text-gray-900 leading-relaxed">{milestone.contractorNote}</p>
          </div>
        </div>
      )}

      {/* Waiting state */}
      {isWaiting && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-sm border border-border px-4 py-3">
          <HardHat className="w-4 h-4 text-gray-600" />
          <span className="text-[13px] text-gray-700">Waiting for contractor to submit</span>
        </div>
      )}

      {/* Verification checklist */}
      {(isSubmitted || isCompleted) && (
        <div className="mb-4">
          <p className="text-[12px] font-medium text-gray-700 uppercase tracking-wider mb-2">
            Verification Checklist
          </p>
          <div className="rounded-sm border border-border bg-white divide-y divide-border">
            {VERIFICATION_ITEMS.map((item, i) => {
              const checked = isCompleted ? true : checks[i];
              const disabled = isCompleted;
              return (
                <label
                  key={i}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    !disabled && "cursor-pointer hover:bg-gray-50"
                  )}
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && toggleCheck(i)}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      checked
                        ? "bg-emerald-600 border-emerald-600"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </button>
                  <span
                    className={cn(
                      "text-[14px]",
                      checked ? "text-gray-900" : "text-gray-700"
                    )}
                  >
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons (submitted only) */}
      {isSubmitted && (
        <div className="space-y-3">
          {showChangesInput ? (
            <div className="space-y-3">
              <Textarea
                placeholder="Describe what needs to be fixed or changed..."
                value={changesNote}
                onChange={(e) => setChangesNote(e.target.value)}
                className="min-h-[80px] text-[14px]"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRequestChanges}
                  disabled={!changesNote.trim()}
                  variant="outline"
                  className="text-[13px]"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Send to Contractor
                </Button>
                <Button
                  onClick={() => {
                    setShowChangesInput(false);
                    setChangesNote("");
                  }}
                  variant="ghost"
                  className="text-[13px] text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                onClick={onApprove}
                disabled={!allChecked}
                className={cn(
                  "text-[13px] font-semibold",
                  allChecked
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gray-100 text-gray-600 cursor-not-allowed"
                )}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Approve & Release Payment
              </Button>
              <Button
                onClick={() => setShowChangesInput(true)}
                variant="outline"
                className="text-[13px] text-gray-800"
              >
                Request Changes
              </Button>
            </div>
          )}
          {!allChecked && !showChangesInput && (
            <p className="text-[12px] text-gray-600">
              Complete all verification checks above to approve this milestone
            </p>
          )}
        </div>
      )}
    </div>
  );
}
