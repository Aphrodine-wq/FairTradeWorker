"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Textarea } from "@shared/ui/textarea";
import { cn } from "@shared/lib/utils";
import { toast } from "sonner";

interface Dispute {
  id: string;
  job_id: string;
  job_title: string;
  homeowner_name: string;
  contractor_name: string;
  reason: string;
  status: string;
  amount: number;
  created_at: string;
  resolved_at?: string;
  resolution?: string;
}

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "text-amber-700 bg-amber-50 border-amber-200" },
  under_review: { label: "Under Review", color: "text-blue-700 bg-blue-50 border-blue-200" },
  resolved: { label: "Resolved", color: "text-green-700 bg-green-50 border-green-200" },
};

function getToken() {
  return localStorage.getItem("ftw-token") || "";
}

const API_BASE = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filter, setFilter] = useState<string>("open");
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [outcome, setOutcome] = useState<"homeowner" | "contractor" | "split">("split");

  const fetchDisputes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`${API_BASE}/api/admin/disputes?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const resolveDispute = async (disputeId: string) => {
    if (!resolution.trim()) {
      toast.error("Add a resolution note");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ resolution, outcome }),
      });
      if (res.ok) {
        toast.success("Dispute resolved");
        setResolving(null);
        setResolution("");
        fetchDisputes();
      } else {
        toast.error("Failed to resolve dispute");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const formatCurrency = (cents: number) =>
    `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
        Disputes
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Review and resolve payment and service disputes
      </p>

      {/* Filters */}
      <div className="flex gap-1 mt-6">
        {["open", "under_review", "resolved", "all"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors",
              filter === s
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {s === "all"
              ? "All"
              : s === "under_review"
                ? "Under Review"
                : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Dispute cards */}
      <div className="mt-4 space-y-3">
        {disputes.map((d) => {
          const style = STATUS_STYLES[d.status] || STATUS_STYLES.open;
          return (
            <div
              key={d.id}
              className="bg-white rounded-sm border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {d.job_title || `Job #${d.job_id}`}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", style.color)}
                    >
                      {style.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {d.homeowner_name} vs {d.contractor_name}
                    {d.amount > 0 && (
                      <span className="ml-2 font-medium text-gray-700">
                        {formatCurrency(d.amount)}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(d.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-gray-700 mt-3">{d.reason}</p>

              {d.resolution && (
                <div className="mt-3 p-3 bg-green-50 rounded-sm border border-green-200">
                  <p className="text-xs font-medium text-green-800">
                    Resolution:
                  </p>
                  <p className="text-xs text-green-700 mt-1">{d.resolution}</p>
                </div>
              )}

              {d.status !== "resolved" && (
                <div className="mt-3">
                  {resolving === d.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-1">
                        {(["homeowner", "contractor", "split"] as const).map(
                          (o) => (
                            <button
                              key={o}
                              onClick={() => setOutcome(o)}
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors capitalize",
                                outcome === o
                                  ? "bg-brand-600 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              )}
                            >
                              {o === "split" ? "Split" : `Favor ${o}`}
                            </button>
                          )
                        )}
                      </div>
                      <Textarea
                        placeholder="Resolution details..."
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => resolveDispute(d.id)}
                          className="text-xs h-7 bg-brand-600 hover:bg-brand-700"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Resolve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setResolving(null);
                            setResolution("");
                          }}
                          className="text-xs h-7"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResolving(d.id)}
                      className="text-xs h-7"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" /> Resolve
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {disputes.length === 0 && !loading && (
          <div className="bg-white rounded-sm border border-gray-200 p-12 text-center">
            <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-400 mt-2">
              {filter === "open"
                ? "No open disputes"
                : "No disputes found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
