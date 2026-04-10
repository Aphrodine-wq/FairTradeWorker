import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@shared/lib/auth";
import { buildAuthUrl } from "@shared/lib/quickbooks";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = randomBytes(16).toString("hex");
    const authUrl = buildAuthUrl(state);

    const response = NextResponse.json({ authUrl });
    response.cookies.set("qb_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to build auth URL";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
