import React from "react";
import { FileText, Calendar, List } from "lucide-react";
import { Card, CardContent } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { type Estimate } from "@shared/lib/mock-data";
import { formatCurrency, formatDate } from "@shared/lib/utils";
import { type BadgeProps } from "@shared/ui/badge";

type BadgeVariant = BadgeProps["variant"];

const STATUS_CONFIG: Record<
  Estimate["status"],
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "info" },
  viewed: { label: "Viewed", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Declined", variant: "danger" },
  expired: { label: "Expired", variant: "outline" },
};

interface EstimateCardProps {
  estimate: Estimate;
  onView?: (id: string) => void;
}

export function EstimateCard({ estimate, onView }: EstimateCardProps) {
  const config = STATUS_CONFIG[estimate.status];

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-none bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-brand-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {estimate.jobTitle}
              </p>
              <p className="text-xs text-gray-700 mt-0.5 truncate">
                {estimate.clientName}
              </p>
            </div>
          </div>
          <Badge variant={config.variant} className="flex-shrink-0">
            {config.label}
          </Badge>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-gray-900 tabular-nums">
            {formatCurrency(estimate.amount)}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <List className="w-3 h-3" />
              {estimate.lineItems.length} items
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(estimate.createdDate)}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 h-7 text-xs"
            onClick={() => onView?.(estimate.id)}
          >
            View Estimate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
