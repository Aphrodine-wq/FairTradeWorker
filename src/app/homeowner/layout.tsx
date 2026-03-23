"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FolderOpen,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Sidebar } from "@shared/components/sidebar";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/homeowner/dashboard", icon: LayoutDashboard },
  { label: "My Jobs", href: "/homeowner/jobs", icon: Briefcase },
  { label: "Find Contractors", href: "/homeowner/contractors", icon: Users },
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
      <Sidebar
        items={NAV_ITEMS}
        currentPath={pathname}
        userRole="homeowner"
        topAction={
          <Link
            href="/homeowner/jobs"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-3 px-4 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post a Job
          </Link>
        }
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
