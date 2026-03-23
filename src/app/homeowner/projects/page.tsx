"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  Circle,
  Clock,
  DollarSign,
  Shield,
  ShieldCheck,
  Phone,
  MessageSquare,
  FileText,
  Camera,
  ClipboardCheck,
  Star,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Progress } from "@shared/ui/progress";
import { Separator } from "@shared/ui/separator";
import { cn, formatCurrency, formatDate } from "@shared/lib/utils";
import { fetchProjects } from "@shared/lib/data";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Milestone {
  name: string;
  status: "completed" | "in-progress" | "upcoming";
  date?: string;
  payment: number;
  paidDate?: string;
}

interface Payment {
  date: string;
  description: string;
  amount: number;
  status: "paid" | "due" | "upcoming";
}

interface Document {
  name: string;
  type: "pdf" | "photo" | "report";
  badge?: string;
  badgeVariant?: "success" | "warning";
  count?: number;
}

interface ChangeOrder {
  id: string;
  description: string;
  costDifference: number;
  reason: string;
  status: "pending" | "approved" | "declined";
}

interface Contractor {
  name: string;
  initials: string;
  rating: number;
  reviews: number;
  verified: boolean;
}

interface StatusBanner {
  type: "payment-due" | "input-needed" | "on-track";
  message: string;
  actionLabel?: string;
}

