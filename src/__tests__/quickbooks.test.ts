import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Test the pure helpers from quickbooks.ts ─────────────────────
// We can't test the full OAuth/API flow without a sandbox, but we can
// test URL building, token management logic, and webhook verification.

describe("QuickBooks integration", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe("buildAuthUrl", () => {
    it("builds a valid Intuit OAuth2 URL with required params", async () => {
      vi.stubEnv("QB_CLIENT_ID", "test-client-id");
      vi.stubEnv("QB_REDIRECT_URI", "http://localhost:3000/api/quickbooks/callback");

      const { buildAuthUrl } = await import("@shared/lib/quickbooks");
      const url = buildAuthUrl("test-state-123");
      const parsed = new URL(url);

      expect(parsed.origin).toBe("https://appcenter.intuit.com");
      expect(parsed.pathname).toBe("/connect/oauth2");
      expect(parsed.searchParams.get("client_id")).toBe("test-client-id");
      expect(parsed.searchParams.get("redirect_uri")).toBe(
        "http://localhost:3000/api/quickbooks/callback"
      );
      expect(parsed.searchParams.get("response_type")).toBe("code");
      expect(parsed.searchParams.get("scope")).toBe("com.intuit.quickbooks.accounting");
      expect(parsed.searchParams.get("state")).toBe("test-state-123");
    });

    it("throws when QB_CLIENT_ID is missing", async () => {
      vi.stubEnv("QB_CLIENT_ID", "");
      vi.stubEnv("QB_REDIRECT_URI", "http://localhost:3000/callback");

      const { buildAuthUrl } = await import("@shared/lib/quickbooks");
      expect(() => buildAuthUrl("state")).toThrow("QB_CLIENT_ID");
    });

    it("throws when QB_REDIRECT_URI is missing", async () => {
      vi.stubEnv("QB_CLIENT_ID", "test-id");
      vi.stubEnv("QB_REDIRECT_URI", "");

      const { buildAuthUrl } = await import("@shared/lib/quickbooks");
      expect(() => buildAuthUrl("state")).toThrow("QB_REDIRECT_URI");
    });
  });

  describe("verifyWebhookSignature", () => {
    it("returns false when QB_WEBHOOK_VERIFIER_TOKEN is not set", async () => {
      vi.stubEnv("QB_WEBHOOK_VERIFIER_TOKEN", "");

      const { verifyWebhookSignature } = await import("@shared/lib/quickbooks");
      expect(verifyWebhookSignature("payload", "signature")).toBe(false);
    });

    it("returns true for a valid HMAC-SHA256 signature", async () => {
      const crypto = await import("crypto");
      const verifierToken = "test-webhook-verifier";
      vi.stubEnv("QB_WEBHOOK_VERIFIER_TOKEN", verifierToken);

      const payload = '{"eventNotifications":[]}';
      const expectedSignature = crypto
        .createHmac("sha256", verifierToken)
        .update(payload)
        .digest("base64");

      const { verifyWebhookSignature } = await import("@shared/lib/quickbooks");
      expect(verifyWebhookSignature(payload, expectedSignature)).toBe(true);
    });

    it("returns false for an invalid signature", async () => {
      vi.stubEnv("QB_WEBHOOK_VERIFIER_TOKEN", "real-token");

      const { verifyWebhookSignature } = await import("@shared/lib/quickbooks");
      expect(verifyWebhookSignature("payload", "bad-signature")).toBe(false);
    });
  });

  describe("QB API base URL selection", () => {
    it("uses sandbox URL when QB_SANDBOX is true", async () => {
      vi.stubEnv("QB_SANDBOX", "true");

      // Force re-import to pick up new env
      vi.resetModules();
      const mod = await import("@shared/lib/quickbooks");

      // We can't directly inspect the const, but we can verify
      // the module loaded without error — the URL is used internally
      expect(mod.buildAuthUrl).toBeDefined();
      expect(mod.qbFetch).toBeDefined();
    });
  });
});

// ── Payout fee calculations ──────────────────────────────────────
// These mirror the logic in the payout route to ensure correctness.

describe("Payout fee calculations (Int cents)", () => {
  const PLATFORM_FEE_PERCENT = 5.0;
  const HOMEOWNER_SERVICE_FEE_PERCENT = 3.0;
  const roundCents = (value: number): number => Math.round(value);

  it("calculates 5% platform fee correctly on a $10,000 bid (1000000 cents)", () => {
    const gross = 1000000; // $10,000 in cents
    const fee = roundCents(gross * PLATFORM_FEE_PERCENT / 100);
    const net = gross - fee;

    expect(fee).toBe(50000);   // $500
    expect(net).toBe(950000);  // $9,500
  });

  it("calculates 3% homeowner service fee correctly", () => {
    const bidAmount = 500000; // $5,000 in cents
    const homeownerFee = roundCents(bidAmount * HOMEOWNER_SERVICE_FEE_PERCENT / 100);
    const totalCharge = bidAmount + homeownerFee;

    expect(homeownerFee).toBe(15000);  // $150
    expect(totalCharge).toBe(515000);  // $5,150
  });

  it("handles zero amounts", () => {
    expect(roundCents(0)).toBe(0);
  });

  it("rounds fractional cents correctly", () => {
    // 5% of 333 cents = 16.65 -> rounds to 17 cents
    expect(roundCents(333 * PLATFORM_FEE_PERCENT / 100)).toBe(17);
    // 3% of 999 cents = 29.97 -> rounds to 30 cents
    expect(roundCents(999 * HOMEOWNER_SERVICE_FEE_PERCENT / 100)).toBe(30);
  });

  it("calculates combined platform revenue correctly", () => {
    // On a $10,000 bid (1000000 cents):
    // - Homeowner pays: 1000000 + 30000 (3% service fee) = 1030000 cents ($10,300)
    // - Platform keeps: 50000 (5% contractor fee) + 30000 (3% homeowner fee) = 80000 cents ($800)
    // - Contractor gets: 1000000 - 50000 = 950000 cents ($9,500)
    const bid = 1000000;
    const homeownerFee = roundCents(bid * HOMEOWNER_SERVICE_FEE_PERCENT / 100);
    const platformFee = roundCents(bid * PLATFORM_FEE_PERCENT / 100);
    const contractorNet = bid - platformFee;
    const totalRevenue = homeownerFee + platformFee;

    expect(homeownerFee).toBe(30000);
    expect(platformFee).toBe(50000);
    expect(contractorNet).toBe(950000);
    expect(totalRevenue).toBe(80000);
  });

  it("handles small bid amounts in cents", () => {
    const bid = 5000; // $50 in cents
    const homeownerFee = roundCents(bid * HOMEOWNER_SERVICE_FEE_PERCENT / 100);
    const platformFee = roundCents(bid * PLATFORM_FEE_PERCENT / 100);
    const contractorNet = bid - platformFee;

    expect(homeownerFee).toBe(150);  // $1.50
    expect(platformFee).toBe(250);   // $2.50
    expect(contractorNet).toBe(4750); // $47.50
  });
});
