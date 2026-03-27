"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn, getInitials } from "@shared/lib/utils";
import { BrandMark } from "@shared/components/brand-mark";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  items: NavItem[];
  currentPath: string;
  userRole: "contractor" | "homeowner";
  topAction?: React.ReactNode;
}

const MOCK_USER = {
  contractor: { name: "Marcus Johnson", email: "marcus@johnson.com" },
  homeowner: { name: "Michael Brown", email: "michael@brown.com" },
};

export function Sidebar({ items, currentPath, userRole, topAction }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const user = MOCK_USER[userRole];

  return (
    <aside
      className={cn(
        "flex-shrink-0 flex h-screen flex-col bg-white border-r border-border transition-[width] duration-200 ease-in-out relative",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-center px-4 border-b border-border flex-shrink-0">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <BrandMark className="w-7 h-7 flex-shrink-0" />
            <span className="text-sm font-bold text-gray-900 truncate">FairTradeWorker</span>
          </Link>
        ) : (
          <Link href="/">
            <BrandMark className="w-7 h-7" />
          </Link>
        )}
      </div>

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
                "flex items-center gap-3 rounded-lg px-3 py-3 text-[16px] font-medium transition-colors",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Collapse + User + Logout */}
      <div className="border-t border-border flex-shrink-0">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-12 bg-white border border-gray-200 rounded-r-lg flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm z-20"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-400" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-400" />
          )}
        </button>
        <div className="px-3 pb-3">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "flex-col gap-2"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-700 text-xs font-bold">
                {getInitials(user.name)}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={() => router.push("/login")}
              className={cn(
                "flex-shrink-0 w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors",
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
