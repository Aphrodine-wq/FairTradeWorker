"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { ContractorCard } from "@/components/app/contractor-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockContractors, type Contractor } from "@/lib/mock-data";

const SPECIALTIES = [
  "All",
  "General Contracting",
  "Electrical",
  "Plumbing",
  "Roofing",
  "Painting",
  "Flooring",
];

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rating" },
  { value: "experience", label: "Most Experience" },
  { value: "price_asc", label: "Lowest Price" },
  { value: "price_desc", label: "Highest Price" },
  { value: "reviews", label: "Most Reviews" },
];

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export default function ContractorsPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [location, setLocation] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list: Contractor[] = [...mockContractors];

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.specialty.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Specialty filter
    if (specialty !== "All") {
      list = list.filter((c) => c.specialty === specialty);
    }

    // Location filter
    if (location.trim()) {
      const loc = location.toLowerCase();
      list = list.filter((c) => c.location.toLowerCase().includes(loc));
    }

    // Min rating
    if (minRating) {
      const min = parseFloat(minRating);
      if (!isNaN(min)) list = list.filter((c) => c.rating >= min);
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return b.yearsExperience - a.yearsExperience;
        case "price_asc":
          return a.hourlyRate - b.hourlyRate;
        case "price_desc":
          return b.hourlyRate - a.hourlyRate;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    return list;
  }, [search, specialty, location, minRating, sortBy]);

  const hasActiveFilters =
    specialty !== "All" || location.trim() || minRating.trim();

  function clearFilters() {
    setSpecialty("All");
    setLocation("");
    setMinRating("");
  }

  return (
    <div className="p-8">
      <AppHeader
        title="Find Contractors"
        subtitle={`${filtered.length} verified contractor${filtered.length !== 1 ? "s" : ""} available`}
      />

      {/* Search + Filter Row */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, company, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters((f) => !f)}
            className={cn(showFilters && "border-brand-600 text-brand-600 bg-brand-50")}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 w-4 h-4 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                !
              </span>
            )}
          </Button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 bg-white border border-border rounded-xl">
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium text-gray-500">Location</label>
              <Input
                placeholder="City, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-[120px]">
              <label className="text-xs font-medium text-gray-500">Min Rating</label>
              <Input
                type="number"
                placeholder="4.5"
                min="1"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-xs font-medium text-gray-500">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-8 text-sm rounded-lg border border-border bg-white px-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Specialty pill tabs */}
        <div className="flex gap-2 flex-wrap">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                specialty === s
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "bg-white border-border text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No contractors match your filters.</p>
          <Button variant="link" onClick={clearFilters} className="mt-2">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((contractor) => (
            <ContractorCard
              key={contractor.id}
              contractor={contractor}
              onViewProfile={(c) => console.log("View profile:", c.id)}
              onRequestEstimate={(c) => console.log("Request estimate:", c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
