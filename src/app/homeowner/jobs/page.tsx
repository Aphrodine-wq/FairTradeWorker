"use client";

import React, { useState } from "react";
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
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
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
import { AppHeader } from "@shared/components/app-header";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Badge } from "@shared/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@shared/ui/tabs";
import { Separator } from "@shared/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/ui/dialog";
import { cn, formatCurrency, formatDate, getInitials } from "@shared/lib/utils";
import { mockContractors, mockJobs, mockReviews } from "@shared/lib/mock-data";
import { api } from "@shared/lib/realtime";

// ─── Shared Helpers ────────────────────────────────────────────────────────────

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

// ─── Post a Job ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { label: "General Contracting", icon: Hammer },
  { label: "Plumbing", icon: Wrench },
  { label: "Electrical", icon: Zap },
  { label: "HVAC", icon: Wind },
  { label: "Roofing", icon: Home },
  { label: "Painting", icon: PaintBucket },
  { label: "Flooring", icon: Layers },
  { label: "Landscaping", icon: TreePine },
  { label: "Remodeling", icon: LayoutGrid },
  { label: "Concrete", icon: Square },
  { label: "Fencing", icon: Fence },
  { label: "Drywall", icon: Wall2 },
];

const TIMELINE_OPTIONS = [
  { value: "asap", label: "As soon as possible" },
  { value: "2weeks", label: "Within 2 weeks" },
  { value: "1month", label: "Within 1 month" },
  { value: "flexible", label: "I'm flexible" },
];

const URGENCY_OPTIONS = [
  { value: "low", label: "Low", description: "Within a few months", color: "text-brand-700 border-brand-600 bg-brand-50" },
  { value: "medium", label: "Medium", description: "Within 2–4 weeks", color: "text-amber-700 border-amber-500 bg-amber-50" },
  { value: "high", label: "High", description: "Urgent — within days", color: "text-red-700 border-red-500 bg-red-50" },
];

const POST_STEPS = ["What", "Details", "Post"];

interface PostFormData {
  category: string;
  title: string;
  description: string;
  timeline: string;
  budgetMin: string;
  budgetMax: string;
  urgency: string;
}

const EMPTY_FORM: PostFormData = {
  category: "",
  title: "",
  description: "",
  timeline: "",
  budgetMin: "",
  budgetMax: "",
  urgency: "",
};

