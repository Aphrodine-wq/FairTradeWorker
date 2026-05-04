"use client";

import { useRouter } from "next/navigation";
import { cn } from "@shared/lib/utils";
import { authStore, type UserRoleClient } from "@shared/lib/auth-store";
import { DEMO_ACCESS_TOKENS, demoDashboardUrl } from "@shared/lib/demo-routes";

interface RoleSwitcherProps {
  activeRole: UserRoleClient;
  roles: UserRoleClient[];
  collapsed?: boolean;
}

const ROLE_CONFIG: Record<string, { label: string; shortLabel: string; dashboard: string }> = {
  contractor: { label: "Contractor", shortLabel: "GC", dashboard: "/contractor/dashboard" },
  subcontractor: { label: "Sub", shortLabel: "Sub", dashboard: "/subcontractor/dashboard" },
  homeowner: { label: "Homeowner", shortLabel: "HO", dashboard: "/homeowner/dashboard" },
};

export function RoleSwitcher({ activeRole, roles, collapsed }: RoleSwitcherProps) {
  const router = useRouter();

  // Only show if user has more than one role
  const switchableRoles = roles.filter((r) => r !== "homeowner");
  if (switchableRoles.length < 2) return null;

  function handleSwitch(targetRole: UserRoleClient) {
    if (targetRole === activeRole) return;

    // Check if this is a demo token — update the cookie directly and navigate
    const existingCookie = document.cookie.split("; ").find((c) => c.startsWith("ftw-token="));
    const rawTok = existingCookie?.split("=")[1] || "";
    const tokenValue = rawTok ? decodeURIComponent(rawTok) : "";
    if (DEMO_ACCESS_TOKENS.has(tokenValue)) {
      const tokenByRole: Record<UserRoleClient, string> = {
        contractor: "demo.contractor",
        subcontractor: "demo.subcontractor",
        homeowner: "demo.homeowner",
      };
      const nextTok = tokenByRole[targetRole];
      if (nextTok) {
        document.cookie = `ftw-token=${nextTok}; path=/`;
        const dest = demoDashboardUrl(nextTok) ?? ROLE_CONFIG[targetRole].dashboard;
        window.location.href = dest;
      }
      return;
    }

    // Real auth — use authStore
    authStore.switchRole(targetRole).then(() => {
      const config = ROLE_CONFIG[targetRole];
      if (config) window.location.href = config.dashboard;
    });
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 px-1 py-2">
        {switchableRoles.map((role) => {
          const config = ROLE_CONFIG[role];
          const isActive = role === activeRole;
          return (
            <button
              key={role}
              onClick={() => handleSwitch(role)}
              className={cn(
                "w-9 h-6 flex items-center justify-center text-[10px] font-bold transition-colors",
                isActive
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
              title={`Switch to ${config?.label}`}
            >
              {config?.shortLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 mx-3 my-2 bg-gray-100 p-0.5">
      {switchableRoles.map((role) => {
        const config = ROLE_CONFIG[role];
        const isActive = role === activeRole;
        return (
          <button
            key={role}
            onClick={() => handleSwitch(role)}
            className={cn(
              "flex-1 h-7 text-[12px] font-semibold transition-colors",
              isActive
                ? "bg-brand-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {config?.label}
          </button>
        );
      })}
    </div>
  );
}
