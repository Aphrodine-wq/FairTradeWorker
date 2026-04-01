import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

describe("Seed API Route - Authorization Checks", () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeEach(() => {
    // Set a test secret for auth validation
    process.env.JWT_SECRET = "test-jwt-secret";
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv) {
      process.env.JWT_SECRET = originalEnv;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  it("rejects POST without x-seed-secret header", async () => {
    const { POST } = await import("../app/api/seed/route");

    const req = new NextRequest(new URL("http://localhost:3000/api/seed"), {
      method: "POST",
      headers: new Headers({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("unauthorized");
  });

  it("rejects POST with incorrect x-seed-secret header", async () => {
    const { POST } = await import("../app/api/seed/route");

    const req = new NextRequest(new URL("http://localhost:3000/api/seed"), {
      method: "POST",
      headers: new Headers({ "x-seed-secret": "wrong-secret-value" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("unauthorized");
  });

  it("returns 401 when JWT_SECRET is not configured", async () => {
    delete process.env.JWT_SECRET;

    const { POST } = await import("../app/api/seed/route");

    const req = new NextRequest(new URL("http://localhost:3000/api/seed"), {
      method: "POST",
      headers: new Headers({ "x-seed-secret": "any-secret" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("unauthorized");
  });

});
