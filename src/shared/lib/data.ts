/**
 * Data layer — tries real Elixir API first, falls back to mock data.
 * Pages import from here instead of mock-data directly.
 */
import { api, type RealtimeJob, type RealtimeBid } from "./realtime";
import { mockJobs, mockEstimates, type Job, type Estimate } from "./mock-data";

// Convert a RealtimeJob from the API to the mock Job shape pages expect
function toJob(rj: RealtimeJob): Job {
  return {
    ...mockJobs[0], // inherit defaults for fields the API doesn't have yet
    id: rj.id,
    title: rj.title,
    description: rj.description,
    detailedScope: rj.description,
    category: rj.category,
    budget: { min: rj.budget_min, max: rj.budget_max },
    location: rj.location,
    fullAddress: rj.location,
    postedBy: typeof rj.homeowner === "string" ? rj.homeowner : rj.homeowner?.name ?? "Homeowner",
    postedDate: rj.posted_at,
    status: rj.status as Job["status"],
    bidsCount: rj.bid_count,
    tags: [rj.category],
    thumbnail: "",
    photos: [],
  };
}

/**
 * Fetch jobs — real API if backend is reachable, mock data otherwise.
 */
export async function fetchJobs(): Promise<Job[]> {
  try {
    const realtimeJobs = await api.listJobs();
    if (realtimeJobs.length > 0) {
      return realtimeJobs.map(toJob);
    }
  } catch {
    // Backend not available — fall through to mock
  }
  return mockJobs;
}

/**
 * Fetch bids for a specific job.
 */
export async function fetchBidsForJob(jobId: string): Promise<RealtimeBid[]> {
  try {
    const { bids } = await api.getJob(jobId);
    return bids;
  } catch {
    return [];
  }
}

/**
 * Fetch estimates — real API with mock fallback.
 */
export async function fetchEstimates(): Promise<Estimate[]> {
  try {
    const apiEstimates = await api.listEstimates();
    if (apiEstimates.length > 0) {
      return apiEstimates;
    }
  } catch {
    // Backend not available — fall through to mock
  }
  return mockEstimates;
}

/**
 * Fetch invoices — real API with empty fallback.
 */
export async function fetchInvoices(): Promise<any[]> {
  try { return await api.listInvoices(); } catch { return []; }
}

/**
 * Fetch projects — real API with empty fallback.
 */
export async function fetchProjects(): Promise<any[]> {
  try { return await api.listProjects(); } catch { return []; }
}

/**
 * Fetch clients — real API with empty fallback.
 */
export async function fetchClients(): Promise<any[]> {
  try { return await api.listClients(); } catch { return []; }
}

/**
 * Fetch reviews — real API with empty fallback.
 */
export async function fetchReviews(forUserId?: string): Promise<any[]> {
  try { return await api.listReviews(forUserId); } catch { return []; }
}

/**
 * Fetch notifications — real API with empty fallback.
 */
export async function fetchNotifications(): Promise<any[]> {
  try { return await api.listNotifications(); } catch { return []; }
}

/**
 * Fetch settings — real API with null fallback.
 */
export async function fetchSettings(): Promise<any> {
  try { return await api.getSettings(); } catch { return null; }
}

/**
 * Save settings — real API with null fallback.
 */
export async function saveSettings(settings: Record<string, any>): Promise<any> {
  try { return await api.updateSettings(settings); } catch { return null; }
}
