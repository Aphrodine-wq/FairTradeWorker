import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, COOKIE_MAX_AGE } from "@shared/lib/auth";

/**
 * POST /api/auth/sync-token
 *
 * Receives a JWT from the client (obtained from Spring Boot login)
 * and sets it as an httpOnly cookie so Next.js middleware can read it.
 * Verifies the token is a valid JWT before setting the cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    // Verify the JWT is valid before trusting it as the auth cookie
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("ftw-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
