"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Shield,
  CreditCard,
  Bell,
  User,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  MapPin,
  Briefcase,
  Users,
  Calendar,
  Link2,
  Palette,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Badge } from "@shared/ui/badge";
import { Card, CardContent } from "@shared/ui/card";
import { Separator } from "@shared/ui/separator";
import { mockContractors } from "@shared/lib/mock-data";
import { JOB_CATEGORIES } from "@shared/lib/constants";
import { getInitials, cn } from "@shared/lib/utils";
import { fetchSettings, saveSettings } from "@shared/lib/data";

const contractor = mockContractors[0];

// ─── Shared Components ───────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, description }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative flex-shrink-0 mt-0.5 w-10 h-[22px] rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2", checked ? "bg-brand-600" : "bg-gray-200")}
      >
        <span className={cn("absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200", checked ? "translate-x-[18px]" : "translate-x-0")} />
      </button>
    </div>
  );
}

type VerifyStatus = "verified" | "pending" | "expired";

function VerifyBadge({ status }: { status: VerifyStatus }) {
  if (status === "verified") return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
      <CheckCircle2 className="w-3.5 h-3.5" />Verified
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
      <Clock className="w-3.5 h-3.5" />Pending
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
      <XCircle className="w-3.5 h-3.5" />Expired
    </span>
  );
}

function UploadZone({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center hover:border-brand-400 hover:bg-brand-50/50 transition-colors cursor-pointer">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
        <Upload className="w-4 h-4 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-400">{hint}</p>
      <Button variant="outline" size="sm" className="mt-1">Choose File</Button>
    </div>
  );
}

function SaveBar({ saved, onSave, label = "Save Changes" }: { saved: boolean; onSave: () => void; label?: string }) {
  return (
    <div className="flex justify-end pt-4 border-t border-border">
      <Button onClick={onSave} className="gap-2" variant={saved ? "secondary" : "default"}>
        <Save className="w-4 h-4" />{saved ? "Saved!" : label}
      </Button>
    </div>
  );
}

function useSave() {
  const [saved, setSaved] = useState(false);
  const onSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return { saved, onSave };
}

// ─── Sections ────────────────────────────────────────────────────────────────

function ProfileSection() {
  const [name, setName] = useState(contractor.name);
  const [company, setCompany] = useState(contractor.company);
  const [bio, setBio] = useState(contractor.bio);
  const [specialty, setSpecialty] = useState(contractor.specialty);
  const [location, setLocation] = useState(contractor.location);
  const [phone, setPhone] = useState("(512) 555-0147");
  const [website, setWebsite] = useState("johnsonconstruction.com");
  const [yearsExp, setYearsExp] = useState("12");
  const { saved, onSave } = useSave();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Your public contractor profile shown to homeowners</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-100 border-2 border-brand-200 flex items-center justify-center">
          <span className="text-brand-700 font-bold text-xl">{getInitials(name)}</span>
        </div>
        <div>
          <Button variant="outline" size="sm">Upload Photo</Button>
          <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 2MB</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Company Name</label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Website</label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="yoursite.com" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Primary Specialty</label>
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2">
            {JOB_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Years Experience</label>
          <Input type="number" min="0" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bio</label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px] resize-none text-sm" placeholder="Tell homeowners about your experience..." />
        <p className="text-xs text-gray-400 text-right">{bio.length} / 500</p>
      </div>

      <SaveBar saved={saved} onSave={onSave} />
    </div>
  );
}

