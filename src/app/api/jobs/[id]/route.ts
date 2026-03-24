import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";

// GET /api/jobs/[id] — get job details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      photos: true,
      homeowner: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
      },
      _count: { select: { bids: true } },
      aiEstimate: true,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Increment view count
  await prisma.job.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({
    ...job,
    bidsCount: job._count.bids,
    _count: undefined,
  });
}
