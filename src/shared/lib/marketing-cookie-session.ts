import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { DEMO_ACCESS_TOKENS } from "./demo-routes";
import type { MarketingSession } from "./marketing-nav";
import { normalizeMarketingRole } from "./marketing-nav";

function demoCookieToRole(token: string): MarketingSession["role"] {
  if (token === "demo.homeowner") return "homeowner";
  if (token === "demo.subcontractor") return "subcontractor";
  return "contractor";
}

/** Best-effort session from httpOnly-visible cookie (marketing layout / RSC). */
export async function getMarketingSessionFromCookies(): Promise<MarketingSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("ftw-token")?.value;
  if (!raw) return null;

  let token = raw;
  try {
    token = decodeURIComponent(raw);
  } catch {
    token = raw;
  }

  if (DEMO_ACCESS_TOKENS.has(token)) {
    return { kind: "demo", role: demoCookieToRole(token) };
  }

  const payload = verifyToken(token);
  if (!payload) return null;

  return { kind: "real", role: normalizeMarketingRole(payload.role) };
}
