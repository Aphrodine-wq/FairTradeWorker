"use client";

import { useState } from "react";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  User,
  Building2,
  Briefcase,
  Clock,
} from "lucide-react";
import { Input } from "@shared/ui/input";
import { Badge } from "@shared/ui/badge";
import { formatCurrency, cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

interface SubClient {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  rating: number;
  subJobsCompleted: number;
  activeSubJobs: number;
  totalRevenue: number;
  lastActivity: string;
  status: "active" | "past";
  specialty: string;
}

const MOCK_CLIENTS: SubClient[] = [
  {
    id: "c1",
    name: "Marcus Johnson",
    company: "Johnson & Sons Construction",
    email: "marcus@johnsonsons.com",
    phone: "(512) 555-0147",
    location: "Oxford, MS",
    rating: 4.9,
    subJobsCompleted: 8,
    activeSubJobs: 2,
    totalRevenue: 42500,
    lastActivity: "2026-03-28",
    status: "active",
    specialty: "General Contracting",
  },
  {
    id: "c4",
    name: "James Mitchell",
    company: "Mitchell Roofing Co.",
    email: "james@mitchellroofing.com",
    phone: "(713) 555-0291",
    location: "Jackson, MS",
    rating: 4.9,
    subJobsCompleted: 3,
    activeSubJobs: 1,
    totalRevenue: 12800,
    lastActivity: "2026-03-29",
    status: "active",
    specialty: "Roofing",
  },
  {
    id: "c7",
    name: "Tony Rivera",
    company: "Rivera General Contracting",
    email: "tony@riveragc.com",
    phone: "(210) 555-0183",
    location: "Hattiesburg, MS",
    rating: 4.6,
    subJobsCompleted: 5,
    activeSubJobs: 0,
    totalRevenue: 19200,
    lastActivity: "2026-03-10",
    status: "past",
    specialty: "General Contracting",
  },
];

type FilterTab = "all" | "active" | "past";

export default function SubContractorClientsPage() {
  usePageTitle("Clients");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = MOCK_CLIENTS.filter((c) => {
    if (tab !== "all" && c.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selected = selectedId ? MOCK_CLIENTS.find((c) => c.id === selectedId) : null;

  return (
    <div className="flex h-full">
      {/* Client List */}
      <div className="w-[340px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-gray-200">
          <h1 className="text-[20px] font-semibold text-gray-900">Clients</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Contractors who hire you</p>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="pl-8 h-8 text-[13px] rounded-sm"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3">
            {(["all", "active", "past"] as FilterTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 h-7 text-[12px] font-semibold transition-colors capitalize",
                  tab === t ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedId(client.id)}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                selectedId === client.id && "bg-brand-50 border-l-2 border-l-brand-600"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900 truncate">{client.name}</p>
                  <p className="text-[12px] text-gray-500 truncate">{client.company}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[12px] font-semibold text-gray-900 tabular-nums">{client.subJobsCompleted} jobs</p>
                  <div className="flex items-center gap-0.5 justify-end mt-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-semibold text-gray-600">{client.rating}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-[13px] font-semibold text-gray-900">No clients found</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-700 font-bold text-lg">
                  {selected.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-[20px] font-bold text-gray-900">{selected.name}</h2>
                <p className="text-[14px] text-gray-600">{selected.company}</p>
                <div className="flex items-center gap-3 mt-2 text-[13px] text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selected.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{selected.specialty}</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />{selected.rating}
                  </span>
                </div>
              </div>
              <Badge variant={selected.status === "active" ? "success" : "secondary"} className="capitalize">
                {selected.status}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 p-4">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Revenue</p>
                <p className="text-[20px] font-bold text-gray-900 tabular-nums mt-1">{formatCurrency(selected.totalRevenue)}</p>
              </div>
              <div className="bg-white border border-gray-200 p-4">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Jobs Done</p>
                <p className="text-[20px] font-bold text-gray-900 tabular-nums mt-1">{selected.subJobsCompleted}</p>
              </div>
              <div className="bg-white border border-gray-200 p-4">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Active</p>
                <p className="text-[20px] font-bold text-brand-600 tabular-nums mt-1">{selected.activeSubJobs}</p>
              </div>
              <div className="bg-white border border-gray-200 p-4">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Last Activity</p>
                <p className="text-[14px] font-semibold text-gray-900 mt-1">{selected.lastActivity}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white border border-gray-200 p-4 mb-6">
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-[13px]">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-900">{selected.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px]">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-900">{selected.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px]">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-900">{selected.location}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Building2 className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-[15px] font-semibold text-gray-900">Select a client</p>
            <p className="text-[13px] text-gray-500 mt-1">Choose a contractor to see details</p>
          </div>
        )}
      </div>
    </div>
  );
}
