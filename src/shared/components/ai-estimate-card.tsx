"use client";

import { useState } from "react";
import {
  DollarSign,
  Sparkles,
  TrendingUp,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  Bookmark,
  Clock,
  AlertTriangle,
  FileText,
  Hammer,
  Package,
  Truck,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Separator } from "@shared/ui/separator";
import { cn, formatCurrency } from "@shared/lib/utils";
import type { AiEstimate } from "@shared/hooks/use-estimate";

interface AiEstimateCardProps {
  estimate: AiEstimate | null;
  suggestedBid?: number;
  variant?: "homeowner" | "contractor";
  loading?: boolean;
  onSave?: () => void;
  onRegenerate?: () => void;
  onDownloadPdf?: () => void;
  compact?: boolean;
}

export function AiEstimateCard({
  estimate,
  suggestedBid,
  variant = "homeowner",
  loading,
  onSave,
  onRegenerate,
  onDownloadPdf,
  compact = false,
}: AiEstimateCardProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [lineItemsOpen, setLineItemsOpen] = useState(false);
  const [exclusionsOpen, setExclusionsOpen] = useState(false);

  if (loading) {
    return (
      <Card className="border-brand-200 bg-brand-50/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
          <div>
            <span className="text-sm text-gray-900 font-medium">
              Generating AI estimate...
            </span>
            <p className="text-xs text-gray-700 mt-0.5">
              Analyzing project scope, materials, and regional pricing
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!estimate) return null;

  const confidenceLabel =
    estimate.confidence > 0.7
      ? "High"
      : estimate.confidence > 0.4
        ? "Medium"
        : "Low";
  const confidenceBadgeVariant =
    estimate.confidence > 0.7
      ? "success"
      : estimate.confidence > 0.4
        ? "warning"
        : "danger";

  const hasBreakdown =
    estimate.breakdown && Array.isArray(estimate.breakdown) && estimate.breakdown.length > 0;
  const hasLineItems =
    estimate.lineItems && Array.isArray(estimate.lineItems) && estimate.lineItems.length > 0;
  const hasExclusions = estimate.exclusions && estimate.exclusions.length > 0;
  const hasNotes = estimate.notes && estimate.notes.length > 0;

  return (
    <Card className="border-brand-200 bg-brand-50/30">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-brand-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {variant === "contractor" ? "AI Bid Assistant" : "AI Price Estimate"}
              </p>
              <p className="text-[11px] text-gray-700">
                Powered by ConstructionAI {estimate.modelVersion}
              </p>
            </div>
          </div>
          <Badge variant={confidenceBadgeVariant}>
            {confidenceLabel} confidence
          </Badge>
        </div>

        {/* Estimate range with midpoint */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg text-gray-700">
              {formatCurrency(estimate.estimateMin)}
            </span>
            <span className="text-gray-300 mx-1">&ndash;</span>
            <span className="text-lg text-gray-700">
              {formatCurrency(estimate.estimateMax)}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(estimate.estimateMid)}
            </span>
            <span className="text-xs text-gray-700">best estimate</span>
          </div>
          {estimate.total && estimate.total !== estimate.estimateMid && (
            <div className="flex items-baseline gap-2">
              <DollarSign className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-sm text-gray-800">
                Total with markup: <strong>{formatCurrency(estimate.total)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Suggested bid for contractors */}
        {suggestedBid && variant === "contractor" && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/10 border border-emerald-800/20 rounded-sm">
            <TrendingUp className="w-4 h-4 text-emerald-950" />
            <span className="text-sm text-green-800">
              Suggested bid: <strong>{formatCurrency(suggestedBid)}</strong>
            </span>
          </div>
        )}

        {/* Timeline */}
        {estimate.timelineWeeks && (
          <div className="flex items-center gap-2 text-sm text-gray-800">
            <Clock className="w-4 h-4 text-gray-600" />
            <span>
              Estimated timeline:{" "}
              <strong>
                {estimate.timelineWeeks} week{estimate.timelineWeeks !== 1 ? "s" : ""}
              </strong>
            </span>
          </div>
        )}

        {/* Cost summary row */}
        {!compact && (estimate.laborCost || estimate.materialCost || estimate.equipmentCost) && (
          <>
            <Separator />
            <div className="grid grid-cols-3 gap-3">
              {estimate.laborCost != null && (
                <div className="text-center">
                  <Hammer className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-700">Labor</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(estimate.laborCost)}
                  </p>
                  {estimate.laborHours != null && (
                    <p className="text-[11px] text-gray-600">
                      {estimate.laborHours}h
                    </p>
                  )}
                </div>
              )}
              {estimate.materialCost != null && (
                <div className="text-center">
                  <Package className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-700">Materials</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(estimate.materialCost)}
                  </p>
                </div>
              )}
              {estimate.equipmentCost != null && (
                <div className="text-center">
                  <Truck className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-700">Equipment</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(estimate.equipmentCost)}
                  </p>
                </div>
              )}
            </div>

            {/* Markup percentages */}
            {(estimate.overheadPercent || estimate.profitPercent || estimate.contingencyPct) && (
              <div className="flex items-center gap-3 text-[11px] text-gray-600">
                {estimate.overheadPercent != null && (
                  <span>OH {Math.round(estimate.overheadPercent * 100)}%</span>
                )}
                {estimate.profitPercent != null && (
                  <span>Profit {Math.round(estimate.profitPercent * 100)}%</span>
                )}
                {estimate.contingencyPct != null && (
                  <span>Contingency {Math.round(estimate.contingencyPct * 100)}%</span>
                )}
                {estimate.regionFactor != null && estimate.regionFactor !== 1.0 && (
                  <span>Region {estimate.regionFactor.toFixed(2)}x</span>
                )}
              </div>
            )}
          </>
        )}

        {/* CSI Division Breakdown — expandable */}
        {!compact && hasBreakdown && (
          <>
            <Separator />
            <button
              type="button"
              onClick={() => setBreakdownOpen((o) => !o)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                CSI Division Breakdown
              </span>
              {breakdownOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            {breakdownOpen && (
              <div className="space-y-1">
                {(estimate.breakdown as { division?: string; item: string; cost: number; description?: string }[]).map(
                  (item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        {item.division && (
                          <span className="text-[11px] text-gray-600 mr-1.5">
                            {item.division}
                          </span>
                        )}
                        <span className="text-gray-800">{item.item}</span>
                      </div>
                      <span className="text-gray-900 font-medium tabular-nums">
                        {formatCurrency(item.cost)}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}

        {/* Line Items — expandable */}
        {!compact && hasLineItems && (
          <>
            <Separator />
            <button
              type="button"
              onClick={() => setLineItemsOpen((o) => !o)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Line Items ({(estimate.lineItems as unknown[]).length})
              </span>
              {lineItemsOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            {lineItemsOpen && (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-gray-600 uppercase tracking-wide border-b border-gray-100">
                      <th className="text-left py-1.5 px-1 font-medium">Description</th>
                      <th className="text-right py-1.5 px-1 font-medium">Qty</th>
                      <th className="text-right py-1.5 px-1 font-medium">Unit</th>
                      <th className="text-right py-1.5 px-1 font-medium">Rate</th>
                      <th className="text-right py-1.5 px-1 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(estimate.lineItems as { description: string; quantity: number; unit: string; unit_cost: number; total: number }[]).map(
                      (item, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-1.5 px-1 text-gray-800">
                            {item.description}
                          </td>
                          <td className="py-1.5 px-1 text-right text-gray-800 tabular-nums">
                            {item.quantity}
                          </td>
                          <td className="py-1.5 px-1 text-right text-gray-600 text-xs">
                            {item.unit}
                          </td>
                          <td className="py-1.5 px-1 text-right text-gray-800 tabular-nums">
                            {formatCurrency(item.unit_cost)}
                          </td>
                          <td className="py-1.5 px-1 text-right text-gray-900 font-medium tabular-nums">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Exclusions — expandable */}
        {!compact && hasExclusions && (
          <>
            <Separator />
            <button
              type="button"
              onClick={() => setExclusionsOpen((o) => !o)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Exclusions ({estimate.exclusions.length})
              </span>
              {exclusionsOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            {exclusionsOpen && (
              <ul className="space-y-1">
                {estimate.exclusions.map((excl, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    {excl}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Notes */}
        {!compact && hasNotes && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Notes
              </p>
              {estimate.notes.map((note, i) => (
                <p key={i} className="text-sm text-gray-800">
                  {note}
                </p>
              ))}
            </div>
          </>
        )}

        {/* Action buttons */}
        {(onDownloadPdf || onSave || onRegenerate) && (
          <>
            <Separator />
            <div className="flex items-center gap-2 flex-wrap">
              {onDownloadPdf && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownloadPdf}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download PDF
                </Button>
              )}
              {onSave && variant === "contractor" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                >
                  <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                  Save to My Estimates
                </Button>
              )}
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRegenerate}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Regenerate
                </Button>
              )}
            </div>
          </>
        )}

        {/* Estimate number footer */}
        <div className="flex items-center justify-between text-[11px] text-gray-600">
          <span>{estimate.estimateNumber}</span>
          <span>
            {new Date(estimate.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