interface HomeownerProject {
  id: string;
  title: string;
  contractor: Contractor;
  status: "in-progress" | "completed";
  progress: number;
  budget: number;
  spent: number;
  milestones: Milestone[];
  payments: Payment[];
  documents: Document[];
  changeOrders: ChangeOrder[];
  banner: StatusBanner;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const PROJECTS: HomeownerProject[] = [
  {
    id: "proj-1",
    title: "Kitchen Remodel",
    status: "in-progress",
    progress: 65,
    budget: 38500,
    spent: 25000,
    contractor: {
      name: "Marcus Johnson",
      initials: "MJ",
      rating: 4.9,
      reviews: 23,
      verified: true,
    },
    banner: {
      type: "payment-due",
      message:
        "Marcus Johnson marked Demolition as complete. Payment of $7,700 is due.",
      actionLabel: "Approve & Pay",
    },
    milestones: [
      { name: "Deposit & Permits", status: "completed", date: "Jan 15, 2026", payment: 5775, paidDate: "Jan 15, 2026" },
      { name: "Demolition", status: "completed", date: "Feb 3, 2026", payment: 7700, paidDate: "Feb 5, 2026" },
      { name: "Rough Plumbing & Electrical", status: "completed", date: "Feb 20, 2026", payment: 7700, paidDate: "Feb 22, 2026" },
      { name: "Cabinet Install", status: "in-progress", payment: 7700 },
      { name: "Countertops & Backsplash", status: "upcoming", payment: 5775 },
      { name: "Final Finishes & Walkthrough", status: "upcoming", payment: 3850 },
    ],
    payments: [
      { date: "2026-01-15", description: "Deposit & Permits", amount: 5775, status: "paid" },
      { date: "2026-02-05", description: "Milestone: Demolition", amount: 7700, status: "paid" },
      { date: "2026-02-22", description: "Milestone: Rough Plumbing & Electrical", amount: 7700, status: "paid" },
      { date: "2026-03-20", description: "Milestone: Cabinet Install", amount: 7700, status: "due" },
      { date: "2026-04-10", description: "Milestone: Countertops & Backsplash", amount: 5775, status: "upcoming" },
      { date: "2026-05-01", description: "Final Payment", amount: 3850, status: "upcoming" },
    ],
    documents: [
      { name: "Original Estimate", type: "pdf" },
      { name: "Signed Contract", type: "pdf" },
      { name: "Change Order #1", type: "pdf", badge: "Pending Approval", badgeVariant: "warning" },
      { name: "Project Photos", type: "photo", count: 12 },
      { name: "Inspection Report", type: "report", badge: "Passed", badgeVariant: "success" },
    ],
    changeOrders: [
      {
        id: "co-1",
        description: "Upgrade to quartz countertops (from laminate)",
        costDifference: 2400,
        reason: "Homeowner requested premium material upgrade during cabinet phase.",
        status: "pending",
      },
    ],
  },
  {
    id: "proj-2",
    title: "Bathroom Renovation",
    status: "in-progress",
    progress: 30,
    budget: 15200,
    spent: 4500,
    contractor: {
      name: "Sarah Williams",
      initials: "SW",
      rating: 4.8,
      reviews: 17,
      verified: true,
    },
    banner: {
      type: "on-track",
      message: "Everything is on track. Next milestone: Tile & Waterproofing.",
    },
    milestones: [
      { name: "Deposit & Design", status: "completed", date: "Feb 28, 2026", payment: 2280, paidDate: "Feb 28, 2026" },
      { name: "Demolition & Rough-In", status: "completed", date: "Mar 10, 2026", payment: 3040, paidDate: "Mar 12, 2026" },
      { name: "Tile & Waterproofing", status: "in-progress", payment: 3800 },
      { name: "Fixtures & Vanity", status: "upcoming", payment: 3040 },
      { name: "Final Details & Cleanup", status: "upcoming", payment: 3040 },
    ],
    payments: [
      { date: "2026-02-28", description: "Deposit & Design", amount: 2280, status: "paid" },
      { date: "2026-03-12", description: "Milestone: Demolition & Rough-In", amount: 3040, status: "paid" },
      { date: "2026-04-01", description: "Milestone: Tile & Waterproofing", amount: 3800, status: "upcoming" },
      { date: "2026-04-20", description: "Final Payment", amount: 6080, status: "upcoming" },
    ],
    documents: [
      { name: "Original Estimate", type: "pdf" },
      { name: "Signed Contract", type: "pdf" },
      { name: "Project Photos", type: "photo", count: 6 },
    ],
    changeOrders: [],
  },
];

// ─── Status Banner ──────────────────────────────────────────────────────────────

function StatusBannerSection({ banner }: { banner: StatusBanner }) {
  const config = {
    "payment-due": {
      bg: "bg-amber-50 border-amber-200",
      icon: <CreditCard className="h-5 w-5 text-amber-600 flex-shrink-0" />,
      text: "text-amber-900",
    },
    "input-needed": {
      bg: "bg-blue-50 border-blue-200",
      icon: <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />,
      text: "text-blue-900",
    },
    "on-track": {
      bg: "bg-emerald-50 border-emerald-200",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
      text: "text-emerald-900",
    },
  }[banner.type];

  return (
    <div className={cn("flex items-center gap-3 rounded-xl border p-4", config.bg)}>
      {config.icon}
      <p className={cn("text-sm font-medium flex-1", config.text)}>{banner.message}</p>
      {banner.actionLabel && (
        <Button size="sm" className="flex-shrink-0">
          {banner.actionLabel}
        </Button>
      )}
    </div>
  );
}

// ─── Contractor Card ────────────────────────────────────────────────────────────

function ContractorCard({ contractor }: { contractor: Contractor }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{contractor.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">{contractor.name}</h3>
              {contractor.verified && (
                <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-gray-900">{contractor.rating}</span>
              <span className="text-xs text-gray-500">({contractor.reviews} reviews)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Phone className="h-3.5 w-3.5 mr-1.5" />
            Call
          </Button>
        </div>
        <button className="flex items-center gap-1 text-xs text-brand-600 font-medium mt-3 hover:underline">
          View Profile <ExternalLink className="h-3 w-3" />
        </button>
      </CardContent>
    </Card>
  );
}

// ─── Milestones Timeline ────────────────────────────────────────────────────────

function MilestonesSection({ project }: { project: HomeownerProject }) {
  const totalPaid = project.milestones
    .filter((m) => m.status === "completed")
    .reduce((sum, m) => sum + m.payment, 0);
  const remaining = project.budget - totalPaid;

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Progress & Milestones</h3>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Overall Progress</span>
          <span className="text-xs font-bold text-brand-600">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-2.5 mb-6" />

        {/* Timeline */}
        <div className="space-y-0">
          {project.milestones.map((milestone, i) => {
            const isLast = i === project.milestones.length - 1;
            return (
              <div key={i} className="flex gap-3">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  {milestone.status === "completed" ? (
                    <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  ) : milestone.status === "in-progress" ? (
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-3.5 w-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                      <Circle className="h-2.5 w-2.5 text-gray-300" />
                    </div>
                  )}
                  {!isLast && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 min-h-[24px]",
                        milestone.status === "completed" ? "bg-emerald-300" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={cn("pb-4 flex-1 min-w-0", isLast && "pb-0")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          milestone.status === "upcoming" ? "text-gray-400" : "text-gray-900"
                        )}
                      >
                        {milestone.name}
                      </p>
                      {milestone.date && (
                        <p className="text-xs text-gray-500 mt-0.5">{milestone.date}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          milestone.status === "upcoming" ? "text-gray-400" : "text-gray-900"
                        )}
                      >
                        {formatCurrency(milestone.payment)}
                      </span>
                      {milestone.status === "completed" && (
                        <Badge variant="success" className="text-[10px]">Paid</Badge>
                      )}
                      {milestone.status === "in-progress" && (
                        <Badge variant="info" className="text-[10px]">In Progress</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Budget summary */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 bg-surface rounded-lg">
            <p className="text-xs text-gray-500 mb-0.5">Total Budget</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(project.budget)}</p>
          </div>
          <div className="p-2.5 bg-surface rounded-lg">
            <p className="text-xs text-gray-500 mb-0.5">Paid</p>
            <p className="text-sm font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="p-2.5 bg-surface rounded-lg">
            <p className="text-xs text-gray-500 mb-0.5">Remaining</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(remaining)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Payments ───────────────────────────────────────────────────────────────────

function PaymentsSection({ payments }: { payments: Payment[] }) {
  const nextDue = payments.find((p) => p.status === "due");

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Payments</h3>

        {nextDue && (
          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4">
            <div>
              <p className="text-xs text-amber-700 font-medium">Payment Due</p>
              <p className="text-lg font-bold text-amber-900">{formatCurrency(nextDue.amount)}</p>
              <p className="text-xs text-amber-700 mt-0.5">{nextDue.description}</p>
            </div>
            <Button size="sm">
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              Pay Now
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Description</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Amount</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((payment, i) => (
                <tr key={i}>
                  <td className="py-2.5 text-gray-500 text-xs whitespace-nowrap">{formatDate(payment.date)}</td>
                  <td className="py-2.5 text-gray-900 font-medium text-xs">{payment.description}</td>
                  <td className="py-2.5 text-gray-900 font-semibold text-xs text-right">{formatCurrency(payment.amount)}</td>
                  <td className="py-2.5 text-right">
                    {payment.status === "paid" && <Badge variant="success" className="text-[10px]">Paid</Badge>}
                    {payment.status === "due" && <Badge variant="warning" className="text-[10px]">Due</Badge>}
                    {payment.status === "upcoming" && <Badge variant="info" className="text-[10px]">Upcoming</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Documents ──────────────────────────────────────────────────────────────────

function DocumentsSection({ documents }: { documents: Document[] }) {
  const iconForType = (type: Document["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "photo":
        return <Camera className="h-4 w-4 text-blue-500" />;
      case "report":
        return <ClipboardCheck className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Documents</h3>
        <div className="space-y-1">
          {documents.map((doc, i) => (
            <button
              key={i}
              className="flex items-center gap-3 w-full rounded-lg p-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
                {iconForType(doc.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                {doc.count && (
                  <p className="text-xs text-gray-500">{doc.count} photos</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {doc.badge && (
                  <Badge variant={doc.badgeVariant || "info"} className="text-[10px]">
                    {doc.badge}
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Change Orders ──────────────────────────────────────────────────────────────

function ChangeOrdersSection({ changeOrders }: { changeOrders: ChangeOrder[] }) {
  if (changeOrders.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Change Orders</h3>
        <div className="space-y-3">
          {changeOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-gray-900">{order.description}</p>
                <span className="text-sm font-bold text-amber-700 flex-shrink-0 whitespace-nowrap">
                  +{formatCurrency(order.costDifference)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{order.reason}</p>
              {order.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <Button size="sm">Approve</Button>
                  <Button variant="outline" size="sm">Decline</Button>
                  <Badge variant="warning" className="ml-auto text-[10px]">Pending</Badge>
                </div>
              ) : order.status === "approved" ? (
                <Badge variant="success">Approved</Badge>
              ) : (
                <Badge variant="danger">Declined</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Sidebar Project Item ───────────────────────────────────────────────────────

function formatCompact(amount: number): string {
  if (amount >= 1000) {
    const val = amount / 1000;
    return `$${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
  }
  return `$${amount}`;
}

function SidebarProjectItem({
  project,
  selected,
  onClick,
}: {
  project: HomeownerProject;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg p-3.5 transition-colors relative overflow-hidden",
        selected
          ? "bg-white border-l-4 border-l-brand-600 border-y border-r border-gray-200"
          : "bg-white hover:bg-gray-100 border border-transparent"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            "h-2 w-2 rounded-full flex-shrink-0",
            project.status === "in-progress" ? "bg-emerald-500" : "bg-blue-500"
          )}
        />
        <h3 className="text-sm font-bold text-gray-900 truncate">
          {project.title}
        </h3>
      </div>
      <p className="text-xs text-gray-500 mb-2 ml-4">
        {project.contractor.name}
      </p>
      <p className="text-xs text-gray-400 ml-4">
        {formatCompact(project.spent)} / {formatCompact(project.budget)}
      </p>

      {/* Thin progress line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-100">
        <div
          className="h-full bg-brand-600 transition-all"
          style={{ width: `${project.progress}%` }}
        />
      </div>
    </button>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function HomeownerProjectsPage() {
  const [projects, setProjects] = useState<HomeownerProject[]>(PROJECTS);
  const [selectedId, setSelectedId] = useState(PROJECTS[0].id);

  useEffect(() => {
    fetchProjects().then((apiProjects) => {
      if (apiProjects.length > 0) {
        // API projects supplement inline mock data when shape matches
      }
    });
  }, []);

  const selected = projects.find((p) => p.id === selectedId) || projects[0];

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalPaid = projects.reduce((sum, p) => sum + p.spent, 0);

  return (
    <div className="flex h-full min-h-screen">
      {/* Left Sidebar */}
      <aside className="w-80 flex-shrink-0 border-r border-border bg-gray-50 flex flex-col overflow-y-auto">
        {/* Sidebar Header */}
        <div className="p-5 pb-4">
          <h1 className="text-lg font-bold text-gray-900">My Projects</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track progress, payments, and documents.
          </p>
        </div>

        {/* Summary Section */}
        <div className="mx-5 mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{projects.length}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Projects</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{formatCompact(totalBudget)}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Budget</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-700">{formatCompact(totalPaid)}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Paid</p>
            </div>
          </div>
        </div>

        {/* Project List */}
        <div className="px-5 pb-5 space-y-2 flex-1">
          {projects.map((project) => (
            <SidebarProjectItem
              key={project.id}
              project={project}
              selected={project.id === selectedId}
              onClick={() => setSelectedId(project.id)}
            />
          ))}
        </div>
      </aside>

      {/* Right Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-5">
          {/* Status Banner */}
          <StatusBannerSection banner={selected.banner} />

          {/* Contractor Card */}
          <ContractorCard contractor={selected.contractor} />

          {/* Progress & Milestones */}
          <MilestonesSection project={selected} />

          {/* Payments */}
          <PaymentsSection payments={selected.payments} />

          {/* Documents */}
          <DocumentsSection documents={selected.documents} />

          {/* Change Orders */}
          <ChangeOrdersSection changeOrders={selected.changeOrders} />
        </div>
      </main>
    </div>
  );
}
