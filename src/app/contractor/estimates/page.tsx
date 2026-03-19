"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Send } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { mockEstimates, type Estimate } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { type BadgeProps } from "@/components/ui/badge";

type BadgeVariant = BadgeProps["variant"];

const STATUS_CONFIG: Record<
  Estimate["status"],
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "info" },
  viewed: { label: "Viewed", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Declined", variant: "danger" },
  expired: { label: "Expired", variant: "outline" },
};

type TabValue = "all" | Estimate["status"];

function EstimatesTable({ estimates }: { estimates: Estimate[] }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (estimates.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm">
        No estimates found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
              Job / Client
            </th>
            <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">
              Amount
            </th>
            <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
              Status
            </th>
            <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">
              Date
            </th>
            <th className="w-12" />
          </tr>
        </thead>
        <tbody>
          {estimates.map((estimate) => {
            const config = STATUS_CONFIG[estimate.status];
            return (
              <tr
                key={estimate.id}
                className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-gray-900 truncate max-w-xs">
                    {estimate.jobTitle}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {estimate.clientName}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                  <span className="font-bold text-gray-900 tabular-nums">
                    {formatCurrency(estimate.amount)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Badge variant={config.variant}>{config.label}</Badge>
                </td>
                <td className="px-4 py-3.5 text-right text-gray-500 text-xs hidden md:table-cell">
                  {formatDate(estimate.createdDate)}
                </td>
                <td className="px-2 py-3.5 relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === estimate.id ? null : estimate.id)
                    }
                    className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openMenu === estimate.id && (
                    <div
                      className="absolute right-2 top-full mt-1 z-20 bg-white border border-border rounded-lg shadow-lg py-1 w-40"
                      onMouseLeave={() => setOpenMenu(null)}
                    >
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        View
                      </button>
                      {estimate.status === "draft" && (
                        <>
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                            <Edit className="w-3.5 h-3.5 text-gray-400" />
                            Edit
                          </button>
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-brand-600 hover:bg-brand-50 transition-colors">
                            <Send className="w-3.5 h-3.5" />
                            Send
                          </button>
                        </>
                      )}
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function EstimatesPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  const getFiltered = (status: TabValue) =>
    status === "all"
      ? mockEstimates
      : mockEstimates.filter((e) => e.status === status);

  const tabCounts: Record<TabValue, number> = {
    all: mockEstimates.length,
    draft: mockEstimates.filter((e) => e.status === "draft").length,
    sent: mockEstimates.filter((e) => e.status === "sent").length,
    viewed: mockEstimates.filter((e) => e.status === "viewed").length,
    accepted: mockEstimates.filter((e) => e.status === "accepted").length,
    declined: mockEstimates.filter((e) => e.status === "declined").length,
    expired: mockEstimates.filter((e) => e.status === "expired").length,
  };

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader
        title="Estimates"
        subtitle={`${mockEstimates.length} total estimates`}
        actions={
          <Link href="/contractor/estimates/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Estimate
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-8">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
        >
          <TabsList className="mb-6">
            {(
              [
                "all",
                "draft",
                "sent",
                "viewed",
                "accepted",
                "declined",
              ] as TabValue[]
            ).map((tab) => (
              <TabsTrigger key={tab} value={tab} className="capitalize gap-1.5">
                {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tabCounts[tab] > 0 && (
                  <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 leading-none data-[state=active]:bg-brand-100 data-[state=active]:text-brand-700">
                    {tabCounts[tab]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {(
            [
              "all",
              "draft",
              "sent",
              "viewed",
              "accepted",
              "declined",
            ] as TabValue[]
          ).map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="p-0">
                  <EstimatesTable estimates={getFiltered(tab)} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
