"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Save,
  Shield,
  CreditCard,
  Bell,
  User,
  Upload,
  Home,
  Lock,
  Eye,
  Landmark,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Card, CardContent } from "@shared/ui/card";
import { Separator } from "@shared/ui/separator";
import { Badge } from "@shared/ui/badge";
import { cn } from "@shared/lib/utils";
import { fetchSettings, saveSettings } from "@shared/lib/data";
import { authStore } from "@shared/lib/auth-store";
import { toast } from "sonner";
import { usePageTitle } from "@shared/hooks/use-page-title";

function safeUserName(name?: string | null, email?: string | null): string {
  const cleaned = (name || "").trim();
  if (cleaned && cleaned.toLowerCase() !== "undefined" && cleaned.toLowerCase() !== "null") return cleaned;
  if (email && email.includes("@")) return email.split("@")[0];
  return "";
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return (parts[0][0] || "U").toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

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
        {description && <p className="text-xs text-gray-700 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative flex-shrink-0 mt-0.5 w-10 h-[22px] rounded-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2", checked ? "bg-brand-600" : "bg-gray-200")}
      >
        <span className={cn("absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-sm bg-white shadow transition-transform duration-200", checked ? "translate-x-[18px]" : "translate-x-0")} />
      </button>
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
  const onSave = () => { setSaved(true); toast.success("Settings saved"); setTimeout(() => setSaved(false), 2000); };
  return { saved, onSave };
}

// ─── Sections ────────────────────────────────────────────────────────────────

