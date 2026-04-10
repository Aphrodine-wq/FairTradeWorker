import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@shared/lib/auth";
import { prisma } from "@shared/lib/db";
import { revokeToken } from "@shared/lib/quickbooks";

export async function DELETE(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contractor = await prisma.contractor.findUnique({
    where: { userId: user.userId },
  });
  if (!contractor) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const connection = await prisma.quickBooksConnection.findUnique({
    where: { contractorId: contractor.id },
  });
  if (!connection) {
    return NextResponse.json({ error: "No QuickBooks connection" }, { status: 404 });
  }

  // Revoke token with Intuit (best effort)
  try {
    await revokeToken(connection.refreshToken);
  } catch {
    // Continue even if revocation fails — we still delete locally
  }

  await prisma.quickBooksConnection.delete({
    where: { contractorId: contractor.id },
  });

  return NextResponse.json({ success: true });
}
