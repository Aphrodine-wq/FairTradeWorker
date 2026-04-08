"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Calculator,
  Trash2,
  FileText,
  Download,
  ChevronDown,
  X,
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
import { usePageTitle } from "@shared/hooks/use-page-title";
import {
  useContractorEstimates,
  useGenerateEstimate,
  type SavedEstimate,
  type GenerateEstimateParams,
} from "@shared/hooks/use-estimate";

// ─── Constants ───────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Roof Replacement",
  "Deck Build",
  "Room Addition",
  "Flooring",
  "Painting",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Siding",
  "Windows & Doors",
  "Concrete/Foundation",
  "Landscaping",
  "General Renovation",
];

const QUALITY_LEVELS = ["economy", "standard", "premium", "luxury"];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EstimatesPage() {
  usePageTitle("Estimates");

  const { estimates, loading, error, refresh, remove } =
    useContractorEstimates();
  const { generate, loading: generating, error: genError } =
    useGenerateEstimate();

  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<SavedEstimate | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // New estimate form state
  const [form, setForm] = useState<GenerateEstimateParams>({
    projectType: "",
    description: "",
    location: "",
  });

  const filtered = estimates.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.projectType.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
  );

  async function handleGenerate() {
    if (!form.projectType || !form.description || !form.location) {
      toast.error("Fill in project type, description, and location.");
      return;
    }
    const result = await generate(form);
    if (result) {
      toast.success("Estimate generated.");
      setShowNew(false);
      setForm({ projectType: "", description: "", location: "" });
      refresh();
    } else if (genError) {
      toast.error(genError);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await remove(id);
    setDeleting(null);
    toast.success("Estimate deleted.");
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#0F1419]">Estimates</h1>
        <Button
          onClick={() => setShowNew(true)}
          className="bg-[#059669] hover:bg-[#047857] text-white rounded-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Estimate
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search estimates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-3">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-sm animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Calculator className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No estimates yet</p>
          <p className="text-sm mt-1">
            Generate AI-powered estimates for your projects.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((est) => (
            <div
              key={est.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-sm p-4 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => setSelected(est)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-emerald-50 rounded-sm flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-[#059669]" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[#0F1419] truncate">
                    {est.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {est.projectType} &middot; {est.location}
                    {est.sqft ? ` \u00B7 ${est.sqft.toLocaleString()} sqft` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                {est.aiEstimate && (
                  <div className="text-right">
                    <p className="font-semibold text-[#0F1419]">
                      {formatCurrency(est.aiEstimate.estimateMid)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(est.aiEstimate.estimateMin)} &ndash;{" "}
                      {formatCurrency(est.aiEstimate.estimateMax)}
                    </p>
                  </div>
                )}
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  {est.quality || "standard"}
                </Badge>
                <span className="text-xs text-gray-400">
                  {formatDate(est.createdAt)}
                </span>
                {est.pdfUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(est.pdfUrl!, "_blank");
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={deleting === est.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(est.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── New Estimate Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New AI Estimate</DialogTitle>
            <DialogDescription>
              Describe the project and we&apos;ll generate a detailed estimate
              powered by ConstructionAI.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-[#0F1419] block mb-1">
                Project Type
              </label>
              <div className="relative">
                <select
                  value={form.projectType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, projectType: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm bg-white appearance-none pr-8"
                >
                  <option value="">Select a type...</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#0F1419] block mb-1">
                Description
              </label>
              <Textarea
                placeholder="Describe the scope of work..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="rounded-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#0F1419] block mb-1">
                  Location
                </label>
                <Input
                  placeholder="City, State"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0F1419] block mb-1">
                  Square Footage
                </label>
                <Input
                  type="number"
                  placeholder="Optional"
                  value={form.sqft ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sqft: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="rounded-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#0F1419] block mb-1">
                  Quality Level
                </label>
                <div className="relative">
                  <select
                    value={form.quality ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        quality: e.target.value || undefined,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm bg-white appearance-none pr-8 capitalize"
                  >
                    <option value="">Standard</option>
                    {QUALITY_LEVELS.map((q) => (
                      <option key={q} value={q} className="capitalize">
                        {q}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#0F1419] block mb-1">
                  Client Name
                </label>
                <Input
                  placeholder="Optional"
                  value={form.clientName ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      clientName: e.target.value || undefined,
                    }))
                  }
                  className="rounded-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowNew(false)}
                className="rounded-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-[#059669] hover:bg-[#047857] text-white rounded-sm"
              >
                {generating ? (
                  <>
                    <Calculator className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Generate Estimate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Detail Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.projectType} &middot; {selected.location}
                  {selected.sqft
                    ? ` \u00B7 ${selected.sqft.toLocaleString()} sqft`
                    : ""}
                </DialogDescription>
              </DialogHeader>

              {selected.aiEstimate && (
                <div className="space-y-4 mt-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 rounded-sm p-3">
                      <p className="text-xs text-gray-500">Low</p>
                      <p className="text-lg font-semibold text-[#0F1419]">
                        {formatCurrency(selected.aiEstimate.estimateMin)}
                      </p>
                    </div>
                    <div className="bg-emerald-100 rounded-sm p-3">
                      <p className="text-xs text-gray-500">Estimate</p>
                      <p className="text-lg font-semibold text-[#059669]">
                        {formatCurrency(selected.aiEstimate.estimateMid)}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-sm p-3">
                      <p className="text-xs text-gray-500">High</p>
                      <p className="text-lg font-semibold text-[#0F1419]">
                        {formatCurrency(selected.aiEstimate.estimateMax)}
                      </p>
                    </div>
                  </div>

                  {/* Confidence + Model */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      Confidence:{" "}
                      <strong className="text-[#0F1419]">
                        {Math.round(selected.aiEstimate.confidence * 100)}%
                      </strong>
                    </span>
                    <span>
                      Model:{" "}
                      <strong className="text-[#0F1419]">
                        {selected.aiEstimate.modelVersion}
                      </strong>
                    </span>
                    {selected.aiEstimate.timelineWeeks && (
                      <span>
                        Timeline:{" "}
                        <strong className="text-[#0F1419]">
                          {selected.aiEstimate.timelineWeeks} weeks
                        </strong>
                      </span>
                    )}
                  </div>

                  {/* Cost Breakdown */}
                  {(selected.aiEstimate.laborCost ||
                    selected.aiEstimate.materialCost ||
                    selected.aiEstimate.equipmentCost) && (
                    <div>
                      <h3 className="text-sm font-medium text-[#0F1419] mb-2">
                        Cost Breakdown
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {selected.aiEstimate.laborCost != null && (
                          <div className="border border-gray-200 rounded-sm p-3">
                            <p className="text-xs text-gray-500">Labor</p>
                            <p className="font-semibold">
                              {formatCurrency(selected.aiEstimate.laborCost)}
                            </p>
                            {selected.aiEstimate.laborHours != null && (
                              <p className="text-xs text-gray-400">
                                {selected.aiEstimate.laborHours} hrs
                              </p>
                            )}
                          </div>
                        )}
                        {selected.aiEstimate.materialCost != null && (
                          <div className="border border-gray-200 rounded-sm p-3">
                            <p className="text-xs text-gray-500">Materials</p>
                            <p className="font-semibold">
                              {formatCurrency(selected.aiEstimate.materialCost)}
                            </p>
                          </div>
                        )}
                        {selected.aiEstimate.equipmentCost != null && (
                          <div className="border border-gray-200 rounded-sm p-3">
                            <p className="text-xs text-gray-500">Equipment</p>
                            <p className="font-semibold">
                              {formatCurrency(
                                selected.aiEstimate.equipmentCost
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Line Items */}
                  {selected.aiEstimate.lineItems &&
                    selected.aiEstimate.lineItems.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-[#0F1419] mb-2">
                          Line Items
                        </h3>
                        <div className="border border-gray-200 rounded-sm overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left px-3 py-2 font-medium text-gray-500">
                                  Item
                                </th>
                                <th className="text-right px-3 py-2 font-medium text-gray-500">
                                  Qty
                                </th>
                                <th className="text-right px-3 py-2 font-medium text-gray-500">
                                  Unit Cost
                                </th>
                                <th className="text-right px-3 py-2 font-medium text-gray-500">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {selected.aiEstimate.lineItems.map((item, i) => (
                                <tr key={i}>
                                  <td className="px-3 py-2">
                                    {item.description}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-500">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-500">
                                    {formatCurrency(item.unit_cost)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-medium">
                                    {formatCurrency(item.total)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Exclusions */}
                  {selected.aiEstimate.exclusions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-[#0F1419] mb-2">
                        Exclusions
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selected.aiEstimate.exclusions.map((exc, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <X className="w-3 h-3 mt-1 text-red-400 flex-shrink-0" />
                            {exc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
                  {selected.aiEstimate.notes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-[#0F1419] mb-2">
                        Notes
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selected.aiEstimate.notes.map((note, i) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-4">
                {selected.pdfUrl && (
                  <Button
                    variant="outline"
                    className="rounded-sm"
                    onClick={() => window.open(selected.pdfUrl!, "_blank")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-sm text-red-600 hover:bg-red-50 border-red-200"
                  onClick={() => {
                    handleDelete(selected.id);
                    setSelected(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