function ProfileSection() {
  const authUser = authStore.getState().user;
  const [name, setName] = useState(safeUserName(authUser?.name, authUser?.email));
  const [email, setEmail] = useState(authUser?.email ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const { saved, onSave } = useSave();

  useEffect(() => {
    const unsub = authStore.subscribe(() => {
      const u = authStore.getState().user;
      setName(safeUserName(u?.name, u?.email));
      setEmail(u?.email ?? "");
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-700 mt-1">Your personal information and primary address</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-sm bg-brand-100 border-2 border-brand-200 flex items-center justify-center">
          <span className="text-brand-700 font-bold text-xl">{initialsFromName(name)}</span>
        </div>
        <div>
          <Button variant="outline" size="sm">Upload Photo</Button>
          <p className="text-xs text-gray-600 mt-1">JPG or PNG, max 2MB</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Full Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Phone</label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Primary Address</label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <SaveBar saved={saved} onSave={onSave} />
    </div>
  );
}

function PropertiesSection() {
  const properties: Array<{ id: number; label: string; address: string; type: string; sqft: string; yearBuilt: string }> = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Properties</h2>
          <p className="text-sm text-gray-700 mt-1">Manage the properties linked to your account</p>
        </div>
        <Button className="gap-2"><Home className="w-4 h-4" />Add Property</Button>
      </div>

      <div className="space-y-3">
        {properties.length === 0 && (
          <div className="bg-white border border-border rounded-sm p-5">
            <p className="text-sm text-gray-700">No properties saved yet.</p>
          </div>
        )}
        {properties.map((prop) => (
          <div key={prop.id} className="bg-white border border-border rounded-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{prop.label}</p>
                {prop.id === 1 && <Badge variant="success" className="text-[10px]">Primary</Badge>}
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-700">Address</span>
                <span className="font-medium text-gray-900 text-right">{prop.address}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-700">Property Type</span>
                <span className="font-medium text-gray-900">{prop.type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-700">Square Footage</span>
                <span className="font-medium text-gray-900">{prop.sqft} sqft</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-700">Year Built</span>
                <span className="font-medium text-gray-900">{prop.yearBuilt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentSection() {
  const [autoPay, setAutoPay] = useState(false);

  const methods: Array<{ id: number; type: string; last4: string; label: string; expiry: string | null; isDefault: boolean }> = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Payment Methods</h2>
          <p className="text-sm text-gray-700 mt-1">Manage saved payment methods for project payments</p>
        </div>
        <Button className="gap-2"><CreditCard className="w-4 h-4" />Add Payment Method</Button>
      </div>

      <div className="space-y-3">
        {methods.length === 0 && (
          <div className="flex items-center justify-between p-4 bg-white border border-border rounded-sm">
            <p className="text-sm text-gray-700">No payment methods connected.</p>
          </div>
        )}
        {methods.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-border rounded-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-gray-100 flex items-center justify-center">
                {m.type === "Visa" ? (
                  <CreditCard className="w-5 h-5 text-gray-700" />
                ) : (
                  <Landmark className="w-5 h-5 text-gray-700" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {m.expiry ? `Expires ${m.expiry}` : "Checking account"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {m.isDefault && <Badge variant="success" className="text-[10px]">Default</Badge>}
              <Button variant="outline" size="sm">Remove</Button>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div>
        <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-1">Auto-Pay</p>
        <div className="divide-y divide-border">
          <Toggle
            checked={autoPay}
            onChange={setAutoPay}
            label="Auto-pay milestone payments"
            description="Automatically release payment when a contractor marks a milestone as complete and you approve"
          />
        </div>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [newBids, setNewBids] = useState(true);
  const [messages, setMessages] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [savedSettings, setSavedSettings] = useState<any>(null);
  const { saved, onSave } = useSave();

  useEffect(() => {
    fetchSettings().then((s) => {
      if (s) {
        setSavedSettings(s);
        if (s.notifications_new_bids !== undefined) setNewBids(s.notifications_new_bids);
        if (s.notifications_messages !== undefined) setMessages(s.notifications_messages);
        if (s.notifications_project_updates !== undefined) setProjectUpdates(s.notifications_project_updates);
        if (s.notifications_payment_reminders !== undefined) setPaymentReminders(s.notifications_payment_reminders);
        if (s.notifications_marketing !== undefined) setMarketingEmails(s.notifications_marketing);
      }
    });
  }, []);

  const handleSaveSettings = async () => {
    try {
      await saveSettings({
        notifications_new_bids: newBids,
        notifications_messages: messages,
        notifications_project_updates: projectUpdates,
        notifications_payment_reminders: paymentReminders,
        notifications_marketing: marketingEmails,
      });
      onSave();
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-700 mt-1">Choose what you want to be notified about</p>
      </div>

      <div className="divide-y divide-border">
        <Toggle
          checked={newBids}
          onChange={setNewBids}
          label="New bids"
          description="When a contractor submits a bid on one of your jobs"
        />
        <Toggle
          checked={messages}
          onChange={setMessages}
          label="Messages"
          description="When a contractor sends you a direct message"
        />
        <Toggle
          checked={projectUpdates}
          onChange={setProjectUpdates}
          label="Project updates"
          description="When a milestone is completed or a project status changes"
        />
        <Toggle
          checked={paymentReminders}
          onChange={setPaymentReminders}
          label="Payment reminders"
          description="Reminders for upcoming or overdue milestone payments"
        />
        <Toggle
          checked={marketingEmails}
          onChange={setMarketingEmails}
          label="Marketing emails"
          description="Tips, platform updates, and feature announcements"
        />
      </div>

      <SaveBar saved={saved} onSave={handleSaveSettings} />
    </div>
  );
}

function PrivacySection() {
  const [showName, setShowName] = useState(true);
  const [showAddress, setShowAddress] = useState(false);
  const [sharePhotos, setSharePhotos] = useState(false);
  const { saved, onSave } = useSave();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Privacy</h2>
        <p className="text-sm text-gray-700 mt-1">Control what contractors and other users can see</p>
      </div>

      <div className="divide-y divide-border">
        <Toggle
          checked={showName}
          onChange={setShowName}
          label="Show my name to contractors before I accept a bid"
          description="When disabled, contractors will only see your first initial until you accept their bid"
        />
        <Toggle
          checked={showAddress}
          onChange={setShowAddress}
          label="Allow contractors to see my address before I accept"
          description="When disabled, contractors will only see your city and zip code until you accept their bid"
        />
        <Toggle
          checked={sharePhotos}
          onChange={setSharePhotos}
          label="Share project photos publicly"
          description="Allow completed project photos to appear in contractor portfolios and search results"
        />
      </div>

      <SaveBar saved={saved} onSave={onSave} />
    </div>
  );
}

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const { saved, onSave } = useSave();

  const sessions: Array<{ id: number; device: string; location: string; lastActive: string; icon: typeof Monitor }> = [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Security</h2>
        <p className="text-sm text-gray-700 mt-1">Password, two-factor authentication, and active sessions</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Change Password</p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">Current Password</label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="max-w-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-800">New Password</label>
              <Input type="password" placeholder="Min 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-800">Confirm Password</label>
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
        <p className="text-sm font-semibold text-gray-900 mb-3">Two-Factor Authentication</p>
        <Toggle checked={twoFactor} onChange={setTwoFactor} label="Enable 2FA" description="Require a verification code when signing in from a new device" />
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900">Active Sessions</p>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Sign Out All Devices</Button>
        </div>
        <div className="space-y-2">
          {sessions.length === 0 && (
            <div className="flex items-center justify-between p-4 bg-white border border-border rounded-sm">
              <p className="text-sm text-gray-700">No active session history available.</p>
            </div>
          )}
          {sessions.map((s) => {
            const DeviceIcon = s.icon;
            return (
              <div key={s.id} className="flex items-center justify-between p-4 bg-white border border-border rounded-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-gray-100 flex items-center justify-center">
                    <DeviceIcon className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.device}</p>
                    <p className="text-xs text-gray-600">{s.location} · {s.lastActive}</p>
                  </div>
                </div>
                {s.lastActive === "Active now" && (
                  <Badge variant="success" className="text-[10px]">Current</Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Nav Config ──────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "properties", label: "Properties", icon: Home },
  { id: "payment", label: "Payment Methods", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Eye },
  { id: "security", label: "Security", icon: Shield },
];

// ─── Main Page ───────────────────────────────────────────────────────────────

function HomeownerSettingsPageContent() {
  usePageTitle("Settings");
  const searchParams = useSearchParams();
  const [active, setActive] = useState("profile");

  useEffect(() => {
    const s = searchParams.get("section");
    if (s && NAV_SECTIONS.some((sec) => sec.id === s)) {
      setActive(s);
    }
  }, [searchParams]);

  const renderSection = () => {
    switch (active) {
      case "profile": return <ProfileSection />;
      case "properties": return <PropertiesSection />;
      case "payment": return <PaymentSection />;
      case "notifications": return <NotificationsSection />;
      case "privacy": return <PrivacySection />;
      case "security": return <SecuritySection />;
      default: return <ProfileSection />;
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 bg-white border-b border-border">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your account, properties, and preferences</p>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        {/* Settings sidebar */}
        <nav className="w-48 flex-shrink-0 bg-white border-r border-border py-3 px-2 overflow-y-auto">
          {NAV_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = active === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActive(section.id)}
                className={cn(
                  "w-full flex items-center gap-2 rounded-sm px-2.5 py-2 text-[13px] font-medium transition-colors mb-0.5",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
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

function HomeownerSettingsPageFallback() {
  return (
    <div className="flex flex-col min-h-full bg-surface animate-pulse">
      <div className="h-[88px] bg-white border-b border-border" />
      <div className="flex flex-1 min-h-0">
        <div className="w-48 flex-shrink-0 bg-white border-r border-border" />
        <div className="flex-1 p-8 bg-surface" />
      </div>
    </div>
  );
}

export default function HomeownerSettingsPage() {
  return (
    <Suspense fallback={<HomeownerSettingsPageFallback />}>
      <HomeownerSettingsPageContent />
    </Suspense>
  );
}
