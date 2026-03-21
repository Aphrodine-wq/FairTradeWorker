"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import { Sidebar } from "@shared/components/sidebar";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/homeowner/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/homeowner/jobs", icon: Briefcase },
  { label: "Contractors", href: "/homeowner/contractors", icon: Users },
  { label: "Projects", href: "/homeowner/projects", icon: FolderOpen },
  { label: "Messages", href: "/homeowner/messages", icon: MessageSquare },
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
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