function PostJobTab() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PostFormData>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 1) return !!form.category;
    if (step === 2) return !!form.title && !!form.description && !!form.timeline;
    return !!form.budgetMin && !!form.budgetMax && !!form.urgency;
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-brand-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted!</h2>
        <p className="text-gray-500 mb-6">
          Your job has been posted. Verified contractors in your area will start
          submitting estimates shortly.
        </p>
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setForm(EMPTY_FORM);
              setStep(1);
              setSubmitted(false);
            }}
          >
            Post Another Job
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {POST_STEPS.map((label, i) => {
          const num = i + 1;
          const isActive = num === step;
          const isDone = num < step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                    isActive || isDone
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "bg-white border-gray-200 text-gray-400"
                  )}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : num}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium hidden sm:block",
                    isActive ? "text-gray-900" : isDone ? "text-brand-600" : "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < POST_STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    isDone ? "bg-brand-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: What */}
      {step === 1 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              What type of job is this?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Select the category that best describes your project.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORY_OPTIONS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => update("category", label)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-colors",
                    form.category === label
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-border bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <Card>
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Describe your project
              </h2>
              <p className="text-sm text-gray-500">
                More detail helps contractors give you accurate estimates.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Title
                </label>
                <Input
                  placeholder="e.g., Kitchen Remodel — Full Gut"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <Textarea
                  placeholder="Describe the scope of work, any specific requirements, current conditions, etc."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Photos <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="h-7 w-7 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">
                    Drag photos here or click to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, HEIC up to 10MB each</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When do you need this done?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIMELINE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("timeline", opt.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors text-left",
                        form.timeline === opt.value
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : "border-border bg-white text-gray-600 hover:border-gray-300"
                      )}
                    >
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Post (Budget + Urgency + Review) */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  Budget &amp; Urgency
                </h2>
                <p className="text-sm text-gray-500">
                  Set a budget range and how quickly you need this done.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Budget Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Minimum</p>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="5,000"
                        value={form.budgetMin}
                        onChange={(e) => update("budgetMin", e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Maximum</p>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="15,000"
                        value={form.budgetMax}
                        onChange={(e) => update("budgetMax", e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <div className="space-y-2">
                  {URGENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("urgency", opt.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-colors",
                        form.urgency === opt.value
                          ? opt.color + " border-current"
                          : "border-border bg-white text-gray-600 hover:border-gray-300"
                      )}
                    >
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-xs opacity-80">{opt.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review summary */}
          {form.budgetMin && form.budgetMax && form.urgency && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Review Your Posting</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Category</span>
                    <Badge variant="secondary">{form.category}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Title</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">{form.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Timeline</span>
                    <span className="font-medium text-gray-900">
                      {TIMELINE_OPTIONS.find((t) => t.value === form.timeline)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(Number(form.budgetMin))} – {formatCurrency(Number(form.budgetMax))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Urgency</span>
                    <span className="font-medium text-gray-900 capitalize">{form.urgency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => {
            // Post to Elixir real-time backend
            api.postJob({
              title: form.title,
              description: form.description,
              category: form.category.toLowerCase(),
              budget_min: parseInt(form.budgetMin) || 0,
              budget_max: parseInt(form.budgetMax) || 0,
              location: "Texas",
              homeowner: "You",
            }).catch(() => {});
            setSubmitted(true);
          }} disabled={!canAdvance()}>
            Post Job
          </Button>
        )}
      </div>
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
    coverLetter: "We've completed over 40 kitchen remodels in the Austin area and this project is right in our wheelhouse. Our crew handles everything in-house — demo, framing, cabinet install, and finish work — which keeps your timeline tight and eliminates subcontractor delays. We pull our own permits and our licensed plumber and electrician are on staff. We'd love to walk the space before finalizing.",
    status: "pending", submittedDate: "2026-03-16",
  },
  {
    id: "b2", jobId: "j1", contractorId: "c3", amount: 41200, timeline: "6 weeks",
    coverLetter: "My team has handled the plumbing rough-in on 30+ kitchen remodels. I can coordinate directly with a trusted GC I work with regularly to handle the full scope as a combined bid. The gas line relocation you mentioned is straightforward — we've done that same move in older Austin homes many times.",
    status: "pending", submittedDate: "2026-03-17",
  },
  {
    id: "b3", jobId: "j1", contractorId: "c6", amount: 36900, timeline: "4.5 weeks",
    coverLetter: "We specialize in kitchen and bathroom remodels and have installed the exact Calacatta Laza quartz you've selected on three recent projects. We work clean, protect adjacent spaces daily, and provide a daily job summary.",
    status: "declined", submittedDate: "2026-03-16",
  },
  {
    id: "b4", jobId: "j1", contractorId: "c5", amount: 34750, timeline: "5.5 weeks",
    coverLetter: "While painting is our core trade, we manage full remodel scopes using our trusted subcontractor network. Our project manager coordinates all subs, and you'd have one point of contact throughout.",
    status: "pending", submittedDate: "2026-03-18",
  },
  {
    id: "b5", jobId: "j2", contractorId: "c2", amount: 4850, timeline: "2 days",
    coverLetter: "Panel upgrades and EV charger installs are my primary focus. I'm Oncor-approved and have done over 60 panel replacements in the Dallas area this year alone. I'll handle the utility coordination and pull the city permit.",
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

const JOBS = mockJobs.slice(0, 3);

// ─── Bid Dialog ────────────────────────────────────────────────────────────────

interface BidDialogProps {
  bid: Bid;
  open: boolean;
  onClose: () => void;
  onAccept: (bidId: string) => void;
  onDecline: (bidId: string) => void;
}

function BidDialog({ bid, open, onClose, onAccept, onDecline }: BidDialogProps) {
  const contractor = mockContractors.find((c) => c.id === bid.contractorId);
  if (!contractor) return null;

  const contractorReviews = mockReviews
    .filter((r) => r.authorName === contractor.name || r.role === "contractor")
    .slice(0, 2);

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
          {contractor.verified && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2.5 py-0.5">
              <Shield className="h-3 w-3" /> Verified
            </span>
          )}
          {contractor.licensed && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">
              <Shield className="h-3 w-3" /> Licensed
            </span>
          )}
          {contractor.insured && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-2.5 py-0.5">
              <Shield className="h-3 w-3" /> Insured
            </span>
          )}
        </div>

        <Separator className="mx-6 mt-4" />

        <div className="grid grid-cols-3 gap-3 px-6 mt-4">
          <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-center">
            <DollarSign className="h-4 w-4 text-brand-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-0.5">Bid Amount</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(bid.amount)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
            <Clock className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-0.5">Timeline</p>
            <p className="text-lg font-bold text-gray-900">{bid.timeline}</p>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
            <CalendarDays className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-0.5">Submitted</p>
            <p className="text-sm font-bold text-gray-900">{formatDate(bid.submittedDate)}</p>
          </div>
        </div>

        <div className="px-6 mt-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cover Letter</p>
          <p className="text-sm text-gray-700 leading-relaxed">{bid.coverLetter}</p>
        </div>

        <Separator className="mx-6 mt-5" />

        <div className="px-6 mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contractor Stats</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-gray-200 p-3">
              <Briefcase className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{contractor.jobsCompleted}</p>
              <p className="text-xs text-gray-500">Jobs Done</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <Clock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{contractor.yearsExperience}</p>
              <p className="text-xs text-gray-500">Years Exp.</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <DollarSign className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">${contractor.hourlyRate}</p>
              <p className="text-xs text-gray-500">Per Hour</p>
            </div>
          </div>
        </div>

        <div className="px-6 mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About</p>
          <p className="text-sm text-gray-600 leading-relaxed">{contractor.bio}</p>
        </div>

        {contractorReviews.length > 0 && (
          <>
            <Separator className="mx-6 mt-5" />
            <div className="px-6 mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Reviews</p>
              <div className="space-y-3">
                {contractorReviews.map((review) => (
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
          </>
        )}

        <div className="flex items-center gap-3 px-6 py-5 mt-2 border-t border-border">
          {isAccepted ? (
            <>
              <Button className="flex-1 gap-2" variant="outline">
                <MessageSquare className="h-4 w-4" />
                Message Contractor
              </Button>
              <div className="flex items-center gap-1.5 text-sm text-brand-600 font-semibold">
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

// ─── Bid Card ─────────────────────────────────────────────────────────────────

interface BidCardProps {
  bid: Bid;
  onViewFull: () => void;
}

function BidCard({ bid, onViewFull }: BidCardProps) {
  const contractor = mockContractors.find((c) => c.id === bid.contractorId);
  if (!contractor) return null;

  const statusColors: Record<BidStatus, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-brand-50 text-brand-700 border-brand-200",
    declined: "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white text-sm font-bold",
          avatarColor(contractor.id)
        )}
      >
        {getInitials(contractor.name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{contractor.name}</p>
            <p className="text-xs text-gray-500">{contractor.company}</p>
          </div>
          <span
            className={cn(
              "flex-shrink-0 text-xs font-medium border rounded-full px-2.5 py-0.5 capitalize",
              statusColors[bid.status]
            )}
          >
            {bid.status}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1.5">
          <StarRating rating={contractor.rating} />
          <span className="text-xs font-medium text-gray-700">{contractor.rating}</span>
          <span className="text-xs text-gray-400">({contractor.reviewCount})</span>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <DollarSign className="h-3 w-3 text-brand-600" />
            <span className="font-semibold text-gray-900">{formatCurrency(bid.amount)}</span>
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

      <Button size="sm" variant="outline" onClick={onViewFull} className="flex-shrink-0">
        View
      </Button>
    </div>
  );
}

// ─── Job Section (for Bids tab) ───────────────────────────────────────────────

function JobSection({
  jobId,
  bids,
  bidStatuses,
  onViewBid,
}: {
  jobId: string;
  bids: Bid[];
  bidStatuses: Record<string, BidStatus>;
  onViewBid: (bid: Bid) => void;
}) {
  const job = JOBS.find((j) => j.id === jobId);
  const [expanded, setExpanded] = useState(true);
  if (!job) return null;

  const effectiveBids = bids.map((b) => ({ ...b, status: bidStatuses[b.id] ?? b.status }));

  return (
    <Card>
      <div
        className="flex items-start justify-between gap-4 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
            <Badge variant="secondary" className="text-xs">{job.category}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span>Posted {formatDate(job.postedDate)}</span>
            <span>{formatCurrency(job.budget.min)} – {formatCurrency(job.budget.max)}</span>
            <span className="font-medium text-gray-700">
              {effectiveBids.length} bid{effectiveBids.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-400">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {expanded && (
        <CardContent className="pt-0 px-5 pb-5 space-y-3">
          {effectiveBids.map((bid) => (
            <BidCard key={bid.id} bid={bid} onViewFull={() => onViewBid(bid)} />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Bids Tab ─────────────────────────────────────────────────────────────────

function BidsTab() {
  const [bidStatuses, setBidStatuses] = useState<Record<string, BidStatus>>(() => {
    const initial: Record<string, BidStatus> = {};
    MOCK_BIDS.forEach((b) => { initial[b.id] = b.status; });
    return initial;
  });
  const [activeBid, setActiveBid] = useState<Bid | null>(null);

  const handleAccept = (bidId: string) => setBidStatuses((prev) => ({ ...prev, [bidId]: "accepted" }));
  const handleDecline = (bidId: string) => setBidStatuses((prev) => ({ ...prev, [bidId]: "declined" }));

  const pendingBids = MOCK_BIDS.filter((b) => bidStatuses[b.id] === "pending");
  const acceptedBids = MOCK_BIDS.filter((b) => bidStatuses[b.id] === "accepted");
  const declinedBids = MOCK_BIDS.filter((b) => bidStatuses[b.id] === "declined");

  const groupByJob = (filter: (b: Bid) => boolean) =>
    JOBS.map((job) => ({
      jobId: job.id,
      bids: MOCK_BIDS.filter((b) => b.jobId === job.id && filter(b)),
    })).filter((g) => g.bids.length > 0);

  const effectiveActiveBid = activeBid
    ? { ...activeBid, status: bidStatuses[activeBid.id] }
    : null;

  return (
    <>
      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Active
            {pendingBids.length > 0 && (
              <span className="ml-1.5 text-xs bg-brand-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                {pendingBids.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({acceptedBids.length})</TabsTrigger>
          <TabsTrigger value="declined">Declined ({declinedBids.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {groupByJob((b) => bidStatuses[b.id] === "pending").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No pending bids</p>
              <p className="text-xs text-gray-400 mt-1">All bids have been reviewed.</p>
            </div>
          ) : (
            groupByJob((b) => bidStatuses[b.id] === "pending").map((group) => (
              <JobSection
                key={group.jobId}
                jobId={group.jobId}
                bids={group.bids}
                bidStatuses={bidStatuses}
                onViewBid={setActiveBid}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {groupByJob((b) => bidStatuses[b.id] === "accepted").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No accepted bids yet</p>
            </div>
          ) : (
            groupByJob((b) => bidStatuses[b.id] === "accepted").map((group) => (
              <JobSection
                key={group.jobId}
                jobId={group.jobId}
                bids={group.bids}
                bidStatuses={bidStatuses}
                onViewBid={setActiveBid}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="declined" className="space-y-4">
          {groupByJob((b) => bidStatuses[b.id] === "declined").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <XCircle className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No declined bids</p>
            </div>
          ) : (
            groupByJob((b) => bidStatuses[b.id] === "declined").map((group) => (
              <JobSection
                key={group.jobId}
                jobId={group.jobId}
                bids={group.bids}
                bidStatuses={bidStatuses}
                onViewBid={setActiveBid}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {effectiveActiveBid && (
        <BidDialog
          bid={effectiveActiveBid as Bid}
          open={!!activeBid}
          onClose={() => setActiveBid(null)}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
    </>
  );
}

// ─── My Jobs Tab ──────────────────────────────────────────────────────────────

function MyJobsTab({ onSwitchToBids }: { onSwitchToBids: () => void }) {
  return (
    <div className="space-y-4">
      {JOBS.map((job) => {
        const bidCount = MOCK_BIDS.filter((b) => b.jobId === job.id).length;
        const pendingCount = MOCK_BIDS.filter((b) => b.jobId === job.id && b.status === "pending").length;
        return (
          <Card key={job.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <Badge variant="secondary" className="text-xs">{job.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Posted {formatDate(job.postedDate)}</span>
                    <span>{formatCurrency(job.budget.min)} – {formatCurrency(job.budget.max)}</span>
                    <span className="font-semibold text-brand-600">{bidCount} bid{bidCount !== 1 ? "s" : ""}</span>
                    {pendingCount > 0 && (
                      <span className="text-amber-600 font-medium">{pendingCount} pending</span>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={onSwitchToBids}>
                  View Bids
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Compare Tab ──────────────────────────────────────────────────────────────

interface CompareBid {
  id: string;
  jobId: string;
  jobLabel: string;
  contractorId: string;
  amount: number;
  timeline: string;
  coverLetter: string;
}

const COMPARE_JOBS = [
  { id: "j1", label: "Kitchen Remodel - Full Gut" },
  { id: "j2", label: "Electrical Panel Upgrade + EV Charger" },
  { id: "j3", label: "Master Bathroom Full Renovation" },
];

const COMPARE_BIDS: CompareBid[] = [
  { id: "b1", jobId: "j1", jobLabel: "Kitchen Remodel - Full Gut", contractorId: "c1", amount: 38500, timeline: "5 weeks", coverLetter: "We've completed over 40 kitchen remodels in the Austin area and this project is right in our wheelhouse. Our crew handles everything in-house — demo, framing, cabinet install, and finish work." },
  { id: "b2", jobId: "j1", jobLabel: "Kitchen Remodel - Full Gut", contractorId: "c3", amount: 41200, timeline: "6 weeks", coverLetter: "My team has handled the plumbing rough-in on 30+ kitchen remodels. I coordinate directly with a trusted GC to handle the full scope as a combined bid." },
  { id: "b3", jobId: "j1", jobLabel: "Kitchen Remodel - Full Gut", contractorId: "c6", amount: 36900, timeline: "4.5 weeks", coverLetter: "We specialize in kitchen and bathroom remodels and have installed the exact Calacatta Laza quartz you selected on three recent projects. We work clean and provide daily summaries." },
  { id: "b4", jobId: "j1", jobLabel: "Kitchen Remodel - Full Gut", contractorId: "c5", amount: 34750, timeline: "5.5 weeks", coverLetter: "While painting is our core trade, we manage full remodel scopes using our trusted subcontractor network. One point of contact throughout." },
  { id: "b5", jobId: "j2", jobLabel: "Electrical Panel Upgrade + EV Charger", contractorId: "c2", amount: 4850, timeline: "2 days", coverLetter: "Panel upgrades and EV charger installs are my primary focus. I'm Oncor-approved and have done over 60 panel replacements in Dallas this year." },
  { id: "b6", jobId: "j2", jobLabel: "Electrical Panel Upgrade + EV Charger", contractorId: "c1", amount: 5400, timeline: "3 days", coverLetter: "Licensed master electrician on staff. Fully insured with $2M GL and workers comp. All work NEC 2023 standard, first-attempt city inspection guaranteed." },
  { id: "b7", jobId: "j3", jobLabel: "Master Bathroom Full Renovation", contractorId: "c3", amount: 26400, timeline: "4 weeks", coverLetter: "Licensed master plumber with 20 years in San Antonio. Schluter-certified, KERDI waterproofing on 80+ walk-in shower builds." },
  { id: "b8", jobId: "j3", jobLabel: "Master Bathroom Full Renovation", contractorId: "c2", amount: 28900, timeline: "5 weeks", coverLetter: "Full bathroom remodel scope including electrical rough-in for heated floor and exhaust fan. Licensed plumber and certified tile installer on regular crew." },
  { id: "b9", jobId: "j3", jobLabel: "Master Bathroom Full Renovation", contractorId: "c4", amount: 24100, timeline: "3.5 weeks", coverLetter: "Full remodel division alongside our roofing operation. Licensed plumber sub with own insurance. 15 full bathroom remodels in Alamo Heights in two years." },
];

interface ScoredBid {
  bid: CompareBid;
  score: number;
  breakdown: { label: string; pts: number }[];
}

function scoreBids(bids: CompareBid[]): ScoredBid[] {
  const amounts = bids.map((b) => b.amount);
  const minAmt = Math.min(...amounts);
  const maxAmt = Math.max(...amounts);

  return bids.map((bid) => {
    const contractor = mockContractors.find((c) => c.id === bid.contractorId)!;
    const breakdown: { label: string; pts: number }[] = [];
    const priceRange = maxAmt - minAmt || 1;
    breakdown.push({ label: "Price", pts: Math.round(((maxAmt - bid.amount) / priceRange) * 35) });
    breakdown.push({ label: "Rating", pts: Math.round(((contractor.rating - 4.0) / 1.0) * 30) });
    breakdown.push({ label: "Experience", pts: Math.min(Math.round((contractor.yearsExperience / 20) * 20), 20) });
    breakdown.push({ label: "Trust", pts: (contractor.verified ? 5 : 0) + (contractor.licensed ? 5 : 0) + (contractor.insured ? 5 : 0) });
    return { bid, score: breakdown.reduce((s, b) => s + b.pts, 0), breakdown };
  });
}

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="h-4 w-4 mx-auto text-brand-600" />
  ) : (
    <XCircle className="h-4 w-4 mx-auto text-gray-300" />
  );
}

function CompareTab() {
  const [selectedJobId, setSelectedJobId] = useState("j1");
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedJob = COMPARE_JOBS.find((j) => j.id === selectedJobId)!;
  const jobBids = COMPARE_BIDS.filter((b) => b.jobId === selectedJobId);
  const scored = scoreBids(jobBids).sort((a, b) => b.score - a.score);
  const topScore = scored[0];

  const amounts = jobBids.map((b) => b.amount);
  const minAmt = Math.min(...amounts);
  const maxAmt = Math.max(...amounts);
  const allRatings = jobBids.map((b) => mockContractors.find((c) => c.id === b.contractorId)!.rating);
  const maxRating = Math.max(...allRatings);
  const allExp = jobBids.map((b) => mockContractors.find((c) => c.id === b.contractorId)!.yearsExperience);
  const maxExp = Math.max(...allExp);

  const TABLE_ROWS: { label: string; render: (bid: CompareBid) => React.ReactNode }[] = [
    {
      label: "Rating",
      render: (bid) => {
        const c = mockContractors.find((x) => x.id === bid.contractorId)!;
        return (
          <div className="flex flex-col items-center gap-1">
            <StarRatingSmall rating={c.rating} />
            <span className={cn("text-sm font-bold", c.rating === maxRating ? "text-brand-600" : "text-gray-700")}>{c.rating}</span>
          </div>
        );
      },
    },
    {
      label: "Bid Amount",
      render: (bid) => (
        <span className={cn("text-sm font-bold", bid.amount === minAmt ? "text-brand-600" : "text-gray-700")}>
          {formatCurrency(bid.amount)}
        </span>
      ),
    },
    {
      label: "Timeline",
      render: (bid) => {
        const weeks = parseFloat(bid.timeline);
        const allWeeks = jobBids.map((b) => parseFloat(b.timeline));
        const fastest = Math.min(...allWeeks);
        return (
          <span className={cn("text-sm font-semibold", weeks === fastest ? "text-brand-600" : "text-gray-700")}>
            {bid.timeline}
          </span>
        );
      },
    },
    {
      label: "Experience",
      render: (bid) => {
        const c = mockContractors.find((x) => x.id === bid.contractorId)!;
        return (
          <span className={cn("text-sm font-bold", c.yearsExperience === maxExp ? "text-brand-600" : "text-gray-700")}>
            {c.yearsExperience} yrs
          </span>
        );
      },
    },
    {
      label: "Licensed",
      render: (bid) => <BoolCell value={mockContractors.find((x) => x.id === bid.contractorId)!.licensed} />,
    },
    {
      label: "Insured",
      render: (bid) => <BoolCell value={mockContractors.find((x) => x.id === bid.contractorId)!.insured} />,
    },
    {
      label: "Verified",
      render: (bid) => <BoolCell value={mockContractors.find((x) => x.id === bid.contractorId)!.verified} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Job selector */}
      <div className="relative inline-block">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition-colors"
        >
          <Scale className="h-4 w-4 text-brand-600" />
          {selectedJob.label}
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>
        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-72 py-1">
            {COMPARE_JOBS.map((job) => (
              <button
                key={job.id}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                  job.id === selectedJobId ? "text-brand-600 font-semibold" : "text-gray-700"
                )}
                onClick={() => { setSelectedJobId(job.id); setDropdownOpen(false); setAcceptedId(null); }}
              >
                {job.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comparison table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-32 bg-gray-50 border-r border-gray-100 px-4 py-4" />
                {scored.map(({ bid, score }, idx) => {
                  const contractor = mockContractors.find((c) => c.id === bid.contractorId)!;
                  const isTop = idx === 0;
                  return (
                    <th key={bid.id} className={cn("text-center px-4 py-4 min-w-[160px]", isTop && "bg-brand-50")}>
                      <div className="flex flex-col items-center gap-2">
                        {isTop && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-100 rounded-full px-2 py-0.5 uppercase tracking-wide">
                            <Award className="h-3 w-3" />
                            Best Match
                          </span>
                        )}
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-full text-white text-sm font-bold",
                            avatarColor(contractor.id)
                          )}
                        >
                          {getInitials(contractor.name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{contractor.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{contractor.company}</p>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map((row, ri) => (
                <tr key={row.label} className={cn("border-b border-gray-100 last:border-0", ri % 2 === 0 ? "bg-white" : "bg-gray-50/50")}>
                  <td className="border-r border-gray-100 px-4 py-3 bg-gray-50">
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
                <td className="border-r border-gray-100 px-4 py-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</span>
                </td>
                {scored.map(({ bid }, idx) => (
                  <td key={bid.id} className={cn("text-center px-4 py-4", idx === 0 && "bg-brand-50/40")}>
                    {acceptedId === bid.id ? (
                      <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Accepted
                      </div>
                    ) : acceptedId !== null ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <Button
                        size="sm"
                        variant={idx === 0 ? "default" : "outline"}
                        className="w-full max-w-[130px]"
                        onClick={() => setAcceptedId(bid.id)}
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
      </Card>

      {/* Recommendation */}
      {topScore && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <Award className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">Our Recommendation</p>
                {(() => {
                  const rec = mockContractors.find((c) => c.id === topScore.bid.contractorId)!;
                  const second = scored[1] ? mockContractors.find((c) => c.id === scored[1].bid.contractorId)! : null;
                  const savingsVsAvg = amounts.reduce((s, a) => s + a, 0) / amounts.length - topScore.bid.amount;
                  return (
                    <>
                      <h3 className="text-base font-bold text-gray-900">{rec.name} — {rec.company}</h3>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {rec.name} scores highest with a{" "}
                        <span className="font-semibold text-gray-900">{topScore.score}/100</span> composite rating.
                        Their <span className="font-semibold text-gray-900">{formatCurrency(topScore.bid.amount)}</span> bid is{" "}
                        {savingsVsAvg > 0 ? (
                          <span className="font-semibold text-brand-600">{formatCurrency(Math.round(savingsVsAvg))} below average</span>
                        ) : (
                          <span className="font-semibold text-gray-900">near the field average</span>
                        )}{" "}
                        with a <span className="font-semibold text-gray-900">{rec.rating}-star</span> rating across {rec.reviewCount} reviews.
                        {second && scored[1].score >= topScore.score - 10
                          ? ` ${second.name} is a close second worth considering.`
                          : ""}
                      </p>
                      <div className="flex items-center gap-4 mt-4 flex-wrap">
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
                    </>
                  );
                })()}
              </div>
              {acceptedId === null && (
                <Button className="flex-shrink-0" onClick={() => setAcceptedId(topScore.bid.id)}>
                  Accept Top Pick
                </Button>
              )}
              {acceptedId === topScore.bid.id && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                  Accepted
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState("post");

  return (
    <div className="p-8">
      <AppHeader
        title="Jobs"
        subtitle="Post jobs, review bids, and compare contractors."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="post">Post a Job</TabsTrigger>
          <TabsTrigger value="myjobs">My Jobs</TabsTrigger>
          <TabsTrigger value="bids">Bids</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="post">
          <PostJobTab />
        </TabsContent>

        <TabsContent value="myjobs">
          <MyJobsTab onSwitchToBids={() => setActiveTab("bids")} />
        </TabsContent>

        <TabsContent value="bids">
          <BidsTab />
        </TabsContent>

        <TabsContent value="compare">
          <CompareTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
