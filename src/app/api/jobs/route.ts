import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";

// GET /api/jobs — list open jobs (public, with optional filters)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const status = searchParams.get("status") || "OPEN";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = { status };
  if (category) where.category = category;
  if (location) where.location = { contains: location, mode: "insensitive" };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        photos: true,
        _count: { select: { bids: true } },
        aiEstimate: { select: { estimateMin: true, estimateMax: true, confidence: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    jobs: jobs.map((j) => ({
      ...j,
      bidsCount: j._count.bids,
      _count: undefined,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

// POST /api/jobs — create a new job (homeowner only)
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "HOMEOWNER") {
    return NextResponse.json({ error: "Only homeowners can post jobs" }, { status: 403 });
  }

  const homeowner = await prisma.homeowner.findUnique({
    where: { userId: user.userId },
  });
  if (!homeowner) {
    return NextResponse.json({ error: "Homeowner profile not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    title, description, detailedScope, category, subcategory,
    budgetMin, budgetMax, location, fullAddress, urgency,
    propertyType, sqft, yearBuilt, deadline, preferredStartDate,
    estimatedDuration, accessNotes, specialInstructions,
    materialsProvided, permitsRequired, inspectionRequired,
    insuranceClaim, tags, photos,
  } = body;

  if (!title || !description || !category || !location) {
    return NextResponse.json(
      { error: "Title, description, category, and location are required" },
      { status: 400 }
    );
  }

  const job = await prisma.job.create({
    data: {
      homeownerId: homeowner.id,
      title,
      description,
      detailedScope: detailedScope || null,
      category,
      subcategory: subcategory || null,
      budgetMin: budgetMin || null,
      budgetMax: budgetMax || null,
      location,
      fullAddress: fullAddress || null,
      urgency: urgency || "MEDIUM",
      propertyType: propertyType || "RESIDENTIAL",
      sqft: sqft || null,
      yearBuilt: yearBuilt || null,
      deadline: deadline ? new Date(deadline) : null,
      preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : null,
      estimatedDuration: estimatedDuration || null,
      accessNotes: accessNotes || null,
      specialInstructions: specialInstructions || null,
      materialsProvided: materialsProvided || false,
      permitsRequired: permitsRequired || false,
      inspectionRequired: inspectionRequired || false,
      insuranceClaim: insuranceClaim || false,
      tags: tags || [],
      photos: photos?.length
        ? { create: photos.map((p: { url: string; caption?: string; type?: string }) => ({
            url: p.url,
            caption: p.caption || null,
            type: p.type || "photo",
          }))}
        : undefined,
    },
    include: { photos: true },
  });

  return NextResponse.json({ job }, { status: 201 });
}
