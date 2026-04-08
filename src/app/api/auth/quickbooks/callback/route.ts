import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { createToken, COOKIE_MAX_AGE } from "@shared/lib/auth";

/**
 * GET /api/auth/quickbooks/callback
 *
 * Handles the OAuth2 callback from Intuit. Exchanges the authorization code
 * for tokens, fetches user info from Intuit's OpenID userinfo endpoint,
 * then finds or creates the user and logs them in.
 */

const INTUIT_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const INTUIT_USERINFO_URL = "https://accounts.platform.intuit.com/v1/openid_connect/userinfo";

function getBasicAuth(): string {
  const clientId = process.env.QB_CLIENT_ID;
  const clientSecret = process.env.QB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("QB_CLIENT_ID and QB_CLIENT_SECRET must be set");
  }
  return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const realmId = searchParams.get("realmId");
  const error = searchParams.get("error");
  const storedState = req.cookies.get("qb-sso-state")?.value;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Error from Intuit (user denied, etc.)
  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=qb_denied`);
  }

  // Validate state to prevent CSRF
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${baseUrl}/login?error=qb_invalid_state`);
  }

  const redirectUri = process.env.QB_SSO_REDIRECT_URI || `${baseUrl}/api/auth/quickbooks/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(INTUIT_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${getBasicAuth()}`,
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      console.error("QB token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=qb_token_failed`);
    }

    const tokens = await tokenRes.json();

    // Fetch user profile from Intuit OpenID Connect
    const userInfoRes = await fetch(INTUIT_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/json",
      },
    });

    if (!userInfoRes.ok) {
      console.error("QB userinfo failed:", await userInfoRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=qb_userinfo_failed`);
    }

    const profile = await userInfoRes.json();
    const email = profile.email;
    const name = [profile.givenName, profile.familyName].filter(Boolean).join(" ") || email;

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/login?error=qb_no_email`);
    }

    // Find or create user (with contractor relation for QB connection)
    let user = await prisma.user.findUnique({
      where: { email },
      include: { contractor: true },
    });

    if (!user) {
      // New user from QB — default to contractor role since they have a QB account
      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: "", // No password — SSO-only until they set one
          roles: ["CONTRACTOR"],
          activeRole: "CONTRACTOR",
          contractor: { create: {} },
        },
        include: { contractor: true },
      });
    }

    // If they have a QB company and a contractor profile, store the connection
    if (realmId && user.contractor) {
      await prisma.quickBooksConnection.upsert({
        where: { contractorId: user.contractor.id },
        create: {
          contractorId: user.contractor.id,
          realmId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
        },
        update: {
          realmId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });
    }

    // Issue JWT and set cookie
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.activeRole as "CONTRACTOR" | "HOMEOWNER" | "SUBCONTRACTOR",
      roles: user.roles as ("CONTRACTOR" | "HOMEOWNER" | "SUBCONTRACTOR")[],
    });

    const dashboard = user.activeRole === "HOMEOWNER"
      ? "/homeowner/dashboard"
      : user.activeRole === "SUBCONTRACTOR"
        ? "/subcontractor/dashboard"
        : "/contractor/dashboard";

    const response = NextResponse.redirect(`${baseUrl}${dashboard}`);
    response.cookies.set("ftw-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    // Clear the SSO state cookie
    response.cookies.delete("qb-sso-state");

    return response;
  } catch (err) {
    console.error("QB SSO error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=qb_failed`);
  }
}
