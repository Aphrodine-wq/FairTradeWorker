import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@shared/lib/auth";
import { prisma } from "@shared/lib/db";
import { exchangeCode, getCompanyInfo } from "@shared/lib/quickbooks";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.redirect(new URL("/contractor/settings?qb=unauthorized", req.url));
  }

  // Validate CSRF state
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("qb_oauth_state")?.value;
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/contractor/settings?qb=invalid_state", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  const realmId = req.nextUrl.searchParams.get("realmId");
  if (!code || !realmId) {
    return NextResponse.redirect(new URL("/contractor/settings?qb=missing_params", req.url));
  }

  // Exchange code for tokens
  let tokenData;
  try {
    tokenData = await exchangeCode(code);
  } catch {
    return NextResponse.redirect(new URL("/contractor/settings?qb=token_error", req.url));
  }

  // Look up contractor
  const contractor = await prisma.contractor.findUnique({
    where: { userId: user.userId },
  });
  if (!contractor) {
    return NextResponse.redirect(new URL("/contractor/settings?qb=no_profile", req.url));
  }

  // Fetch company name from QB
  const companyName = await getCompanyInfo(tokenData.access_token, realmId);

  // Upsert QuickBooks connection
  const tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);
  await prisma.quickBooksConnection.upsert({
    where: { contractorId: contractor.id },
    create: {
      contractorId: contractor.id,
      realmId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry,
      companyName,
    },
    update: {
      realmId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry,
      companyName,
    },
  });

  // Clear CSRF cookie and redirect to settings
  const response = NextResponse.redirect(
    new URL("/contractor/settings?qb=connected", req.url)
  );
  response.cookies.delete("qb_oauth_state");
  return response;
}
