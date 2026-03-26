import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";

const CONSTRUCTIONAI_API_URL =
  process.env.CONSTRUCTIONAI_API_URL || "http://localhost:8000/api/estimate";

// GET /api/contractor/estimates/[id]/pdf — download or regenerate PDF
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
  });
  if (!estimate) {
    return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
  }

  // If PDF already exists, proxy it from the ConstructionAI service
  if (estimate.pdfUrl) {
    try {
      const pdfResponse = await fetch(estimate.pdfUrl);
      if (pdfResponse.ok) {
        const pdfBuffer = await pdfResponse.arrayBuffer();
        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${sanitizeFilename(estimate.title)}.pdf"`,
          },
        });
      }
    } catch {
      // PDF fetch failed — regenerate below
    }
  }

  // Regenerate PDF via ConstructionAI PDF endpoint
  try {
    const pdfEndpoint = `${CONSTRUCTIONAI_API_URL}/pdf`;
    const pdfResponse = await fetch(pdfEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estimate_data: estimate.estimateData,
        title: estimate.title,
        contractor_name: contractor.company || undefined,
        location: estimate.location,
        project_type: estimate.projectType,
      }),
    });

    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: "PDF generation service unavailable" },
        { status: 503 }
      );
    }

    // Update the saved PDF URL if the service returns one
    const contentType = pdfResponse.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const result = await pdfResponse.json();
      if (result.pdf_url) {
        await prisma.savedEstimate.update({
          where: { id },
          data: { pdfUrl: result.pdf_url },
        });
        // Fetch the generated PDF
        const pdf = await fetch(result.pdf_url);
        const pdfBuffer = await pdf.arrayBuffer();
        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${sanitizeFilename(estimate.title)}.pdf"`,
          },
        });
      }
    }

    // Direct PDF binary response
    const pdfBuffer = await pdfResponse.arrayBuffer();
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sanitizeFilename(estimate.title)}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_").slice(0, 100);
}
