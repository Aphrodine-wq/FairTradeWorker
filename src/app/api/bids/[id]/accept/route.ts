import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";
import { createQBInvoice, sendQBInvoice } from "@shared/lib/quickbooks";

/**
 * Homeowner service fee added on top of the bid amount.
 * Homeowner sees: bid amount + 3% service fee on their invoice.
 */
const HOMEOWNER_SERVICE_FEE_PERCENT = 3.0;

/** Round a fractional cent value to the nearest whole cent. */
const roundCents = (value: number): number => Math.round(value);

// POST /api/bids/[id]/accept — homeowner accepts a bid
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bidId } = await params;
  const user = getAuthUser(req);

  if (!user || user.role !== "HOMEOWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    },
  });

  if (!bid) {
    return NextResponse.json({ error: "Bid not found" }, { status: 404 });
  }

  // Verify the homeowner owns this job
  if (bid.job?.homeowner?.userId !== user.userId) {
    return NextResponse.json({ error: "Not your job" }, { status: 403 });
  }

  if (bid.status !== "PENDING") {
    return NextResponse.json({ error: "Bid is no longer pending" }, { status: 400 });
  }

  // Accept this bid, decline all others on the same job, update job status
  await prisma.$transaction([
    prisma.bid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" },
    }),
    prisma.bid.updateMany({
      where: { jobId: bid.jobId, id: { not: bidId }, status: "PENDING" },
      data: { status: "DECLINED" },
    }),
    prisma.job.update({
      where: { id: bid.jobId },
      data: { status: "IN_PROGRESS" },
    }),
  ]);

  // Queue the payout: create a QB invoice for the homeowner and a queued payout for the contractor.
  // The actual contractor payout happens after the homeowner's invoice is paid (via webhook).
  let invoiceCreated = false;
  let payoutQueued = false;

  if (bid.contractor.qbConnection) {
    try {
      // Calculate what the homeowner will be charged (all values in cents)
      const bidAmount = bid.amount;
      const homeownerFee = roundCents(bidAmount * HOMEOWNER_SERVICE_FEE_PERCENT / 100);
      const totalCharge = bidAmount + homeownerFee;

      // Due in 3 days from acceptance
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);
      const dueDateStr = dueDate.toISOString().split("T")[0];

      const homeownerName = bid.job?.homeowner?.user?.name ?? "Unknown";
      const homeownerEmail = bid.job?.homeowner?.user?.email ?? "";

      // Create QB invoice for the homeowner with bid amount + service fee
      // QB API expects dollar amounts, so convert cents to dollars
      const qbInvoice = await createQBInvoice({
        contractorId: bid.contractorId,
        customerName: homeownerName,
        customerEmail: homeownerEmail,
        lineItems: [
          {
            description: `${bid.job.title} — ${bid.contractor?.company || bid.contractor?.user?.name || "Contractor"}`,
            quantity: 1,
            unitPrice: bidAmount / 100,
          },
          {
            description: "FairTradeWorker Service Fee",
            quantity: 1,
            unitPrice: homeownerFee / 100,
          },
        ],
        dueDate: dueDateStr,
        memo: `FTW Project: ${bid.job.title} | Bid accepted ${new Date().toISOString().split("T")[0]}`,
      });

      // Send the invoice to the homeowner via QB email
      if (homeownerEmail) {
        await sendQBInvoice(bid.contractorId, qbInvoice.Id);
      }

      // Store invoice record
      await prisma.invoice.create({
        data: {
          bidId: bid.id,
          qbInvoiceId: qbInvoice.Id,
          amount: totalCharge,
          status: "sent",
        },
      });

      invoiceCreated = true;

      // Queue the contractor payout (will be executed when invoice is paid)
      // All values in cents
      const platformFeePercent = 5.0;
      const platformFee = roundCents(bidAmount * platformFeePercent / 100);
      const netPayout = bidAmount - platformFee;

      await prisma.payout.create({
        data: {
          bidId: bid.id,
          contractorId: bid.contractorId,
          grossAmount: bidAmount,
          platformFee,
          netAmount: netPayout,
          feePercent: platformFeePercent,
          status: "queued",
        },
      });

      payoutQueued = true;

      // Notify contractor that their bid was accepted and payout is queued
      if (bid.contractor?.userId) await prisma.notification.create({
        data: {
          userId: bid.contractor.userId,
          type: "bid_accepted",
          title: "Bid Accepted",
          body: `Your $${(bidAmount / 100).toFixed(2)} bid on "${bid.job.title}" was accepted. Payout of $${(netPayout / 100).toFixed(2)} will process when payment is received.`,
          data: {
            bidId: bid.id,
            jobId: bid.jobId,
            amount: bidAmount,
            netPayout,
          },
        },
      });
    } catch (err) {
      // QB integration failure should not block bid acceptance.
      // The bid is already accepted; invoice/payout can be retried.
      console.error("[Bid Accept] QB invoice/payout queue failed:", err);
    }
  }

  return NextResponse.json({
    success: true,
    invoiceCreated,
    payoutQueued,
  });
}
