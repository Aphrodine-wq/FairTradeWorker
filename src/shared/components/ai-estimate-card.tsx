"use client";

import { DollarSign, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { cn, formatCurrency } from "@shared/lib/utils";

interface AiEstimateCardProps {
  estimateMin: number;
  estimateMax: number;
  confidence: number;
  breakdown?: { item: string; cost: number }[] | null;
  suggestedBid?: number;
  variant?: "homeowner" | "contractor";
  loading?: boolean;
}

export function AiEstimateCard({
  estimateMin,
  estimateMax,
  confidence,
  breakdown,
  suggestedBid,
  variant = "homeowner",
  loading,
}: AiEstimateCardProps) {
  if (loading) {
    return (
      <Card className="border-brand-200 bg-brand-50/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
          <span className="text-sm text-gray-500">Generating AI estimate...</span>
        </CardContent>
      </Card>
    );
  }

  const confidenceLabel = confidence > 0.7 ? "High" : confidence > 0.4 ? "Medium" : "Low";
  const confidenceColor = confidence > 0.7 ? "text-green-600" : confidence > 0.4 ? "text-amber-600" : "text-red-500";

  return (
    <Card className="border-brand-200 bg-brand-50/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {variant === "contractor" ? "AI Bid Assistant" : "AI Price Estimate"}
              </p>
              <p className="text-[11px] text-gray-500">Powered by ConstructionAI</p>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs", confidenceColor)}>
            {confidenceLabel} confidence
          </Badge>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(estimateMin)}
          </span>
          <span className="text-gray-400 mx-1">–</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(estimateMax)}
          </span>
        </div>

        {suggestedBid && variant === "contractor" && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Suggested bid: <strong>{formatCurrency(suggestedBid)}</strong>
            </span>
          </div>
        )}

        {breakdown && breakdown.length > 0 && (
          <div className="space-y-1 pt-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Breakdown</p>
            {breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.item}</span>
                <span className="text-gray-900 font-medium">{formatCurrency(item.cost)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
