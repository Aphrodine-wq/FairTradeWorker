import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";

const CONSTRUCTIONAI_API_URL =
  process.env.CONSTRUCTIONAI_API_URL || "http://localhost:8000/api/estimate";

// GET /api/contractor/estimates — list contractor's saved estimates
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contractor = await prisma.contractor.findUnique({
    where: { userId: user.userId },
  });
  if (!contractor) {
    return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
  }

  const estimates = await prisma.savedEstimate.findMany({
    where: { contractorId: contractor.id },
    orderBy: { createdAt: "desc" },
    include: { aiEstimate: true },
  });

  return NextResponse.json({ estimates });
}

// POST /api/contractor/estimates — generate a standalone estimate (not tied to a job)
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contractor = await prisma.contractor.findUnique({
    where: { userId: user.userId },
  });
  if (!contractor) {
    return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    projectType,
    subcategory,
    sqft,
    location,
    quality,
    description,
    clientName,
    propertyType,
    yearBuilt,
  } = body;

  if (!projectType || !location || !description) {
    return NextResponse.json(
      { error: "projectType, location, and description are required" },
      { status: 400 }
    );
  }

  try {
    // Call ConstructionAI API
    const response = await fetch(CONSTRUCTIONAI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_type: projectType,
        subcategory: subcategory || undefined,
        description,
        sqft: sqft || undefined,
        location,
        property_type: propertyType || "RESIDENTIAL",
        year_built: yearBuilt || undefined,
        quality: quality || "mid-range",
        format: "full",
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "ConstructionAI service unavailable" },
        { status: 503 }
      );
    }

    const result = await response.json();

    // Build a title from the project details
    const title = clientName
      ? `${clientName} — ${projectType}`
      : `${projectType} Estimate`;

    const savedEstimate = await prisma.savedEstimate.create({
      data: {
        contractorId: contractor.id,
        title,
        projectType,
        location,
        sqft: sqft ? Number(sqft) : null,
        quality: quality || "mid-range",
        estimateData: result,
        pdfUrl: typeof result.pdf_url === "string" ? result.pdf_url : null,
        notes: clientName ? `Client: ${clientName}` : null,
      },
    });

    return NextResponse.json({ estimate: savedEstimate }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate estimate" },
      { status: 500 }
    );
  }
}
