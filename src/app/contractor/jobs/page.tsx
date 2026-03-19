"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { JobCard } from "@/components/app/job-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockJobs } from "@/lib/mock-data";
import { JOB_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const URGENCY_OPTIONS = ["all", "low", "medium", "high"] as const;
type UrgencyFilter = (typeof URGENCY_OPTIONS)[number];

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState<UrgencyFilter>("all");

  const openJobs = mockJobs.filter((j) => j.status === "open");

  const filtered = openJobs.filter((job) => {
    const matchSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === "all" || job.category === selectedCategory;

    const matchLocation =
      !location ||
      job.location.toLowerCase().includes(location.toLowerCase());

    const matchUrgency = urgency === "all" || job.urgency === urgency;

    return matchSearch && matchCategory && matchLocation && matchUrgency;
  });

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setLocation("");
    setUrgency("all");
  };

  const hasFilters =
    search || selectedCategory !== "all" || location || urgency !== "all";

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader
        title="Browse Jobs"
        subtitle={`${openJobs.length} open jobs in your area`}
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Filter Bar */}
        <div className="bg-white border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
            >
              <option value="all">All Categories</option>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Location */}
            <Input
              placeholder="Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            {/* Urgency */}
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyFilter)}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
            >
              <option value="all">All Urgencies</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2">
              {search && (
                <Badge variant="secondary" className="gap-1.5 cursor-pointer" onClick={() => setSearch("")}>
                  Search: &ldquo;{search}&rdquo;
                  <span className="text-gray-400 hover:text-gray-600">&times;</span>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1.5 cursor-pointer" onClick={() => setSelectedCategory("all")}>
                  {selectedCategory}
                  <span className="text-gray-400 hover:text-gray-600">&times;</span>
                </Badge>
              )}
              {location && (
                <Badge variant="secondary" className="gap-1.5 cursor-pointer" onClick={() => setLocation("")}>
                  {location}
                  <span className="text-gray-400 hover:text-gray-600">&times;</span>
                </Badge>
              )}
              {urgency !== "all" && (
                <Badge variant="secondary" className="gap-1.5 cursor-pointer" onClick={() => setUrgency("all")}>
                  {urgency} urgency
                  <span className="text-gray-400 hover:text-gray-600">&times;</span>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length === 0
              ? "No jobs match your filters."
              : `${filtered.length} job${filtered.length === 1 ? "" : "s"} found`}
          </p>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-border rounded-xl py-16 text-center">
              <p className="text-gray-400 text-sm mb-3">No jobs found with those filters.</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
