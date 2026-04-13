"use client";

import { useState, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Button } from "@shared/ui/button";
import { cn, formatCurrency } from "@shared/lib/utils";

const PROJECT_CATEGORIES = [
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Roofing",
  "Flooring",
  "Painting",
  "HVAC",
  "Plumbing",
  "Electrical",
  "General Renovation",
  "Deck/Patio",
  "Fencing",
  "Siding",
  "Windows/Doors",
  "Foundation",
  "Landscaping",
] as const;

type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

interface MilestoneTemplate {
  label: string;
  pct: number;
  enabled: boolean;
  customLabel: string;
  customAmount: number;
}

const CATEGORY_MILESTONE_TEMPLATES: Record<string, { label: string; pct: number }[]> = {
  "Kitchen Remodel": [
    { label: "Demo complete", pct: 12 },
    { label: "Rough-in (plumbing/electrical)", pct: 22 },
    { label: "Cabinet install", pct: 20 },
    { label: "Countertops", pct: 18 },
    { label: "Tile & flooring", pct: 18 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "Bathroom Remodel": [
    { label: "Demo complete", pct: 15 },
    { label: "Plumbing rough-in", pct: 22 },
    { label: "Tile & waterproofing", pct: 25 },
    { label: "Vanity & fixtures", pct: 23 },
    { label: "Final walkthrough", pct: 15 },
  ],
  "Roofing": [
    { label: "Tear-off complete", pct: 20 },
    { label: "Decking & underlayment", pct: 25 },
    { label: "Shingles installed", pct: 30 },
    { label: "Flashings & ridge vent", pct: 15 },
    { label: "Final inspection", pct: 10 },
  ],
  "Flooring": [
    { label: "Furniture removal & protection", pct: 10 },
    { label: "Subfloor prep", pct: 20 },
    { label: "Flooring install", pct: 40 },
    { label: "Trim & transitions", pct: 20 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "Painting": [
    { label: "Prep & protection", pct: 20 },
    { label: "Prime", pct: 15 },
    { label: "Paint (2 coats)", pct: 35 },
    { label: "Trim & detail work", pct: 20 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "HVAC": [
    { label: "Disconnect old system", pct: 15 },
    { label: "Ductwork modifications", pct: 25 },
    { label: "Equipment install", pct: 30 },
    { label: "Startup & testing", pct: 20 },
    { label: "Final inspection", pct: 10 },
  ],
  "Plumbing": [
    { label: "Demo & access", pct: 15 },
    { label: "Rough-in", pct: 30 },
    { label: "Fixture install", pct: 25 },
    { label: "Testing & pressure check", pct: 15 },
    { label: "Final inspection", pct: 15 },
  ],
  "Electrical": [
    { label: "Panel assessment", pct: 10 },
    { label: "Rough-in & wiring", pct: 35 },
    { label: "Fixtures & devices", pct: 25 },
    { label: "Testing & labeling", pct: 15 },
    { label: "Final inspection", pct: 15 },
  ],
  "General Renovation": [
    { label: "Demo complete", pct: 15 },
    { label: "Framing & structural", pct: 20 },
    { label: "MEP rough-in", pct: 25 },
    { label: "Finishes", pct: 25 },
    { label: "Final walkthrough", pct: 15 },
  ],
  "Deck/Patio": [
    { label: "Footings & posts", pct: 20 },
    { label: "Framing", pct: 25 },
    { label: "Decking boards", pct: 25 },
    { label: "Railing & stairs", pct: 20 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "Fencing": [
    { label: "Layout & post holes", pct: 20 },
    { label: "Posts set", pct: 25 },
    { label: "Rails installed", pct: 20 },
    { label: "Pickets/panels", pct: 25 },
    { label: "Gates & final", pct: 10 },
  ],
  "Siding": [
    { label: "Tear-off old siding", pct: 15 },
    { label: "Sheathing & house wrap", pct: 20 },
    { label: "Siding install", pct: 35 },
    { label: "Trim & caulk", pct: 20 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "Windows/Doors": [
    { label: "Removal & prep", pct: 15 },
    { label: "Framing & flashing", pct: 25 },
    { label: "Install", pct: 30 },
    { label: "Trim & caulk", pct: 20 },
    { label: "Final walkthrough", pct: 10 },
  ],
  "Foundation": [
    { label: "Excavation", pct: 20 },
    { label: "Forms & rebar", pct: 20 },
    { label: "Pour", pct: 25 },
    { label: "Cure & strip forms", pct: 20 },
    { label: "Backfill & grade", pct: 15 },
  ],
  "Landscaping": [
    { label: "Clearing & grading", pct: 20 },
    { label: "Hardscape", pct: 25 },
    { label: "Irrigation", pct: 20 },
    { label: "Planting", pct: 25 },
    { label: "Mulch & final cleanup", pct: 10 },
  ],
};

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (project: any) => void;
}

export function CreateProjectDialog({ open, onOpenChange, onCreated }: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "">("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [milestones, setMilestones] = useState<MilestoneTemplate[]>([]);

  const budgetNum = parseFloat(budget) || 0;

  // When category changes, populate milestones
  useEffect(() => {
    if (!category) {
      setMilestones([]);
      return;
    }
    const templates = CATEGORY_MILESTONE_TEMPLATES[category] || [];
    setMilestones(
      templates.map((t) => ({
        label: t.label,
        pct: t.pct,
        enabled: true,
        customLabel: t.label,
        customAmount: Math.round((budgetNum * t.pct) / 100),
      }))
    );
  }, [category]);

  // Recalculate amounts when budget changes
  useEffect(() => {
    if (milestones.length === 0) return;
    setMilestones((prev) =>
      prev.map((m) => ({
        ...m,
        customAmount: Math.round((budgetNum * m.pct) / 100),
      }))
    );
  }, [budgetNum]);

  function toggleMilestone(index: number) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, enabled: !m.enabled } : m))
    );
  }

  function updateMilestoneLabel(index: number, label: string) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, customLabel: label } : m))
    );
  }

  function updateMilestoneAmount(index: number, amount: string) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, customAmount: parseInt(amount) || 0 } : m))
    );
  }

  function handleSubmit() {
    if (!name.trim()) return;

    const enabledMilestones = milestones
      .filter((m) => m.enabled)
      .map((m) => ({
        label: m.customLabel,
        done: false,
        amount: m.customAmount,
        status: "pending" as const,
      }));

    const newProject = {
      id: `j-${Date.now()}`,
      name: name.trim(),
      client: clientName.trim() || "—",
      description: description.trim(),
      contractValue: budgetNum,
      startDate: startDate || new Date().toISOString().split("T")[0],
      estimatedEnd: endDate || "",
      progress: 0,
      milestones: enabledMilestones,
      changeOrders: 0,
      hoursThisWeek: 0,
      punchListComplete: 0,
      punchListTotal: 0,
    };

    onCreated(newProject);
    onOpenChange(false);

    // Reset form
    setName("");
    setClientName("");
    setCategory("");
    setDescription("");
    setBudget("");
    setStartDate("");
    setEndDate("");
    setMilestones([]);
  }

  const enabledTotal = milestones.filter((m) => m.enabled).reduce((s, m) => s + m.customAmount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Project name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">
              Project Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kitchen Remodel - Smith"
              autoFocus
            />
          </div>

          {/* Client name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Client Name</label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Michael Brown"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProjectCategory)}
              className="w-full h-9 rounded-sm border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">Select category...</option>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope of work, key details..."
              rows={3}
            />
          </div>

          {/* Budget + Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">Budget ($)</label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Milestone templates */}
          {category && milestones.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Milestones</label>
                {budgetNum > 0 && (
                  <span className={cn(
                    "text-[12px] tabular-nums font-medium",
                    enabledTotal === budgetNum ? "text-brand-600" : enabledTotal > budgetNum ? "text-red-600" : "text-gray-600"
                  )}>
                    {formatCurrency(enabledTotal)} of {formatCurrency(budgetNum)}
                  </span>
                )}
              </div>

              <div className="rounded-sm border border-border overflow-hidden">
                {milestones.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0",
                      !m.enabled && "bg-gray-50 opacity-60"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleMilestone(i)}
                      className={cn(
                        "w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                        m.enabled
                          ? "bg-brand-600 border-brand-600"
                          : "bg-white border-gray-300 hover:border-gray-400"
                      )}
                    >
                      {m.enabled && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </button>

                    <input
                      type="text"
                      value={m.customLabel}
                      onChange={(e) => updateMilestoneLabel(i, e.target.value)}
                      disabled={!m.enabled}
                      className="flex-1 min-w-0 text-[13px] text-gray-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 disabled:text-gray-600"
                    />

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] text-gray-600">{m.pct}%</span>
                      <input
                        type="number"
                        value={m.customAmount || ""}
                        onChange={(e) => updateMilestoneAmount(i, e.target.value)}
                        disabled={!m.enabled}
                        className="w-[80px] h-7 text-[13px] text-right tabular-nums text-gray-900 bg-white border border-border rounded-sm px-2 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full"
            disabled={!name.trim()}
            onClick={handleSubmit}
          >
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
