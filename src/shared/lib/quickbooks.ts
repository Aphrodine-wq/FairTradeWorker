import { prisma } from "@shared/lib/db";

// ── Intuit OAuth2 URLs ──────────────────────────────────────────
const INTUIT_AUTH_URL = "https://appcenter.intuit.com/connect/oauth2";
const INTUIT_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const INTUIT_REVOKE_URL = "https://developer.api.intuit.com/v2/oauth2/tokens/revoke";

const QB_API_BASE = process.env.QB_SANDBOX === "true"
  ? "https://sandbox-quickbooks.api.intuit.com/v3/company"
  : "https://quickbooks.api.intuit.com/v3/company";

const QB_SCOPES = ["com.intuit.quickbooks.accounting"];

// ── OAuth2 Helpers ──────────────────────────────────────────────

export function buildAuthUrl(state: string): string {
  const clientId = process.env.QB_CLIENT_ID;
  const redirectUri = process.env.QB_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("QB_CLIENT_ID and QB_REDIRECT_URI must be set");
  }

  const url = new URL(INTUIT_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", QB_SCOPES.join(" "));
  url.searchParams.set("state", state);
  return url.toString();
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
  token_type: string;
}

function getBasicAuth(): string {
  const clientId = process.env.QB_CLIENT_ID;
  const clientSecret = process.env.QB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("QB_CLIENT_ID and QB_CLIENT_SECRET must be set");
  }
  return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

export async function exchangeCode(code: string): Promise<TokenResponse> {
  const redirectUri = process.env.QB_REDIRECT_URI;
  if (!redirectUri) throw new Error("QB_REDIRECT_URI must be set");

  const res = await fetch(INTUIT_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch(INTUIT_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function revokeToken(token: string): Promise<void> {
  await fetch(INTUIT_REVOKE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: new URLSearchParams({ token }),
  });
}

// ── Token Management ────────────────────────────────────────────

/**
 * Get valid access token for a contractor, refreshing if expired.
 * Returns { accessToken, realmId } or null if not connected.
 */
export async function getQBAccess(contractorId: string) {
  const conn = await prisma.quickBooksConnection.findUnique({
    where: { contractorId },
  });

  if (!conn) return null;

  // Refresh if token expires within 5 minutes
  const fiveMinFromNow = new Date(Date.now() + 5 * 60 * 1000);
  if (conn.tokenExpiry < fiveMinFromNow) {
    const tokens = await refreshTokens(conn.refreshToken);
    const newExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.quickBooksConnection.update({
      where: { contractorId },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: newExpiry,
      },
    });

    return { accessToken: tokens.access_token, realmId: conn.realmId };
  }

  return { accessToken: conn.accessToken, realmId: conn.realmId };
}

// ── QB API Calls ────────────────────────────────────────────────

/**
 * Authenticated fetch to QuickBooks Online API.
 */
export async function qbFetch(
  contractorId: string,
  endpoint: string,
  options: RequestInit = {}
) {
  const access = await getQBAccess(contractorId);
  if (!access) throw new Error("No QuickBooks connection");

  const url = `${QB_API_BASE}/${access.realmId}/${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${access.accessToken}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QB API error (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Fetch company info from QuickBooks.
 */
export async function getCompanyInfo(accessToken: string, realmId: string) {
  const url = `${QB_API_BASE}/${realmId}/companyinfo/${realmId}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.CompanyInfo?.CompanyName ?? null;
}

// ── Customer Sync ───────────────────────────────────────────────

interface QBCustomer {
  Id?: string;
  DisplayName: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
  };
}

/**
 * Find or create a customer in QuickBooks by name.
 */
