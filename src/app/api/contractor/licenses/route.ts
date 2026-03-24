import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";

// POST /api/contractor/licenses — add a license
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
  const { licenseNumber, state, type, expirationDate } = body;

  if (!licenseNumber || !state || !type) {
    return NextResponse.json(
      { error: "License number, state, and type are required" },
      { status: 400 }
    );
  }

  const license = await prisma.license.create({
    data: {
      contractorId: contractor.id,
      licenseNumber,
      state,
      type,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
    },
  });

  // Update contractor licensed status
  await prisma.contractor.update({
    where: { id: contractor.id },
    data: { licensed: true },
  });

  return NextResponse.json({ license }, { status: 201 });
}
