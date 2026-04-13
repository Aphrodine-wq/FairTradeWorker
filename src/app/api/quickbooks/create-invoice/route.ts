import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@shared/lib/auth";
import { prisma } from "@shared/lib/db";
import { createQBInvoice, sendQBInvoice } from "@shared/lib/quickbooks";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { bidId, milestone, dueDate, customerName, customerEmail, description } = body;

  if (!bidId || !dueDate || !customerName) {
    return NextResponse.json(
      { error: "bidId, dueDate, and customerName are required" },
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

    // Fetch the accepted bid to get amount
    const bid = await prisma.bid.findUnique({
      where: { id: bidId, contractorId: contractor.id },
      include: { invoice: true },
    });
    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Return existing invoice if one already exists for this bid
    if (bid.invoice) {
      return NextResponse.json({
        created: false,
        qbInvoiceId: bid.invoice.qbInvoiceId,
        invoiceId: bid.invoice.id,
        message: "Invoice already exists for this bid",
      });
    }

    const lineDescription = milestone
      ? `Milestone: ${milestone} — ${description || ""}`
      : description || "Project payment";

    const qbInvoice = await createQBInvoice({
      contractorId: contractor.id,
      customerName,
      customerEmail,
      lineItems: [
        {
          description: lineDescription,
          quantity: 1,
          unitPrice: bid.amount, // bid.amount is already in dollars (Float)
        },
      ],
      dueDate,
      memo: "FTW Project Payment",
    });

    // Send the invoice via QB email
    if (customerEmail) {
      await sendQBInvoice(contractor.id, qbInvoice.Id);
    }

    // Store QB invoice ID on the bid's invoice record
    await prisma.invoice.create({
      data: {
        bidId: bid.id,
        qbInvoiceId: qbInvoice.Id,
        amount: bid.amount,
        status: "sent",
      },
    });

    return NextResponse.json({
      created: true,
      qbInvoiceId: qbInvoice.Id,
      qbDocNumber: qbInvoice.DocNumber,
      invoiceLink: qbInvoice.InvoiceLink,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invoice creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
