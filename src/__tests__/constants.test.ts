import { describe, it, expect } from "vitest";
import {
  BRAND,
  NAV_LINKS,
  PLAN_TIERS,
  STATS,
  JOB_CATEGORIES,
  ESTIMATE_STATUSES,
  JOB_STATUSES,
} from "../shared/lib/constants";

describe("BRAND", () => {
  it("has a name", () => {
    expect(BRAND.name).toBe("FairTradeWorker");
  });

  it("has a primary color in hex format", () => {
    expect(BRAND.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("has a tagline", () => {
    expect(BRAND.tagline.length).toBeGreaterThan(0);
  });

  it("has all required color tokens", () => {
    const required = ["primary", "primaryHover", "dark", "bgSoft", "bgCard", "textPrimary", "textSecondary", "border"];
    for (const key of required) {
      expect(BRAND.colors).toHaveProperty(key);
    }
  });
});

describe("NAV_LINKS", () => {
  it("has at least one link", () => {
    expect(NAV_LINKS.length).toBeGreaterThan(0);
  });

  it("every link has a label and href", () => {
    for (const link of NAV_LINKS) {
      expect(link.label.length).toBeGreaterThan(0);
      expect(link.href.length).toBeGreaterThan(0);
    }
  });

  it("hrefs start with / or #", () => {
    for (const link of NAV_LINKS) {
      expect(link.href).toMatch(/^[/#]/);
    }
  });
});

describe("PLAN_TIERS", () => {
  it("has exactly 3 tiers", () => {
    expect(PLAN_TIERS.length).toBe(3);
  });

  it("exactly one tier is featured", () => {
    const featured = PLAN_TIERS.filter((t) => t.featured);
    expect(featured.length).toBe(1);
  });

  it("prices are non-negative", () => {
    for (const tier of PLAN_TIERS) {
      expect(tier.price).toBeGreaterThanOrEqual(0);
    }
  });

  it("each tier has a cta and features list", () => {
    for (const tier of PLAN_TIERS) {
      expect(tier.cta.length).toBeGreaterThan(0);
      expect(tier.features.length).toBeGreaterThan(0);
    }
  });

  it("free tier has price 0", () => {
    const starter = PLAN_TIERS.find((t) => t.name === "Starter");
    expect(starter?.price).toBe(0);
  });
});

describe("JOB_CATEGORIES", () => {
  it("has at least 5 categories", () => {
    expect(JOB_CATEGORIES.length).toBeGreaterThanOrEqual(5);
  });

  it("all categories are non-empty strings", () => {
    for (const cat of JOB_CATEGORIES) {
      expect(typeof cat).toBe("string");
      expect(cat.length).toBeGreaterThan(0);
    }
  });

  it("includes common trade categories", () => {
    expect(JOB_CATEGORIES).toContain("Plumbing");
    expect(JOB_CATEGORIES).toContain("Electrical");
  });
});

describe("ESTIMATE_STATUSES", () => {
  it("includes draft and accepted", () => {
    expect(ESTIMATE_STATUSES).toContain("draft");
    expect(ESTIMATE_STATUSES).toContain("accepted");
  });

  it("has at least 4 statuses", () => {
    expect(ESTIMATE_STATUSES.length).toBeGreaterThanOrEqual(4);
  });
});

describe("JOB_STATUSES", () => {
  it("includes open and completed", () => {
    expect(JOB_STATUSES).toContain("open");
    expect(JOB_STATUSES).toContain("completed");
  });

  it("has at least 3 statuses", () => {
    expect(JOB_STATUSES.length).toBeGreaterThanOrEqual(3);
  });
});

describe("STATS", () => {
  it("has 4 stats", () => {
    expect(STATS.length).toBe(4);
  });

  it("all stats have a label, value, and suffix", () => {
    for (const stat of STATS) {
      expect(stat.label.length).toBeGreaterThan(0);
      expect(typeof stat.value).toBe("number");
      expect(stat.suffix.length).toBeGreaterThan(0);
    }
  });

  it("satisfaction stat is a percentage", () => {
    const satisfaction = STATS.find((s) => s.label.includes("Satisfaction"));
    expect(satisfaction?.suffix).toBe("%");
    expect(satisfaction?.value).toBeGreaterThan(0);
    expect(satisfaction?.value).toBeLessThanOrEqual(100);
  });
});
