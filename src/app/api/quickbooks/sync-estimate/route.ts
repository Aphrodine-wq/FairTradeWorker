import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@shared/lib/auth";
import { prisma } from "@shared/lib/db";
import { syncEstimateToQB } from "@shared/lib/quickbooks";

/**
 * Sync an estimate to QuickBooks.
 * Accepts estimate data directly (from Elixir backend or frontend state)
 * since Prisma doesn't have an Estimate model — estimates live in ftw-realtime.
 */
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { customerName, customerEmail, lineItems, expirationDate, title } = body;

  if (!customerName || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
    return NextResponse.json(
      { error: "customerName and lineItems are required" },
      { status: 400 }
    );
  }

  try {
    const contractor = await prisma.contractor.findUnique({
      where: { userId: user.userId },
    });
    if (!contractor) {
      return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
    }

    const connection = await prisma.quickBooksConnection.findUnique({
      where: { contractorId: contractor.id },
    });
    if (!connection) {
      return NextResponse.json({ error: "QuickBooks not connected" }, { status: 400 });
    }

    // QB API expects dollar amounts, so convert cents to dollars
    const qbEstimate = await syncEstimateToQB({
      contractorId: contractor.id,
      customerName,
      customerEmail,
      lineItems: lineItems.map((li: { description: string; quantity: number; unitPrice: number }) => ({
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice / 100,
      })),
      expirationDate,
      memo: title ? `FTW Estimate: ${title}` : undefined,
    });

    return NextResponse.json({
      synced: true,
      qbEstimateId: qbEstimate.Id,
      qbDocNumber: qbEstimate.DocNumber,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
