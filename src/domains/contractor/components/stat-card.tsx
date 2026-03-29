import React from "react";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@shared/ui/card";
import { cn } from "@shared/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  prefix?: string;
}

export function StatCard({ title, value, change, icon: Icon, prefix }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{title}</p>
            <p className="mt-1.5 text-2xl font-bold text-gray-900 tabular-nums">
              {prefix && <span>{prefix}</span>}
              {value}
            </p>
            {change !== undefined && (
              <div
                className={cn(
                  "mt-1.5 flex items-center gap-1 text-xs font-semibold",
                  isPositive && "text-emerald-950",
                  isNegative && "text-red-500"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {change.toFixed(1)}% from last month
                </span>
              </div>
            )}
          </div>
          <div className="w-11 h-11 rounded-none bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-brand-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
