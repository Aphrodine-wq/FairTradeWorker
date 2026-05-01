"use client";

import { useState, useEffect } from "react";
import { Users, Briefcase, DollarSign, AlertTriangle } from "lucide-react";
import { api } from "@shared/lib/realtime";
import { cn } from "@shared/lib/utils";

interface PlatformStats {
  total_users: number;
  total_contractors: number;
  total_homeowners: number;
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  total_revenue: number;
  open_disputes: number;
}

const DEFAULT_STATS: PlatformStats = {
  total_users: 0,
  total_contractors: 0,
  total_homeowners: 0,
  total_jobs: 0,
  active_jobs: 0,
  completed_jobs: 0,
  total_revenue: 0,
  open_disputes: 0,
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p
            className={cn(
              "text-2xl font-bold mt-1 tracking-tight",
              accent ? "text-brand-600" : "text-gray-900"
            )}
          >
            {value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-sm bg-gray-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";
    fetch(`${base}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("ftw-token")}` },
    })
      .then((r) => (r.ok ? r.json() : DEFAULT_STATS))
      .then(setStats)
      .catch(() => setStats(DEFAULT_STATS))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (cents: number) =>
    `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
        Platform Overview
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Real-time platform health and metrics
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Users" value={stats.total_users} icon={Users} />
        <StatCard
          label="Contractors"
          value={stats.total_contractors}
          icon={Users}
        />
        <StatCard
          label="Active Jobs"
          value={stats.active_jobs}
          icon={Briefcase}
          accent
        />
        <StatCard
          label="Open Disputes"
          value={stats.open_disputes}
          icon={AlertTriangle}
          accent={stats.open_disputes > 0}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <StatCard label="Homeowners" value={stats.total_homeowners} icon={Users} />
        <StatCard label="Total Jobs" value={stats.total_jobs} icon={Briefcase} />
        <StatCard
          label="Completed Jobs"
          value={stats.completed_jobs}
          icon={Briefcase}
        />
        <StatCard
          label="Platform Revenue"
          value={formatCurrency(stats.total_revenue)}
          icon={DollarSign}
          accent
        />
      </div>
    </div>
  );
}
