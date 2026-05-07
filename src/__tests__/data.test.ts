import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockJobs } from "../shared/lib/mock-data";

const listJobs = vi.fn();
const listConversations = vi.fn();
const listFairRecords = vi.fn();
const getAuthToken = vi.fn();

vi.mock("../shared/lib/realtime", () => ({
  api: {
    listJobs,
    listConversations,
    listFairRecords,
  },
  getAuthToken,
}));

describe("data layer fallback behavior", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getAuthToken.mockReturnValue(null);
  });

  it("does not mark conversations as mock when API fails", async () => {
    listConversations.mockRejectedValue(new Error("offline"));
    const { fetchConversations } = await import("../shared/lib/data");

    const result = await fetchConversations();
    expect(result).toEqual({ data: [], isMock: false });
  });

  it("returns real empty jobs list without fallback", async () => {
    listJobs.mockResolvedValue([]);
    const { fetchJobs } = await import("../shared/lib/data");

    const result = await fetchJobs();
    expect(result).toEqual([]);
  });

  it("returns zeroed fair record stats for real empty response", async () => {
    listFairRecords.mockResolvedValue({ records: [], stats: null });
    const { fetchFairRecords } = await import("../shared/lib/data");

    const result = await fetchFairRecords("me");
    expect(result).toEqual({
      records: [],
      stats: {
        total: 0,
        avg_budget_accuracy: 0,
        on_time_rate: 0,
        avg_rating: 0,
      },
    });
  });

  it("falls back to mock jobs when backend fails in local unauthenticated mode", async () => {
    listJobs.mockRejectedValue(new Error("offline"));
    getAuthToken.mockReturnValue(null);
    const { fetchJobs } = await import("../shared/lib/data");

    const result = await fetchJobs();
    expect(result).toEqual(mockJobs);
  });

  it("does not fall back to mock jobs for authenticated users", async () => {
    listJobs.mockRejectedValue(new Error("offline"));
    getAuthToken.mockReturnValue("real-user-token");
    const { fetchJobs } = await import("../shared/lib/data");

    const result = await fetchJobs();
    expect(result).toEqual([]);
  });
});
