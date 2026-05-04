import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { checkRateLimit } from "@shared/lib/rate-limit";
import { DEMO_ACCESS_TOKENS, demoDashboardUrl } from "@shared/lib/demo-routes";

/**
 * Next.js middleware for FairTradeWorker.
 *
 * - JWT signature + expiry verification via `jose` (Edge-compatible)
 * - Rate-limits public auth pages: /login, /signup, /forgot-password, /reset-password — 10 req/min per IP
 * - Security headers on all responses
 */

// ---------------------------------------------------------------------------
// JWT config (must match auth.ts and Spring Boot)
// ---------------------------------------------------------------------------

// Must match `src/shared/lib/auth.ts` (createToken / verifyToken) so cookies minted
// on the login API route verify here. Spring/local often uses SECRET_KEY_BASE.
const signingSecret =
  process.env.SECRET_KEY_BASE ||
  process.env.JWT_SECRET ||
  "dev-secret-key-change-in-production";
const JWT_SECRET = new TextEncoder().encode(signingSecret);

interface JwtPayload {
  role: string;
  exp?: number;
}

async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Auth rate-limit config
// ---------------------------------------------------------------------------

const AUTH_RATE_LIMIT_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];
const AUTH_RATE_LIMIT = 10; // requests
const AUTH_RATE_WINDOW = 60_000; // 1 minute

const FAIRPRICE_RATE_LIMIT = 5; // requests — each one burns GPU
const FAIRPRICE_RATE_WINDOW = 60_000; // 1 minute

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
// Helpers
// ---------------------------------------------------------------------------

function redirectToLogin(request: NextRequest, pathname: string, clearCookie = false): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  const resp = NextResponse.redirect(loginUrl);
  if (clearCookie) resp.cookies.delete("ftw-token");
  return addSecurityHeaders(resp);
}

function normalizeRole(role: string): string {
  return String(role).toLowerCase().replace("_", "");
}

function getRoleFallback(rawRole: string, target: string): string {
  if (target === "contractor") return rawRole === "subcontractor" ? "/subcontractor/dashboard" : "/homeowner/dashboard";
  if (target === "homeowner") return rawRole === "subcontractor" ? "/subcontractor/dashboard" : "/contractor/dashboard";
  if (target === "subcontractor") return rawRole === "contractor" ? "/contractor/dashboard" : "/homeowner/dashboard";
  return "/login";
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
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

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(AUTH_RATE_LIMIT));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
    return addSecurityHeaders(response);
  }

  // Rate-limit FairPrice AI endpoint: 5 requests per minute per IP
  if (pathname === "/api/fairprice") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const key = `fairprice:${ip}`;
    const { allowed, remaining, resetAt } = checkRateLimit(
      key,
      FAIRPRICE_RATE_LIMIT,
      FAIRPRICE_RATE_WINDOW,
    );

    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      const response = NextResponse.json(
        { error: "Too many estimate requests. Please wait a moment.", fallback: true },
        { status: 429 },
      );
      response.headers.set("Retry-After", String(retryAfter));
      return addSecurityHeaders(response);
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(FAIRPRICE_RATE_LIMIT));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return addSecurityHeaders(response);
  }

  // Demo sandbox — only demo cookie values; real JWT users are sent to the production app
  if (pathname.startsWith("/demo/")) {
    const token = request.cookies.get("ftw-token")?.value;
    if (!token) {
      return redirectToLogin(request, pathname);
    }

    if (DEMO_ACCESS_TOKENS.has(token)) {
      const expectedPrefix =
        token === "demo.contractor"
          ? "/demo/contractor"
          : token === "demo.homeowner"
            ? "/demo/homeowner"
            : "/demo/subcontractor";
      if (!pathname.startsWith(expectedPrefix)) {
        const dest = demoDashboardUrl(token);
        if (dest) {
          return addSecurityHeaders(NextResponse.redirect(new URL(dest, request.url)));
        }
        return redirectToLogin(request, pathname);
      }
      return addSecurityHeaders(NextResponse.next());
    }

    const demoJwtPayload = await verifyJwt(token);
    if (demoJwtPayload) {
      const r = normalizeRole(demoJwtPayload.role);
      const dest =
        r === "homeowner"
          ? "/homeowner/dashboard"
          : r === "subcontractor"
            ? "/subcontractor/dashboard"
            : "/contractor/dashboard";
      return addSecurityHeaders(NextResponse.redirect(new URL(dest, request.url)));
    }

    return redirectToLogin(request, pathname, true);
  }

  // Route protection for authenticated areas
  if (pathname.startsWith("/contractor") || pathname.startsWith("/homeowner") || pathname.startsWith("/subcontractor") || pathname.startsWith("/admin")) {
    const token = request.cookies.get("ftw-token")?.value;
    if (!token) {
      return redirectToLogin(request, pathname);
    }

    if (DEMO_ACCESS_TOKENS.has(token)) {
      const dest = demoDashboardUrl(token);
      if (dest) {
        return addSecurityHeaders(NextResponse.redirect(new URL(dest, request.url)));
      }
      return redirectToLogin(request, pathname);
    }

    // Verify JWT signature and expiry using jose (Edge-compatible)
    const payload = await verifyJwt(token);
    if (!payload) {
      // Token is invalid or expired — clear it and redirect to login
      return redirectToLogin(request, pathname, true);
    }

    // Role-based routing
    const rawRole = normalizeRole(payload.role);
    const roleChecks: [string, string][] = [
      ["/contractor", "contractor"],
      ["/homeowner", "homeowner"],
      ["/subcontractor", "subcontractor"],
    ];

    // Admin routes require admin role
    if (pathname.startsWith("/admin") && rawRole !== "admin") {
      return addSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
    }

    for (const [prefix, expectedRole] of roleChecks) {
      if (pathname.startsWith(prefix) && rawRole !== expectedRole) {
        const fallback = getRoleFallback(rawRole, expectedRole);
        return addSecurityHeaders(NextResponse.redirect(new URL(fallback, request.url)));
      }
    }
  }

  // All other routes — pass through with security headers
  return addSecurityHeaders(NextResponse.next());
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
