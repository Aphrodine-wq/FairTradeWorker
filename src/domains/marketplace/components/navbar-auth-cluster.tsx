"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@shared/ui/button";
import { authStore } from "@shared/lib/auth-store";
import type { MarketingSession } from "@shared/lib/marketing-nav";
import { getAccountSettingsHref, getDashboardHref } from "@shared/lib/marketing-nav";

type Props = {
  session: MarketingSession | null;
  className?: string;
  /** Tailwind visibility for desktop cluster */
  desktopClassName?: string;
};

export function NavbarAuthCluster({ session, className, desktopClassName = "hidden md:flex" }: Props) {
  const router = useRouter();

  if (!session) {
    return (
      <div className={className}>
        <div className={`${desktopClassName} items-center gap-3`}>
          <Link href="/login" className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150">
            Log In
          </Link>
          <Button size="sm" asChild className="inline-flex">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    );
  }

  const dashboard = getDashboardHref(session);
  const account = getAccountSettingsHref(session);

  return (
    <div className={className}>
      <div className={`${desktopClassName} items-center gap-2`}>
        <Button size="sm" variant="outline" asChild>
          <Link href={dashboard}>Dashboard</Link>
        </Button>
        {account ? (
          <Button size="sm" variant="outline" asChild>
            <Link href={account}>Account</Link>
          </Button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            authStore.logout();
            router.push("/");
            router.refresh();
          }}
          className="text-sm text-gray-800 hover:text-gray-900 transition-colors duration-150 px-1"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
