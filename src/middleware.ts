import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@shared/lib/rate-limit";

/**
 * Next.js middleware for FairTradeWorker.
 *
 * - Rate-limits auth paths: /login, /signup, /forgot-password, /api/auth/* — 10 req/min per IP
 * - Security headers on all responses
 *
 * NOTE: This middleware does NOT run while `output: "export"` is set in
 * next.config.ts (static export). Once a server-side deployment is enabled
 * (dropping the export flag), this kicks in automatically.
 */

// ---------------------------------------------------------------------------
// Auth rate-limit config
// ---------------------------------------------------------------------------

const AUTH_RATE_LIMIT_PATHS = ["/login", "/signup", "/forgot-password", "/api/auth"];
const AUTH_RATE_LIMIT = 10; // requests
const AUTH_RATE_WINDOW = 60_000; // 1 minute

function isAuthPath(pathname: string): boolean {
  return AUTH_RATE_LIMIT_PATHS.some((p) => pathname.startsWith(p));
}

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return response;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate-limit auth endpoints: 10 requests per minute per IP
  if (isAuthPath(pathname)) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const key = `auth:${ip}`;
    const { allowed, remaining, resetAt } = checkRateLimit(
      key,
      AUTH_RATE_LIMIT,
      AUTH_RATE_WINDOW,
    );

    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      const response = NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
      response.headers.set("Retry-After", String(retryAfter));
      response.headers.set("X-RateLimit-Limit", String(AUTH_RATE_LIMIT));
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
      return addSecurityHeaders(response);
    }

    // Attach rate-limit info headers to successful auth requests
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(AUTH_RATE_LIMIT));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
    return addSecurityHeaders(response);
  }

  // Route protection for authenticated areas
  if (pathname.startsWith("/contractor") || pathname.startsWith("/homeowner") || pathname.startsWith("/subcontractor")) {
    const token = request.cookies.get("ftw-token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    // Skip role checking for demo tokens — they bypass auth entirely
    if (token.startsWith("demo.")) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Check role from JWT payload (full verification in API routes)
    // Backend sends lowercase enum names (e.g. "contractor", "sub_contractor")
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const rawRole = String(payload.role).toLowerCase().replace("_", "");
      if (pathname.startsWith("/contractor") && rawRole !== "contractor") {
        const fallback = rawRole === "subcontractor" ? "/subcontractor/dashboard" : "/homeowner/dashboard";
        return addSecurityHeaders(NextResponse.redirect(new URL(fallback, request.url)));
      }
      if (pathname.startsWith("/homeowner") && rawRole !== "homeowner") {
        const fallback = rawRole === "subcontractor" ? "/subcontractor/dashboard" : "/contractor/dashboard";
        return addSecurityHeaders(NextResponse.redirect(new URL(fallback, request.url)));
      }
      if (pathname.startsWith("/subcontractor") && rawRole !== "subcontractor") {
        const fallback = rawRole === "contractor" ? "/contractor/dashboard" : "/homeowner/dashboard";
        return addSecurityHeaders(NextResponse.redirect(new URL(fallback, request.url)));
      }
    } catch {
      const resp = NextResponse.redirect(new URL("/login", request.url));
      resp.cookies.delete("ftw-token");
      return addSecurityHeaders(resp);
    }
  }

  // All other routes — pass through with security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
