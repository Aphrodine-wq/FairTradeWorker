import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, getInitials } from "../shared/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "skipped", "included")).toBe("base included");
  });

  it("merges conflicting tailwind classes (last wins)", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats zero cents", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats cents to whole dollar amounts without decimals", () => {
    expect(formatCurrency(100000)).toBe("$1,000");
  });

  it("formats large cent amounts with commas", () => {
    expect(formatCurrency(1250000)).toBe("$12,500");
  });

  it("formats small cent amounts", () => {
    expect(formatCurrency(9999)).toBe("$100");
  });

  it("formats negative cent amounts", () => {
    expect(formatCurrency(-50000)).toBe("-$500");
  });
});

describe("formatDate", () => {
  it("formats a Date object with correct month and year", () => {
    const result = formatDate(new Date(2024, 0, 15));
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("accepts a Date object", () => {
    const result = formatDate(new Date(2024, 5, 1));
    expect(result).toContain("2024");
  });

  it("formats December correctly", () => {
    const result = formatDate(new Date(2024, 11, 25));
    expect(result).toContain("Dec");
    expect(result).toContain("25");
  });
});

describe("getInitials", () => {
  it("returns initials for two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns initials for single name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("returns uppercase initials", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("returns at most 2 characters for long names", () => {
    const result = getInitials("Alice Bob Charlie");
    expect(result.length).toBe(2);
    expect(result).toBe("AB");
  });

  it("handles names with extra spaces gracefully", () => {
    const result = getInitials("Marcus Johnson");
    expect(result).toBe("MJ");
  });
});
