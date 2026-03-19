"use client";

import { useState } from "react";
import {
  Check,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { mockProjects, type Project } from "@/lib/mock-data";

type ProjectStatus = Project["status"];

function statusBadge(status: ProjectStatus) {
  switch (status) {
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "in_progress":
      return <Badge variant="info">In Progress</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    default:
      return null;
  }
}

function BudgetBar({ budget, spent }: { budget: number; spent: number }) {
  const pct = Math.min(100, Math.round((spent / budget) * 100));
  const overBudget = spent > budget;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500">Budget usage</span>
        <span
          className={cn(
            "font-semibold",
            overBudget ? "text-red-500" : "text-gray-900"
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            overBudget ? "bg-red-500" : "bg-brand-600"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1 text-gray-400">
        <span>{formatCurrency(spent)} spent</span>
        <span>{formatCurrency(budget)} total</span>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const completedMilestones = project.milestones.filter((m) => m.completed).length;

  return (
    <Card className="overflow-hidden">
      {/* Main row — always visible */}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
              {statusBadge(project.status)}
            </div>
            <p className="text-sm text-gray-500">{project.contractor}</p>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex-shrink-0 w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Progress row */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500">
              {completedMilestones}/{project.milestones.length} milestones
            </span>
            <span className="text-xs font-semibold text-brand-600">
              {project.progress}%
            </span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-surface rounded-lg">
            <DollarSign className="h-3.5 w-3.5 text-gray-400 mx-auto mb-0.5" />
            <p className="text-xs font-semibold text-gray-900">
              {formatCurrency(project.budget)}
            </p>
            <p className="text-xs text-gray-400">Budget</p>
          </div>
          <div className="p-2 bg-surface rounded-lg">
            <CalendarDays className="h-3.5 w-3.5 text-gray-400 mx-auto mb-0.5" />
            <p className="text-xs font-semibold text-gray-900">
              {formatDate(project.startDate)}
            </p>
            <p className="text-xs text-gray-400">Started</p>
          </div>
          <div className="p-2 bg-surface rounded-lg">
            <Clock className="h-3.5 w-3.5 text-gray-400 mx-auto mb-0.5" />
            <p className="text-xs font-semibold text-gray-900">
              {formatDate(project.estimatedEnd)}
            </p>
            <p className="text-xs text-gray-400">Est. End</p>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Milestones */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                  Milestones
                </p>
                <div className="space-y-2">
                  {project.milestones.map((milestone, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      {milestone.completed ? (
                        <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                          <Circle className="h-2 w-2 text-gray-300" />
                        </div>
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          milestone.completed
                            ? "text-gray-700"
                            : "text-gray-400"
                        )}
                      >
                        {milestone.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget breakdown */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                  Budget Breakdown
                </p>
                <BudgetBar budget={project.budget} spent={project.spent} />

                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Spent to date</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(project.spent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Remaining</span>
                    <span
                      className={cn(
                        "font-semibold",
                        project.spent > project.budget
                          ? "text-red-500"
                          : "text-brand-600"
                      )}
                    >
                      {formatCurrency(Math.max(0, project.budget - project.spent))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const activeProjects = mockProjects.filter((p) => p.status === "in_progress");
  const completedProjects = mockProjects.filter((p) => p.status === "completed");

  return (
    <div className="p-8">
      <AppHeader
        title="My Projects"
        subtitle={`${mockProjects.length} total project${mockProjects.length !== 1 ? "s" : ""}`}
        actions={
          <Button asChild>
            <a href="/homeowner/post-job">Post New Job</a>
          </Button>
        }
      />

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All
            <span className="ml-1.5 text-xs font-bold opacity-60">
              ({mockProjects.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            <span className="ml-1.5 text-xs font-bold opacity-60">
              ({activeProjects.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <span className="ml-1.5 text-xs font-bold opacity-60">
              ({completedProjects.length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {mockProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeProjects.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No active projects.
            </div>
          ) : (
            activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedProjects.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No completed projects yet.
            </div>
          ) : (
            completedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
