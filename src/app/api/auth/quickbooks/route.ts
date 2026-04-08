import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * GET /api/auth/quickbooks
 *
 * Initiates Intuit SSO flow. Redirects the user to QuickBooks OAuth2
 * with OpenID Connect scopes to get user identity.
 */

const INTUIT_AUTH_URL = "https://appcenter.intuit.com/connect/oauth2";

export async function GET() {
  const clientId = process.env.QB_CLIENT_ID;
  const redirectUri = process.env.QB_SSO_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/quickbooks/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: "QuickBooks SSO not configured" },
      { status: 503 }
    );
  }

  const state = crypto.randomBytes(16).toString("hex");

  const url = new URL(INTUIT_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "com.intuit.quickbooks.accounting openid profile email");
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url.toString());
  response.cookies.set("qb-sso-state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}
