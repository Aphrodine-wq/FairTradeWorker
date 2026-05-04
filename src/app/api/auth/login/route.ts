import { NextRequest, NextResponse } from "next/server";
import { createToken, COOKIE_MAX_AGE } from "@shared/lib/auth";

/** ftw-svc (Spring) base URL — server-side; prefer FTW_SVC_URL to avoid coupling to the public client env name. */
const BACKEND_URL =
  process.env.FTW_SVC_URL || process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error || err.message || "Invalid credentials" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const user = data.user;

    // Mint a JWT with the same secret as middleware (`SECRET_KEY_BASE` or `JWT_SECRET`).
    // The original backend token is returned as `token` for use by backend API calls.
    const cookieToken = createToken({
      userId: String(user.id),
      email: String(user.email),
      role: String(user.role).toUpperCase() as any,
      roles: ((user.roles || [user.role]) as string[]).map((r: string) => String(r).toUpperCase() as any),
    });

    const response = NextResponse.json({ token: data.token, cookieToken, user });
    response.cookies.set("ftw-token", cookieToken, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
  }
}
