import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";

// POST /api/contractor/insurance — add insurance certificate
export async function POST(req: NextRequest) {
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

  const body = await req.json();
  const { provider, policyNumber, coverageType, coverageAmount, expirationDate, fileUrl } = body;

  if (!provider || !policyNumber || !coverageType || !expirationDate) {
    return NextResponse.json(
      { error: "Provider, policy number, coverage type, and expiration are required" },
      { status: 400 }
    );
  }

  const cert = await prisma.insuranceCert.create({
    data: {
      contractorId: contractor.id,
      provider,
      policyNumber,
      coverageType,
      coverageAmount: coverageAmount || null,
      expirationDate: new Date(expirationDate),
      fileUrl: fileUrl || null,
    },
  });

  // Update contractor insured status
  await prisma.contractor.update({
    where: { id: contractor.id },
    data: { insured: true },
  });

  return NextResponse.json({ cert }, { status: 201 });
}
