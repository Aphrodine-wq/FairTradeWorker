"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Star,
  Shield,
  Check,
  X,
  MessageSquare,
  ChevronRight,
  Briefcase,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { cn, formatCurrency } from "@shared/lib/utils";
import { authStore } from "@shared/lib/auth-store";
import {
  mockJobs,
  mockContractors,
  type Job,
  type Contractor,
} from "@shared/lib/mock-data";
import { fetchJobs, fetchBidsForJob } from "@shared/lib/data";
import { api } from "@shared/lib/realtime";
import { useRealtimeBids } from "@shared/hooks/use-realtime";
import { toast } from "sonner";
import { usePageTitle } from "@shared/hooks/use-page-title";

// Bid shape — matches API response or mock
interface Bid {
  id: string;
  jobId: string;
  contractor: Contractor;
  amount: number;
  message: string;
  timeline: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

function generateMockBids(): Bid[] {
  const jobs = mockJobs.filter((j) => j.status === "open").slice(0, 3);
  const bids: Bid[] = [];
  jobs.forEach((job) => {
    const bidders = mockContractors.slice(0, 3 + Math.floor(Math.random() * 3));
    bidders.forEach((c, i) => {
      bids.push({
        id: `bid-${job.id}-${c.id}`,
        jobId: job.id,
        contractor: c,
        amount: job.budget.min + Math.random() * (job.budget.max - job.budget.min),
        message: `I've handled similar ${job.category.toLowerCase()} projects and can deliver quality work within your timeline.`,
        timeline: `${1 + Math.floor(Math.random() * 3)} weeks`,
        status: "pending",
        createdAt: new Date(Date.now() - i * 3600000 * (1 + Math.random() * 24)).toISOString(),
      });
    });
  });
  return bids;
}

export default function BidsPage() {
  usePageTitle("Bids");
  const [bids, setBids] = useState<Bid[]>(generateMockBids);
  const [jobs, setJobs] = useState<Job[]>(mockJobs.filter((j) => j.status === "open").slice(0, 3));
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [acceptingBid, setAcceptingBid] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs().then((apiJobs) => {
      const openJobs = apiJobs.filter((j) => j.status === "open").slice(0, 5);
      if (openJobs.length > 0) setJobs(openJobs);
    });
  }, []);

  const activeJob = selectedJobId || jobs[0]?.id;

  // Live bids via WebSocket (falls back to REST internally)
  const { bids: realtimeBids, acceptBid: wsAcceptBid } = useRealtimeBids(activeJob || null);

  useEffect(() => {
    if (realtimeBids.length > 0) {
      setBids(realtimeBids.map((b) => ({
        id: b.id,
        jobId: activeJob!,
        contractor: mockContractors.find((c) => c.id === b.contractor?.id) || {
          ...mockContractors[0],
          name: b.contractor?.name || "Contractor",
          rating: b.contractor?.rating || 4.5,
        },
        amount: (b.amount || 0) / 100,
        message: b.message,
        timeline: b.timeline,
        status: b.status as Bid["status"],
        createdAt: b.placed_at,
      })));
    } else if (activeJob) {
      // Fallback to REST
      fetchBidsForJob(activeJob).then((apiBids) => {
        if (apiBids.length > 0) {
          setBids(apiBids.map((b) => ({
            id: b.id,
            jobId: activeJob,
            contractor: mockContractors.find((c) => c.id === b.contractor?.id) || mockContractors[0],
            amount: (b.amount || 0) / 100,
            message: b.message,
            timeline: b.timeline,
            status: b.status as Bid["status"],
            createdAt: b.placed_at,
          })));
        }
      });
    }
  }, [realtimeBids, activeJob]);

  const jobBids = bids.filter((b) => b.jobId === activeJob);
  const currentJob = jobs.find((j) => j.id === activeJob);

  const handleAccept = async (bidId: string) => {
    setAcceptingBid(bidId);
    try {
      if (activeJob) await api.acceptBid(activeJob, bidId);
      toast.success("Bid accepted");
    } catch {
      // API not available — mock delay
      await new Promise((r) => setTimeout(r, 1000));
      toast.error("Failed to accept bid");
    }
    setAcceptingBid(null);
  };

  const handleDecline = async (bidId: string) => {
    try {
      setBids((prev) =>
        prev.map((b) => (b.id === bidId ? { ...b, status: "declined" as const } : b))
      );
      toast.success("Bid declined");
    } catch {
      toast.error("Failed to decline bid");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Review Bids</h1>
          <p className="text-sm text-gray-700">
            {bids.length} bids across {jobs.length} active jobs
          </p>
        </div>
        <Link href="/homeowner/post-job">
          <Button size="sm">Post New Job</Button>
        </Link>
      </div>

      {/* Job Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {jobs.map((job) => {
          const count = bids.filter((b) => b.jobId === job.id).length;
          return (
            <button
              key={job.id}
              onClick={() => setSelectedJobId(job.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-sm border text-sm font-medium transition-colors",
                activeJob === job.id
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-800 hover:border-gray-300"
              )}
            >
              {job.title}
              <span className={cn(
                "ml-2 px-1.5 py-0.5 rounded-sm text-xs",
                activeJob === job.id ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* AI Estimate Banner */}
      {currentJob && (
        <Card className="mb-6 border-brand-200 bg-brand-50/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-brand-100 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">AI Estimated Range</p>
                <p className="text-xs text-gray-700">Based on ConstructionAI analysis of your job details</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-brand-700">
                {formatCurrency(currentJob.budget.min)} – {formatCurrency(currentJob.budget.max)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bids List */}
      {jobBids.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-700">No bids yet. Contractors in your area will start bidding soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobBids
            .sort((a, b) => a.amount - b.amount)
            .map((bid) => (
            <Card key={bid.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  {/* Contractor Info */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-sm bg-gray-100 flex items-center justify-center text-gray-600">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{bid.contractor.name}</h3>
                        {bid.contractor.verified && (
                          <Shield className="w-3.5 h-3.5 text-brand-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-700">{bid.contractor.company}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-700">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500" />
                          {bid.contractor.rating} ({bid.contractor.reviewCount})
                        </span>
                        <span>{bid.contractor.jobsCompleted} jobs done</span>
                        <span>{bid.contractor.yearsExperience}yr exp</span>
                      </div>
                    </div>
                  </div>

                  {/* Bid Amount */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(bid.amount)}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-700 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {bid.timeline}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-800 mt-3 pl-16">{bid.message}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pl-16">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(bid.id)}
                    disabled={acceptingBid === bid.id}
                  >
                    {acceptingBid === bid.id ? "Accepting..." : "Accept Bid"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-3.5 h-3.5 mr-1" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-700" onClick={() => handleDecline(bid.id)}>
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
