"use client";

import { Shield, MapPin, Star, Briefcase, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { cn, getInitials } from "@shared/lib/utils";
import type { Contractor } from "@shared/lib/mock-data";
import { ContractorProfileDialog } from "@homeowner/components/contractor-profile-dialog";

const AVATAR_COLORS = [
  "bg-brand-600",
  "bg-blue-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
];

function avatarColor(id: string): string {
  const index = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

interface ContractorCardProps {
  contractor: Contractor;
  onViewProfile?: (contractor: Contractor) => void;
  onRequestEstimate?: (contractor: Contractor) => void;
}

export function ContractorCard({
  contractor,
  onViewProfile,
  onRequestEstimate,
}: ContractorCardProps) {
  return (
    <Card className="flex flex-col transition-shadow duration-200 hover:shadow-md">
      <CardContent className="flex-1 p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          {/* Initials avatar */}
          <div
            className={cn(
              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white text-sm font-bold",
              avatarColor(contractor.id)
            )}
          >
            {getInitials(contractor.name)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {contractor.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">{contractor.company}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <StarRating rating={contractor.rating} />
              <span className="text-sm font-medium text-gray-900">
                {contractor.rating}
              </span>
              <span className="text-sm text-gray-400">
                ({contractor.reviewCount})
              </span>
            </div>
          </div>

          <Badge variant="secondary" className="flex-shrink-0 text-xs">
            {contractor.specialty}
          </Badge>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-surface rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-0.5">
              <MapPin className="h-3 w-3" />
            </div>
            <p className="text-xs text-gray-500 leading-tight">{contractor.location}</p>
          </div>
          <div className="text-center border-x border-border">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-0.5">
              <Clock className="h-3 w-3" />
            </div>
            <p className="text-xs font-medium text-gray-900">{contractor.yearsExperience} yrs</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-0.5">
              <Briefcase className="h-3 w-3" />
            </div>
            <p className="text-xs font-medium text-gray-900">${contractor.hourlyRate}/hr</p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-2 mb-4">
          {contractor.verified && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2 py-0.5">
              <Shield className="h-3 w-3" />
              Verified
            </span>
          )}
          {contractor.licensed && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
              <Shield className="h-3 w-3" />
              Licensed
            </span>
          )}
          {contractor.insured && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">
              <Shield className="h-3 w-3" />
              Insured
            </span>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {contractor.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-xs text-gray-600 bg-gray-100 rounded-md px-2 py-0.5"
            >
              {skill}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 gap-2">
        <ContractorProfileDialog
          contractor={contractor}
          trigger={
            <Button variant="outline" size="sm" className="flex-1">
              View Profile
            </Button>
          }
        />
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onRequestEstimate?.(contractor)}
        >
          Request Estimate
        </Button>
      </CardFooter>
    </Card>
  );
}
