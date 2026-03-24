import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";

// POST /api/bids/[id]/accept — homeowner accepts a bid
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bidId } = await params;
  const user = getAuthUser(req);

  if (!user || user.role !== "HOMEOWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: {
      job: { include: { homeowner: true } },
    },
  });

  if (!bid) {
    return NextResponse.json({ error: "Bid not found" }, { status: 404 });
  }

  // Verify the homeowner owns this job
  if (bid.job.homeowner.userId !== user.userId) {
    return NextResponse.json({ error: "Not your job" }, { status: 403 });
  }

  if (bid.status !== "PENDING") {
    return NextResponse.json({ error: "Bid is no longer pending" }, { status: 400 });
  }

  // Accept this bid, decline all others on the same job, update job status
  await prisma.$transaction([
    prisma.bid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" },
    }),
    prisma.bid.updateMany({
      where: { jobId: bid.jobId, id: { not: bidId }, status: "PENDING" },
      data: { status: "DECLINED" },
    }),
    prisma.job.update({
      where: { id: bid.jobId },
      data: { status: "IN_PROGRESS" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
