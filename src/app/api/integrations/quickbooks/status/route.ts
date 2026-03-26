import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@shared/lib/auth";
import { prisma } from "@shared/lib/db";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contractor = await prisma.contractor.findUnique({
    where: { userId: user.userId },
  });
  if (!contractor) {
    return NextResponse.json({ connected: false });
  }

  const connection = await prisma.quickBooksConnection.findUnique({
    where: { contractorId: contractor.id },
    select: { companyName: true, createdAt: true },
  });

  if (!connection) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    companyName: connection.companyName,
    connectedAt: connection.createdAt.toISOString(),
  });
}
