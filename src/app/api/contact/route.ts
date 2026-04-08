import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * POST /api/contact
 *
 * Receives contact form submissions. For now, logs to console.
 * Wire to SendGrid/Resend/SMTP when ready.
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // TODO: wire to email service

    // If Spring Boot backend is available, forward there too
    const backendUrl = process.env.NEXT_PUBLIC_REALTIME_URL;
    if (backendUrl) {
      try {
        await fetch(`${backendUrl}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, subject, message }),
        });
      } catch {
        // Backend forwarding is optional
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process contact form" },
      { status: 500 }
    );
  }
}
