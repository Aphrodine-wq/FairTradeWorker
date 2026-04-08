"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Building2,
  FileText,
  Shield,
  MapPin,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

const STEPS = [
  { key: "business", label: "Business Info", icon: Building2 },
  { key: "licenses", label: "Licenses", icon: FileText },
  { key: "insurance", label: "Insurance", icon: Shield },
  { key: "service-area", label: "Service Area", icon: MapPin },
] as const;

export default function OnboardingPage() {
  usePageTitle("Get Started");
  const router = useRouter();
  const [step, setStep] = useState(0);

  const current = STEPS[step];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                  i < step
                    ? "bg-[#059669] text-white"
                    : i === step
                      ? "bg-[#0F1419] text-white"
                      : "bg-gray-200 text-gray-500"
                )}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1",
                    i < step ? "bg-[#059669]" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#0F1419]">
            {current.label}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 0 && "Tell us about your business."}
            {step === 1 && "Add your contractor licenses."}
            {step === 2 && "Upload proof of insurance."}
            {step === 3 && "Set your service area."}
          </p>
        </div>

        {/* Placeholder */}
        <div className="bg-white border border-gray-200 rounded-sm p-6 mb-6">
          <div className="flex items-center justify-center py-12 text-gray-400">
            <current.icon className="w-12 h-12" />
          </div>
          <p className="text-center text-sm text-gray-500">
            Onboarding form coming soon.
          </p>
        </div>

        {/* Nav */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            className="rounded-sm"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              className="bg-[#059669] hover:bg-[#047857] text-white rounded-sm"
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="bg-[#059669] hover:bg-[#047857] text-white rounded-sm"
              onClick={() => router.push("/contractor/dashboard")}
            >
              Finish Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
