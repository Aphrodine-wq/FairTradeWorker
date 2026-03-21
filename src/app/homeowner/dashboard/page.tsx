"use client";

import Link from "next/link";
import {
  FolderOpen,
  FileText,
  DollarSign,
  TrendingDown,
  Check,
  Circle,
  Clock,
} from "lucide-react";
import { AppHeader } from "@shared/components/app-header";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Progress } from "@shared/ui/progress";
import { Badge } from "@shared/ui/badge";
import { formatCurrency, formatDate } from "@shared/lib/utils";
import { mockProjects, homeownerDashboardStats } from "@shared/lib/mock-data";

const KPI_CARDS = [
  {
    title: "Active Projects",
    value: homeownerDashboardStats.activeProjects,
    icon: FolderOpen,
    iconColor: "text-brand-600",
    iconBg: "bg-brand-50",
  },
  {
    title: "Pending Bids",
    value: homeownerDashboardStats.pendingEstimates,
    icon: FileText,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    title: "Total Spent",
    value: formatCurrency(homeownerDashboardStats.totalSpent),
    icon: DollarSign,
    iconColor: "text-gray-600",
    iconBg: "bg-gray-100",
  },
  {
    title: "Saved vs Average",
    value: formatCurrency(homeownerDashboardStats.savedVsAverage),
    icon: TrendingDown,
    iconColor: "text-brand-600",
    iconBg: "bg-brand-50",
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
            <Link href="/homeowner/jobs">Post a Job</Link>
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Your Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Your Projects</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/homeowner/projects">View all</Link>
          </Button>
        </div>

        {activeProjects.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No active projects yet.{" "}
              <Link href="/homeowner/jobs" className="text-brand-600 font-medium hover:underline">
                Post a job
              </Link>{" "}
              to get started.
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
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

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-semibold text-brand-600">
                      {project.progress}%
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="space-y-1">
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
      </div>
    </div>
  );
}
