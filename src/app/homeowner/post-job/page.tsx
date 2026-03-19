"use client";

import { useState } from "react";
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
} from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

// Map job categories to icons
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

const STEPS = ["Job Type", "Details", "Budget", "Review & Post"];

interface FormData {
  category: string;
  title: string;
  description: string;
  timeline: string;
  budgetMin: string;
  budgetMax: string;
  urgency: string;
}

const EMPTY_FORM: FormData = {
  category: "",
  title: "",
  description: "",
  timeline: "",
  budgetMin: "",
  budgetMax: "",
  urgency: "",
};

export default function PostJobPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 1) return !!form.category;
    if (step === 2) return !!form.title && !!form.description && !!form.timeline;
    if (step === 3) return !!form.budgetMin && !!form.budgetMax && !!form.urgency;
    return true;
  }

  function handlePost() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="text-center py-16">
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
            <Button asChild>
              <a href="/homeowner/dashboard">Back to Dashboard</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <AppHeader
        title="Post a Job"
        subtitle="Describe your project and get estimates from verified contractors."
      />

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 max-w-2xl">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const isActive = num === step;
          const isDone = num < step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                    isActive
                      ? "bg-brand-600 border-brand-600 text-white"
                      : isDone
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
              {i < STEPS.length - 1 && (
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

      <div className="max-w-2xl">
        {/* Step 1: Job Type */}
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
                    rows={5}
                  />
                </div>

                {/* Photo upload zone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Photos <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500">
                      Drag photos here or click to upload
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, HEIC up to 10MB each
                    </p>
                  </div>
                </div>

                {/* Timeline */}
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

        {/* Step 3: Budget */}
        {step === 3 && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  Budget & Urgency
                </h2>
                <p className="text-sm text-gray-500">
                  Set a budget range and how quickly you need this done.
                </p>
              </div>

              <div className="space-y-5">
                {/* Budget range */}
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

                {/* Urgency */}
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Post */}
        {step === 4 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Review Your Job Posting
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Confirm everything looks right before posting.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-surface rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Job Type
                    </p>
                    <button
                      className="text-xs text-brand-600 hover:underline"
                      onClick={() => setStep(1)}
                    >
                      Edit
                    </button>
                  </div>
                  <Badge variant="secondary">{form.category}</Badge>
                </div>

                <div className="p-4 bg-surface rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Details
                    </p>
                    <button
                      className="text-xs text-brand-600 hover:underline"
                      onClick={() => setStep(2)}
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{form.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-3">{form.description}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {TIMELINE_OPTIONS.find((t) => t.value === form.timeline)?.label}
                  </div>
                </div>

                <div className="p-4 bg-surface rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Budget & Urgency
                    </p>
                    <button
                      className="text-xs text-brand-600 hover:underline"
                      onClick={() => setStep(3)}
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Budget Range</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(Number(form.budgetMin))} –{" "}
                        {formatCurrency(Number(form.budgetMax))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Urgency</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {form.urgency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-5">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handlePost} disabled={!canAdvance()}>
              Post Job
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