export async function findOrCreateCustomer(
  contractorId: string,
  customer: { name: string; email?: string; phone?: string; address?: string }
): Promise<QBCustomer> {
  // Search for existing customer by name
  const query = `SELECT * FROM Customer WHERE DisplayName = '${customer.name.replace(/'/g, "\\'")}'`;
  const searchResult = await qbFetch(contractorId, `query?query=${encodeURIComponent(query)}`);

  if (searchResult.QueryResponse?.Customer?.length > 0) {
    return searchResult.QueryResponse.Customer[0];
  }

  // Create new customer
  const body: Record<string, unknown> = { DisplayName: customer.name };
  if (customer.email) body.PrimaryEmailAddr = { Address: customer.email };
  if (customer.phone) body.PrimaryPhone = { FreeFormNumber: customer.phone };
  if (customer.address) body.BillAddr = { Line1: customer.address };

  const result = await qbFetch(contractorId, "customer", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return result.Customer;
}

// ── Estimate Sync ───────────────────────────────────────────────

interface SyncEstimateParams {
  contractorId: string;
  customerName: string;
  customerEmail?: string;
  lineItems: { description: string; quantity: number; unitPrice: number }[];
  expirationDate?: string;
  memo?: string;
}

/**
 * Sync an FTW estimate to QuickBooks as an Estimate.
 * Returns the QB Estimate object with Id.
 */
export async function syncEstimateToQB(params: SyncEstimateParams) {
  const customer = await findOrCreateCustomer(params.contractorId, {
    name: params.customerName,
    email: params.customerEmail,
  });

  const qbEstimate: Record<string, unknown> = {
    CustomerRef: { value: customer.Id, name: customer.DisplayName },
    Line: params.lineItems.map((item, i) => ({
      Id: String(i + 1),
      LineNum: i + 1,
      Amount: item.quantity * item.unitPrice,
      DetailType: "SalesItemLineDetail",
      Description: item.description,
      SalesItemLineDetail: {
        Qty: item.quantity,
        UnitPrice: item.unitPrice,
      },
    })),
    TxnDate: new Date().toISOString().split("T")[0],
  };

  if (params.expirationDate) {
    qbEstimate.ExpirationDate = params.expirationDate;
  }
  if (params.memo) {
    qbEstimate.CustomerMemo = { value: params.memo };
  }

  const result = await qbFetch(params.contractorId, "estimate", {
    method: "POST",
    body: JSON.stringify(qbEstimate),
  });

  return result.Estimate;
}

// ── Invoice Creation ────────────────────────────────────────────

interface CreateInvoiceParams {
  contractorId: string;
  customerName: string;
  customerEmail?: string;
  lineItems: { description: string; quantity: number; unitPrice: number }[];
  dueDate: string;
  memo?: string;
}

/**
 * Create an invoice in QuickBooks for a milestone payment.
 * Returns the QB Invoice object with Id and payment link.
 */
export async function createQBInvoice(params: CreateInvoiceParams) {
  const customer = await findOrCreateCustomer(params.contractorId, {
    name: params.customerName,
    email: params.customerEmail,
  });

  const qbInvoice: Record<string, unknown> = {
    CustomerRef: { value: customer.Id, name: customer.DisplayName },
    Line: params.lineItems.map((item, i) => ({
      Id: String(i + 1),
      LineNum: i + 1,
      Amount: item.quantity * item.unitPrice,
      DetailType: "SalesItemLineDetail",
      Description: item.description,
      SalesItemLineDetail: {
        Qty: item.quantity,
        UnitPrice: item.unitPrice,
      },
    })),
    DueDate: params.dueDate,
    TxnDate: new Date().toISOString().split("T")[0],
    EmailStatus: "NeedToSend",
    BillEmail: params.customerEmail ? { Address: params.customerEmail } : undefined,
  };

  if (params.memo) {
    qbInvoice.CustomerMemo = { value: params.memo };
  }

  const result = await qbFetch(params.contractorId, "invoice", {
    method: "POST",
    body: JSON.stringify(qbInvoice),
  });

  return result.Invoice;
}

/**
 * Send an invoice via QuickBooks email.
 */
export async function sendQBInvoice(contractorId: string, invoiceId: string) {
  return qbFetch(contractorId, `invoice/${invoiceId}/send`, {
    method: "POST",
  });
}

/**
 * Get payment status for an invoice.
 */
export async function getInvoicePayments(contractorId: string, invoiceId: string) {
  const query = `SELECT * FROM Payment WHERE PaymentRefNum = '${invoiceId}'`;
  const result = await qbFetch(contractorId, `query?query=${encodeURIComponent(query)}`);
  return result.QueryResponse?.Payment || [];
}

// ── Vendor Sync (Contractors as QB Vendors) ─────────────────────

interface QBVendor {
  Id?: string;
  DisplayName: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
}

/**
 * Find or create a vendor in QuickBooks for a contractor.
 * Contractors are represented as Vendors in QB for bill/payment flows.
 */
export async function findOrCreateVendor(
  contractorId: string,
  vendor: { name: string; email?: string; phone?: string }
): Promise<QBVendor> {
  const query = `SELECT * FROM Vendor WHERE DisplayName = '${vendor.name.replace(/'/g, "\\'")}'`;
  const searchResult = await qbFetch(contractorId, `query?query=${encodeURIComponent(query)}`);

  if (searchResult.QueryResponse?.Vendor?.length > 0) {
    return searchResult.QueryResponse.Vendor[0];
  }

  const body: Record<string, unknown> = { DisplayName: vendor.name };
  if (vendor.email) body.PrimaryEmailAddr = { Address: vendor.email };
  if (vendor.phone) body.PrimaryPhone = { FreeFormNumber: vendor.phone };

  const result = await qbFetch(contractorId, "vendor", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return result.Vendor;
}

// ── Bill Creation (Contractor Payout) ───────────────────────────

interface CreateBillParams {
  contractorId: string;
  vendorName: string;
  vendorEmail?: string;
  amount: number;
  description: string;
  dueDate: string;
  memo?: string;
}

/**
 * Create a Bill in QB representing money owed to the contractor.
 * In the FTW flow: homeowner pays invoice -> platform takes fee -> bill pays contractor.
 */
export async function createQBBill(params: CreateBillParams) {
  const vendor = await findOrCreateVendor(params.contractorId, {
    name: params.vendorName,
    email: params.vendorEmail,
  });

  const qbBill: Record<string, unknown> = {
    VendorRef: { value: vendor.Id, name: vendor.DisplayName },
    Line: [
      {
        Id: "1",
        LineNum: 1,
        Amount: params.amount,
        DetailType: "AccountBasedExpenseLineDetail",
        Description: params.description,
        AccountBasedExpenseLineDetail: {
          AccountRef: { name: "Cost of Goods Sold" },
        },
      },
    ],
    DueDate: params.dueDate,
    TxnDate: new Date().toISOString().split("T")[0],
  };

  if (params.memo) {
    qbBill.PrivateNote = params.memo;
  }

  const result = await qbFetch(params.contractorId, "bill", {
    method: "POST",
    body: JSON.stringify(qbBill),
  });

  return { bill: result.Bill, vendorId: vendor.Id };
}

// ── Bill Payment (Execute Contractor Payout) ────────────────────

interface PayBillParams {
  contractorId: string;
  billId: string;
  vendorId: string;
  amount: number;
}

/**
 * Pay a bill in QB, completing the contractor payout.
 * This records the actual fund transfer to the contractor.
 */
export async function payQBBill(params: PayBillParams) {
  const qbPayment: Record<string, unknown> = {
    VendorRef: { value: params.vendorId },
    TotalAmt: params.amount,
    Line: [
      {
        Amount: params.amount,
        LinkedTxn: [
          {
            TxnId: params.billId,
            TxnType: "Bill",
          },
        ],
      },
    ],
  };

  const result = await qbFetch(params.contractorId, "billpayment", {
    method: "POST",
    body: JSON.stringify(qbPayment),
  });

  return result.BillPayment;
}

// ── Invoice Query (for Receipts) ────────────────────────────────

/**
 * Fetch a single invoice by its QB ID.
 */
export async function getQBInvoice(contractorId: string, invoiceId: string) {
  const result = await qbFetch(contractorId, `invoice/${invoiceId}`);
  return result.Invoice;
}

// ── Webhook Verification ────────────────────────────────────────

/**
 * Verify Intuit webhook signature using HMAC-SHA256.
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const webhookVerifier = process.env.QB_WEBHOOK_VERIFIER_TOKEN;
  if (!webhookVerifier) return false;

  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha256", webhookVerifier)
    .update(payload)
    .digest("base64");

  return hash === signature;
}
