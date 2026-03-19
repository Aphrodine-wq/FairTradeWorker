"use client";

import React, { useState } from "react";
import { Save, Shield, CreditCard, Bell, User, AlertTriangle } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockContractors } from "@/lib/mock-data";
import { JOB_CATEGORIES } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

const contractor = mockContractors[0];

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 mt-0.5 w-10 h-5.5 h-[22px] rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 ${
          checked ? "bg-brand-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[18px]" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  // Profile state
  const [name, setName] = useState(contractor.name);
  const [company, setCompany] = useState(contractor.company);
  const [bio, setBio] = useState(contractor.bio);
  const [specialty, setSpecialty] = useState(contractor.specialty);
  const [location, setLocation] = useState(contractor.location);

  // Notification toggles
  const [emailEstimates, setEmailEstimates] = useState(true);
  const [emailJobs, setEmailJobs] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savedSection, setSavedSection] = useState<string | null>(null);

  const handleSave = (section: string) => {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="flex-1 p-8 max-w-3xl space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription>Your public contractor profile</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-100 border-2 border-brand-200 flex items-center justify-center">
                <span className="text-brand-700 font-bold text-lg">
                  {getInitials(name)}
                </span>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  Upload Photo
                </Button>
                <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 2MB</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Company Name</label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Specialty</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
                >
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px] resize-none text-sm"
                placeholder="Tell homeowners about your experience and what makes you different..."
              />
              <p className="text-xs text-gray-400 text-right">{bio.length} / 500</p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => handleSave("profile")}
                className="gap-2"
                variant={savedSection === "profile" ? "secondary" : "default"}
              >
                <Save className="w-4 h-4" />
                {savedSection === "profile" ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>Choose how we reach you</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <Toggle
                checked={emailEstimates}
                onChange={setEmailEstimates}
                label="Estimate activity emails"
                description="Notify me when an estimate is viewed or accepted"
              />
              <Toggle
                checked={emailJobs}
                onChange={setEmailJobs}
                label="New job match emails"
                description="Daily digest of jobs matching your specialty"
              />
              <Toggle
                checked={smsAlerts}
                onChange={setSmsAlerts}
                label="SMS alerts"
                description="Text message for high-urgency job posts"
              />
              <Toggle
                checked={pushNotifs}
                onChange={setPushNotifs}
                label="Push notifications"
                description="Browser push for real-time updates"
              />
              <Toggle
                checked={marketingEmails}
                onChange={setMarketingEmails}
                label="Marketing & tips"
                description="Tips for winning more bids, platform updates"
              />
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={() => handleSave("notifications")}
                className="gap-2"
                variant={savedSection === "notifications" ? "secondary" : "default"}
              >
                <Save className="w-4 h-4" />
                {savedSection === "notifications" ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <CardTitle className="text-base">Billing</CardTitle>
                <CardDescription>Manage your subscription</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-brand-50 border border-brand-100">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">Pro Plan</p>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  $49 / month &mdash; renews Apr 19, 2026
                </p>
              </div>
              <p className="text-xl font-bold text-brand-600">$49</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-gray-500">Estimates this month</p>
                <p className="font-bold text-gray-900 mt-0.5">23 / Unlimited</p>
              </div>
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-gray-500">Next billing date</p>
                <p className="font-bold text-gray-900 mt-0.5">Apr 19, 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="flex-1">
                Manage Billing
              </Button>
              <Button size="sm" className="flex-1">
                Upgrade to Enterprise
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account / Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <CardTitle className="text-base">Account & Security</CardTitle>
                <CardDescription>Password and account management</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Change Password</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Current Password</label>
                  <Input
                    type="password"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">New Password</label>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave("password")}
                  className="gap-2"
                  variant={savedSection === "password" ? "secondary" : "default"}
                >
                  <Shield className="w-4 h-4" />
                  {savedSection === "password" ? "Updated!" : "Update Password"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Danger zone */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-red-700">Danger Zone</p>
              </div>
              <p className="text-xs text-red-600">
                Deleting your account is permanent. All your estimates, job history, and profile data will be removed and cannot be recovered.
              </p>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
