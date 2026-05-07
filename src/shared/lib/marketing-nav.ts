import type { UserRoleClient } from "./auth-store";
import { DEMO_ACCESS_TOKENS } from "./demo-routes";

const FTW_COOKIE = "ftw-token";

/** Session inferred from the ftw-token cookie (server or client that reads the same paths). */
export type MarketingSession = { kind: "real"; role: UserRoleClient } | { kind: "demo"; role: UserRoleClient };

export function normalizeMarketingRole(role: string): UserRoleClient {
  const r = String(role).toLowerCase().replace(/_/g, "");
  if (r === "homeowner") return "homeowner";
  if (r === "subcontractor") return "subcontractor";
  return "contractor";
}

function demoCookieToRole(token: string): UserRoleClient {
  if (token === "demo.homeowner") return "homeowner";
  if (token === "demo.subcontractor") return "subcontractor";
  return "contractor";
}

function decodeJwtPayloadUnsafe(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/**
 * Read role from a JWT for marketing UI only (no signature verification).
 * Used in the public navbar on the client; protected routes still verify server-side.
 */
export function parseMarketingSessionFromFtwToken(token: string | null | undefined): MarketingSession | null {
  if (!token) return null;
  if (DEMO_ACCESS_TOKENS.has(token)) {
    return { kind: "demo", role: demoCookieToRole(token) };
  }
  const payload = decodeJwtPayloadUnsafe(token);
  if (!payload || typeof payload.exp !== "number") return null;
  if (payload.exp * 1000 < Date.now() + 15_000) return null;
  const roleRaw = typeof payload.role === "string" ? payload.role : "";
  if (!roleRaw) return null;
  return { kind: "real", role: normalizeMarketingRole(roleRaw) };
}

export function readFtwTokenFromDocumentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie.split("; ").find((p) => p.startsWith(`${FTW_COOKIE}=`));
  if (!row) return null;
  const v = row.slice(FTW_COOKIE.length + 1);
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export function getDashboardHref(session: MarketingSession): string {
  if (session.kind === "demo") {
    if (session.role === "homeowner") return "/demo/homeowner/dashboard";
    if (session.role === "subcontractor") return "/demo/subcontractor/dashboard";
    return "/demo/contractor/dashboard";
  }
  if (session.role === "homeowner") return "/homeowner/dashboard";
  if (session.role === "subcontractor") return "/subcontractor/dashboard";
  return "/contractor/dashboard";
}

/**
 * Settings area for account-style info. Demo sandbox has no settings routes in-app,
 * so this returns null and callers may hide the control.
 */
export function getAccountSettingsHref(session: MarketingSession): string | null {
  if (session.kind === "demo") return null;
  if (session.role === "homeowner") return "/homeowner/settings?section=profile";
  if (session.role === "subcontractor") return "/subcontractor/settings?section=account";
  return "/contractor/settings?section=account";
}
