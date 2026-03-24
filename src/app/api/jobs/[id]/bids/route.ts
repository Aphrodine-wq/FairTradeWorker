import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";

// GET /api/jobs/[id]/bids — list bids on a job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const user = getAuthUser(req);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { homeowner: true },
  });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Homeowners see all bids on their jobs. Contractors see only their own bid.
  const where: Record<string, unknown> = { jobId };
  if (user?.role === "CONTRACTOR") {
    const contractor = await prisma.contractor.findUnique({
      where: { userId: user.userId },
    });
    if (contractor) where.contractorId = contractor.id;
  } else if (user?.role !== "HOMEOWNER") {
    // Public users don't see bid details
    const count = await prisma.bid.count({ where: { jobId } });
    return NextResponse.json({ bids: [], count });
  }

  const bids = await prisma.bid.findMany({
    where,
    include: {
      contractor: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bids, count: bids.length });
}

// POST /api/jobs/[id]/bids — place a bid (contractor only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const user = getAuthUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Only contractors can bid" }, { status: 403 });
  }

  const contractor = await prisma.contractor.findUnique({
    where: { userId: user.userId },
  });
  if (!contractor) {
    return NextResponse.json({ error: "Contractor profile not found" }, { status: 404 });
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.status !== "OPEN") {
    return NextResponse.json({ error: "Job is not accepting bids" }, { status: 400 });
  }

  // Check for existing bid
  const existing = await prisma.bid.findUnique({
    where: { jobId_contractorId: { jobId, contractorId: contractor.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already bid on this job" }, { status: 409 });
  }

  const body = await req.json();
  const { amount, message, timeline } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Valid bid amount required" }, { status: 400 });
  }

  const bid = await prisma.bid.create({
    data: {
      jobId,
      contractorId: contractor.id,
      amount,
      message: message || null,
      timeline: timeline || null,
    },
    include: {
      contractor: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
      },
    },
  });

  return NextResponse.json({ bid }, { status: 201 });
}
