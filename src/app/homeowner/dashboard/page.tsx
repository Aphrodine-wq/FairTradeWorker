"use client";

import Link from "next/link";
import {
  FolderOpen,
  FileText,
  DollarSign,
  TrendingDown,
  Check,
  Circle,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { mockProjects, homeownerDashboardStats } from "@/lib/mock-data";

const RECENT_ACTIVITY = [
  {
    id: "a1",
    type: "estimate",
    message: "Estimate received from Mitchell Roofing Co.",
    detail: "Roof Replacement — $11,400",
    time: "2 hours ago",
    icon: FileText,
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "a2",
    type: "milestone",
    message: "Milestone completed: Cabinets Installed",
    detail: "Kitchen Remodel — Johnson & Sons",
    time: "Yesterday",
    icon: CheckCircle2,
    iconColor: "text-brand-600 bg-brand-50",
  },
  {
    id: "a3",
    type: "message",
    message: "New message from Garcia Plumbing Services",
    detail: "Bathroom Renovation — rough-in update",
    time: "2 days ago",
    icon: MessageSquare,
    iconColor: "text-violet-600 bg-violet-50",
  },
  {
    id: "a4",
    type: "alert",
    message: "Escrow payment released",
    detail: "Kitchen Remodel — $8,000 milestone payment",
    time: "3 days ago",
    icon: DollarSign,
    iconColor: "text-amber-600 bg-amber-50",
  },
  {
    id: "a5",
    type: "alert",
    message: "Project deadline approaching",
    detail: "Bathroom Renovation — 13 days remaining",
    time: "4 days ago",
    icon: AlertCircle,
    iconColor: "text-rose-600 bg-rose-50",
  },
];

export default function HomeownerDashboardPage() {
  const activeProjects = mockProjects.filter((p) => p.status === "in_progress");

  return (
    <div className="p-8">
      <AppHeader
        title="Dashboard"
        subtitle="Welcome back, Michael. Here's what's happening."
        actions={
          <Button asChild>
            <Link href="/homeowner/post-job">
              <PlusCircle className="w-4 h-4 mr-2" />
              Post a Job
            </Link>
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Projects"
          value={homeownerDashboardStats.activeProjects}
          icon={FolderOpen}
          change={0}
        />
        <StatCard
          title="Pending Estimates"
          value={homeownerDashboardStats.pendingEstimates}
          icon={FileText}
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(homeownerDashboardStats.totalSpent)}
          icon={DollarSign}
        />
        <StatCard
          title="Savings vs Average"
          value={formatCurrency(homeownerDashboardStats.savedVsAverage)}
          icon={TrendingDown}
          change={14.2}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Active Projects</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/homeowner/projects">View all</Link>
            </Button>
          </div>

          {activeProjects.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No active projects. Post a job to get started.
              </CardContent>
            </Card>
          )}

          {activeProjects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{project.contractor}</p>
                  </div>
                  <Badge variant="info">In Progress</Badge>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-500 font-medium">Progress</span>
                    <span className="text-xs font-semibold text-brand-600">
                      {project.progress}%
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Budget */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-surface rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(project.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Spent</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(project.spent)}
                    </p>
                  </div>
                </div>

                <Separator className="mb-3" />

                {/* Milestones */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    Milestones
                  </p>
                  <div className="space-y-1.5">
                    {project.milestones.map((milestone, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {milestone.completed ? (
                          <Check className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                        )}
                        <span
                          className={
                            milestone.completed
                              ? "text-sm text-gray-700"
                              : "text-sm text-gray-400"
                          }
                        >
                          {milestone.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="flex gap-4 mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Started {formatDate(project.startDate)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Est. end {formatDate(project.estimatedEnd)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              {RECENT_ACTIVITY.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id}>
                    <div className="flex items-start gap-3 p-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.iconColor}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-snug">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.detail}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                    {i < RECENT_ACTIVITY.length - 1 && (
                      <Separator />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
