import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@shared/lib/auth";
import { prisma } from "@shared/lib/db";
import { createQBBill, payQBBill } from "@shared/lib/quickbooks";

/**
 * Platform fee percentage taken from each payout.
 * Homeowner pays full bid amount -> platform keeps this cut -> contractor gets the rest.
 */
const PLATFORM_FEE_PERCENT = 5.0;

/** Safe division — returns 0 when divisor is 0 to prevent division-by-zero in money calculations. */
const safeDiv = (a: number, b: number): number => (b !== 0 ? a / b : 0);

/** Round to 2 decimal places safely. */
const safeCents = (value: number): number => safeDiv(Math.round(value * 100), 100);

/**
 * POST /api/quickbooks/payout
 *
 * Creates a contractor payout for an accepted bid.
 * Flow:
 *   1. Validate the bid is accepted and has a paid invoice
 *   2. Calculate platform fee and net payout
 *   3. Create a QB Vendor for the contractor (or find existing)
 *   4. Create a QB Bill (money owed to contractor)
 *   5. Create a QB BillPayment (execute the payout)
 *   6. Store Payout record in our DB
 *
 * Can be called by:
 *   - System (after webhook confirms invoice payment)
 *   - Contractor (to trigger manual payout for a paid bid)
 */
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
    // Fetch the bid with all related data
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
        invoice: true,
        payout: true,
      },
    });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    if (bid.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Bid must be accepted before payout" },
        { status: 400 }
      );
    }

    // Authorization: contractor who owns the bid OR the homeowner who accepted it
    const isContractor =
      user.role === "CONTRACTOR" && bid.contractor?.userId === user.userId;
    const isHomeowner =
      user.role === "HOMEOWNER" && bid.job?.homeowner?.userId === user.userId;

    if (!isContractor && !isHomeowner) {
      return NextResponse.json({ error: "Not authorized for this bid" }, { status: 403 });
    }

    // Check if payout already exists
    if (bid.payout) {
      return NextResponse.json({
        error: "Payout already exists for this bid",
        payoutId: bid.payout.id,
        status: bid.payout.status,
      }, { status: 409 });
    }

    // Invoice must exist and be paid before we can pay the contractor
    if (!bid.invoice) {
      return NextResponse.json(
        { error: "No invoice found for this bid — invoice must be created first" },
        { status: 400 }
      );
    }

    if (bid.invoice.status !== "paid") {
      return NextResponse.json(
        { error: `Invoice is "${bid.invoice.status}" — must be paid before contractor payout` },
        { status: 400 }
      );
    }

    // Verify contractor has QB connected
    if (!bid.contractor.qbConnection) {
      return NextResponse.json(
        { error: "Contractor does not have QuickBooks connected" },
        { status: 400 }
      );
    }

    // Calculate payout amounts
    const grossAmount = bid.amount;
    const platformFee = safeCents(grossAmount * safeDiv(PLATFORM_FEE_PERCENT, 100));
    const netAmount = safeCents(grossAmount - platformFee);

    // Create queued payout record before calling QB
    let payout;
    try {
      payout = await prisma.payout.create({
        data: {
          bidId: bid.id,
          contractorId: bid.contractorId,
          grossAmount,
          platformFee,
          netAmount,
          feePercent: PLATFORM_FEE_PERCENT,
          status: "processing",
        },
      });
    } catch (createErr: unknown) {
      // Handle unique constraint violation (race condition / duplicate request)
      if (
        typeof createErr === "object" &&
        createErr !== null &&
        "code" in createErr &&
        (createErr as { code: string }).code === "P2002"
      ) {
        const existingPayout = await prisma.payout.findUnique({
          where: { bidId: bid.id },
        });
        if (existingPayout) {
          return NextResponse.json({
            error: "Payout already exists for this bid",
            payoutId: existingPayout.id,
            status: existingPayout.status,
          }, { status: 409 });
        }
      }
      throw createErr;
    }

    try {
      // Step 1: Create a Bill in QB (represents what we owe the contractor)
      const vendorName = bid.contractor?.company || bid.contractor?.user?.name || "Unknown Contractor";
      const { bill, vendorId } = await createQBBill({
        contractorId: bid.contractorId,
        vendorName,
        vendorEmail: bid.contractor?.user?.email ?? "",
        amount: netAmount,
        description: `FTW Payout — ${bid.job.title} (Bid #${bid.id.slice(-8)})`,
        dueDate: new Date().toISOString().split("T")[0],
        memo: `Platform fee: $${platformFee.toFixed(2)} (${PLATFORM_FEE_PERCENT}%) | Gross: $${grossAmount.toFixed(2)}`,
      });

      // Update payout with QB bill info
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          qbVendorId: vendorId,
          qbBillId: bill.Id,
          status: "bill_created",
        },
      });

      // Step 2: Pay the Bill (execute the transfer to contractor)
      const billPayment = await payQBBill({
        contractorId: bid.contractorId,
        billId: bill.Id,
        vendorId: vendorId!,
        amount: netAmount,
      });

      // Mark payout as completed
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          qbBillPaymentId: billPayment.Id,
          status: "paid",
          paidAt: new Date(),
        },
      });

      // Notify the contractor
      if (bid.contractor?.userId) await prisma.notification.create({
        data: {
          userId: bid.contractor.userId,
          type: "payout_completed",
          title: "Payout Received",
          body: `$${netAmount.toFixed(2)} payout for "${bid.job.title}" has been processed.`,
          data: {
            bidId: bid.id,
            payoutId: payout.id,
            grossAmount,
            platformFee,
            netAmount,
          },
        },
      });

      return NextResponse.json({
        success: true,
        payoutId: payout.id,
        grossAmount,
        platformFee,
        feePercent: PLATFORM_FEE_PERCENT,
        netAmount,
        qbBillId: bill.Id,
        qbBillPaymentId: billPayment.Id,
      });
    } catch (qbErr) {
      // QB call failed — mark payout as failed with reason
      const reason = qbErr instanceof Error ? qbErr.message : "QuickBooks API call failed";
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: "failed", failureReason: reason },
      });

      return NextResponse.json(
        { error: `Payout failed: ${reason}`, payoutId: payout.id },
        { status: 502 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payout processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/quickbooks/payout?bidId=xxx
 *
 * Get payout status for a specific bid.
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

  const payout = await prisma.payout.findUnique({
    where: { bidId },
    include: {
      bid: {
        include: {
          job: {
            select: {
              title: true,
              homeownerId: true,
              homeowner: { select: { userId: true } },
            },
          },
          contractor: { select: { userId: true } },
        },
      },
    },
  });

  if (!payout) {
    return NextResponse.json({ error: "No payout found for this bid" }, { status: 404 });
  }

  // Only the contractor or homeowner involved can view
  const isContractor =
    user.role === "CONTRACTOR" && payout.bid?.contractor?.userId === user.userId;
  const isHomeowner =
    user.role === "HOMEOWNER" && payout.bid?.job?.homeowner?.userId === user.userId;

  if (!isContractor && !isHomeowner) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  return NextResponse.json({
    id: payout.id,
    bidId: payout.bidId,
    grossAmount: payout.grossAmount,
    platformFee: payout.platformFee,
    netAmount: payout.netAmount,
    feePercent: payout.feePercent,
    status: payout.status,
    failureReason: payout.failureReason,
    paidAt: payout.paidAt?.toISOString() ?? null,
    createdAt: payout.createdAt.toISOString(),
  });
}
