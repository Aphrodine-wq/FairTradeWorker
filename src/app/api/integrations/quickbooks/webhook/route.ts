import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  createQBBill,
  payQBBill,
} from "@shared/lib/quickbooks";
import { prisma } from "@shared/lib/db";

/**
 * QuickBooks webhook handler.
 * Intuit sends notifications when invoices are paid, estimates updated, etc.
 *
 * When a homeowner pays their invoice, this webhook:
 *   1. Marks the invoice as paid
 *   2. Executes the queued contractor payout (Bill + BillPayment in QB)
 *   3. Notifies the contractor
 */
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("intuit-signature") || "";

  // Verify webhook signature
  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const data = JSON.parse(payload);

  for (const notification of data.eventNotifications || []) {
    const realmId = notification.realmId;
    const entities = notification.dataChangeEvent?.entities || [];

    for (const entity of entities) {
      const { name, id, operation } = entity;

      // When a payment is created in QB, find our invoice and process the payout
      if (name === "Payment" && operation === "Create") {
        console.log(`[QB Webhook] Payment created: ${id} in realm ${realmId}`);
        // Payment objects are handled below via invoice update
      }

      // When an invoice is updated (e.g., marked paid by Intuit payment)
      if (name === "Invoice" && operation === "Update") {
        // Mark the invoice as paid
        const updateResult = await prisma.invoice.updateMany({
          where: { qbInvoiceId: id, status: { not: "paid" } },
          data: { status: "paid", paidAt: new Date() },
        });

        // If we actually transitioned to paid, execute the queued payout
        if (updateResult.count > 0) {
          await executeQueuedPayout(id);
        }
      }
    }
  }

  // Intuit requires 200 response within 5 seconds
  return NextResponse.json({ ok: true });
}

/**
 * Find and execute a queued payout when its invoice is paid.
 * Creates a QB Bill + BillPayment to send funds to the contractor.
 */
async function executeQueuedPayout(qbInvoiceId: string) {
  try {
    // Find the invoice and its queued payout
    const invoice = await prisma.invoice.findFirst({
      where: { qbInvoiceId },
      include: {
        bid: {
          include: {
            job: true,
            contractor: {
              include: {
                user: true,
                qbConnection: true,
              },
            },
            payout: true,
          },
        },
      },
    });

    if (!invoice?.bid?.payout) {
      console.log(`[QB Webhook] No queued payout for invoice ${qbInvoiceId}`);
      return;
    }

    const payout = invoice.bid.payout;
    if (payout.status !== "queued") {
      console.log(`[QB Webhook] Payout ${payout.id} is "${payout.status}", skipping`);
      return;
    }

    const { bid } = invoice;
    if (!bid.contractor.qbConnection) {
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: "failed",
          failureReason: "Contractor QuickBooks not connected at time of payout",
        },
      });
      return;
    }

    // Mark as processing
    await prisma.payout.update({
      where: { id: payout.id },
      data: { status: "processing" },
    });

    // Create the QB Bill (what we owe the contractor)
    const vendorName = bid.contractor.company || bid.contractor.user.name;
    const { bill, vendorId } = await createQBBill({
      contractorId: bid.contractorId,
      vendorName,
      vendorEmail: bid.contractor.user.email,
      amount: payout.netAmount,
      description: `FTW Payout — ${bid.job.title} (Bid #${bid.id.slice(-8)})`,
      dueDate: new Date().toISOString().split("T")[0],
      memo: `Platform fee: $${payout.platformFee.toFixed(2)} (${payout.feePercent}%) | Gross: $${payout.grossAmount.toFixed(2)}`,
    });

    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        qbVendorId: vendorId,
        qbBillId: bill.Id,
        status: "bill_created",
      },
    });

    // Pay the Bill (execute the transfer)
    const billPayment = await payQBBill({
      contractorId: bid.contractorId,
      billId: bill.Id,
      vendorId: vendorId!,
      amount: payout.netAmount,
    });

    // Mark payout complete
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        qbBillPaymentId: billPayment.Id,
        status: "paid",
        paidAt: new Date(),
      },
    });

    // Notify the contractor
    await prisma.notification.create({
      data: {
        userId: bid.contractor.userId,
        type: "payout_completed",
        title: "Payout Processed",
        body: `$${payout.netAmount.toFixed(2)} payout for "${bid.job.title}" has been sent to your account.`,
        data: {
          bidId: bid.id,
          payoutId: payout.id,
          grossAmount: payout.grossAmount,
          platformFee: payout.platformFee,
          netAmount: payout.netAmount,
        },
      },
    });

    console.log(`[QB Webhook] Payout ${payout.id} completed: $${payout.netAmount.toFixed(2)} to ${vendorName}`);
  } catch (err) {
    console.error(`[QB Webhook] Payout execution failed for invoice ${qbInvoiceId}:`, err);

    // Try to mark the payout as failed
    try {
      const invoice = await prisma.invoice.findFirst({
        where: { qbInvoiceId },
        include: { bid: { include: { payout: true } } },
      });
      if (invoice?.bid?.payout) {
        const reason = err instanceof Error ? err.message : "Webhook payout execution failed";
        await prisma.payout.update({
          where: { id: invoice.bid.payout.id },
          data: { status: "failed", failureReason: reason },
        });
      }
    } catch {
      // Best effort failure recording
    }
  }
}
