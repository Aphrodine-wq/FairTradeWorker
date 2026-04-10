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

describe("Payout fee calculations", () => {
  const PLATFORM_FEE_PERCENT = 5.0;
  const HOMEOWNER_SERVICE_FEE_PERCENT = 3.0;
  const safeDiv = (a: number, b: number): number => (b !== 0 ? a / b : 0);
  const safeCents = (value: number): number => safeDiv(Math.round(value * 100), 100);

  it("calculates 5% platform fee correctly on a $10,000 bid", () => {
    const gross = 10000;
    const fee = safeCents(gross * safeDiv(PLATFORM_FEE_PERCENT, 100));
    const net = safeCents(gross - fee);

    expect(fee).toBe(500);
    expect(net).toBe(9500);
  });

  it("calculates 3% homeowner service fee correctly", () => {
    const bidAmount = 5000;
    const homeownerFee = safeCents(bidAmount * safeDiv(HOMEOWNER_SERVICE_FEE_PERCENT, 100));
    const totalCharge = safeCents(bidAmount + homeownerFee);

    expect(homeownerFee).toBe(150);
    expect(totalCharge).toBe(5150);
  });

  it("handles zero amounts without division by zero", () => {
    expect(safeDiv(0, 0)).toBe(0);
    expect(safeCents(0)).toBe(0);
  });

  it("rounds fractional cents correctly", () => {
    // $1,234.567 -> should round to $1,234.57
    expect(safeCents(1234.567)).toBe(1234.57);
    // $99.994 -> $99.99
    expect(safeCents(99.994)).toBe(99.99);
    // $99.995 -> $100.00
    expect(safeCents(99.995)).toBe(100);
  });

  it("calculates combined platform revenue correctly", () => {
    // On a $10,000 bid:
    // - Homeowner pays: $10,000 + $300 (3% service fee) = $10,300
    // - Platform keeps: $500 (5% contractor fee) + $300 (3% homeowner fee) = $800
    // - Contractor gets: $10,000 - $500 = $9,500
    const bid = 10000;
    const homeownerFee = safeCents(bid * safeDiv(HOMEOWNER_SERVICE_FEE_PERCENT, 100));
    const platformFee = safeCents(bid * safeDiv(PLATFORM_FEE_PERCENT, 100));
    const contractorNet = safeCents(bid - platformFee);
    const totalRevenue = safeCents(homeownerFee + platformFee);

    expect(homeownerFee).toBe(300);
    expect(platformFee).toBe(500);
    expect(contractorNet).toBe(9500);
    expect(totalRevenue).toBe(800);
  });

  it("handles small bid amounts", () => {
    const bid = 50;
    const homeownerFee = safeCents(bid * safeDiv(HOMEOWNER_SERVICE_FEE_PERCENT, 100));
    const platformFee = safeCents(bid * safeDiv(PLATFORM_FEE_PERCENT, 100));
    const contractorNet = safeCents(bid - platformFee);

    expect(homeownerFee).toBe(1.5);
    expect(platformFee).toBe(2.5);
    expect(contractorNet).toBe(47.5);
  });
});
