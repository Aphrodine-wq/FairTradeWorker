"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Shield,
  Star,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  MessageSquare,
  FileText,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/ui/dialog";
import { DialogTrigger } from "@shared/ui/dialog";
import { Button } from "@shared/ui/button";
import { Separator } from "@shared/ui/separator";
import { mockReviews } from "@shared/lib/mock-data";
import { cn, getInitials, formatDate } from "@shared/lib/utils";
import type { Contractor } from "@shared/lib/mock-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-brand-600",
  "bg-blue-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
];

function avatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            cls,
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

// ─── Portfolio images ─────────────────────────────────────────────────────────

const PORTFOLIO_IMGS = [
  { seed: "portfolio1", caption: "Kitchen remodel — Austin, TX" },
  { seed: "portfolio2", caption: "Master bathroom renovation" },
  { seed: "portfolio3", caption: "Outdoor deck build" },
  { seed: "portfolio4", caption: "Hardwood flooring install" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContractorProfileDialogProps {
  contractor: Contractor;
  trigger: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ContractorProfileDialog({
  contractor,
  trigger,
}: ContractorProfileDialogProps) {
  const [saved, setSaved] = useState(false);
  const [estimateRequested, setEstimateRequested] = useState(false);

  // Match reviews by contractor name if possible, otherwise show the homeowner reviews
  const reviews = mockReviews.filter(
    (r) => r.authorName === contractor.name
  );
  const displayReviews =
    reviews.length > 0
      ? reviews
      : mockReviews.filter((r) => r.role === "homeowner").slice(0, 3);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{contractor.name} — Contractor Profile</DialogTitle>
          <DialogDescription>
            Full profile for {contractor.name} at {contractor.company}
          </DialogDescription>
        </DialogHeader>

        {/* ── Header ── */}
        <div className="flex items-start gap-5 px-6 pt-7 pb-5">
          <div
            className={cn(
              "flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full text-white text-2xl font-bold",
              avatarColor(contractor.id)
            )}
          >
            {getInitials(contractor.name)}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{contractor.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{contractor.company}</p>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              {contractor.location}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={contractor.rating} size="md" />
              <span className="text-base font-bold text-gray-900">{contractor.rating}</span>
              <span className="text-sm text-gray-400">({contractor.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* ── Trust badges ── */}
        <div className="flex items-center gap-2 px-6">
          {contractor.verified && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
              <Shield className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
          {contractor.licensed && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
              <Shield className="h-3.5 w-3.5" />
              Licensed
            </span>
          )}
          {contractor.insured && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-3 py-1">
              <Shield className="h-3.5 w-3.5" />
              Insured
            </span>
          )}
        </div>

        <Separator className="mx-6 mt-5" />

        {/* ── Bio ── */}
        <div className="px-6 mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About</p>
          <p className="text-sm text-gray-700 leading-relaxed">{contractor.bio}</p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3 px-6 mt-5">
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <Clock className="h-4 w-4 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xl font-bold text-gray-900">{contractor.yearsExperience}</p>
            <p className="text-xs text-gray-500 mt-0.5">Years Exp.</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <Briefcase className="h-4 w-4 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xl font-bold text-gray-900">{contractor.jobsCompleted}</p>
            <p className="text-xs text-gray-500 mt-0.5">Jobs Done</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <DollarSign className="h-4 w-4 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xl font-bold text-gray-900">${contractor.hourlyRate}</p>
            <p className="text-xs text-gray-500 mt-0.5">Per Hour</p>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="px-6 mt-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {contractor.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs text-gray-700 bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <Separator className="mx-6 mt-5" />

        {/* ── Reviews ── */}
        <div className="px-6 mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Reviews</p>
          <div className="space-y-3">
            {displayReviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-gray-900">{review.authorName}</p>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                <p className="text-xs text-gray-400 mt-1.5">{formatDate(review.date)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Portfolio ── */}
        <div className="px-6 mt-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Portfolio</p>
          <div className="grid grid-cols-2 gap-3">
            {PORTFOLIO_IMGS.map((img) => (
              <div
                key={img.seed}
                className="rounded-xl overflow-hidden border border-gray-200"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={`https://picsum.photos/seed/${img.seed}/400/300`}
                    alt={img.caption}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 px-2.5 py-1.5">{img.caption}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 px-6 py-5 mt-2 border-t border-border">
          <Button
            className="flex-1 gap-2"
            onClick={() => setEstimateRequested(true)}
            variant={estimateRequested ? "secondary" : "default"}
          >
            {estimateRequested ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Requested
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Request Estimate
              </>
            )}
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <MessageSquare className="h-4 w-4" />
            Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5",
              saved && "text-brand-600 border-brand-200 bg-brand-50"
            )}
            onClick={() => setSaved((v) => !v)}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-brand-600")} />
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
