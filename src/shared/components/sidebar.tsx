"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn, getInitials } from "@shared/lib/utils";
import { BrandMark } from "@shared/components/brand-mark";
import { RoleSwitcher } from "@shared/components/role-switcher";
import type { UserRoleClient } from "@shared/lib/auth-store";
import { authStore } from "@shared/lib/auth-store";
import { api } from "@shared/lib/realtime";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  items: NavItem[];
  currentPath: string;
  userRole: "contractor" | "homeowner" | "subcontractor";
  roles?: UserRoleClient[];
  topAction?: React.ReactNode;
  autoCollapse?: boolean;
}

/** Shown in /demo/* sidebars and as legacy placeholder labels */
const MOCK_USER: Record<string, { name: string; email: string; rating: number }> = {
  contractor: { name: "Marcus Johnson", email: "marcus@johnson.com", rating: 4.8 },
  homeowner: { name: "Michael Brown", email: "michael@brown.com", rating: 4.9 },
  subcontractor: { name: "Marcus Johnson", email: "marcus@johnson.com", rating: 4.7 },
};

type Profile = { name: string; email: string; rating?: number };

function safeName(name: string | null | undefined, email?: string): string {
  const cleaned = (name || "").trim();
  if (cleaned && cleaned.toLowerCase() !== "undefined" && cleaned.toLowerCase() !== "null") return cleaned;
  if (email && email.includes("@")) return email.split("@")[0];
  return "Account";
}

function demoProfileForPath(pathname: string, userRole: SidebarProps["userRole"]): Profile | null {
  if (pathname.startsWith("/demo/contractor") && userRole === "contractor") return MOCK_USER.contractor;
  if (pathname.startsWith("/demo/homeowner") && userRole === "homeowner") return MOCK_USER.homeowner;
  if (pathname.startsWith("/demo/subcontractor") && userRole === "subcontractor") return MOCK_USER.subcontractor;
  return null;
}

export function Sidebar({ items, currentPath, userRole, roles, topAction, autoCollapse }: SidebarProps) {
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);
  const collapsed = manualOverride ?? (autoCollapse || false);
  const router = useRouter();
  const pathname = usePathname();
  const demoProfile = demoProfileForPath(pathname, userRole);
  const [profile, setProfile] = useState<Profile | null>(() => demoProfile);

  useEffect(() => {
    setManualOverride(null);
  }, [autoCollapse]);

  useEffect(() => {
    if (demoProfile) {
      setProfile(demoProfile);
      return;
    }

    const applyStore = () => {
      const u = authStore.getUser();
      if (u) {
        setProfile({ name: safeName(u.name, u.email), email: u.email });
      }
    };
    applyStore();

    let cancelled = false;
    if (!authStore.getUser()) {
      api
        .me()
        .then((res) => {
          if (cancelled) return;
          const raw = res.user as Record<string, unknown>;
          const name = String(raw?.name ?? "").trim();
          const email = String(raw?.email ?? "").trim();
          if (email) setProfile({ name: safeName(name, email), email });
        })
        .catch(() => {});
    }

    const unsub = authStore.subscribe(() => {
      if (demoProfileForPath(pathname, userRole)) return;
      const u = authStore.getUser();
      if (u) setProfile({ name: safeName(u.name, u.email), email: u.email });
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [demoProfile, pathname, userRole]);

  const display = profile ?? { name: "Account", email: "", rating: undefined };
  const showRating = display.rating != null && display.rating > 0;

  function handleLogout() {
    authStore.logout();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "flex-shrink-0 flex h-screen flex-col bg-white border-r border-border transition-[width] duration-200 ease-in-out relative",
        collapsed ? "w-14" : "w-48"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-center px-4 border-b border-border flex-shrink-0">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <BrandMark className="w-7 h-7 flex-shrink-0" />
            <span className="text-xs font-bold text-gray-900 truncate">FairTradeWorker</span>
          </Link>
        ) : (
          <Link href="/">
            <BrandMark className="w-7 h-7" />
          </Link>
        )}
      </div>

      {/* Role Switcher */}
      {roles && roles.length > 1 && (
        <RoleSwitcher activeRole={userRole} roles={roles} collapsed={collapsed} />
      )}

      {/* Top Action */}
      {topAction && !collapsed && (
        <div className="px-3 pt-4">{topAction}</div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-sm px-2.5 py-2.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-gray-800 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Collapse + User + Logout */}
      <div className="border-t border-border flex-shrink-0">
        <button
          onClick={() => setManualOverride((prev) => !(prev ?? autoCollapse ?? false))}
          className="absolute bottom-16 -right-3 w-6 h-12 bg-white border border-gray-200 rounded-sm-lg flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm z-20"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600" />
          )}
        </button>
        <div className="px-3 pb-3">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "flex-col gap-2"
            )}
          >
            <div className="w-8 h-8 rounded-sm bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-700 text-xs font-bold">
                {getInitials(display.name)}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{display.name}</p>
                {showRating ? (
                  <p className="text-[11px] leading-tight mt-0.5">
                    <span className="text-amber-500">&#9733;</span>{" "}
                    <span className="font-semibold text-gray-800">{display.rating}</span>
                  </p>
                ) : null}
                {display.email ? (
                  <p className="text-xs text-gray-700 truncate">{display.email}</p>
                ) : null}
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "flex-shrink-0 w-7 h-7 rounded-sm hover:bg-red-50 flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors",
                collapsed && "mx-auto"
              )}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
