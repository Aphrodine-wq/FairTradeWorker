import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";

// GET /api/contractor/estimates/[id] — single estimate detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const contractor = await prisma.contractor.findUnique({
    where: { userId: user.userId },
  });
  if (!contractor) {
    return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
  }

  const estimate = await prisma.savedEstimate.findFirst({
    where: { id, contractorId: contractor.id },
    include: { aiEstimate: true },
  });

  if (!estimate) {
    return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
  }

  return NextResponse.json({ estimate });
}

// DELETE /api/contractor/estimates/[id] — remove saved estimate
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const contractor = await prisma.contractor.findUnique({
    where: { userId: user.userId },
  });
  if (!contractor) {
    return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
  }

  const estimate = await prisma.savedEstimate.findFirst({
    where: { id, contractorId: contractor.id },
  });
  if (!estimate) {
    return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
  }

  await prisma.savedEstimate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
