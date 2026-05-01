"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown, Ban, CheckCircle2 } from "lucide-react";
import { Input } from "@shared/ui/input";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { cn } from "@shared/lib/utils";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  active: boolean;
  created_at: string;
  last_login?: string;
}

const ROLE_FILTERS = ["all", "contractor", "homeowner", "subcontractor"] as const;

function getToken() {
  return localStorage.getItem("ftw-token") || "";
}

const API_BASE = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);
      const res = await fetch(`${API_BASE}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (userId: string, currentActive: boolean) => {
    const action = currentActive ? "suspended" : "active";
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        toast.success(`User ${action === "suspended" ? "suspended" : "reactivated"}`);
        fetchUsers();
      } else {
        toast.error("Failed to update user status");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
        Users
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Manage platform users, roles, and account status
      </p>

      {/* Filters */}
      <div className="flex items-center gap-3 mt-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors",
                roleFilter === r
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1) + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                User
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                Role
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                Joined
              </th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name || "Unnamed"}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className="text-xs capitalize"
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium",
                      user.active ? "text-green-700" : "text-red-600"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        user.active ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                    {user.active ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "--"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleUserStatus(user.id, user.active)}
                    className={cn(
                      "text-xs h-7",
                      user.active
                        ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                        : "text-green-600 hover:text-green-700 hover:bg-green-50"
                    )}
                  >
                    {user.active ? (
                      <>
                        <Ban className="w-3 h-3 mr-1" /> Suspend
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Reactivate
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                  {search ? "No users match your search" : "No users found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
