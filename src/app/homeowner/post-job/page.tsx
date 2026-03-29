"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Home,
  Building2,
  Factory,
  Clock,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Input } from "@shared/ui/input";
import { Badge } from "@shared/ui/badge";
import { cn } from "@shared/lib/utils";
import { JOB_CATEGORIES } from "@shared/lib/constants";
import { authStore } from "@shared/lib/auth-store";
import { api } from "@shared/lib/realtime";
import { track } from "@shared/lib/analytics";
import { toast } from "sonner";
import { usePageTitle } from "@shared/hooks/use-page-title";

type Step = 1 | 2 | 3 | 4;

const URGENCY_OPTIONS = [
  { value: "LOW", label: "Flexible", desc: "No rush — within a few weeks", icon: Clock },
  { value: "MEDIUM", label: "Standard", desc: "Within 1-2 weeks", icon: Calendar },
  { value: "HIGH", label: "Urgent", desc: "As soon as possible", icon: AlertTriangle },
] as const;

const PROPERTY_TYPES = [
  { value: "RESIDENTIAL", label: "Residential", icon: Home },
  { value: "COMMERCIAL", label: "Commercial", icon: Building2 },
  { value: "INDUSTRIAL", label: "Industrial", icon: Factory },
] as const;

interface JobForm {
  title: string;
  category: string;
  description: string;
  detailedScope: string;
  location: string;
  fullAddress: string;
  budgetMin: string;
  budgetMax: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  propertyType: "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL";
  sqft: string;
  yearBuilt: string;
  deadline: string;
  preferredStartDate: string;
  estimatedDuration: string;
  accessNotes: string;
  specialInstructions: string;
  materialsProvided: boolean;
  permitsRequired: boolean;
  inspectionRequired: boolean;
  insuranceClaim: boolean;
}

const INITIAL_FORM: JobForm = {
  title: "",
  category: "",
  description: "",
  detailedScope: "",
  location: "",
  fullAddress: "",
  budgetMin: "",
  budgetMax: "",
  urgency: "MEDIUM",
  propertyType: "RESIDENTIAL",
  sqft: "",
  yearBuilt: "",
  deadline: "",
  preferredStartDate: "",
  estimatedDuration: "",
  accessNotes: "",
  specialInstructions: "",
  materialsProvided: false,
  permitsRequired: false,
  inspectionRequired: false,
  insuranceClaim: false,
};

