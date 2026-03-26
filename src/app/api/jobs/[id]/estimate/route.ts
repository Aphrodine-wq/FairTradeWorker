import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const CONSTRUCTIONAI_API_URL =
  process.env.CONSTRUCTIONAI_API_URL || "http://localhost:8000/api/estimate";

// POST /api/jobs/[id]/estimate — generate AI estimate for a job
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const { force } = await req.json().catch(() => ({ force: false }));

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { photos: true },
  });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Return cached estimate unless force-regenerate requested
  if (!force) {
    const existing = await prisma.aiEstimate.findUnique({ where: { jobId } });
    if (existing) {
      return NextResponse.json({ estimate: existing });
    }
  }

  try {
    const response = await fetch(CONSTRUCTIONAI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_type: job.category,
        subcategory: job.subcategory || undefined,
        description: job.description,
        detailed_scope: job.detailedScope || undefined,
        sqft: job.sqft || undefined,
        location: job.location,
        property_type: job.propertyType,
        year_built: job.yearBuilt || undefined,
        materials_provided: job.materialsProvided,
        urgency: job.urgency,
        permits_required: job.permitsRequired,
        quality: "mid-range",
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
    const parsed = parseConstructionAIResponse(result);

    // Generate a unique estimate number
    const estimateNumber = `EST-${Date.now().toString(36).toUpperCase()}`;

    // Upsert — handles both new and force-regenerate cases
    const estimate = await prisma.aiEstimate.upsert({
      where: { jobId },
      create: {
        jobId,
        estimateNumber,
        estimateMin: parsed.estimateMin,
        estimateMax: parsed.estimateMax,
        estimateMid: parsed.estimateMid,
        confidence: parsed.confidence,
        breakdown: (parsed.breakdown ?? undefined) as Prisma.InputJsonValue | undefined,
        lineItems: (parsed.lineItems ?? undefined) as Prisma.InputJsonValue | undefined,
        materials: (parsed.materials ?? undefined) as Prisma.InputJsonValue | undefined,
        laborHours: parsed.laborHours,
        laborCost: parsed.laborCost,
        materialCost: parsed.materialCost,
        equipmentCost: parsed.equipmentCost,
        subtotal: parsed.subtotal,
        overheadPercent: parsed.overheadPercent,
        profitPercent: parsed.profitPercent,
        contingencyPct: parsed.contingencyPct,
        total: parsed.total,
        exclusions: parsed.exclusions,
        notes: parsed.notes,
        timelineWeeks: parsed.timelineWeeks,
        pdfUrl: parsed.pdfUrl,
        regionFactor: parsed.regionFactor,
      },
      update: {
        estimateMin: parsed.estimateMin,
        estimateMax: parsed.estimateMax,
        estimateMid: parsed.estimateMid,
        confidence: parsed.confidence,
        breakdown: (parsed.breakdown ?? undefined) as Prisma.InputJsonValue | undefined,
        lineItems: (parsed.lineItems ?? undefined) as Prisma.InputJsonValue | undefined,
        materials: (parsed.materials ?? undefined) as Prisma.InputJsonValue | undefined,
        laborHours: parsed.laborHours,
        laborCost: parsed.laborCost,
        materialCost: parsed.materialCost,
        equipmentCost: parsed.equipmentCost,
        subtotal: parsed.subtotal,
        overheadPercent: parsed.overheadPercent,
        profitPercent: parsed.profitPercent,
        contingencyPct: parsed.contingencyPct,
        total: parsed.total,
        exclusions: parsed.exclusions,
        notes: parsed.notes,
        timelineWeeks: parsed.timelineWeeks,
        pdfUrl: parsed.pdfUrl,
        regionFactor: parsed.regionFactor,
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

interface ConstructionAIParsed {
  estimateMin: number;
  estimateMax: number;
  estimateMid: number;
  confidence: number;
  breakdown: Record<string, unknown>[] | null;
  lineItems: Record<string, unknown>[] | null;
  materials: Record<string, unknown>[] | null;
  laborHours: number | null;
  laborCost: number | null;
  materialCost: number | null;
  equipmentCost: number | null;
  subtotal: number | null;
  overheadPercent: number | null;
  profitPercent: number | null;
  contingencyPct: number | null;
  total: number | null;
  exclusions: string[];
  notes: string[];
  timelineWeeks: number | null;
  pdfUrl: string | null;
  regionFactor: number | null;
}

function parseConstructionAIResponse(raw: Record<string, unknown>): ConstructionAIParsed {
  const n = (v: unknown) => (typeof v === "number" ? v : null);
  const nRequired = (v: unknown, fallback: number) =>
    typeof v === "number" ? v : fallback;

  const min = nRequired(raw.estimate_min ?? raw.min, 0);
  const max = nRequired(raw.estimate_max ?? raw.max, 0);
  // Safe midpoint: guard against potential division issues (divisor is constant 2, but guarded for safety)
  const midFallback = min + max !== 0 ? (min + max) / 2 : 0;
  const mid = nRequired(raw.estimate_mid ?? raw.midpoint, midFallback);

  return {
    estimateMin: min,
    estimateMax: max,
    estimateMid: mid,
    confidence: Math.min(1, Math.max(0, nRequired(raw.confidence, 0.5))),
    breakdown: Array.isArray(raw.breakdown) ? raw.breakdown : null,
    lineItems: Array.isArray(raw.line_items) ? raw.line_items : null,
    materials: Array.isArray(raw.materials) ? raw.materials : null,
    laborHours: n(raw.labor_hours),
    laborCost: n(raw.labor_cost),
    materialCost: n(raw.material_cost),
    equipmentCost: n(raw.equipment_cost),
    subtotal: n(raw.subtotal),
    overheadPercent: n(raw.overhead_percent) ?? 0.12,
    profitPercent: n(raw.profit_percent) ?? 0.15,
    contingencyPct: n(raw.contingency_percent) ?? 0.08,
    total: n(raw.total),
    exclusions: Array.isArray(raw.exclusions) ? raw.exclusions : [],
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    timelineWeeks: n(raw.timeline_weeks) ? Math.round(raw.timeline_weeks as number) : null,
    pdfUrl: typeof raw.pdf_url === "string" ? raw.pdf_url : null,
    regionFactor: n(raw.region_factor) ?? 1.0,
  };
}
