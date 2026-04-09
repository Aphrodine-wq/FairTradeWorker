/**
 * Data layer — tries real Elixir API first, falls back to mock data.
 * Pages import from here instead of mock-data directly.
 */
import { api, type RealtimeJob, type RealtimeBid, type RealtimeSubJob, type RealtimeSubBid } from "./realtime";
import { mockJobs, mockEstimates, mockFairRecords, mockSubJobs, mockSubBids, subContractorDashboardStats, type Job, type Estimate, type FairRecord, type SubJob, type SubBid } from "./mock-data";

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
export async function fetchJobs(filters?: {
  status?: string;
  category?: string;
  limit?: number;
}): Promise<Job[]> {
  try {
    const realtimeJobs = await api.listJobs(filters);
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
export async function fetchInvoice(id: string): Promise<any | null> {
  try { return await api.getInvoice(id); } catch { return null; }
}
export async function createInvoice(payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createInvoice(payload); } catch { return null; }
}
export async function updateInvoice(id: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.updateInvoice(id, payload); } catch { return null; }
}

/**
 * Fetch projects — real API with empty fallback.
 */
export async function fetchProjects(): Promise<any[]> {
  try { return await api.listProjects(); } catch { return []; }
}
export async function fetchProject(id: string): Promise<any | null> {
  try { return await api.getProject(id); } catch { return null; }
}
export async function createProject(payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createProject(payload); } catch { return null; }
}
export async function updateProject(id: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.updateProject(id, payload); } catch { return null; }
}

/**
 * Fetch clients — real API with empty fallback.
 */
export async function fetchClients(): Promise<any[]> {
  try { return await api.listClients(); } catch { return []; }
}
export async function fetchClient(id: string): Promise<any | null> {
  try { return await api.getClient(id); } catch { return null; }
}
export async function createClient(payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createClient(payload); } catch { return null; }
}
export async function updateClient(id: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.updateClient(id, payload); } catch { return null; }
}
export async function removeClient(id: string): Promise<boolean> {
  try { await api.deleteClient(id); return true; } catch { return false; }
}

/**
 * Fetch reviews — real API with empty fallback.
 */
export async function fetchReviews(forUserId?: string): Promise<any[]> {
  try { return await api.listReviews(forUserId); } catch { return []; }
}
export async function fetchReview(id: string): Promise<any | null> {
  try { return await api.getReview(id); } catch { return null; }
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

/**
 * Fetch verification status — real API with default fallback.
 */
export async function fetchVerificationStatus(): Promise<any> {
  try { return await api.getVerificationStatus(); } catch { return null; }
}

/**
 * Submit a verification step — real API.
 */
export async function submitVerification(step: string, data: Record<string, any>): Promise<any> {
  return api.submitVerificationStep(step, data);
}

/**
 * Fetch FairRecords for a contractor — real API with mock fallback.
 */
export async function fetchFairRecords(contractorId?: string): Promise<{ records: FairRecord[]; stats: any }> {
  try {
    const data = await api.listFairRecords(contractorId || "me");
    if (data.records.length > 0) return data;
  } catch {
    // Backend not available — fall through to mock
  }
  return {
    records: mockFairRecords,
    stats: {
      total: mockFairRecords.length,
      avg_budget_accuracy: 96.8,
      on_time_rate: 80.0,
      avg_rating: 4.9,
    },
  };
}

/**
 * Fetch a single FairRecord by public ID — real API with mock fallback.
 */
export async function fetchPublicRecord(publicId: string): Promise<FairRecord | null> {
  try {
    return await api.getPublicRecord(publicId);
  } catch {
    // Fall through to mock
  }
  return mockFairRecords.find((r) => r.publicId === publicId) || null;
}

/**
 * Fetch sub jobs — mock data for now.
 */
export async function fetchSubJobs(): Promise<SubJob[]> {
  try {
    const subJobs = await api.listSubJobs({ status: "open", limit: 50 });
    if (subJobs.length > 0) {
      return subJobs.map(toSubJob);
    }
  } catch {
    // fall through
  }
  return mockSubJobs;
}

/**
 * Fetch bids for a specific sub job — mock data for now.
 */
export async function fetchSubBids(subJobId: string): Promise<SubBid[]> {
  try {
    const { bids } = await api.getSubJob(subJobId);
    if (bids.length > 0) return bids.map(toSubBid);
  } catch {
    // fall through
  }
  return mockSubBids.filter((b) => b.subJobId === subJobId);
}

/**
 * Fetch sub contractor dashboard stats — mock data for now.
 */
export async function fetchSubContractorStats() {
  return subContractorDashboardStats;
}

export async function createEstimate(payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createEstimate(payload); } catch { return null; }
}
export async function updateEstimate(id: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.updateEstimate(id, payload); } catch { return null; }
}
export async function removeEstimate(id: string): Promise<boolean> {
  try { await api.deleteEstimate(id); return true; } catch { return false; }
}

function toSubJob(sj: RealtimeSubJob): SubJob {
  return {
    id: sj.id,
    contractorId: sj.contractor?.id || "",
    contractorName: sj.contractor?.name || "Contractor",
    contractorCompany: sj.contractor?.company || "Contractor Co.",
    contractorRating: sj.contractor?.rating || 0,
    projectId: sj.project_id,
    projectTitle: sj.project?.title || "Project",
    milestoneLabel: sj.milestone_label,
    milestoneIndex: sj.milestone_index,
    title: sj.title,
    description: sj.description || "",
    category: sj.category || "General Contracting",
    skills: sj.skills || [],
    location: sj.location || "",
    budgetMin: sj.budget_min || 0,
    budgetMax: sj.budget_max || 0,
    paymentPath: (sj.payment_path || "contractor_escrow") as SubJob["paymentPath"],
    disclosedToOwner: Boolean(sj.disclosed_to_owner),
    status: sj.status,
    deadline: sj.deadline || "",
    bidsCount: sj.bid_count || 0,
    postedDate: sj.posted_at || "",
    urgency: "medium",
  };
}

function toSubBid(sb: RealtimeSubBid): SubBid {
  return {
    id: sb.id,
    subJobId: sb.sub_job_id,
    subContractorId: sb.subcontractor?.id || "",
    subContractorName: sb.subcontractor?.name || "Subcontractor",
    subContractorCompany: sb.subcontractor?.company || "Subcontractor Co.",
    subContractorRating: sb.subcontractor?.rating || 0,
    amount: sb.amount,
    message: sb.message || "",
    timeline: sb.timeline || "",
    status: sb.status as SubBid["status"],
    createdDate: sb.placed_at || new Date().toISOString(),
  };
}