export default function PostJobPage() {
  usePageTitle("Post a Job");
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<JobForm>(INITIAL_FORM);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof JobForm>(key: K, value: JobForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canAdvance = (): boolean => {
    if (step === 1) return !!form.title && !!form.category && !!form.description;
    if (step === 2) return !!form.location;
    if (step === 3) return true;
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    try {
      // Post job via Elixir backend (realtime API)
      const job = await api.postJob({
        title: form.title || `${form.category} Project`,
        description: form.description,
        category: form.category,
        budget_min: form.budgetMin ? parseFloat(form.budgetMin) : 0,
        budget_max: form.budgetMax ? parseFloat(form.budgetMax) : 0,
        location: form.location || "Texas",
      });

      // Request AI estimate in the background
      api.getAIEstimate(form.description).catch(() => {});

      track("job_posted", { category: form.category });
      toast.success("Job posted successfully");
      router.push("/homeowner/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error("Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos((prev) => [...prev, ...Array.from(e.target.files!)].slice(0, 10));
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => (step > 1 ? setStep((s) => (s - 1) as Step) : router.back())}
          className="w-9 h-9 rounded-none border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-sm text-gray-700">Step {step} of 4</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-none transition-colors",
              s <= step ? "bg-brand-600" : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-none mb-6">
          {error}
        </div>
      )}

      {/* Steps */}
      {step === 1 && (
        <StepBasics form={form} set={set} photos={photos} onPhotoAdd={handlePhotoAdd} onPhotoRemove={removePhoto} />
      )}
      {step === 2 && <StepLocation form={form} set={set} />}
      {step === 3 && <StepDetails form={form} set={set} />}
      {step === 4 && <StepReview form={form} photos={photos} />}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep((s) => (s - 1) as Step)} className="flex-1">
            Back
          </Button>
        )}
        {step < 4 ? (
          <Button
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={!canAdvance()}
            className="flex-1"
          >
            Continue <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting ? "Posting..." : "Post Job"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Step 1: Basics ──────────────────────────────────────────────

function StepBasics({
  form,
  set,
  photos,
  onPhotoAdd,
  onPhotoRemove,
}: {
  form: JobForm;
  set: <K extends keyof JobForm>(key: K, value: JobForm[K]) => void;
  photos: File[];
  onPhotoAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoRemove: (idx: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">What do you need done?</h2>
        <p className="text-sm text-gray-700">Describe the job so contractors can give you accurate bids.</p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => set("category", cat)}
              className={cn(
                "px-3 py-2 text-sm rounded-none border transition-colors text-left",
                form.category === cat
                  ? "border-brand-600 bg-brand-50 text-brand-700 font-medium"
                  : "border-gray-200 text-gray-800 hover:border-gray-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-900">Job title</label>
        <Input
          placeholder="e.g. Kitchen remodel, roof repair, new deck"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-900">Description</label>
        <textarea
          rows={4}
          placeholder="Describe what you need — the more detail, the better the bids you'll get."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="flex w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        />
      </div>

      {/* Photos */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Photos (optional)</label>
        <div className="flex flex-wrap gap-2">
          {photos.map((f, i) => (
            <div key={i} className="relative w-20 h-20 rounded-none bg-gray-100 border border-gray-200 overflow-hidden">
              <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => onPhotoRemove(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-none bg-gray-900/60 text-white flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {photos.length < 10 && (
            <label className="w-20 h-20 rounded-none border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-600 hover:bg-brand-50/50 transition-colors">
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-[10px] text-gray-600 mt-0.5">Add</span>
              <input type="file" accept="image/*" multiple onChange={onPhotoAdd} className="hidden" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Location & Property ─────────────────────────────────

function StepLocation({
  form,
  set,
}: {
  form: JobForm;
  set: <K extends keyof JobForm>(key: K, value: JobForm[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Where is the job?</h2>
        <p className="text-sm text-gray-700">This helps match you with local contractors.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-900">City / Area</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <Input
            className="pl-9"
            placeholder="e.g. Austin, TX"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-900">Full address (optional, shared after bid accepted)</label>
        <Input
          placeholder="123 Main St, Austin, TX 78701"
          value={form.fullAddress}
          onChange={(e) => set("fullAddress", e.target.value)}
        />
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Property type</label>
        <div className="grid grid-cols-3 gap-3">
          {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("propertyType", value)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-4 rounded-none border transition-colors",
                form.propertyType === value
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Square footage</label>
          <Input
            type="number"
            placeholder="2,000"
            value={form.sqft}
            onChange={(e) => set("sqft", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Year built</label>
          <Input
            type="number"
            placeholder="1995"
            value={form.yearBuilt}
            onChange={(e) => set("yearBuilt", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Budget & Timeline ───────────────────────────────────

function StepDetails({
  form,
  set,
}: {
  form: JobForm;
  set: <K extends keyof JobForm>(key: K, value: JobForm[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Budget and timeline</h2>
        <p className="text-sm text-gray-700">Help contractors understand your expectations.</p>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Budget range (optional)</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <Input
              type="number"
              className="pl-9"
              placeholder="Min"
              value={form.budgetMin}
              onChange={(e) => set("budgetMin", e.target.value)}
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <Input
              type="number"
              className="pl-9"
              placeholder="Max"
              value={form.budgetMax}
              onChange={(e) => set("budgetMax", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Urgency */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">How urgent is this?</label>
        <div className="space-y-2">
          {URGENCY_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("urgency", value)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-none border transition-colors text-left",
                form.urgency === value
                  ? "border-brand-600 bg-brand-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Icon className={cn("w-5 h-5", form.urgency === value ? "text-brand-600" : "text-gray-600")} />
              <div>
                <span className={cn("text-sm font-medium", form.urgency === value ? "text-brand-700" : "text-gray-900")}>{label}</span>
                <span className="text-xs text-gray-700 ml-2">{desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Preferred start</label>
          <Input
            type="date"
            value={form.preferredStartDate}
            onChange={(e) => set("preferredStartDate", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Deadline</label>
          <Input
            type="date"
            value={form.deadline}
            onChange={(e) => set("deadline", e.target.value)}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">Additional details</label>
        {[
          { key: "materialsProvided" as const, label: "I'll provide materials" },
          { key: "permitsRequired" as const, label: "Permits required" },
          { key: "inspectionRequired" as const, label: "Inspection required" },
          { key: "insuranceClaim" as const, label: "Insurance claim" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => set(key, !form[key])}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-none border transition-colors text-left text-sm",
              form[key]
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-gray-200 text-gray-800 hover:border-gray-300"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center",
              form[key] ? "border-brand-600 bg-brand-600" : "border-gray-300"
            )}>
              {form[key] && <Check className="w-3 h-3 text-white" />}
            </div>
            {label}
          </button>
        ))}
      </div>

      {/* Special instructions */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-900">Special instructions (optional)</label>
        <textarea
          rows={3}
          placeholder="Access codes, parking info, pet warnings..."
          value={form.specialInstructions}
          onChange={(e) => set("specialInstructions", e.target.value)}
          className="flex w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        />
      </div>
    </div>
  );
}

// ── Step 4: Review ──────────────────────────────────────────────

function StepReview({ form, photos }: { form: JobForm; photos: File[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Review your job</h2>
        <p className="text-sm text-gray-700">Make sure everything looks right before posting.</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">{form.category}</Badge>
            <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
            <p className="text-sm text-gray-800 mt-1">{form.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-800">
              <MapPin className="w-4 h-4 text-gray-600" />
              {form.location}
            </div>
            {form.budgetMin && (
              <div className="flex items-center gap-2 text-gray-800">
                <DollarSign className="w-4 h-4 text-gray-600" />
                ${Number(form.budgetMin).toLocaleString()} – ${Number(form.budgetMax).toLocaleString()}
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-800">
              <FileText className="w-4 h-4 text-gray-600" />
              {form.propertyType.charAt(0) + form.propertyType.slice(1).toLowerCase()}
              {form.sqft && ` / ${Number(form.sqft).toLocaleString()} sqft`}
            </div>
            <div className="flex items-center gap-2 text-gray-800">
              <Clock className="w-4 h-4 text-gray-600" />
              {URGENCY_OPTIONS.find((u) => u.value === form.urgency)?.label} priority
            </div>
          </div>

          {photos.length > 0 && (
            <div className="flex gap-2 pt-2">
              {photos.map((f, i) => (
                <div key={i} className="w-16 h-16 rounded-none bg-gray-100 overflow-hidden">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {(form.materialsProvided || form.permitsRequired || form.inspectionRequired || form.insuranceClaim) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {form.materialsProvided && <Badge variant="outline">Materials provided</Badge>}
              {form.permitsRequired && <Badge variant="outline">Permits needed</Badge>}
              {form.inspectionRequired && <Badge variant="outline">Inspection needed</Badge>}
              {form.insuranceClaim && <Badge variant="outline">Insurance claim</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-700 text-center">
        Once posted, local contractors will see your job and can submit bids.
        You&apos;ll be notified when bids come in.
      </p>
    </div>
  );
}
