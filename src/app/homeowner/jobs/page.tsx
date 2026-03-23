"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Hammer,
  Zap,
  Wrench,
  Wind,
  Home,
  PaintBucket,
  Layers,
  TreePine,
  LayoutGrid,
  Square,
  Fence,
  PanelTop as Wall2,
  CheckCircle2,
  DollarSign,
  Clock,
  FileText,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Scale,
  Award,
  XCircle,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Separator } from "@shared/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/ui/dialog";
import { cn, formatCurrency, formatDate, getInitials } from "@shared/lib/utils";
import { mockContractors, mockJobs, type Job } from "@shared/lib/mock-data";
import { fetchJobs } from "@shared/lib/data";
import type { LucideIcon } from "lucide-react";

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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3.5 w-3.5",
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

function StarRatingSmall({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3 w-3",
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

// ─── Category Icon + Color Map ────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  "General Contracting": { icon: Hammer, color: "text-brand-600", bg: "bg-brand-50" },
  "Plumbing":            { icon: Wrench, color: "text-blue-600", bg: "bg-blue-50" },
  "Electrical":          { icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
  "HVAC":                { icon: Wind, color: "text-cyan-600", bg: "bg-cyan-50" },
  "Roofing":             { icon: Home, color: "text-red-600", bg: "bg-red-50" },
  "Painting":            { icon: PaintBucket, color: "text-violet-600", bg: "bg-violet-50" },
  "Flooring":            { icon: Layers, color: "text-stone-600", bg: "bg-stone-50" },
  "Landscaping":         { icon: TreePine, color: "text-emerald-600", bg: "bg-emerald-50" },
  "Remodeling":          { icon: LayoutGrid, color: "text-indigo-600", bg: "bg-indigo-50" },
  "Concrete":            { icon: Square, color: "text-slate-600", bg: "bg-slate-50" },
  "Fencing":             { icon: Fence, color: "text-teal-600", bg: "bg-teal-50" },
  "Drywall":             { icon: Wall2, color: "text-orange-600", bg: "bg-orange-50" },
};

function CategoryIcon({ category }: { category: string }) {
  const style = CATEGORY_STYLE[category] ?? { icon: Hammer, color: "text-gray-500", bg: "bg-gray-100" };
  const Icon = style.icon;
  return (
    <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg", style.bg)}>
      <Icon className={cn("h-4.5 w-4.5", style.color)} />
    </div>
  );
}

// ─── Bid Types & Mock Data ────────────────────────────────────────────────────

type BidStatus = "pending" | "accepted" | "declined";

interface Bid {
  id: string;
  jobId: string;
  contractorId: string;
  amount: number;
  timeline: string;
  coverLetter: string;
  status: BidStatus;
  submittedDate: string;
}

const MOCK_BIDS: Bid[] = [
  {
    id: "b1", jobId: "j1", contractorId: "c1", amount: 38500, timeline: "5 weeks",
    coverLetter: "We've completed over 40 kitchen remodels in the Austin area and this project is right in our wheelhouse. Our crew handles everything in-house — demo, framing, cabinet install, and finish work — which keeps your timeline tight and eliminates subcontractor delays.",
    status: "pending", submittedDate: "2026-03-16",
  },
  {
    id: "b2", jobId: "j1", contractorId: "c3", amount: 41200, timeline: "6 weeks",
    coverLetter: "My team has handled the plumbing rough-in on 30+ kitchen remodels. I can coordinate directly with a trusted GC I work with regularly to handle the full scope as a combined bid.",
    status: "pending", submittedDate: "2026-03-17",
  },
  {
    id: "b3", jobId: "j1", contractorId: "c6", amount: 36900, timeline: "4.5 weeks",
    coverLetter: "We specialize in kitchen and bathroom remodels and have installed the exact Calacatta Laza quartz you've selected on three recent projects. We work clean and provide daily summaries.",
    status: "declined", submittedDate: "2026-03-16",
  },
  {
    id: "b4", jobId: "j1", contractorId: "c5", amount: 34750, timeline: "5.5 weeks",
    coverLetter: "While painting is our core trade, we manage full remodel scopes using our trusted subcontractor network. Our project manager coordinates all subs, and you'd have one point of contact throughout.",
    status: "pending", submittedDate: "2026-03-18",
  },
  {
    id: "b5", jobId: "j2", contractorId: "c2", amount: 4850, timeline: "2 days",
    coverLetter: "Panel upgrades and EV charger installs are my primary focus. I'm Oncor-approved and have done over 60 panel replacements in the Dallas area this year alone.",
    status: "accepted", submittedDate: "2026-03-17",
  },
  {
    id: "b6", jobId: "j2", contractorId: "c1", amount: 5400, timeline: "3 days",
    coverLetter: "We have a licensed master electrician on our team who handles all panel work. We're fully insured with $2M GL and workers' comp. All work is to NEC 2023 standards.",
    status: "pending", submittedDate: "2026-03-17",
  },
  {
    id: "b7", jobId: "j3", contractorId: "c3", amount: 26400, timeline: "4 weeks",
    coverLetter: "I'm a licensed master plumber with 20 years in San Antonio. I'm Schluter-certified and have installed their KERDI waterproofing system on over 80 walk-in shower builds.",
    status: "pending", submittedDate: "2026-03-12",
  },
  {
    id: "b8", jobId: "j3", contractorId: "c2", amount: 28900, timeline: "5 weeks",
    coverLetter: "We handle full bathroom remodel scopes including all electrical rough-in for heated floor and exhaust fan. I work with a licensed plumber and certified tile installer as a regular crew.",
    status: "pending", submittedDate: "2026-03-13",
  },
];

// Use first 3 jobs, override statuses for filter variety
const INITIAL_JOBS = mockJobs.slice(0, 3).map((job, i) => ({
  ...job,
  status: i === 1 ? ("in_progress" as const) : i === 2 ? ("completed" as const) : job.status,
}));

type StatusFilter = "all" | "open" | "in_progress" | "completed";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  open:        { label: "Open",        className: "bg-brand-50 text-brand-700 border-brand-200" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-700 border-amber-200" },
  completed:   { label: "Completed",   className: "bg-gray-100 text-gray-600 border-gray-200" },
  cancelled:   { label: "Cancelled",   className: "bg-red-50 text-red-600 border-red-200" },
};

// ─── Bid Dialog ───────────────────────────────────────────────────────────────

function BidDialog({
  bid,
  open,
  onClose,
  onAccept,
  onDecline,
}: {
  bid: Bid;
  open: boolean;
  onClose: () => void;
  onAccept: (bidId: string) => void;
  onDecline: (bidId: string) => void;
}) {
  const contractor = mockContractors.find((c) => c.id === bid.contractorId);
  if (!contractor) return null;

  const isAccepted = bid.status === "accepted";
  const isDeclined = bid.status === "declined";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Bid from {contractor.name}</DialogTitle>
          <DialogDescription>Full bid details and contractor profile</DialogDescription>
        </DialogHeader>

        {isAccepted && (
          <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl bg-brand-50 border border-brand-200 p-4">
            <CheckCircle2 className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-brand-800">Bid Accepted</p>
              <p className="text-xs text-brand-700 mt-0.5">
                {contractor.name} has been notified. Funds will be held in escrow until the job is complete.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4 px-6 pt-6">
          <div
            className={cn(
              "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-white text-base font-bold",
              avatarColor(contractor.id)
            )}
          >
            {getInitials(contractor.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{contractor.name}</h2>
            <p className="text-sm text-gray-500">{contractor.company}</p>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={contractor.rating} />
              <span className="text-sm font-semibold text-gray-900">{contractor.rating}</span>
              <span className="text-sm text-gray-400">({contractor.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 mt-2">
          {([
            { show: contractor.verified, label: "Verified", style: "text-brand-700 bg-brand-50 border-brand-100" },
            { show: contractor.licensed, label: "Licensed", style: "text-blue-700 bg-blue-50 border-blue-100" },
            { show: contractor.insured,  label: "Insured",  style: "text-violet-700 bg-violet-50 border-violet-100" },
          ] as const).filter((b) => b.show).map((b) => (
            <span key={b.label} className={cn("inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2.5 py-0.5", b.style)}>
              <Shield className="h-3 w-3" /> {b.label}
            </span>
          ))}
        </div>

        <Separator className="mx-6 mt-4" />

        <div className="grid grid-cols-3 gap-3 px-6 mt-4">
          {[
            { icon: DollarSign, label: "Bid Amount", value: formatCurrency(bid.amount), accent: true },
            { icon: Clock, label: "Timeline", value: bid.timeline, accent: false },
            { icon: CalendarDays, label: "Submitted", value: formatDate(bid.submittedDate), accent: false },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-xl border p-4 text-center", s.accent ? "bg-brand-50 border-brand-100" : "bg-gray-50 border-gray-200")}>
              <s.icon className={cn("h-4 w-4 mx-auto mb-1", s.accent ? "text-brand-600" : "text-gray-500")} />
              <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="px-6 mt-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cover Letter</p>
          <p className="text-sm text-gray-700 leading-relaxed">{bid.coverLetter}</p>
        </div>

        <Separator className="mx-6 mt-5" />

        <div className="px-6 mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contractor Stats</p>
          <div className="flex items-center gap-6 text-center">
            {[
              { icon: Briefcase, val: contractor.jobsCompleted, label: "Jobs" },
              { icon: Clock, val: `${contractor.yearsExperience} yrs`, label: "Exp." },
              { icon: DollarSign, val: `$${contractor.hourlyRate}`, label: "/hr" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <s.icon className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm font-bold text-gray-900">{s.val}</span>
                <span className="text-xs text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">{contractor.bio}</p>
        </div>

        <div className="flex items-center gap-3 px-6 py-5 mt-2 border-t border-border">
          {isAccepted ? (
            <>
              <Button className="flex-1 gap-2" variant="outline">
                <MessageSquare className="h-4 w-4" />
                Message Contractor
              </Button>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                <CheckCircle2 className="h-4 w-4" />
                Bid Accepted
              </div>
            </>
          ) : isDeclined ? (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <XCircle className="h-4 w-4" />
              Bid Declined
            </div>
          ) : (
            <>
              <Button className="flex-1" onClick={() => { onAccept(bid.id); onClose(); }}>
                Accept Bid
              </Button>
              <Button
                variant="outline"
                onClick={() => { onDecline(bid.id); onClose(); }}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Decline
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Compare Modal ────────────────────────────────────────────────────────────

function scoreBid(bid: Bid, allBids: Bid[]): { score: number; breakdown: { label: string; pts: number }[] } {
  const contractor = mockContractors.find((c) => c.id === bid.contractorId)!;
  const amounts = allBids.map((b) => b.amount);
  const minAmt = Math.min(...amounts);
  const maxAmt = Math.max(...amounts);
  const priceRange = maxAmt - minAmt || 1;

  const breakdown = [
    { label: "Price", pts: Math.round(((maxAmt - bid.amount) / priceRange) * 35) },
    { label: "Rating", pts: Math.round(((contractor.rating - 4.0) / 1.0) * 30) },
    { label: "Experience", pts: Math.min(Math.round((contractor.yearsExperience / 20) * 20), 20) },
    { label: "Trust", pts: (contractor.verified ? 5 : 0) + (contractor.licensed ? 5 : 0) + (contractor.insured ? 5 : 0) },
  ];
  return { score: breakdown.reduce((s, b) => s + b.pts, 0), breakdown };
}

function compareRows(bids: Bid[], minAmt: number, maxRating: number, maxExp: number) {
  const fastest = Math.min(...bids.map((b) => parseFloat(b.timeline)));
  const c = (bid: Bid) => mockContractors.find((x) => x.id === bid.contractorId)!;
  const hi = (v: boolean) => v ? "text-brand-600" : "text-gray-700";
  return [
    { label: "Price", render: (bid: Bid) => <span className={cn("text-sm font-bold", hi(bid.amount === minAmt))}>{formatCurrency(bid.amount)}</span> },
    { label: "Rating", render: (bid: Bid) => {
      const ct = c(bid);
      return <div className="flex flex-col items-center gap-1"><StarRatingSmall rating={ct.rating} /><span className={cn("text-sm font-bold", hi(ct.rating === maxRating))}>{ct.rating}</span></div>;
    }},
    { label: "Timeline", render: (bid: Bid) => <span className={cn("text-sm font-semibold", hi(parseFloat(bid.timeline) === fastest))}>{bid.timeline}</span> },
    { label: "Experience", render: (bid: Bid) => <span className={cn("text-sm font-bold", hi(c(bid).yearsExperience === maxExp))}>{c(bid).yearsExperience} yrs</span> },
    { label: "Reviews", render: (bid: Bid) => <span className="text-sm font-semibold text-gray-700">{c(bid).reviewCount}</span> },
    { label: "Verified", render: (bid: Bid) => <BoolCell value={c(bid).verified} /> },
    { label: "Licensed", render: (bid: Bid) => <BoolCell value={c(bid).licensed} /> },
    { label: "Insured", render: (bid: Bid) => <BoolCell value={c(bid).insured} /> },
  ] as { label: string; render: (bid: Bid) => React.ReactNode }[];
}

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="h-4 w-4 mx-auto text-brand-600" />
  ) : (
    <XCircle className="h-4 w-4 mx-auto text-gray-300" />
  );
}

function CompareModal({
  open,
  onClose,
  bids,
  bidStatuses,
  onAccept,
}: {
  open: boolean;
  onClose: () => void;
  bids: Bid[];
  bidStatuses: Record<string, BidStatus>;
  onAccept: (bidId: string) => void;
}) {
  const effectiveBids = bids.map((b) => ({ ...b, status: bidStatuses[b.id] ?? b.status }));
  const scored = effectiveBids
    .map((bid) => ({
      bid,
      contractor: mockContractors.find((c) => c.id === bid.contractorId)!,
      ...scoreBid(bid, effectiveBids),
    }))
    .sort((a, b) => b.score - a.score);

  const amounts = effectiveBids.map((b) => b.amount);
  const minAmt = Math.min(...amounts);
  const allRatings = scored.map((s) => s.contractor.rating);
  const maxRating = Math.max(...allRatings);
  const allExp = scored.map((s) => s.contractor.yearsExperience);
  const maxExp = Math.max(...allExp);

  const topScore = scored[0];
  const savingsVsAvg = amounts.reduce((s, a) => s + a, 0) / amounts.length - topScore.bid.amount;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Compare Bids</DialogTitle>
          <DialogDescription>Side-by-side contractor comparison</DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-gray-900">Compare Bids</h2>
          <p className="text-sm text-gray-500 mt-0.5">Side-by-side comparison to find the best value</p>
        </div>

        <div className="px-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-28 bg-gray-50 border-r border-gray-100 px-3 py-4" />
                {scored.map(({ bid, contractor, score }, idx) => {
                  const isTop = idx === 0;
                  return (
                    <th key={bid.id} className={cn("text-center px-4 py-4 min-w-[150px]", isTop && "bg-brand-50")}>
                      <div className="flex flex-col items-center gap-2">
                        {isTop && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-100 rounded-full px-2 py-0.5 uppercase tracking-wide">
                            <Award className="h-3 w-3" /> Best Match
                          </span>
                        )}
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold",
                            avatarColor(contractor.id)
                          )}
                        >
                          {getInitials(contractor.name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{contractor.name}</p>
                          <p className="text-xs text-gray-500">{contractor.company}</p>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {(compareRows(effectiveBids, minAmt, maxRating, maxExp)).map((row, ri) => (
                <tr key={row.label} className={cn("border-b border-gray-100 last:border-0", ri % 2 === 0 ? "bg-white" : "bg-gray-50/50")}>
                  <td className="border-r border-gray-100 px-3 py-3 bg-gray-50">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {row.label}
                    </span>
                  </td>
                  {scored.map(({ bid }, idx) => (
                    <td key={bid.id} className={cn("text-center px-4 py-3", idx === 0 && "bg-brand-50/40")}>
                      {row.render(bid)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="border-r border-gray-100 px-3 py-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</span>
                </td>
                {scored.map(({ bid }, idx) => (
                  <td key={bid.id} className={cn("text-center px-4 py-4", idx === 0 && "bg-brand-50/40")}>
                    {bid.status === "accepted" ? (
                      <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                        <CheckCircle2 className="h-4 w-4" /> Accepted
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant={idx === 0 ? "default" : "outline"}
                        className="w-full max-w-[130px]"
                        onClick={() => { onAccept(bid.id); onClose(); }}
                      >
                        Accept Bid
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recommendation */}
        {topScore && (
          <div className="mx-6 mb-6 mt-4 rounded-xl border border-brand-100 bg-brand-50/50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <Award className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">Our Recommendation</p>
                <p className="text-sm font-bold text-gray-900">{topScore.contractor.name} — {topScore.contractor.company}</p>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  Scores highest with{" "}
                  <span className="font-semibold text-gray-900">{topScore.score}/100</span>.
                  Their <span className="font-semibold text-gray-900">{formatCurrency(topScore.bid.amount)}</span> bid is{" "}
                  {savingsVsAvg > 0 ? (
                    <span className="font-semibold text-brand-600">{formatCurrency(Math.round(savingsVsAvg))} below average</span>
                  ) : (
                    <span className="font-semibold text-gray-900">near the field average</span>
                  )}{" "}
                  with a <span className="font-semibold text-gray-900">{topScore.contractor.rating}-star</span> rating.
                </p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {topScore.breakdown.map((b) => (
                    <div key={b.label} className="text-center">
                      <p className="text-xs text-gray-400">{b.label}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {b.pts}
                        <span className="text-xs font-normal text-gray-400">
                          /{b.label === "Price" ? 35 : b.label === "Rating" ? 30 : b.label === "Experience" ? 20 : 15}
                        </span>
                      </p>
                    </div>
                  ))}
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Overall</p>
                    <p className="text-lg font-bold text-brand-600">
                      {topScore.score}<span className="text-xs font-normal text-gray-400">/100</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Inline Bid Card ──────────────────────────────────────────────────────────

function InlineBidCard({
  bid,
  onViewFull,
  onAccept,
}: {
  bid: Bid;
  onViewFull: () => void;
  onAccept: () => void;
}) {
  const contractor = mockContractors.find((c) => c.id === bid.contractorId);
  if (!contractor) return null;

  const isAccepted = bid.status === "accepted";

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
      <div
        className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-bold",
          avatarColor(contractor.id)
        )}
      >
        {getInitials(contractor.name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">{contractor.name}</p>
          {contractor.verified && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-1.5 py-0.5">
              <Shield className="h-2.5 w-2.5" /> Verified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <StarRating rating={contractor.rating} />
          <span className="text-xs font-medium text-gray-700">{contractor.rating}</span>
          <span className="text-xs text-gray-400">({contractor.reviewCount})</span>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-xs">
            <DollarSign className="h-3 w-3 text-brand-600" />
            <span className="font-bold text-gray-900">{formatCurrency(bid.amount)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {bid.timeline}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
          {bid.coverLetter}
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0">
        {isAccepted ? (
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-2.5 py-1">
            <CheckCircle2 className="h-3 w-3" /> Accepted
          </div>
        ) : (
          <>
            <Button size="sm" onClick={onAccept}>Accept</Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={onViewFull}>
              View
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs().then((apiJobs) => {
      if (apiJobs.length > 0) {
        setJobs(apiJobs);
      }
    });
  }, []);
  const [bidStatuses, setBidStatuses] = useState<Record<string, BidStatus>>(() => {
    const initial: Record<string, BidStatus> = {};
    MOCK_BIDS.forEach((b) => { initial[b.id] = b.status; });
    return initial;
  });
  const [activeBid, setActiveBid] = useState<Bid | null>(null);
  const [compareJobId, setCompareJobId] = useState<string | null>(null);

  const handleAccept = (bidId: string) => setBidStatuses((prev) => ({ ...prev, [bidId]: "accepted" }));
  const handleDecline = (bidId: string) => setBidStatuses((prev) => ({ ...prev, [bidId]: "declined" }));

  const filteredJobs = useMemo(
    () => jobs.filter((j) => filter === "all" || j.status === filter),
    [filter, jobs]
  );

  const getBidsForJob = (jobId: string) =>
    MOCK_BIDS.filter((b) => b.jobId === jobId).map((b) => ({
      ...b,
      status: bidStatuses[b.id] ?? b.status,
    }));

  const effectiveActiveBid = activeBid
    ? { ...activeBid, status: bidStatuses[activeBid.id] }
    : null;

  const compareBids = compareJobId ? getBidsForJob(compareJobId) : [];

  const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Shadow header */}
      <div className="px-6 pt-5 pb-4 bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] relative z-10">
        <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">My Jobs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track jobs, review bids, and compare contractors.</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Filter pills + count */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "text-sm font-medium rounded-full px-3.5 py-1.5 border transition-colors",
                  filter === f.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Job list */}
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700">No jobs yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Post one from your{" "}
              <Link href="/homeowner/dashboard" className="text-brand-600 font-medium hover:underline">
                Dashboard
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredJobs.map((job) => {
              const bids = getBidsForJob(job.id);
              const isExpanded = expandedJobId === job.id;
              const statusBadge = STATUS_BADGE[job.status] ?? STATUS_BADGE.open;
              const comparableBids = bids.filter((b) => b.status !== "declined");

              return (
                <div key={job.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  {/* Job row */}
                  <button
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <CategoryIcon category={job.category} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{job.title}</h3>
                        <span
                          className={cn(
                            "text-[11px] font-medium border rounded-full px-2 py-0.5",
                            statusBadge.className
                          )}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{formatDate(job.postedDate)}</span>
                        <span className="font-medium text-gray-700">
                          {bids.length} bid{bids.length !== 1 ? "s" : ""}
                        </span>
                        <span>
                          {formatCurrency(job.budget.min)} – {formatCurrency(job.budget.max)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-gray-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {/* Expanded: description + bids */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/30">
                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{job.description}</p>

                      {/* Photos placeholder */}
                      {job.photos.length > 0 && (
                        <div className="flex gap-2 mb-4">
                          {job.photos.slice(0, 3).map((photo, idx) => (
                            <div key={idx} className="w-20 h-20 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center">
                              <span className="text-[10px] text-gray-400">Photo</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bids section header */}
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Bids Received ({bids.length})
                        </p>
                        {comparableBids.length >= 2 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCompareJobId(job.id);
                            }}
                          >
                            <Scale className="h-3.5 w-3.5" />
                            Compare Bids
                          </Button>
                        )}
                      </div>

                      {bids.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">No bids yet. Check back soon.</p>
                      ) : (
                        <div className="space-y-2">
                          {bids.map((bid) => (
                            <InlineBidCard
                              key={bid.id}
                              bid={bid}
                              onViewFull={() => setActiveBid(bid)}
                              onAccept={() => handleAccept(bid.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bid detail dialog */}
      {effectiveActiveBid && (
        <BidDialog
          bid={effectiveActiveBid as Bid}
          open={!!activeBid}
          onClose={() => setActiveBid(null)}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}

      {/* Compare modal */}
      {compareJobId && (
        <CompareModal
          open={!!compareJobId}
          onClose={() => setCompareJobId(null)}
          bids={compareBids}
          bidStatuses={bidStatuses}
          onAccept={handleAccept}
        />
      )}
    </div>
  );
}
