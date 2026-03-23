"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  TrendingDown,
  Check,
  Circle,
  Clock,
  DollarSign,
  Plus,
  ArrowRight,
  ArrowLeft,
  Hammer,
  Wrench,
  Zap,
  Wind,
  Home,
  PaintBucket,
  Layers,
  TreePine,
  LayoutGrid,
  Square,
  Fence,
  PanelTop as Wall2,
  Camera,
  Upload,
  X,
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  Shield,
  Star,
  Ruler,
  CalendarDays,
  Building2,
  Users,
  Key,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Progress } from "@shared/ui/progress";
import { Badge } from "@shared/ui/badge";
import { formatCurrency, formatDate } from "@shared/lib/utils";
import { mockProjects, homeownerDashboardStats, type Project } from "@shared/lib/mock-data";
import { fetchNotifications } from "@shared/lib/data";

const CATEGORIES = [
  { label: "General Contracting", icon: Hammer, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { label: "Plumbing", icon: Wrench, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { label: "Electrical", icon: Zap, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  { label: "HVAC", icon: Wind, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
  { label: "Roofing", icon: Home, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  { label: "Painting", icon: PaintBucket, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { label: "Flooring", icon: Layers, color: "text-stone-600", bg: "bg-stone-50", border: "border-stone-200" },
  { label: "Landscaping", icon: TreePine, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { label: "Remodeling", icon: LayoutGrid, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  { label: "Concrete", icon: Square, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
  { label: "Fencing", icon: Fence, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
  { label: "Drywall", icon: Wall2, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
];

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family", icon: Home },
  { value: "condo", label: "Condo / Townhouse", icon: Building2 },
  { value: "multi_family", label: "Multi-Family", icon: Users },
  { value: "commercial", label: "Commercial", icon: Building2 },
];

const AREAS = [
  "Kitchen", "Bathroom", "Living Room", "Bedroom", "Basement",
  "Garage", "Attic", "Exterior", "Porch / Deck", "Whole House",
  "Yard / Landscape", "Driveway", "Roof", "Other",
];

export default function HomeownerDashboardPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotifications().then((notifs) => {
      if (notifs.length > 0) {
        setNotificationCount(notifs.filter((n: any) => !n.read).length);
      }
    });
  }, []);

  const activeProjects = projects.filter((p) => p.status === "in_progress");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [address, setAddress] = useState("");
  const [sqft, setSqft] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [condition, setCondition] = useState("");
  const [materialPref, setMaterialPref] = useState("");
  const [notes, setNotes] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [bidCount, setBidCount] = useState("5");
  const [priority, setPriority] = useState("");
  const [contact, setContact] = useState<string[]>(["app"]);
  const [access, setAccess] = useState("");

  function reset() {
    setSelectedCategory(null); setStep(1); setShowSuccess(false);
    setTitle(""); setDescription(""); setPropertyType(""); setAddress("");
    setSqft(""); setYearBuilt(""); setAreas([]); setCondition("");
    setMaterialPref(""); setNotes(""); setTimeline(""); setBudget("");
    setBidCount("5"); setPriority(""); setContact(["app"]); setAccess("");
  }

  function post() {
    setShowSuccess(true);
    setTimeout(reset, 4000);
  }

  function toggleArea(a: string) {
    setAreas((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);
  }

  function toggleContact(c: string) {
    setContact((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  }

  const cat = CATEGORIES.find((c) => c.label === selectedCategory);

  // ── Selection helper for pill/card buttons ──
  function sel(isActive: boolean) {
    return isActive
      ? "border-brand-600 bg-brand-50 text-brand-700"
      : "border-border text-gray-600 hover:border-gray-300";
  }

  return (
    <div className="p-8">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-6 mb-5">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 mb-1">What do you need done?</h1>
            <p className="text-gray-500 text-[15px]">Pick a category. Verified contractors bid within hours.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = selectedCategory === c.label;
            return (
              <button
                key={c.label}
                onClick={() => { reset(); setSelectedCategory(c.label); }}
                className={`flex flex-col items-center gap-3 rounded-xl border p-5 transition-colors ${
                  active ? `${c.border} ${c.bg}` : "border-border bg-white hover:border-gray-300"
                }`}
              >
                <Icon className={`h-6 w-6 ${active ? c.color : "text-gray-400"}`} />
                <span className={`text-[13px] text-center leading-tight ${active ? `${c.color} font-medium` : "text-gray-600"}`}>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────── */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,20,25,0.5)" }} onClick={reset}>
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                {cat && (
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cat.bg}`}>
                    <cat.icon className={`h-4 w-4 ${cat.color}`} />
                  </div>
                )}
                <span className="text-[15px] font-semibold text-gray-900">{selectedCategory}</span>
              </div>
              <div className="flex items-center gap-4">
                {!showSuccess && (
                  <div className="flex items-center gap-1">
                    {[1,2,3,4].map((s) => (
                      <div key={s} className={`h-1 rounded-full transition-colors ${s <= step ? "w-7 bg-brand-600" : "w-4 bg-gray-200"}`} />
                    ))}
                  </div>
                )}
                <button onClick={reset} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {showSuccess ? (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-7 w-7 text-brand-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-1">Job posted</p>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {bidCount} verified contractors in your area are being notified. Expect bids within hours.
                  </p>
                </div>
              ) : step === 1 ? (
                /* ── Step 1: Project + Property + Photos ─────── */
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">What do you need done?</label>
                    <input
                      type="text" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
                      placeholder="e.g., Replace hardwood floors in living room and hallway"
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Describe the project <span className="text-gray-400 font-normal">— more detail = better bids</span>
                    </label>
                    <textarea
                      value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                      placeholder={"What's the current state? Materials in mind? Specific requirements?"}
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 resize-none leading-relaxed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Property type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PROPERTY_TYPES.map((pt) => {
                          const PIcon = pt.icon;
                          const active = propertyType === pt.value;
                          return (
                            <button key={pt.value} onClick={() => setPropertyType(pt.value)}
                              className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-colors ${sel(active)}`}>
                              <PIcon className={`h-4 w-4 ${active ? "text-brand-600" : "text-gray-400"}`} />
                              <span className="text-xs font-medium">{pt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        <Camera className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
                        Photos <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer text-center h-[108px] flex flex-col items-center justify-center">
                        <Upload className="h-5 w-5 text-gray-300 mb-1" />
                        <p className="text-xs font-medium text-gray-500">Upload photos of the area</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Required. Up to 10 photos.</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <MapPin className="inline h-3 w-3 mr-0.5 text-gray-400" /> Address
                      </label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main St, Oxford, MS"
                        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Ruler className="inline h-3 w-3 mr-0.5 text-gray-400" /> Sq ft
                      </label>
                      <input type="text" value={sqft} onChange={(e) => setSqft(e.target.value)}
                        placeholder="2,200"
                        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <CalendarDays className="inline h-3 w-3 mr-0.5 text-gray-400" /> Year built
                      </label>
                      <input type="text" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)}
                        placeholder="1998"
                        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" />
                    </div>
                  </div>
                </div>
              ) : step === 2 ? (
                /* ── Step 2: Areas + Condition + Materials ────── */
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Areas involved <span className="text-gray-400 font-normal">— select all that apply</span></label>
                    <div className="flex flex-wrap gap-2">
                      {AREAS.map((a) => (
                        <button key={a} onClick={() => toggleArea(a)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            areas.includes(a) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-border hover:border-gray-300"
                          }`}>{a}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Current condition</label>
                    <textarea value={condition} onChange={(e) => setCondition(e.target.value)} rows={3}
                      placeholder="Describe what's there now — existing materials, damage, anything a contractor should know before visiting..."
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Material preference</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["I know what I want", "I have some ideas", "Open to suggestions", "Budget-friendly", "Mid-range", "Premium / high-end"].map((opt) => (
                        <button key={opt} onClick={() => setMaterialPref(opt)}
                          className={`p-2.5 rounded-xl border-2 text-xs font-medium text-center transition-colors ${sel(materialPref === opt)}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Anything else? <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="HOA rules, permit info, previous work done..."
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" />
                  </div>
                </div>
              ) : step === 3 ? (
                /* ── Step 3: Timing + Preferences ────────────── */
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">When do you need this started?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { v: "asap", l: "As soon as possible", s: "Within days", i: Zap },
                        { v: "2weeks", l: "Next 2 weeks", s: "Some flexibility", i: CalendarDays },
                        { v: "month", l: "Within a month", s: "Planning ahead", i: Clock },
                        { v: "flexible", l: "I'm flexible", s: "No rush", i: SlidersHorizontal },
                      ].map((o) => {
                        const OI = o.i; const active = timeline === o.v;
                        return (
                          <button key={o.v} onClick={() => setTimeline(o.v)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-colors ${sel(active)}`}>
                            <OI className={`h-4 w-4 flex-shrink-0 ${active ? "text-brand-600" : "text-gray-400"}`} />
                            <div>
                              <span className={`text-sm font-medium block ${active ? "text-brand-700" : "text-gray-700"}`}>{o.l}</span>
                              <span className="text-xs text-gray-400">{o.s}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Budget range</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { v: "under5k", l: "Under $5K" }, { v: "5to15k", l: "$5K – $15K" },
                        { v: "15to50k", l: "$15K – $50K" }, { v: "50kplus", l: "$50K+" },
                        { v: "unsure", l: "Not sure yet" }, { v: "needestimate", l: "Need an estimate" },
                      ].map((o) => (
                        <button key={o.v} onClick={() => setBudget(o.v)}
                          className={`p-2.5 rounded-xl border-2 text-sm font-medium text-center transition-colors ${sel(budget === o.v)}`}>{o.l}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">How many bids?</label>
                      <div className="flex gap-2">
                        {["3","5","7"].map((n) => (
                          <button key={n} onClick={() => setBidCount(n)}
                            className={`flex-1 p-2.5 rounded-xl border-2 text-sm font-semibold text-center transition-colors ${sel(bidCount === n)}`}>{n}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">What matters most?</label>
                      <div className="flex gap-2">
                        {[
                          { v: "price", l: "Lowest price", i: DollarSign },
                          { v: "rating", l: "Top rated", i: Star },
                          { v: "speed", l: "Fastest", i: Zap },
                        ].map((o) => {
                          const PI = o.i; const active = priority === o.v;
                          return (
                            <button key={o.v} onClick={() => setPriority(o.v)}
                              className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-colors ${sel(active)}`}>
                              <PI className={`h-3.5 w-3.5 ${active ? "text-brand-600" : "text-gray-400"}`} />
                              <span className="text-[11px] font-medium">{o.l}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Contact method</label>
                      <div className="flex gap-2">
                        {[
                          { v: "app", l: "In-app", i: MessageSquare },
                          { v: "phone", l: "Phone", i: Phone },
                          { v: "email", l: "Email", i: Mail },
                        ].map((o) => {
                          const CI = o.i; const active = contact.includes(o.v);
                          return (
                            <button key={o.v} onClick={() => toggleContact(o.v)}
                              className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-medium transition-colors ${sel(active)}`}>
                              <CI className="h-3.5 w-3.5" /> {o.l}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        <Key className="inline h-3 w-3 mr-0.5 text-gray-400" /> Access notes <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input type="text" value={access} onChange={(e) => setAccess(e.target.value)}
                        placeholder="Gate code, pets, best visit time..."
                        className="w-full rounded-xl border border-border px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" />
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Step 4: Review ──────────────────────────── */
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">Review your job</h3>
                  <div className="rounded-xl bg-gray-50 divide-y divide-border">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {cat && (
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cat.bg} flex-shrink-0`}>
                            <cat.icon className={`h-[18px] w-[18px] ${cat.color}`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-gray-900">{title || "Untitled"}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{selectedCategory}</p>
                          {description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{description}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div><p className="text-xs text-gray-400">Property</p><p className="text-gray-700">{PROPERTY_TYPES.find(p => p.value === propertyType)?.label || "—"}{sqft && ` · ${sqft} sqft`}</p></div>
                      <div><p className="text-xs text-gray-400">Location</p><p className="text-gray-700">{address || "—"}</p></div>
                      <div><p className="text-xs text-gray-400">Areas</p><p className="text-gray-700">{areas.length ? areas.join(", ") : "—"}</p></div>
                      <div><p className="text-xs text-gray-400">Materials</p><p className="text-gray-700">{materialPref || "—"}</p></div>
                      <div><p className="text-xs text-gray-400">Timeline</p><p className="text-gray-700">
                        {timeline === "asap" ? "ASAP" : timeline === "2weeks" ? "Next 2 weeks" : timeline === "month" ? "Within a month" : timeline === "flexible" ? "Flexible" : "—"}
                      </p></div>
                      <div><p className="text-xs text-gray-400">Budget</p><p className="text-gray-700">
                        {budget === "under5k" ? "Under $5K" : budget === "5to15k" ? "$5K–$15K" : budget === "15to50k" ? "$15K–$50K" : budget === "50kplus" ? "$50K+" : budget === "unsure" ? "TBD" : budget === "needestimate" ? "Need estimate" : "—"}
                      </p></div>
                      <div><p className="text-xs text-gray-400">Bids</p><p className="text-gray-700">{bidCount} contractors</p></div>
                      <div><p className="text-xs text-gray-400">Contact</p><p className="text-gray-700">{contact.map(c => c === "app" ? "In-app" : c === "phone" ? "Phone" : "Email").join(", ")}</p></div>
                    </div>
                    {(condition || notes || access) && (
                      <div className="p-4 space-y-2 text-sm">
                        {condition && <div><p className="text-xs text-gray-400">Condition</p><p className="text-gray-600">{condition}</p></div>}
                        {notes && <div><p className="text-xs text-gray-400">Notes</p><p className="text-gray-600">{notes}</p></div>}
                        {access && <div><p className="text-xs text-gray-400">Access</p><p className="text-gray-600">{access}</p></div>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-100">
                    <Shield className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    <p className="text-xs text-brand-700">Only verified, licensed, and background-checked contractors can bid. Your info stays private until you accept.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!showSuccess && (
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-border flex-shrink-0">
                <div>
                  {step > 1 && (
                    <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="text-gray-500">
                      <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{step} of 4</span>
                  {step < 4 ? (
                    <Button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !title.trim()}
                      className="bg-brand-600 hover:bg-brand-700 text-white px-5">
                      Continue <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button onClick={post} className="bg-brand-600 hover:bg-brand-700 text-white px-6">
                      Post Job <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Activity Strip ────────────────────────────────────────── */}
      <div className="flex items-center gap-6 mb-8 py-4 border-y border-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{homeownerDashboardStats.activeProjects}</span>
          <span className="text-sm text-gray-500">active projects</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{homeownerDashboardStats.pendingEstimates}</span>
          <span className="text-sm text-gray-500">bids waiting</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(homeownerDashboardStats.totalSpent)}</span>
          <span className="text-sm text-gray-500">spent this year</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-sm">
          <TrendingDown className="h-4 w-4 text-brand-600" />
          <span className="text-brand-700 font-medium">{formatCurrency(homeownerDashboardStats.savedVsAverage)} saved</span>
          <span className="text-gray-400">vs market avg</span>
        </div>
      </div>

      {/* ── Projects ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/homeowner/projects" className="flex items-center gap-1">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>

        {activeProjects.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 mx-auto mb-4">
                <FolderOpen className="h-7 w-7 text-brand-600" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">No active projects yet</p>
              <p className="text-sm text-gray-500 mb-4">Post a job to start receiving bids from verified contractors.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeProjects.map((project) => (
            <Link key={project.id} href="/homeowner/projects" className="block group">
              <Card className="h-full transition-colors group-hover:border-brand-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">{project.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{project.contractor}</p>
                    </div>
                    <Badge variant="info">In Progress</Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-semibold text-brand-600">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    {project.milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {m.completed ? <Check className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" /> : <Circle className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />}
                        <span className={m.completed ? "text-sm text-gray-700" : "text-sm text-gray-400"}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500"><Clock className="h-3 w-3" /> Started {formatDate(project.startDate)}</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500"><Clock className="h-3 w-3" /> Est. end {formatDate(project.estimatedEnd)}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-brand-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
