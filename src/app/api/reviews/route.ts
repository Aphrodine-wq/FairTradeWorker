import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";

/**
 * GET /api/reviews?contractorId=xxx
 * Fetch reviews for a contractor.
 */
export async function GET(req: NextRequest) {
  const contractorId = req.nextUrl.searchParams.get("contractorId");
  if (!contractorId) {
    return NextResponse.json({ error: "contractorId is required" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { contractorId },
    include: {
      authorHomeowner: { include: { user: { select: { name: true } } } },
      authorContractor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    text: r.text,
    authorName:
      r.authorHomeowner?.user?.name ||
      r.authorContractor?.user?.name ||
      "Anonymous",
    authorType: r.authorHomeownerId ? "homeowner" : "contractor",
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json(formatted);
}

/**
 * POST /api/reviews
 * Submit a review for a contractor.
 * Body: { contractorId, rating (1-5), text? }
 */
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { contractorId, rating, text } = body;

  if (!contractorId || !rating) {
    return NextResponse.json(
      { error: "contractorId and rating are required" },
      { status: 400 }
    );
  }

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json(
      { error: "rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  // Verify the contractor exists
  const contractor = await prisma.contractor.findUnique({
    where: { id: contractorId },
  });
  if (!contractor) {
    return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
  }

  // Build author fields based on role
  const authorData: { authorHomeownerId?: string; authorContractorId?: string } = {};

  if (user.role === "HOMEOWNER") {
    const homeowner = await prisma.homeowner.findUnique({
      where: { userId: user.userId },
    });
    if (!homeowner) {
      return NextResponse.json({ error: "Homeowner profile not found" }, { status: 400 });
    }

    // Verify the homeowner had a completed job with this contractor
    const completedJob = await prisma.bid.findFirst({
      where: {
        contractorId,
        status: "ACCEPTED",
        job: { homeownerId: homeowner.id, status: { in: ["COMPLETED", "IN_PROGRESS"] } },
      },
    });
    if (!completedJob) {
      return NextResponse.json(
        { error: "You can only review contractors you have worked with" },
        { status: 403 }
      );
    }

    authorData.authorHomeownerId = homeowner.id;
  } else if (user.role === "CONTRACTOR") {
    const authorContractor = await prisma.contractor.findUnique({
      where: { userId: user.userId },
    });
    if (!authorContractor) {
      return NextResponse.json({ error: "Contractor profile not found" }, { status: 400 });
    }
    if (authorContractor.id === contractorId) {
      return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });
    }
    authorData.authorContractorId = authorContractor.id;
  } else {
    return NextResponse.json({ error: "Only homeowners and contractors can leave reviews" }, { status: 403 });
  }

  // Check for duplicate review
  const existing = await prisma.review.findFirst({
    where: {
      contractorId,
      ...(authorData.authorHomeownerId
        ? { authorHomeownerId: authorData.authorHomeownerId }
        : { authorContractorId: authorData.authorContractorId }),
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You have already reviewed this contractor" },
      { status: 409 }
    );
  }

  const review = await prisma.review.create({
    data: {
      contractorId,
      rating,
      text: text || null,
      ...authorData,
    },
  });

  // Notify the contractor
  await prisma.notification.create({
    data: {
      userId: contractor.userId,
      type: "new_review",
      title: "New Review",
      body: `You received a ${rating}-star review.`,
      data: { reviewId: review.id, rating },
    },
  });

  return NextResponse.json({
    id: review.id,
    rating: review.rating,
    text: review.text,
    createdAt: review.createdAt.toISOString(),
  }, { status: 201 });
}
