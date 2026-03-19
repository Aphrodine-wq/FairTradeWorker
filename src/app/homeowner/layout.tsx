"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  FolderOpen,
  Settings,
} from "lucide-react";
import { Sidebar } from "@/components/app/sidebar";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/homeowner/dashboard", icon: LayoutDashboard },
  { label: "Post a Job", href: "/homeowner/post-job", icon: PlusCircle },
  { label: "Find Contractors", href: "/homeowner/contractors", icon: Search },
  { label: "My Projects", href: "/homeowner/projects", icon: FolderOpen },
  { label: "Settings", href: "/homeowner/settings", icon: Settings },
];

export default function HomeownerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar items={NAV_ITEMS} currentPath={pathname} userRole="homeowner" />
      {/* Main content — offset by sidebar width. Sidebar is fixed, so use ml-64. */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden ml-64">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
