import { NextRequest, NextResponse } from "next/server";

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  try {
    // Proxy to Spring Boot backend which handles token generation + email sending
    await fetch(`${REALTIME_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    // Swallow errors — never leak whether backend is up or email exists
  }

  // Always return success to avoid leaking whether the email exists
  return NextResponse.json({
    message: "If an account exists, a reset link has been sent.",
  });
}
