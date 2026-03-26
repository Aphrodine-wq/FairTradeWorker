import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * POST /api/auth/sync-token
 *
 * Receives a JWT from the client (obtained from Spring Boot login)
 * and sets it as an httpOnly cookie so Next.js middleware can read it.
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("ftw-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
