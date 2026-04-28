import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendContactNotification, sendContactReceipt } from "@shared/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (typeof message !== "string" || message.length > 5000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const [notify] = await Promise.all([
      sendContactNotification({ name, email, subject, message }),
      sendContactReceipt({ name, email }),
    ]);

    if (!notify.ok) {
      return NextResponse.json(
        { error: "Couldn't send your message. Please try again or email hello@fairtradeworker.com directly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process contact form" },
      { status: 500 }
    );
  }
}
