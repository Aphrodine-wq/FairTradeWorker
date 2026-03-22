"use client";

import {
  MapPin,
  Clock,
  Users,
  Camera,
  Video,
  DollarSign,
  Calendar,
  Home,
  Building2,
  Factory,
  Shield,
  FileCheck,
  AlertTriangle,
  Eye,
  Timer,
  CheckCircle2,
  Circle,
  User,
  Star,
  Wrench,
  CalendarClock,
  Tag,
  Info,
  Bookmark,
  Send,
  TrendingUp,
  Lightbulb,
  Zap,
  Droplets,
  Thermometer,
  Layers,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/ui/dialog";
import { Card } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { type Job, type JobPhoto } from "@shared/lib/mock-data";
import { formatCurrency, formatDate, cn } from "@shared/lib/utils";

// ─── Config ──────────────────────────────────────────────────────────────────

const URGENCY_CONFIG = {
  low: {
    label: "Low Priority",
    color: "text-gray-600",
    bg: "bg-gray-100",
    dot: "bg-gray-400",
  },
  medium: {
    label: "Medium",
    color: "text-amber-700",
    bg: "bg-amber-50",
    dot: "bg-amber-400",
  },
  high: {
    label: "Urgent",
    color: "text-red-700",
    bg: "bg-red-50",
    dot: "bg-red-500",
  },
};

const PROPERTY_ICONS = {
  residential: Home,
  commercial: Building2,
  industrial: Factory,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DeadlinePill({ deadline }: { deadline: string }) {
  const days = daysUntil(deadline);
  return (
    <span
      className={cn(
        "text-[11px] font-medium flex items-center gap-1",
        days <= 0
          ? "text-red-600"
          : days <= 7
          ? "text-red-600"
          : days <= 21
          ? "text-amber-600"
          : "text-gray-500"
      )}
    >
      <CalendarClock className="w-3 h-3" />
      {days <= 0 ? "Past due" : `${days}d left`}
    </span>
  );
}

// ─── Risk Mitigation ─────────────────────────────────────────────────────────

interface RiskItem {
  risk: string;
  likelihood: "high" | "medium" | "low";
  upsell: string;
  estimatedAdd: string;
}

const RISK_DB: Record<string, RiskItem[]> = {
  Remodeling: [
    { risk: "Hidden water damage behind walls", likelihood: "high", upsell: "Moisture remediation + mold treatment", estimatedAdd: "$1,500–$4,000" },
    { risk: "Outdated wiring not to code", likelihood: "medium", upsell: "Panel upgrade or circuit additions", estimatedAdd: "$800–$3,000" },
    { risk: "Asbestos in older homes (pre-1980)", likelihood: "medium", upsell: "Abatement or encapsulation", estimatedAdd: "$2,000–$6,000" },
    { risk: "Subfloor rot under flooring", likelihood: "medium", upsell: "Subfloor replacement + leveling", estimatedAdd: "$500–$2,000" },
    { risk: "Load-bearing wall discovery", likelihood: "low", upsell: "Structural beam + engineering", estimatedAdd: "$2,500–$8,000" },
  ],
  Electrical: [
    { risk: "Aluminum wiring (fire hazard)", likelihood: "high", upsell: "Full rewire or COPALUM remediation", estimatedAdd: "$3,000–$10,000" },
    { risk: "Undersized panel for EV charger", likelihood: "medium", upsell: "200A panel upgrade", estimatedAdd: "$1,500–$3,500" },
    { risk: "Knob-and-tube wiring in walls", likelihood: "medium", upsell: "Partial or full rewire", estimatedAdd: "$4,000–$12,000" },
    { risk: "Missing GFCI in wet areas", likelihood: "high", upsell: "GFCI outlet installation", estimatedAdd: "$200–$600" },
  ],
  Roofing: [
    { risk: "Damaged decking under shingles", likelihood: "high", upsell: "Decking replacement (per sheet)", estimatedAdd: "$75–$150/sheet" },
    { risk: "Improper flashing at penetrations", likelihood: "medium", upsell: "Flashing replacement + sealant", estimatedAdd: "$300–$800" },
    { risk: "Inadequate attic ventilation", likelihood: "medium", upsell: "Ridge vent + soffit vent install", estimatedAdd: "$400–$1,200" },
    { risk: "Sagging rafters or trusses", likelihood: "low", upsell: "Structural sistering or replacement", estimatedAdd: "$1,500–$5,000" },
    { risk: "Ice dam history (poor insulation)", likelihood: "medium", upsell: "Attic insulation + ice shield", estimatedAdd: "$1,000–$3,000" },
  ],
  HVAC: [
    { risk: "Undersized ductwork for new system", likelihood: "high", upsell: "Duct modification or replacement", estimatedAdd: "$1,200–$4,000" },
    { risk: "Asbestos duct insulation", likelihood: "medium", upsell: "Abatement + new insulation", estimatedAdd: "$1,500–$3,500" },
    { risk: "No return air in bedrooms", likelihood: "medium", upsell: "Return air duct additions", estimatedAdd: "$300–$600/room" },
    { risk: "Condensate drain issues", likelihood: "low", upsell: "Drain line reroute + safety pan", estimatedAdd: "$200–$500" },
  ],
  Painting: [
    { risk: "Lead paint (pre-1978 homes)", likelihood: "high", upsell: "Lead-safe work practices + testing", estimatedAdd: "$500–$2,000" },
    { risk: "Drywall damage behind peeling paint", likelihood: "medium", upsell: "Drywall repair + skim coat", estimatedAdd: "$300–$1,500" },
    { risk: "Moisture stains indicating leaks", likelihood: "medium", upsell: "Leak investigation + repair", estimatedAdd: "$400–$2,000" },
    { risk: "Exterior wood rot under paint", likelihood: "medium", upsell: "Wood replacement + prime + paint", estimatedAdd: "$500–$3,000" },
  ],
  Flooring: [
    { risk: "Uneven subfloor requiring leveling", likelihood: "high", upsell: "Self-leveling compound application", estimatedAdd: "$2–$5/sqft" },
    { risk: "Moisture in concrete slab", likelihood: "medium", upsell: "Moisture barrier + testing", estimatedAdd: "$1–$3/sqft" },
    { risk: "Asbestos tile underneath existing floor", likelihood: "medium", upsell: "Encapsulation or abatement", estimatedAdd: "$3–$8/sqft" },
    { risk: "Subfloor structural damage", likelihood: "low", upsell: "Subfloor replacement", estimatedAdd: "$3–$6/sqft" },
  ],
  Concrete: [
    { risk: "Poor soil compaction or clay soil", likelihood: "high", upsell: "Soil remediation + extra gravel base", estimatedAdd: "$500–$2,000" },
    { risk: "Underground utilities in path", likelihood: "medium", upsell: "Reroute or locate + hand dig", estimatedAdd: "$300–$1,500" },
    { risk: "Tree root interference", likelihood: "medium", upsell: "Root removal + barrier install", estimatedAdd: "$400–$1,200" },
    { risk: "Drainage grade issues", likelihood: "medium", upsell: "French drain or regrading", estimatedAdd: "$1,000–$4,000" },
  ],
  Fencing: [
    { risk: "Property line disputes", likelihood: "medium", upsell: "Survey recommendation", estimatedAdd: "$300–$800" },
    { risk: "Rocky soil / hardpan", likelihood: "medium", upsell: "Auger rental + extra labor", estimatedAdd: "$200–$600" },
    { risk: "Underground utilities at post locations", likelihood: "low", upsell: "Hand dig + reroute posts", estimatedAdd: "$150–$400" },
    { risk: "Grading issues causing fence gap", likelihood: "medium", upsell: "Kickboard or stepped panels", estimatedAdd: "$3–$8/lf" },
  ],
};

const LIKELIHOOD_STYLE = {
  high: { label: "Likely", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  medium: { label: "Possible", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  low: { label: "Unlikely", dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100" },
};

function getRisksForJob(job: Job): RiskItem[] {
  const risks = RISK_DB[job.category] || RISK_DB.Remodeling || [];
  // Boost likelihood for older properties
  if (job.yearBuilt > 0 && job.yearBuilt < 1980) {
    return risks.map((r) => ({
      ...r,
      likelihood: r.likelihood === "low" ? "medium" : r.likelihood === "medium" ? "high" : r.likelihood,
    }));
  }
  return risks;
}

// ─── Modal Content ────────────────────────────────────────────────────────────

function JobModalContent({ job }: { job: Job }) {
  const urgency = URGENCY_CONFIG[job.urgency];
  const PropertyIcon = PROPERTY_ICONS[job.propertyType];
  const photoCount = job.photos.filter((p) => p.type === "photo").length;
  const videoCount = job.photos.filter((p) => p.type === "video").length;
  const deadlineDays = daysUntil(job.deadline);

  return (
    <div className="flex flex-col">
      {/* Hero image */}
      <div className="relative h-64 bg-gray-100 flex-shrink-0 overflow-hidden rounded-t-xl">
        <Image
          src={job.thumbnail}
          alt={job.title}
          fill
          className="object-cover"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <Badge
            className={cn(
              "text-[11px] font-semibold border-0 shadow-sm",
              urgency.bg,
              urgency.color
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", urgency.dot)} />
            {urgency.label}
          </Badge>
          <div className="flex items-center gap-1.5">
            {job.insuranceClaim && (
              <Badge variant="warning" className="text-[11px] shadow-sm">
                <Shield className="w-3 h-3 mr-1" />
                Insurance Claim
              </Badge>
            )}
          </div>
        </div>
        {/* Media / view count */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {photoCount > 0 && (
              <span className="flex items-center gap-1 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
                <Camera className="w-3 h-3" />
                {photoCount}
              </span>
            )}
            {videoCount > 0 && (
              <span className="flex items-center gap-1 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
                <Video className="w-3 h-3" />
                {videoCount}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
            <Eye className="w-3 h-3" />
            {job.viewCount} views
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Header block */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <Badge variant="outline" className="text-xs px-2">
              {job.category}
            </Badge>
            <Badge variant="secondary" className="text-xs px-2">
              {job.subcategory}
            </Badge>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 leading-snug">
              {job.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-brand-600" />
              <span className="text-lg font-bold text-gray-900 tabular-nums">
                {formatCurrency(job.budget.min)}&ndash;{formatCurrency(job.budget.max)}
              </span>
            </div>
            <DeadlinePill deadline={job.deadline} />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-3.5 h-3.5" />
              <span className="font-semibold text-gray-900">{job.bidsCount}</span>{" "}
              bids
            </div>
          </div>
        </div>

        {/* Job details row */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wide">Location</span>
              <span className="text-gray-800 font-medium">{job.location}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wide">Start Date</span>
              <span className="text-gray-800 font-medium">{formatDate(job.preferredStartDate)}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Timer className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wide">Duration</span>
              <span className="text-gray-800 font-medium">{job.estimatedDuration}</span>
            </div>
          </div>
        </div>

        {/* Property Details */}
        {job.property && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-400" />
              Property Details
            </h4>
            <div className="bg-gray-50 rounded-lg border border-border p-4 space-y-4">
              {/* Structure */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-2.5 text-sm">
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block">Year Built</span>
                  <span className="text-gray-900 font-medium">{job.yearBuilt}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block">Size</span>
                  <span className="text-gray-900 font-medium">{job.sqft > 0 ? `${job.sqft.toLocaleString()} sqft` : "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block">Stories</span>
                  <span className="text-gray-900 font-medium">{job.property.stories}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block">Foundation</span>
                  <span className="text-gray-900 font-medium capitalize">{job.property.foundation.replace("_", " & ")}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block">Exterior</span>
                  <span className="text-gray-900 font-medium">{job.property.exterior}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block">Garage</span>
                  <span className="text-gray-900 font-medium capitalize">{job.property.garage}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block">Lot Size</span>
                  <span className="text-gray-900 font-medium">{job.property.lotSize}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block">Roof</span>
                  <span className="text-gray-900 font-medium">{job.property.roofType} ({job.property.roofAge}yr old)</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block">Sewer</span>
                  <span className="text-gray-900 font-medium capitalize">{job.property.sewer}</span>
                </div>
              </div>

              {/* Systems */}
              <div className="border-t border-border pt-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide block mb-2">Systems</span>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-gray-700">{job.property.electrical}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-gray-700">{job.property.plumbing}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-gray-700">{job.property.heating} / {job.property.cooling}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-700 capitalize">{job.property.waterHeater.replace("_", " ")} water heater</span>
                  </div>
                </div>
              </div>

              {/* HOA */}
              {job.property.hoa && (
                <div className="border-t border-border pt-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide block mb-1">HOA</span>
                  <p className="text-sm text-gray-700">{job.property.hoaNotes || "HOA community — check for restrictions."}</p>
                </div>
              )}

              {/* Known Issues */}
              {job.property.knownIssues.length > 0 && (
                <div className="border-t border-border pt-3">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wide block mb-2">Known Issues</span>
                  <ul className="space-y-1.5">
                    {job.property.knownIssues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recent Work */}
              {job.property.recentWork.length > 0 && (
                <div className="border-t border-border pt-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide block mb-2">Recent Work</span>
                  <ul className="space-y-1.5">
                    {job.property.recentWork.map((work, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
                        {work}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status pills row */}
        <div className="flex flex-wrap gap-2">
          {job.permitsRequired && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
              <FileCheck className="w-3 h-3" />
              Permits Required
            </span>
          )}
          {job.inspectionRequired && (
            <span className="inline-flex items-center gap-1 text-xs text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full font-medium">
              <Wrench className="w-3 h-3" />
              Inspection Required
            </span>
          )}
          {job.materialsProvided && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Materials Provided
            </span>
          )}
          {job.insuranceClaim && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full font-medium">
              <Shield className="w-3 h-3" />
              Insurance Claim
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Scope of Work */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Scope of Work
          </h4>
          <div className="space-y-2">
            {job.detailedScope.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-sm text-gray-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Photo Gallery */}
        {job.photos.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Photos &amp; Media ({job.photos.length})
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {job.photos.map((photo: JobPhoto, i: number) => (
                <div key={i} className="group">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-border">
                    {photo.type === "photo" ? (
                      <Image
                        src={photo.url}
                        alt={photo.caption}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                        <Video className="w-6 h-6 text-gray-300" />
                        <span className="text-[10px] text-gray-400 mt-1">
                          Video
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 leading-tight line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        {job.requirements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Requirements
            </h4>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  {req.met ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={req.met ? "text-gray-900 font-medium" : ""}>
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {job.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2.5">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
                >
                  <Tag className="w-2.5 h-2.5 text-gray-400" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Site Access */}
        {job.accessNotes && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Site Access
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {job.accessNotes}
            </p>
          </div>
        )}

        {/* Special Instructions callout */}
        {job.specialInstructions && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <h4 className="text-sm font-semibold text-amber-800">
                Special Instructions
              </h4>
            </div>
            <p className="text-sm text-amber-700 leading-relaxed">
              {job.specialInstructions}
            </p>
          </div>
        )}

        {/* Risk Mitigation / Upsell Opportunities */}
        {(() => {
          const risks = getRisksForJob(job);
          if (risks.length === 0) return null;
          return (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Risk Mitigation & Additional Scope
                </h4>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Common issues found on {job.category.toLowerCase()} jobs{job.yearBuilt > 0 && job.yearBuilt < 1980 ? ` in pre-1980 homes (built ${job.yearBuilt})` : ""}. Flag these during your site visit to protect your bid and identify upsell opportunities.
              </p>
              <div className="space-y-2">
                {risks.map((r, i) => {
                  const style = LIKELIHOOD_STYLE[r.likelihood];
                  return (
                    <div key={i} className="flex items-start gap-3 bg-gray-50 border border-border rounded-lg p-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full", style.bg, style.text)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
                          {style.label}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900">{r.risk}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Lightbulb className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <p className="text-xs text-gray-500">
                            <span className="font-medium text-gray-700">{r.upsell}</span>
                            {" · "}
                            <span className="font-semibold text-brand-600">{r.estimatedAdd}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Address + deadline info boxes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-border">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block mb-1">
              Bid Deadline
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatDate(job.deadline)}
            </span>
            <DeadlinePill deadline={job.deadline} />
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-border">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide block mb-1">
              Full Address
            </span>
            <span className="text-sm font-medium text-gray-800 leading-snug block">
              {job.fullAddress}
            </span>
          </div>
        </div>

        {/* Posted by */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-border">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-brand-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{job.postedBy}</p>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {job.postedByRating}
              </span>
              <span className="text-gray-300">·</span>
              <span>{job.postedByJobs} jobs posted</span>
            </div>
          </div>
          <Info className="w-4 h-4 text-gray-300" />
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 pt-1">
          <Link href="/contractor/estimates?tab=new" className="flex-1">
            <Button className="w-full gap-2" size="default">
              <Send className="w-4 h-4" />
              Create Estimate
            </Button>
          </Link>
          <Link href="/contractor/messages" className="flex-1">
            <Button variant="outline" className="w-full gap-2" size="default">
              <MessageSquare className="w-4 h-4" />
              Message Homeowner
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Card (collapsed) ─────────────────────────────────────────────────────────

export function JobCard({ job }: { job: Job }) {
  const urgency = URGENCY_CONFIG[job.urgency];
  const PropertyIcon = PROPERTY_ICONS[job.propertyType];
  const photoCount = job.photos.filter((p) => p.type === "photo").length;
  const videoCount = job.photos.filter((p) => p.type === "video").length;
  const deadlineDays = daysUntil(job.deadline);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden hover:shadow-sm transition-shadow duration-200 flex flex-col cursor-pointer group">
          {/* Thumbnail */}
          <div className="relative h-40 bg-gray-100 overflow-hidden flex-shrink-0">
            <Image
              src={job.thumbnail}
              alt={job.title}
              fill
              className="object-cover"
            />

            {/* Top badges */}
            <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
              <Badge
                className={cn(
                  "text-[11px] font-semibold border-0 shadow-sm",
                  urgency.bg,
                  urgency.color
                )}
              >
                <span
                  className={cn("w-1.5 h-1.5 rounded-full mr-1", urgency.dot)}
                />
                {urgency.label}
              </Badge>
              {job.insuranceClaim && (
                <Badge variant="warning" className="text-[11px] shadow-sm">
                  <Shield className="w-3 h-3 mr-0.5" />
                  Insurance
                </Badge>
              )}
            </div>

            {/* Bottom — photo/video count + views */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {photoCount > 0 && (
                  <span className="flex items-center gap-1 bg-black/60 text-white text-[11px] px-1.5 py-0.5 rounded">
                    <Camera className="w-3 h-3" />
                    {photoCount}
                  </span>
                )}
                {videoCount > 0 && (
                  <span className="flex items-center gap-1 bg-black/60 text-white text-[11px] px-1.5 py-0.5 rounded">
                    <Video className="w-3 h-3" />
                    {videoCount}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 bg-black/60 text-white text-[11px] px-1.5 py-0.5 rounded">
                <Eye className="w-3 h-3" />
                {job.viewCount}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            {/* Category row */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <Badge variant="outline" className="text-[11px] px-1.5 py-0">
                {job.category}
              </Badge>
              <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
                {job.subcategory}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5">
              {job.title}
            </h3>

            {/* Description preview */}
            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
              {job.description}
            </p>

            {/* Budget + deadline row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-sm font-bold text-gray-900 tabular-nums">
                  {formatCurrency(job.budget.min)}&ndash;
                  {formatCurrency(job.budget.max)}
                </span>
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium flex items-center gap-1",
                  deadlineDays <= 7
                    ? "text-red-600"
                    : deadlineDays <= 21
                    ? "text-amber-600"
                    : "text-gray-500"
                )}
              >
                <CalendarClock className="w-3 h-3" />
                {deadlineDays <= 0 ? "Past due" : `${deadlineDays}d left`}
              </span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                {formatDate(job.preferredStartDate)}
              </span>
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3 text-gray-400" />
                {job.estimatedDuration}
              </span>
              <span className="flex items-center gap-1">
                <PropertyIcon className="w-3 h-3 text-gray-400" />
                {job.sqft > 0
                  ? `${job.sqft.toLocaleString()} sqft`
                  : job.propertyType}
              </span>
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap gap-1 mb-3">
              {job.permitsRequired && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">
                  <FileCheck className="w-2.5 h-2.5" />
                  Permits
                </span>
              )}
              {job.inspectionRequired && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded-full font-medium">
                  <Wrench className="w-2.5 h-2.5" />
                  Inspection
                </span>
              )}
              {job.materialsProvided && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Materials Incl.
                </span>
              )}
              {job.yearBuilt > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full font-medium">
                  Built {job.yearBuilt}
                </span>
              )}
            </div>

            {/* Footer — posted by + bid count */}
            <div className="flex items-center justify-between pt-2.5 border-t border-border mt-auto">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-brand-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {job.postedBy}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    {job.postedByRating}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span className="font-semibold">{job.bidsCount}</span> bids
              </div>
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="p-0">
        <JobModalContent job={job} />
      </DialogContent>
    </Dialog>
  );
}