function ServiceAreaSection() {
  const [radius, setRadius] = useState("35");
  const [zip, setZip] = useState("78756");
  const [areas, setAreas] = useState(["Austin", "Round Rock", "Cedar Park", "Georgetown", "Pflugerville", "San Marcos"]);
  const [newArea, setNewArea] = useState("");
  const { saved, onSave } = useSave();

  const addArea = () => {
    if (newArea.trim() && !areas.includes(newArea.trim())) {
      setAreas([...areas, newArea.trim()]);
      setNewArea("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Service Area</h2>
        <p className="text-sm text-gray-500 mt-1">Define where you work so homeowners in your area can find you</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Home Zip Code</label>
          <Input value={zip} onChange={(e) => setZip(e.target.value)} maxLength={5} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Service Radius (miles)</label>
          <Input type="number" min="5" max="100" value={radius} onChange={(e) => setRadius(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Cities You Serve</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {areas.map((a) => (
            <span key={a} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-border rounded-full px-3 py-1">
              {a}
              <button onClick={() => setAreas(areas.filter((x) => x !== a))} className="text-gray-400 hover:text-red-500 transition-colors">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Add a city..." onKeyDown={(e) => e.key === "Enter" && addArea()} className="max-w-xs" />
          <Button variant="outline" size="sm" onClick={addArea}>Add</Button>
        </div>
      </div>

      <SaveBar saved={saved} onSave={onSave} />
    </div>
  );
}

function JobPreferencesSection() {
  const [categories, setCategories] = useState<string[]>(["General Contracting", "Remodeling", "Concrete"]);
  const [minBudget, setMinBudget] = useState("1000");
  const [maxBudget, setMaxBudget] = useState("");
  const [propertyTypes, setPropertyTypes] = useState({ residential: true, commercial: true, industrial: false });
  const [autoApply, setAutoApply] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const { saved, onSave } = useSave();

  const toggleCat = (cat: string) => {
    setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Job Preferences</h2>
        <p className="text-sm text-gray-500 mt-1">Filter which jobs show up in your feed and get matched to</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-3">Job Categories</label>
        <div className="flex flex-wrap gap-2">
          {JOB_CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => toggleCat(cat)} className={cn("text-sm font-medium rounded-full px-3 py-1.5 border transition-colors", categories.includes(cat) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-border hover:border-gray-300")}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Min Budget ($)</label>
          <Input type="number" min="0" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} placeholder="No minimum" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Max Budget ($)</label>
          <Input type="number" min="0" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} placeholder="No maximum" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Property Types</label>
        <div className="flex gap-3">
          {(["residential", "commercial", "industrial"] as const).map((pt) => (
            <label key={pt} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={propertyTypes[pt]} onChange={(e) => setPropertyTypes({ ...propertyTypes, [pt]: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600" />
              <span className="text-sm text-gray-700 capitalize">{pt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border">
        <Toggle checked={autoApply} onChange={setAutoApply} label="Auto-save matching jobs" description="Automatically bookmark jobs that match all your preferences" />
        <Toggle checked={urgentOnly} onChange={setUrgentOnly} label="Urgent jobs only" description="Only show high-urgency jobs in your feed" />
      </div>

      <SaveBar saved={saved} onSave={onSave} />
    </div>
  );
}

function TeamSection() {
  const team = [
    { name: "Marcus Johnson", role: "Owner / GC", email: "marcus@johnsonsons.com", status: "active" as const },
    { name: "Tony Ramirez", role: "Lead Carpenter", email: "tony@johnsonsons.com", status: "active" as const },
    { name: "David Park", role: "Electrician (Sub)", email: "david@sparkelectric.com", status: "active" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Team & Crew</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your team members and subcontractors</p>
        </div>
        <Button className="gap-2"><Users className="w-4 h-4" />Add Member</Button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {team.map((m, i) => (
          <div key={m.email} className={cn("flex items-center justify-between px-5 py-4", i < team.length - 1 && "border-b border-border")}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-brand-700 text-xs font-bold">{getInitials(m.name)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-400">{m.role} · {m.email}</p>
              </div>
            </div>
            <Badge variant="success" className="text-[10px]">Active</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function AvailabilitySection() {
  const [workDays, setWorkDays] = useState({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false });
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("17:00");
  const [maxJobs, setMaxJobs] = useState("3");
  const [vacationMode, setVacationMode] = useState(false);
  const { saved, onSave } = useSave();

  const dayLabels: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Availability</h2>
        <p className="text-sm text-gray-500 mt-1">Set your working schedule so homeowners know when you&apos;re available</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-3">Work Days</label>
        <div className="flex gap-2">
          {Object.entries(dayLabels).map(([key, label]) => (
            <button key={key} onClick={() => setWorkDays({ ...workDays, [key]: !workDays[key as keyof typeof workDays] })} className={cn("w-12 h-10 rounded-lg text-sm font-semibold border transition-colors", workDays[key as keyof typeof workDays] ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-400 border-border hover:border-gray-300")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Start Time</label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">End Time</label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Max Concurrent Jobs</label>
          <Input type="number" min="1" max="10" value={maxJobs} onChange={(e) => setMaxJobs(e.target.value)} />
        </div>
      </div>

      <div className="divide-y divide-border">
        <Toggle checked={vacationMode} onChange={setVacationMode} label="Vacation mode" description="Pause all job matching and hide your profile from search" />
      </div>

      <SaveBar saved={saved} onSave={onSave} />
    </div>
  );
}

function NotificationsSection() {
  const [emailEstimates, setEmailEstimates] = useState(true);
  const [emailJobs, setEmailJobs] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [bidUpdates, setBidUpdates] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [savedSettings, setSavedSettings] = useState<any>(null);
  const { saved, onSave } = useSave();

  useEffect(() => {
    fetchSettings().then((s) => {
      if (s) {
        setSavedSettings(s);
        if (s.notifications_email_estimates !== undefined) setEmailEstimates(s.notifications_email_estimates);
        if (s.notifications_email_jobs !== undefined) setEmailJobs(s.notifications_email_jobs);
        if (s.notifications_sms_alerts !== undefined) setSmsAlerts(s.notifications_sms_alerts);
        if (s.notifications_push !== undefined) setPushNotifs(s.notifications_push);
        if (s.notifications_marketing !== undefined) setMarketingEmails(s.notifications_marketing);
        if (s.notifications_weekly_digest !== undefined) setWeeklyDigest(s.notifications_weekly_digest);
        if (s.notifications_bid_updates !== undefined) setBidUpdates(s.notifications_bid_updates);
        if (s.notifications_review_alerts !== undefined) setReviewAlerts(s.notifications_review_alerts);
      }
    });
  }, []);

  const handleSaveSettings = async () => {
    await saveSettings({
      notifications_email_estimates: emailEstimates,
      notifications_email_jobs: emailJobs,
      notifications_sms_alerts: smsAlerts,
      notifications_push: pushNotifs,
      notifications_marketing: marketingEmails,
      notifications_weekly_digest: weeklyDigest,
      notifications_bid_updates: bidUpdates,
      notifications_review_alerts: reviewAlerts,
    });
    onSave();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-1">Choose how FairTradeWorker reaches you</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Jobs & Estimates</p>
        <div className="divide-y divide-border">
          <Toggle checked={emailEstimates} onChange={setEmailEstimates} label="Estimate activity" description="When an estimate is viewed, accepted, or declined" />
          <Toggle checked={emailJobs} onChange={setEmailJobs} label="New job matches" description="Daily digest of jobs matching your specialty and area" />
          <Toggle checked={bidUpdates} onChange={setBidUpdates} label="Bid status updates" description="When a homeowner responds to your bid" />
          <Toggle checked={reviewAlerts} onChange={setReviewAlerts} label="New reviews" description="When a homeowner leaves you a review" />
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Channels</p>
        <div className="divide-y divide-border">
          <Toggle checked={smsAlerts} onChange={setSmsAlerts} label="SMS alerts" description="Text message for urgent job posts and payment notifications" />
          <Toggle checked={pushNotifs} onChange={setPushNotifs} label="Push notifications" description="Browser/desktop push for real-time updates" />
          <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} label="Weekly performance digest" description="Summary of views, bids, win rate, and revenue" />
          <Toggle checked={marketingEmails} onChange={setMarketingEmails} label="Tips & updates" description="Bid-winning tips, platform updates, feature announcements" />
        </div>
      </div>

      <SaveBar saved={saved} onSave={handleSaveSettings} />
    </div>
  );
}

function BillingSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Billing</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your subscription and payment method</p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-brand-50 border border-brand-100">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">Pro Plan</p>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">$49 / month — renews Apr 19, 2026</p>
        </div>
        <p className="text-xl font-bold text-brand-600">$49<span className="text-xs font-normal text-gray-400">/mo</span></p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="p-3 rounded-lg border border-border">
          <p className="text-xs text-gray-500">Estimates this month</p>
          <p className="font-bold text-gray-900 mt-0.5">23 / Unlimited</p>
        </div>
        <div className="p-3 rounded-lg border border-border">
          <p className="text-xs text-gray-500">Next billing</p>
          <p className="font-bold text-gray-900 mt-0.5">Apr 19, 2026</p>
        </div>
        <div className="p-3 rounded-lg border border-border">
          <p className="text-xs text-gray-500">YTD spend</p>
          <p className="font-bold text-gray-900 mt-0.5">$147</p>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Payment Method</p>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-border">
          <div>
            <p className="text-sm font-semibold text-gray-900">Chase Visa ending in 4821</p>
            <p className="text-xs text-gray-500 mt-0.5">Expires 08/28</p>
          </div>
          <Button variant="outline" size="sm">Update Card</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="flex-1">View Invoice History</Button>
        <Button className="flex-1">Upgrade to Enterprise</Button>
      </div>
    </div>
  );
}

function LicensesSection() {
  const [licenseNumber, setLicenseNumber] = useState("GC-TX-2019-48821");
  const [licenseState, setLicenseState] = useState("TX");
  const [licenseExpiry, setLicenseExpiry] = useState("2027-06-30");
  const { saved, onSave } = useSave();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Licenses</h2>
        <p className="text-sm text-gray-500 mt-1">Contractor licenses and trade certifications</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Contractor License</p>
          <VerifyBadge status="verified" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">License Number</label>
            <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">State</label>
            <Input value={licenseState} onChange={(e) => setLicenseState(e.target.value)} maxLength={2} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Expiration</label>
            <Input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} />
          </div>
        </div>
        <div className="mt-3"><UploadZone label="Upload License" hint="JPG, PNG, or PDF — max 10MB" /></div>
      </div>

      <SaveBar saved={saved} onSave={onSave} label="Save License" />
    </div>
  );
}

function InsuranceSection() {
  const [insuranceProvider, setInsuranceProvider] = useState("State Farm Commercial");
  const [policyNumber, setPolicyNumber] = useState("SF-BOP-2024-99123");
  const [coverageAmount, setCoverageAmount] = useState("2000000");
  const [insuranceExpiry, setInsuranceExpiry] = useState("2026-12-31");
  const [wcProvider, setWcProvider] = useState("Texas Mutual");
  const [wcPolicy, setWcPolicy] = useState("WC-TX-2024-55781");
  const [wcExpiry, setWcExpiry] = useState("2026-12-31");
  const { saved, onSave } = useSave();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Insurance</h2>
        <p className="text-sm text-gray-500 mt-1">General liability and workers&apos; compensation policies</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">General Liability</p>
          <VerifyBadge status="pending" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Provider</label>
            <Input value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Policy Number</label>
            <Input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Coverage ($)</label>
            <Input type="number" value={coverageAmount} onChange={(e) => setCoverageAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Expiration</label>
            <Input type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} />
          </div>
        </div>
        <div className="mt-3"><UploadZone label="Upload COI" hint="Certificate of Insurance — PDF preferred" /></div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Workers&apos; Compensation</p>
          <VerifyBadge status="verified" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Provider</label>
            <Input value={wcProvider} onChange={(e) => setWcProvider(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Policy Number</label>
            <Input value={wcPolicy} onChange={(e) => setWcPolicy(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Expiration</label>
            <Input type="date" value={wcExpiry} onChange={(e) => setWcExpiry(e.target.value)} />
          </div>
        </div>
      </div>

      <SaveBar saved={saved} onSave={onSave} label="Save Insurance" />
    </div>
  );
}

function IntegrationsSection() {
  const [qbStatus, setQbStatus] = useState<{
    connected: boolean;
    companyName?: string;
    connectedAt?: string;
  }>({ connected: false });
  const [qbLoading, setQbLoading] = useState(true);
  const [qbConnecting, setQbConnecting] = useState(false);
  const [qbDisconnecting, setQbDisconnecting] = useState(false);

  // Check for OAuth redirect result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qbResult = params.get("qb");
    if (qbResult === "connected") {
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("qb");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

  // Fetch QuickBooks connection status
  useEffect(() => {
    fetch("/api/integrations/quickbooks/status")
      .then((res) => res.json())
      .then((data) => setQbStatus(data))
      .catch(() => setQbStatus({ connected: false }))
      .finally(() => setQbLoading(false));
  }, []);

  async function connectQuickBooks() {
    setQbConnecting(true);
    try {
      const res = await fetch("/api/integrations/quickbooks/connect");
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch {
      setQbConnecting(false);
    }
  }

  async function disconnectQuickBooks() {
    setQbDisconnecting(true);
    try {
      await fetch("/api/integrations/quickbooks/disconnect", { method: "POST" });
      setQbStatus({ connected: false });
    } catch {
      // Silently fail — user can retry
    } finally {
      setQbDisconnecting(false);
    }
  }

  const futureIntegrations = [
    { name: "Google Calendar", desc: "Sync project schedule", icon: "GC" },
    { name: "Stripe Connect", desc: "Receive escrow payments", icon: "SC" },
    { name: "CompanyCam", desc: "Auto-upload job site photos", icon: "CC" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Integrations</h2>
        <p className="text-sm text-gray-500 mt-1">Connect your tools for a seamless workflow</p>
      </div>

      <div className="space-y-3">
        {/* QuickBooks — real integration */}
        <div className="flex items-center justify-between p-4 bg-white border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-700">QB</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">QuickBooks</p>
              <p className="text-xs text-gray-400">
                {qbLoading
                  ? "Checking connection..."
                  : qbStatus.connected
                    ? `Connected to ${qbStatus.companyName || "QuickBooks"}`
                    : "Sync estimates and invoices"}
              </p>
            </div>
          </div>
          {qbLoading ? (
            <div className="w-20 h-8 bg-gray-100 rounded animate-pulse" />
          ) : qbStatus.connected ? (
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-[10px]">Connected</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectQuickBooks}
                disabled={qbDisconnecting}
              >
                {qbDisconnecting ? "..." : "Disconnect"}
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={connectQuickBooks} disabled={qbConnecting}>
              {qbConnecting ? "Connecting..." : "Connect"}
            </Button>
          )}
        </div>

        {/* Future integrations — still mock */}
        {futureIntegrations.map((int) => (
          <div key={int.name} className="flex items-center justify-between p-4 bg-white border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{int.icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{int.name}</p>
                <p className="text-xs text-gray-400">{int.desc}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" disabled>Coming Soon</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearanceSection() {
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showRiskMitigation, setShowRiskMitigation] = useState(true);
  const [defaultTab, setDefaultTab] = useState("dashboard");
  const { saved, onSave } = useSave();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
        <p className="text-sm text-gray-500 mt-1">Customize how FairTradeWorker looks and feels</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-3">Layout Density</label>
        <div className="flex gap-3">
          {(["comfortable", "compact"] as const).map((d) => (
            <button key={d} onClick={() => setDensity(d)} className={cn("flex-1 py-3 rounded-lg border-2 text-sm font-semibold transition-colors capitalize", density === d ? "border-brand-600 bg-brand-50 text-brand-700" : "border-border bg-white text-gray-500 hover:border-gray-300")}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Default Landing Page</label>
        <select value={defaultTab} onChange={(e) => setDefaultTab(e.target.value)} className="h-10 w-full max-w-xs rounded-lg border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2">
          <option value="dashboard">Dashboard</option>
          <option value="work">Browse Jobs</option>
          <option value="estimates">Estimates</option>
          <option value="projects">Projects</option>
        </select>
      </div>

      <div className="divide-y divide-border">
        <Toggle checked={showThumbnails} onChange={setShowThumbnails} label="Show job thumbnails" description="Display thumbnail images on job cards" />
        <Toggle checked={showRiskMitigation} onChange={setShowRiskMitigation} label="Risk mitigation insights" description="Show risk analysis and upsell opportunities on job details" />
      </div>

      <SaveBar saved={saved} onSave={onSave} />
    </div>
  );
}

function AccountSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Account</h2>
        <p className="text-sm text-gray-500 mt-1">Email, plan, and account management</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Account Details</p>
        <div className="space-y-0 text-sm">
          {[
            ["Email", "marcus@johnsonsons.com"],
            ["Account type", "Contractor — Pro"],
            ["Plan", "$49/mo — renews Apr 19, 2026"],
            ["Member since", "January 2025"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-sm font-semibold text-red-700">Danger Zone</p>
        </div>
        <p className="text-xs text-red-600">Deleting your account is permanent. All estimates, job history, and profile data will be removed.</p>
        <Button variant="destructive" size="sm">Delete Account</Button>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(true);
  const { saved, onSave } = useSave();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Security</h2>
        <p className="text-sm text-gray-500 mt-1">Password and two-factor authentication</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Change Password</p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Current Password</label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="max-w-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">New Password</label>
              <Input type="password" placeholder="Min 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Confirm</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <Button onClick={onSave} className="gap-2" variant={saved ? "secondary" : "default"}>
            <Lock className="w-4 h-4" />{saved ? "Updated!" : "Update Password"}
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Two-Factor Authentication</p>
        <Toggle checked={twoFactor} onChange={setTwoFactor} label="Enable 2FA" description="Require a verification code when signing in from a new device" />
      </div>
    </div>
  );
}

// ─── Sidebar Nav Config ──────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "service-area", label: "Service Area", icon: MapPin },
  { id: "job-prefs", label: "Job Preferences", icon: Briefcase },
  { id: "team", label: "Team & Crew", icon: Users },
  { id: "availability", label: "Availability", icon: Calendar },
  { id: "licenses", label: "Licenses", icon: FileCheck },
  { id: "insurance", label: "Insurance", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: CreditCard },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState("profile");

  const renderSection = () => {
    switch (active) {
      case "profile": return <ProfileSection />;
      case "service-area": return <ServiceAreaSection />;
      case "job-prefs": return <JobPreferencesSection />;
      case "team": return <TeamSection />;
      case "availability": return <AvailabilitySection />;
      case "licenses": return <LicensesSection />;
      case "insurance": return <InsuranceSection />;
      case "integrations": return <IntegrationsSection />;
      case "appearance": return <AppearanceSection />;
      case "account": return <AccountSection />;
      case "security": return <SecuritySection />;
      case "notifications": return <NotificationsSection />;
      default: return <ProfileSection />;
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 bg-white border-b border-border">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account, credentials, and preferences</p>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        {/* Settings sidebar */}
        <nav className="w-56 flex-shrink-0 bg-white border-r border-border py-4 px-2 overflow-y-auto">
          {NAV_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = active === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActive(section.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-lg px-3 py-3 text-[15px] font-medium transition-colors mb-1",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{section.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
