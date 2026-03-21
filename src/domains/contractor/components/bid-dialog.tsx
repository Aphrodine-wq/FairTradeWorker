"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@shared/ui/dialog";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { type Job } from "@shared/lib/mock-data";
import { formatCurrency, cn } from "@shared/lib/utils";

const TIMELINE_OPTIONS = [
  { value: "1-week", label: "1 week" },
  { value: "2-weeks", label: "2 weeks" },
  { value: "1-month", label: "1 month" },
  { value: "2-months", label: "2 months" },
  { value: "3-months", label: "3 months" },
];

interface BidDialogProps {
  job: Job;
  trigger: React.ReactNode;
}

export function BidDialog({ job, trigger }: BidDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [bidAmount, setBidAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [qualificationsChecked, setQualificationsChecked] = useState(false);
  const [tosChecked, setTosChecked] = useState(false);

  const canSubmit =
    bidAmount.trim() !== "" &&
    timeline !== "" &&
    coverLetter.trim() !== "" &&
    startDate !== "" &&
    qualificationsChecked &&
    tosChecked;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      // Reset on close
      setTimeout(() => {
        setSubmitted(false);
        setBidAmount("");
        setTimeline("");
        setCoverLetter("");
        setStartDate("");
        setQualificationsChecked(false);
        setTosChecked(false);
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-lg">
        {submitted ? (
          // ── Success State ──
          <div className="flex flex-col items-center text-center py-8 px-4">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Bid Submitted
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              You&apos;ll be notified when the homeowner responds. In the meantime,
              you can message them directly through your inbox.
            </p>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="w-full max-w-xs"
            >
              Close
            </Button>
          </div>
        ) : (
          // ── Bid Form ──
          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-lg font-bold text-gray-900">
                Submit a Bid
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                {job.title}
              </DialogDescription>
              {/* Budget reference */}
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-fit">
                <span className="text-xs text-gray-500 font-medium">
                  Homeowner budget:
                </span>
                <span className="text-sm font-bold text-gray-900 tabular-nums">
                  {formatCurrency(job.budget.min)} &ndash;{" "}
                  {formatCurrency(job.budget.max)}
                </span>
              </div>
            </DialogHeader>

            <div className="py-5 space-y-5">
              {/* Bid Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Your Bid Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-base">
                    $
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="0"
                    className="pl-7 text-lg font-bold h-12"
                    required
                  />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Estimated Timeline
                </label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  required
                  className={cn(
                    "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-0",
                    "text-gray-900"
                  )}
                >
                  <option value="" disabled>
                    Select a timeline...
                  </option>
                  {TIMELINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Start Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Availability Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Cover Letter
                </label>
                <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why you're the right contractor for this job — relevant experience, approach, what sets you apart..."
                  className="min-h-[110px] resize-none text-sm leading-relaxed"
                  required
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={qualificationsChecked}
                    onChange={(e) =>
                      setQualificationsChecked(e.target.checked)
                    }
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 leading-snug">
                    I have read the job requirements and can meet all listed
                    qualifications
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={tosChecked}
                    onChange={(e) => setTosChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 leading-snug">
                    I agree to FairTradeWorker{" "}
                    <a
                      href="#"
                      className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
                    >
                      terms of service
                    </a>
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button
                type="submit"
                disabled={!canSubmit}
                className="flex-1"
              >
                Submit Bid
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
