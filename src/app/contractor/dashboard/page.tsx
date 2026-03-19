"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  TrendingUp,
  Briefcase,
  DollarSign,
  Plus,
  ArrowRight,
  Mic,
  Star,
  Clock,
} from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { StatCard } from "@/components/app/stat-card";
import { EstimateCard } from "@/components/app/estimate-card";
import { JobCard } from "@/components/app/job-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  contractorDashboardStats,
  mockEstimates,
  mockJobs,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function ContractorDashboardPage() {
  const { estimatesSent, estimatesAccepted, activeJobs, monthlyRevenue, revenueChange, avgRating, responseTime } =
    contractorDashboardStats;

  const winRate = Math.round((estimatesAccepted / estimatesSent) * 100);
  const recentEstimates = mockEstimates.slice(0, 3);
  const openJobs = mockJobs.filter((j) => j.status === "open").slice(0, 3);

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader
        title="Dashboard"
        subtitle="Welcome back, Marcus."
        actions={
          <Link href="/contractor/estimates/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Estimate
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Estimates Sent"
            value={estimatesSent}
            icon={FileText}
          />
          <StatCard
            title="Win Rate"
            value={`${winRate}%`}
            change={4.2}
            icon={TrendingUp}
          />
          <StatCard
            title="Active Jobs"
            value={activeJobs}
            icon={Briefcase}
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(monthlyRevenue)}
            change={revenueChange}
            icon={DollarSign}
          />
        </div>

        {/* Secondary metrics strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Avg. Rating</p>
                <p className="text-xl font-bold text-gray-900">{avgRating} <span className="text-sm text-gray-400 font-normal">/ 5.0</span></p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Avg. Response Time</p>
                <p className="text-xl font-bold text-gray-900">{responseTime}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Estimates */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Recent Estimates</h2>
              <Link href="/contractor/estimates">
                <Button variant="ghost" size="sm" className="gap-1.5 text-brand-600 hover:text-brand-700 hover:bg-brand-50 text-xs">
                  View all
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentEstimates.map((estimate) => (
                <EstimateCard key={estimate.id} estimate={estimate} />
              ))}
            </div>
          </section>

          {/* Job Opportunities */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Job Opportunities</h2>
              <Link href="/contractor/jobs">
                <Button variant="ghost" size="sm" className="gap-1.5 text-brand-600 hover:text-brand-700 hover:bg-brand-50 text-xs">
                  Browse all
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {openJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 pt-0">
            <Link href="/contractor/estimates/new">
              <Button variant="secondary" size="sm" className="gap-2">
                <Mic className="w-4 h-4" />
                Voice Estimate
              </Button>
            </Link>
            <Link href="/contractor/jobs">
              <Button variant="outline" size="sm" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Find Jobs
              </Button>
            </Link>
            <Link href="/contractor/estimates">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="w-4 h-4" />
                All Estimates
              </Button>
            </Link>
            <Link href="/contractor/settings">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
                Update Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
