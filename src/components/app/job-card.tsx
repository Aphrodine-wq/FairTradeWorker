import React from "react";
import { MapPin, Clock, Users, Image as ImageIcon, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Job } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const URGENCY_CONFIG = {
  low: { label: "Low", dotClass: "bg-gray-400" },
  medium: { label: "Medium", dotClass: "bg-amber-400" },
  high: { label: "High", dotClass: "bg-red-500" },
};

interface JobCardProps {
  job: Job;
  onView?: (id: string) => void;
}

export function JobCard({ job, onView }: JobCardProps) {
  const urgency = URGENCY_CONFIG[job.urgency];

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      <CardContent className="p-5">
        {/* Title + Category */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-brand-600 transition-colors truncate">
              {job.title}
            </h3>
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            {job.category}
          </Badge>
        </div>

        {/* Budget */}
        <div className="mt-3 flex items-center gap-1.5 text-gray-700">
          <DollarSign className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
          <span className="text-sm font-semibold tabular-nums">
            {formatCurrency(job.budget.min)} &ndash; {formatCurrency(job.budget.max)}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(job.postedDate)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {job.bidsCount} {job.bidsCount === 1 ? "bid" : "bids"}
          </span>
          {job.photos > 0 && (
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {job.photos}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className={cn("w-2 h-2 rounded-full flex-shrink-0", urgency.dotClass)}
            />
            <span>{urgency.label} urgency</span>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={() => onView?.(job.id)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
