"use client";

import { useState } from "react";
import {
  User,
  Wrench,
  MapPin,
  FileCheck,
  Shield,
  Settings as SettingsIcon,
  Lock,
  Bell,
  Save,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

// ─── Types ───────────────────────────────────────────────────────────────────

type SectionKey =
  | "profile"
  | "skills"
  | "service-area"
  | "licenses"
  | "insurance"
  | "account"
  | "security"
  | "notifications";

interface NavItem {
  key: SectionKey;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "service-area", label: "Service Area", icon: MapPin },
  { key: "licenses", label: "Licenses", icon: FileCheck },
  { key: "insurance", label: "Insurance", icon: Shield },
  { key: "account", label: "Account", icon: SettingsIcon },
  { key: "security", label: "Security", icon: Lock },
  { key: "notifications", label: "Notifications", icon: Bell },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SubContractorSettingsPage() {
  usePageTitle("Settings");
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-200">
        <h1 className="text-[24px] font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left nav */}
        <div className="w-[220px] bg-white border-r border-gray-200 py-4 flex-shrink-0 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-2.5 text-left text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 border-r-2 border-brand-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[600px]">
            {activeSection === "profile" && <ProfileSection />}
            {activeSection === "skills" && <PlaceholderSection title="Skills" description="Manage your trade skills and certifications." />}
            {activeSection === "service-area" && <PlaceholderSection title="Service Area" description="Set your location and service radius." />}
            {activeSection === "licenses" && <PlaceholderSection title="Licenses" description="Add and manage your trade licenses." />}
            {activeSection === "insurance" && <PlaceholderSection title="Insurance" description="Upload and track your insurance certificates." />}
            {activeSection === "account" && <PlaceholderSection title="Account" description="Manage your account details and preferences." />}
            {activeSection === "security" && <PlaceholderSection title="Security" description="Password, two-factor authentication, and login sessions." />}
            {activeSection === "notifications" && <PlaceholderSection title="Notifications" description="Control which notifications you receive." />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Section ────────────────────────────────────────────────────────

function ProfileSection() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("(512) 555-0147");
  const [specialty, setSpecialty] = useState("Plumbing");
  const [hourlyRate, setHourlyRate] = useState("65");
  const [bio, setBio] = useState("Licensed plumber with 8 years of residential and commercial experience.");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Profile</h2>
        <p className="text-[13px] text-gray-700 mt-0.5">Your public-facing information</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Full name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Phone</label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Specialty</label>
          <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Hourly rate ($)</label>
          <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="flex w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Placeholder Section ────────────────────────────────────────────────────

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">{title}</h2>
        <p className="text-[13px] text-gray-700 mt-0.5">{description}</p>
      </div>
      <div className="bg-white border border-gray-200 p-8 text-center">
        <p className="text-[13px] text-gray-600">
          This section is under development.
        </p>
      </div>
    </div>
  );
}
