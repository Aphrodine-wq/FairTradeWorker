"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Constants ───────────────────────────────────────────────────────────────

const SPECIALTIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Framing / Carpentry",
  "Concrete / Masonry",
  "Drywall",
  "Painting",
  "Flooring",
  "Roofing",
  "Insulation",
  "Tile",
  "Welding",
  "Demolition",
  "Excavation",
];

const SKILLS = [
  "Framing", "Finish Carpentry", "Tile", "Concrete", "Drywall", "Painting",
  "Electrical Rough-in", "Plumbing Rough-in", "HVAC Install", "Roofing",
  "Siding", "Decking", "Foundation", "Demolition", "Insulation",
  "Flooring Install", "Cabinet Install", "Welding", "Excavation",
  "Blueprint Reading", "Code Compliance",
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SubContractorOnboardingPage() {
  usePageTitle("Set Up SubContractor Profile");
  const router = useRouter();

  const [specialty, setSpecialty] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const canSubmit = !!specialty;

  const handleComplete = async () => {
    setSaving(true);
    try {
      // API integration will go here
      router.push("/subcontractor/dashboard");
    } catch {
      router.push("/subcontractor/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Set Up SubContractor Profile</h1>
          <p className="text-sm text-gray-700 mt-1">
            Tell contractors what you do so they can find you for sub jobs.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Specialty */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">Primary specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="flex h-10 w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                <option value="">Select specialty...</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Skills</label>
              <p className="text-xs text-gray-600">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "px-3 py-1.5 rounded-none text-xs font-medium border transition-colors",
                      selectedSkills.includes(skill)
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    )}
                  >
                    {selectedSkills.includes(skill) && <Check className="w-3 h-3 inline mr-1" />}
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">Hourly rate ($)</label>
              <Input
                type="number"
                min="0"
                placeholder="65"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">Bio</label>
              <textarea
                rows={3}
                placeholder="Describe your experience and what makes your work stand out..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="flex w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8">
            <Button
              onClick={handleComplete}
              disabled={!canSubmit || saving}
              className="w-full"
            >
              {saving ? "Saving..." : "Complete Setup"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
