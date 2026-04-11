/**
 * Data layer — prefers ftw-svc and only returns mock fixtures when explicitly
 * enabled through DEV_USE_MOCK_DATA / NEXT_PUBLIC_DEV_USE_MOCK_DATA.
 */
import { api, type RealtimeJob, type RealtimeBid, type RealtimeSubJob, type RealtimeSubBid } from "./realtime";
import { mockJobs, mockEstimates, mockFairRecords, mockSubJobs, mockSubBids, subContractorDashboardStats, type Job, type Estimate, type FairRecord, type SubJob, type SubBid } from "./mock-data";

const USE_MOCK_DATA =
  process.env.DEV_USE_MOCK_DATA === "true" ||
  process.env.NEXT_PUBLIC_DEV_USE_MOCK_DATA === "true";

function warnFtWSvcFailure(scope: string, error: unknown) {
  console.warn(`[ftw-svc] ${scope} failed`, error);
}

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
 * Fetch jobs from ftw-svc.
 */
export async function fetchJobs(filters?: {
  status?: string;
  category?: string;
  limit?: number;
}): Promise<Job[]> {
  try {
    const realtimeJobs = await api.listJobs(filters);
    return realtimeJobs.map(toJob);
  } catch (error) {
    warnFtWSvcFailure("fetchJobs", error);
    if (USE_MOCK_DATA) {
      return mockJobs;
    }
    return [];
  }
}

/**
 * Fetch bids for a specific job.
 */
export async function fetchBidsForJob(jobId: string): Promise<RealtimeBid[]> {
  try {
    const { bids } = await api.getJob(jobId);
    return bids;
  } catch (error) {
    warnFtWSvcFailure(`fetchBidsForJob(${jobId})`, error);
    return [];
  }
}

/**
 * Fetch estimates from ftw-svc.
 */
export async function fetchEstimates(): Promise<Estimate[]> {
  try {
    return await api.listEstimates();
  } catch (error) {
    warnFtWSvcFailure("fetchEstimates", error);
    if (USE_MOCK_DATA) {
      return mockEstimates;
    }
    return [];
  }
}

/**
 * Fetch invoices from ftw-svc.
 */
export async function fetchInvoices(): Promise<any[]> {
  try { return await api.listInvoices(); } catch (error) { warnFtWSvcFailure("fetchInvoices", error); return []; }
}
export async function fetchInvoice(id: string): Promise<any | null> {
  try { return await api.getInvoice(id); } catch (error) { warnFtWSvcFailure(`fetchInvoice(${id})`, error); return null; }
}
export async function createInvoice(payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createInvoice(payload); } catch (error) { warnFtWSvcFailure("createInvoice", error); return null; }
}
export async function updateInvoice(id: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.updateInvoice(id, payload); } catch (error) { warnFtWSvcFailure(`updateInvoice(${id})`, error); return null; }
}

/**
 * Fetch projects from ftw-svc.
 */
export async function fetchProjects(): Promise<any[]> {
  try { return await api.listProjects(); } catch (error) { warnFtWSvcFailure("fetchProjects", error); return []; }
}
export async function fetchProject(id: string): Promise<any | null> {
  try { return await api.getProject(id); } catch (error) { warnFtWSvcFailure(`fetchProject(${id})`, error); return null; }
}
export async function createProject(payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createProject(payload); } catch (error) { warnFtWSvcFailure("createProject", error); return null; }
}
export async function updateProject(id: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.updateProject(id, payload); } catch (error) { warnFtWSvcFailure(`updateProject(${id})`, error); return null; }
}

/**
 * Fetch clients from ftw-svc.
 */
export async function fetchClients(): Promise<any[]> {
  try { return await api.listClients(); } catch (error) { warnFtWSvcFailure("fetchClients", error); return []; }
}
export async function fetchClient(id: string): Promise<any | null> {
  try { return await api.getClient(id); } catch (error) { warnFtWSvcFailure(`fetchClient(${id})`, error); return null; }
}
export async function createClient(payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createClient(payload); } catch (error) { warnFtWSvcFailure("createClient", error); return null; }
}
export async function updateClient(id: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.updateClient(id, payload); } catch (error) { warnFtWSvcFailure(`updateClient(${id})`, error); return null; }
}
export async function removeClient(id: string): Promise<boolean> {
  try { await api.deleteClient(id); return true; } catch (error) { warnFtWSvcFailure(`removeClient(${id})`, error); return false; }
}

/**
 * Fetch reviews from ftw-svc.
 */
