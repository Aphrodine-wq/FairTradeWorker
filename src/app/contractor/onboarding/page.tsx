"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  MapPin,
  FileCheck,
  Shield,
  Briefcase,
  Camera,
  Check,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Input } from "@shared/ui/input";
import { Badge } from "@shared/ui/badge";
import { cn } from "@shared/lib/utils";
import { authStore } from "@shared/lib/auth-store";

const SPECIALTIES = [
  "General Contracting", "Electrical", "Plumbing", "HVAC", "Roofing",
  "Framing / Carpentry", "Concrete / Masonry", "Painting", "Flooring",
  "Landscaping / Excavation", "Drywall", "Insulation", "Windows & Doors",
  "Cabinets & Millwork",
];

const SKILLS = [
  "Framing", "Finish Carpentry", "Tile", "Concrete", "Drywall", "Painting",
  "Electrical Rough-in", "Plumbing Rough-in", "HVAC Install", "Roofing",
  "Siding", "Decking", "Foundation", "Demolition", "Insulation",
  "Flooring Install", "Cabinet Install", "Welding", "Excavation",
  "Project Management", "Blueprint Reading", "Code Compliance",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

type Step = 1 | 2 | 3 | 4;

export default function ContractorOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Business info
  const [company, setCompany] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bio, setBio] = useState("");

  // Step 2: Location & skills
  const [location, setLocation] = useState("");
  const [serviceRadius, setServiceRadius] = useState("50");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Step 3: License
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseState, setLicenseState] = useState("TX");
  const [licenseType, setLicenseType] = useState("General Contractor");

  // Step 4: Insurance
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [coverageType, setCoverageType] = useState("General Liability");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const canAdvance = (): boolean => {
    if (step === 1) return !!company && !!specialty;
    if (step === 2) return !!location;
    return true;
  };

  const handleComplete = async () => {
    setSaving(true);
    const token = authStore.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      // Save profile
      await fetch("/api/contractor/profile", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          company,
          specialty,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          bio,
          location,
          serviceRadius: parseInt(serviceRadius),
          skills: selectedSkills,
        }),
      });

      // Save license if provided
      if (licenseNumber) {
        await fetch("/api/contractor/licenses", {
          method: "POST",
          headers,
          body: JSON.stringify({
            licenseNumber,
            state: licenseState,
            type: licenseType,
          }),
        });
      }

      // Save insurance if provided
      if (insuranceProvider && policyNumber) {
        await fetch("/api/contractor/insurance", {
          method: "POST",
          headers,
          body: JSON.stringify({
            provider: insuranceProvider,
            policyNumber,
            coverageType,
            coverageAmount: coverageAmount ? parseFloat(coverageAmount) : null,
            expirationDate,
          }),
        });
      }

      router.push("/contractor/dashboard");
    } catch {
      // Silently continue — profile is still usable
      router.push("/contractor/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF8] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            The more complete your profile, the more jobs you&apos;ll win.
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                s <= step ? "bg-brand-600" : "bg-gray-200"
              )}
            />
          ))}
        </div>

        <Card className="shadow-md">
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Business</h2>
                  <p className="text-sm text-gray-500">Tell homeowners about your company.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Company name</label>
                  <Input placeholder="Walton Construction LLC" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Primary specialty</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  >
                    <option value="">Select specialty...</option>
                    {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Years experience</label>
                    <Input type="number" min="0" placeholder="5" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Hourly rate ($)</label>
                    <Input type="number" min="0" placeholder="85" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">About your business</label>
                  <textarea
                    rows={3}
                    placeholder="Tell homeowners what makes your work stand out..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Service Area & Skills</h2>
                  <p className="text-sm text-gray-500">Where you work and what you do best.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pl-9" placeholder="Austin, TX" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Service radius (miles)</label>
                  <Input type="number" min="5" max="200" value={serviceRadius} onChange={(e) => setServiceRadius(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Skills (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          selectedSkills.includes(skill)
                            ? "border-brand-600 bg-brand-50 text-brand-700"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                      >
                        {selectedSkills.includes(skill) && <Check className="w-3 h-3 inline mr-1" />}
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">License Verification</h2>
                  <p className="text-sm text-gray-500">Optional but increases your trust score and bid acceptance rate.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">License number</label>
                  <Input placeholder="e.g. R21909" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <select
                      value={licenseState}
                      onChange={(e) => setLicenseState(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                    >
                      {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">License type</label>
                    <Input value={licenseType} onChange={(e) => setLicenseType(e.target.value)} />
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  You can skip this step and add it later from Settings. Licensed contractors get a verified badge.
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Insurance</h2>
                  <p className="text-sm text-gray-500">Homeowners trust insured contractors. Upload your certificate of insurance.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Insurance provider</label>
                  <Input placeholder="State Farm, Progressive, etc." value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Policy number</label>
                    <Input placeholder="GL-123456" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Coverage type</label>
                    <Input value={coverageType} onChange={(e) => setCoverageType(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Coverage amount ($)</label>
                    <Input type="number" placeholder="1000000" value={coverageAmount} onChange={(e) => setCoverageAmount(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Expiration date</label>
                    <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  You can skip this step and add it later from Settings.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep((s) => (s - 1) as Step)} className="flex-1">
                  Back
                </Button>
              )}
              {step < 4 ? (
                <Button onClick={() => setStep((s) => (s + 1) as Step)} disabled={!canAdvance()} className="flex-1">
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Complete Profile"}
                </Button>
              )}
              {step >= 3 && step < 4 && (
                <Button variant="ghost" onClick={() => setStep((s) => (s + 1) as Step)} className="text-gray-400 text-sm">
                  Skip
                </Button>
              )}
              {step === 4 && (
                <Button variant="ghost" onClick={handleComplete} disabled={saving} className="text-gray-400 text-sm">
                  Skip
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
