import { NextRequest, NextResponse } from "next/server";

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, password } = body;

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    // Proxy to Spring Boot backend which verifies the reset token and updates password
    const res = await fetch(`${REALTIME_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Reset failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "Password reset successfully" });
  } catch {
    return NextResponse.json(
      { error: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