export async function fetchReviews(forUserId?: string): Promise<any[]> {
  try { return await api.listReviews(forUserId); } catch (error) { warnFtWSvcFailure("fetchReviews", error); return []; }
}
export async function fetchReview(id: string): Promise<any | null> {
  try { return await api.getReview(id); } catch (error) { warnFtWSvcFailure(`fetchReview(${id})`, error); return null; }
}

/**
 * Fetch notifications from ftw-svc.
 */
export async function fetchNotifications(): Promise<any[]> {
  try { return await api.listNotifications(); } catch (error) { warnFtWSvcFailure("fetchNotifications", error); return []; }
}

/**
 * Fetch settings from ftw-svc.
 */
export async function fetchSettings(): Promise<any> {
  try { return await api.getSettings(); } catch (error) { warnFtWSvcFailure("fetchSettings", error); return null; }
}

/**
 * Save settings to ftw-svc.
 */
export async function saveSettings(settings: Record<string, any>): Promise<any> {
  try { return await api.updateSettings(settings); } catch (error) { warnFtWSvcFailure("saveSettings", error); return null; }
}

/**
 * Fetch verification status from ftw-svc.
 */
export async function fetchVerificationStatus(): Promise<any> {
  try { return await api.getVerificationStatus(); } catch (error) { warnFtWSvcFailure("fetchVerificationStatus", error); return null; }
}

/**
 * Submit a verification step — real API.
 */
export async function submitVerification(step: string, data: Record<string, any>): Promise<any> {
  return api.submitVerificationStep(step, data);
}

/**
 * Fetch FairRecords for a contractor.
 */
export async function fetchFairRecords(contractorId?: string): Promise<{ records: FairRecord[]; stats: any }> {
  if (!contractorId) {
    warnFtWSvcFailure("fetchFairRecords", new Error("ftw-svc requires a contractorId for /api/contractors/{contractorId}/records"));
    if (USE_MOCK_DATA) {
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
    return {
      records: [],
      stats: {
        total: 0,
        avg_budget_accuracy: 0,
        on_time_rate: 0,
        avg_rating: 0,
      },
    };
  }

  try {
    return await api.listFairRecords(contractorId);
  } catch (error) {
    warnFtWSvcFailure(`fetchFairRecords(${contractorId})`, error);
    if (USE_MOCK_DATA) {
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
    return {
      records: [],
      stats: {
        total: 0,
        avg_budget_accuracy: 0,
        on_time_rate: 0,
        avg_rating: 0,
      },
    };
  }
}

/**
 * Fetch a single FairRecord by public ID.
 */
export async function fetchPublicRecord(publicId: string): Promise<FairRecord | null> {
  try {
    return await api.getPublicRecord(publicId);
  } catch (error) {
    warnFtWSvcFailure(`fetchPublicRecord(${publicId})`, error);
    if (USE_MOCK_DATA) {
      return mockFairRecords.find((r) => r.publicId === publicId) || null;
    }
    return null;
  }
}

/**
 * Fetch sub-jobs from ftw-svc.
 */
export async function fetchSubJobs(): Promise<SubJob[]> {
  try {
    const subJobs = await api.listSubJobs({ status: "open", limit: 50 });
    return subJobs.map(toSubJob);
  } catch (error) {
    warnFtWSvcFailure("fetchSubJobs", error);
    if (USE_MOCK_DATA) {
      return mockSubJobs;
    }
    return [];
  }
}

/**
 * Fetch bids for a specific sub-job from ftw-svc.
 */
export async function fetchSubBids(subJobId: string): Promise<SubBid[]> {
  try {
    const { bids } = await api.getSubJob(subJobId);
    return bids.map(toSubBid);
  } catch (error) {
    warnFtWSvcFailure(`fetchSubBids(${subJobId})`, error);
    if (USE_MOCK_DATA) {
      return mockSubBids.filter((b) => b.subJobId === subJobId);
    }
    return [];
  }
}

/**
 * Fetch sub contractor dashboard stats — mock data for now.
 */
export async function fetchSubContractorStats() {
  if (!USE_MOCK_DATA) {
    warnFtWSvcFailure("fetchSubContractorStats", new Error("TODO(ftw-svc): add a subcontractor dashboard stats endpoint"));
  }
  return subContractorDashboardStats;
}

export async function createEstimate(payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createEstimate(payload); } catch (error) { warnFtWSvcFailure("createEstimate", error); return null; }
}
export async function updateEstimate(id: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.updateEstimate(id, payload); } catch (error) { warnFtWSvcFailure(`updateEstimate(${id})`, error); return null; }
}
export async function removeEstimate(id: string): Promise<boolean> {
  try { await api.deleteEstimate(id); return true; } catch (error) { warnFtWSvcFailure(`removeEstimate(${id})`, error); return false; }
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
