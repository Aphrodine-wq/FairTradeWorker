"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  items: NavItem[];
  currentPath: string;
  userRole: "contractor" | "homeowner";
}

const MOCK_USER = {
  contractor: { name: "Marcus Johnson", email: "marcus@johnson.com" },
  homeowner: { name: "Michael Brown", email: "michael@brown.com" },
};

export function Sidebar({ items, currentPath, userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const user = MOCK_USER[userRole];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-white border-r border-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border flex-shrink-0">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">FTW</span>
            </div>
            <span className="text-sm font-bold text-gray-900 truncate">FairTradeWorker</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">FTW</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-md border border-border bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors",
            collapsed && "mx-auto mt-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User + Logout */}
      <div className="border-t border-border p-3 flex-shrink-0">
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
    </aside>
  );
}
