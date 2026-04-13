import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAuthUser } from "@shared/lib/auth";
import { prisma } from "@shared/lib/db";
import { getQBInvoice } from "@shared/lib/quickbooks";

/**
 * POST /api/quickbooks/receipt
 *
 * Generates a homeowner receipt after payment is confirmed.
 * Pulls data from our Invoice + QB Invoice, computes the full charge
 * (bid amount + homeowner service fee), and stores a Receipt record.
 *
 * Revenue model:
 *   - Homeowner pays: bid amount + homeowner service fee (3%)
 *   - Platform keeps: contractor platform fee (5%) + homeowner service fee (3%)
 *   - Contractor gets: bid amount - 5% platform fee
 */
const HOMEOWNER_SERVICE_FEE_PERCENT = 3.0;

/** Round a fractional cent value to the nearest whole cent. */
const roundCents = (value: number): number => Math.round(value);

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { bidId } = body;

  if (!bidId) {
    return NextResponse.json({ error: "bidId is required" }, { status: 400 });
  }

  try {
    // Load the bid with all necessary relations
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        job: {
          include: {
            homeowner: { include: { user: true } },
          },
        },
        contractor: {
          include: {
            user: true,
            qbConnection: true,
          },
        },
        invoice: {
          include: { receipt: true },
        },
      },
    });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    if (bid.status !== "ACCEPTED") {
      return NextResponse.json({ error: "Bid must be accepted" }, { status: 400 });
    }

    // Only the homeowner who owns the job can generate their receipt
    if (user.role !== "HOMEOWNER" || bid.job?.homeowner?.userId !== user.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (!bid.invoice) {
      return NextResponse.json(
        { error: "No invoice exists for this bid" },
        { status: 400 }
      );
    }

    if (bid.invoice.status !== "paid") {
      return NextResponse.json(
        { error: `Invoice is "${bid.invoice.status}" — receipt only available after payment` },
        { status: 400 }
      );
    }

    // Return existing receipt if already generated
    if (bid.invoice.receipt) {
      const existing = bid.invoice.receipt;
      return NextResponse.json({
        receiptId: existing.id,
        receiptNumber: existing.receiptNumber,
        grossAmount: existing.grossAmount,
        platformFee: existing.platformFee,
        totalCharged: existing.totalCharged,
        jobTitle: existing.jobTitle,
        contractorName: existing.contractorName,
        homeownerName: existing.homeownerName,
        lineItems: existing.lineItems,
        paidAt: existing.paidAt.toISOString(),
        createdAt: existing.createdAt.toISOString(),
      });
    }

    // Fetch the QB invoice for detailed line item data
    let qbLineItems: { description: string; quantity: number; unitPrice: number; amount: number }[] = [];

    if (bid.invoice.qbInvoiceId && bid.contractor.qbConnection) {
      try {
        const qbInvoice = await getQBInvoice(
          bid.contractorId,
          bid.invoice.qbInvoiceId
        );

        if (qbInvoice?.Line) {
          qbLineItems = qbInvoice.Line
            .filter((line: Record<string, unknown>) => line.DetailType === "SalesItemLineDetail")
            .map((line: Record<string, unknown>) => {
              const detail = line.SalesItemLineDetail as Record<string, unknown> | undefined;
              return {
                description: (line.Description as string) || "Project work",
                quantity: (detail?.Qty as number) || 1,
                unitPrice: (detail?.UnitPrice as number) || (line.Amount as number) || 0,
                amount: (line.Amount as number) || 0,
              };
            });
        }
      } catch {
        // If QB fetch fails, build line items from our data
      }
    }

    // Fallback: build line items from bid data if QB fetch didn't return any
    if (qbLineItems.length === 0) {
      qbLineItems = [
        {
          description: `${bid.job.title} — Project completion`,
          quantity: 1,
          unitPrice: bid.amount,
          amount: bid.amount,
        },
      ];
    }

    // Calculate receipt amounts (all values in cents)
    const grossAmount = bid.amount;
    const homeownerFee = roundCents(grossAmount * HOMEOWNER_SERVICE_FEE_PERCENT / 100);
    const totalCharged = grossAmount + homeownerFee;

    // Generate a receipt number: FTW-YYMMDD-XXXX
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = randomBytes(3).toString("hex").toUpperCase();
    const receiptNumber = `FTW-${datePart}-${randomPart}`;

    const contractorName = bid.contractor?.company || bid.contractor?.user?.name || "Unknown Contractor";
    const homeownerName = bid.job?.homeowner?.user?.name ?? "Unknown";

    const receipt = await prisma.receipt.create({
      data: {
        invoiceId: bid.invoice.id,
        homeownerId: bid.job.homeownerId,
        receiptNumber,
        grossAmount,
        platformFee: homeownerFee,
        totalCharged,
        jobTitle: bid.job.title,
        contractorName,
        homeownerName,
        lineItems: qbLineItems,
        paidAt: bid.invoice.paidAt || now,
      },
    });

    // Notify the homeowner
    if (bid.job?.homeowner?.userId) await prisma.notification.create({
      data: {
        userId: bid.job.homeowner.userId,
        type: "receipt_generated",
        title: "Payment Receipt Ready",
        body: `Receipt ${receiptNumber} for "${bid.job.title}" is available.`,
        data: {
          receiptId: receipt.id,
          receiptNumber,
          totalCharged,
          bidId: bid.id,
        },
      },
    });

    return NextResponse.json({
      receiptId: receipt.id,
      receiptNumber: receipt.receiptNumber,
      grossAmount: receipt.grossAmount,
      platformFee: receipt.platformFee,
      totalCharged: receipt.totalCharged,
      jobTitle: receipt.jobTitle,
      contractorName: receipt.contractorName,
      homeownerName: receipt.homeownerName,
      lineItems: receipt.lineItems,
      paidAt: receipt.paidAt.toISOString(),
      createdAt: receipt.createdAt.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Receipt generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/quickbooks/receipt?bidId=xxx
 *
 * Fetch an existing receipt for a bid.
 */
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bidId = req.nextUrl.searchParams.get("bidId");
  if (!bidId) {
    return NextResponse.json({ error: "bidId query param is required" }, { status: 400 });
  }

  // Find the receipt via bid -> invoice -> receipt
  const invoice = await prisma.invoice.findUnique({
    where: { bidId },
    include: {
      receipt: true,
      bid: {
        include: {
          job: {
            include: {
              homeowner: { select: { userId: true } },
            },
          },
          contractor: { select: { userId: true } },
        },
      },
    },
  });

  if (!invoice || !invoice.receipt) {
    return NextResponse.json({ error: "No receipt found for this bid" }, { status: 404 });
  }

  // Both the homeowner and contractor can view the receipt
  const isHomeowner =
    user.role === "HOMEOWNER" && invoice.bid?.job?.homeowner?.userId === user.userId;
  const isContractor =
    user.role === "CONTRACTOR" && invoice.bid?.contractor?.userId === user.userId;

  if (!isHomeowner && !isContractor) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const receipt = invoice.receipt;

  return NextResponse.json({
    receiptId: receipt.id,
    receiptNumber: receipt.receiptNumber,
    grossAmount: receipt.grossAmount,
    platformFee: receipt.platformFee,
    totalCharged: receipt.totalCharged,
    jobTitle: receipt.jobTitle,
    contractorName: receipt.contractorName,
    homeownerName: receipt.homeownerName,
    lineItems: receipt.lineItems,
    paidAt: receipt.paidAt.toISOString(),
    createdAt: receipt.createdAt.toISOString(),
  });
}
