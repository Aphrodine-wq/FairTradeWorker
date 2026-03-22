import { describe, it, expect } from "vitest";
import {
  mockContractors,
} from "../shared/lib/mock-data";

describe("mockContractors", () => {
  it("has at least one contractor", () => {
    expect(mockContractors.length).toBeGreaterThan(0);
  });

  it("every contractor has required fields", () => {
    for (const c of mockContractors) {
      expect(typeof c.id).toBe("string");
      expect(c.id.length).toBeGreaterThan(0);
      expect(typeof c.name).toBe("string");
      expect(c.name.length).toBeGreaterThan(0);
      expect(typeof c.company).toBe("string");
      expect(typeof c.rating).toBe("number");
      expect(typeof c.hourlyRate).toBe("number");
      expect(typeof c.verified).toBe("boolean");
    }
  });

  it("ratings are between 1 and 5", () => {
    for (const c of mockContractors) {
      expect(c.rating).toBeGreaterThanOrEqual(1);
      expect(c.rating).toBeLessThanOrEqual(5);
    }
  });

  it("hourly rates are positive", () => {
    for (const c of mockContractors) {
      expect(c.hourlyRate).toBeGreaterThan(0);
    }
  });

  it("all contractor ids are unique", () => {
    const ids = mockContractors.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("skills is an array", () => {
    for (const c of mockContractors) {
      expect(Array.isArray(c.skills)).toBe(true);
    }
  });

  it("years experience and jobs completed are non-negative", () => {
    for (const c of mockContractors) {
      expect(c.yearsExperience).toBeGreaterThanOrEqual(0);
      expect(c.jobsCompleted).toBeGreaterThanOrEqual(0);
    }
  });
});
