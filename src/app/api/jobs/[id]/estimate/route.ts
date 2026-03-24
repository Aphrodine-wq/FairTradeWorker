import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";

const CONSTRUCTIONAI_URL = process.env.CONSTRUCTIONAI_URL || "http://localhost:11434/api/generate";
const CONSTRUCTIONAI_MODEL = process.env.CONSTRUCTIONAI_MODEL || "constructionai:latest";

// POST /api/jobs/[id]/estimate — generate AI estimate for a job
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { photos: true },
  });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Check for existing estimate
  const existing = await prisma.aiEstimate.findUnique({ where: { jobId } });
  if (existing) {
    return NextResponse.json({ estimate: existing });
  }

  // Build prompt for ConstructionAI
  const prompt = buildEstimatePrompt(job);

  try {
    const response = await fetch(CONSTRUCTIONAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CONSTRUCTIONAI_MODEL,
        prompt,
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "ConstructionAI service unavailable" },
        { status: 503 }
      );
    }

    const result = await response.json();
    const parsed = parseEstimateResponse(result.response);

    const estimate = await prisma.aiEstimate.create({
      data: {
        jobId,
        estimateMin: parsed.min,
        estimateMax: parsed.max,
        confidence: parsed.confidence,
        breakdown: parsed.breakdown ?? undefined,
      },
    });

    return NextResponse.json({ estimate }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate estimate" },
      { status: 500 }
    );
  }
}

function buildEstimatePrompt(job: {
  title: string;
  description: string;
  detailedScope: string | null;
  category: string;
  subcategory: string | null;
  sqft: number | null;
  yearBuilt: number | null;
  location: string;
  propertyType: string;
  materialsProvided: boolean;
}): string {
  return `Estimate this construction job:
Title: ${job.title}
Category: ${job.category}${job.subcategory ? ` / ${job.subcategory}` : ""}
Description: ${job.description}
${job.detailedScope ? `Detailed Scope: ${job.detailedScope}` : ""}
Property: ${job.propertyType}, ${job.sqft ? `${job.sqft} sqft` : "unknown sqft"}${job.yearBuilt ? `, built ${job.yearBuilt}` : ""}
Location: ${job.location}
Materials provided: ${job.materialsProvided ? "yes" : "no"}

Respond with JSON: {"min": number, "max": number, "confidence": 0-1, "breakdown": [{"item": string, "cost": number}]}`;
}

function parseEstimateResponse(raw: string): {
  min: number;
  max: number;
  confidence: number;
  breakdown: { item: string; cost: number }[] | null;
} {
  try {
    const data = JSON.parse(raw);
    return {
      min: Number(data.min) || 0,
      max: Number(data.max) || 0,
      confidence: Math.min(1, Math.max(0, Number(data.confidence) || 0.5)),
      breakdown: Array.isArray(data.breakdown) ? data.breakdown : null,
    };
  } catch {
    return { min: 0, max: 0, confidence: 0, breakdown: null };
  }
}
