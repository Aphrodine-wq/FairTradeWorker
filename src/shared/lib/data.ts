/**
 * Data layer — tries real Elixir API first, falls back to mock data.
 * Pages import from here instead of mock-data directly.
 */
import { api, type RealtimeJob, type RealtimeBid } from "./realtime";
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

export async function fetchContractorDashboard(): Promise<any | null> {
  try { return await api.getContractorDashboard(); } catch { return null; }
}

export async function fetchHomeownerDashboard(): Promise<any | null> {
  try { return await api.getHomeownerDashboard(); } catch { return null; }
}

export async function fetchProjectChangeOrders(projectId: string): Promise<any[]> {
  try { return await api.getProjectChangeOrders(projectId); } catch { return []; }
}

export async function createProjectChangeOrder(projectId: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createProjectChangeOrder(projectId, payload); } catch { return null; }
}

export async function fetchProjectPunchItems(projectId: string): Promise<any[]> {
  try { return await api.getProjectPunchItems(projectId); } catch { return []; }
}

export async function createProjectPunchItem(projectId: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createProjectPunchItem(projectId, payload); } catch { return null; }
}

export async function fetchProjectExpenses(projectId: string): Promise<{ totals: any; expenses: any[] } | null> {
  try { return await api.getProjectExpenses(projectId); } catch { return null; }
}

export async function createProjectExpense(projectId: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createProjectExpense(projectId, payload); } catch { return null; }
}

export async function fetchProjectDocuments(projectId: string): Promise<any[]> {
  try { return await api.getProjectDocuments(projectId); } catch { return []; }
}

export async function createProjectDocument(projectId: string, payload: Record<string, unknown>): Promise<any | null> {
  try { return await api.createProjectDocument(projectId, payload); } catch { return null; }
}

export async function fetchInvoiceableMilestones(projectId: string): Promise<any[]> {
  try { return await api.getInvoiceableMilestones(projectId); } catch { return []; }
}

export async function fetchEstimateTemplates(): Promise<any[]> {
  try { return await api.listEstimateTemplates(); } catch { return []; }
}

export async function fetchPublicStats(): Promise<any | null> {
  try { return await api.getPublicStats(); } catch { return null; }
}

export async function fetchJobCategories(): Promise<any[]> {
  try { return await api.listJobCategories(); } catch { return []; }
}

export async function fetchTrades(): Promise<any[]> {
  try { return await api.listTrades(); } catch { return []; }
}

export async function fetchSubcontractorEarningsSummary(subcontractorId: string): Promise<any | null> {
  try { return await api.getSubcontractorEarningsSummary(subcontractorId); } catch { return null; }
}

export async function fetchSubcontractorPayouts(
  subcontractorId: string,
  params?: { page?: number; pageSize?: number }
): Promise<any | null> {
  try { return await api.getSubcontractorPayouts(subcontractorId, params); } catch { return null; }
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
  try {
    await api.deleteClient(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch reviews — real API with mock fallback.
 */
export async function fetchReviews(forUserId?: string): Promise<{ data: any[]; isMock: boolean }> {
  try {
    const reviews = await api.listReviews(forUserId);
    if (reviews.length > 0) return { data: reviews, isMock: false };
  } catch {
    // Backend not available — fall through to mock
  }
  return { data: [], isMock: true };
}

/**
 * Fetch notifications — real API with mock fallback.
 * Returns isMock flag so UI can show fallback banner.
 */
export async function fetchNotifications(): Promise<{ data: any[]; isMock: boolean }> {
  try {
    const notifs = await api.listNotifications();
    return { data: notifs, isMock: false };
  } catch {
    // Backend not available — fall through to mock
  }
  return { data: [], isMock: true };
}

/**
 * Fetch conversations — real API with mock fallback.
 */
export async function fetchConversations(): Promise<{ data: any[]; isMock: boolean }> {
  try {
    const convos = await api.listConversations();
    if (convos.length > 0) return { data: convos, isMock: false };
  } catch {
    // Backend not available — fall through to mock
  }
  return { data: [], isMock: true };
}

/**
 * Legacy fetchNotifications without isMock — for backward compatibility.
 * Prefer the named export above which returns { data, isMock }.
 */

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

// Convert a snake_case sub job from the API to the camelCase SubJob shape pages expect
function toSubJob(raw: any): SubJob {
  return {
    id: raw.id,
    contractorId: raw.contractor_id ?? raw.contractorId ?? "",
    contractorName: raw.contractor_name ?? raw.contractorName ?? "",
    contractorCompany: raw.contractor_company ?? raw.contractorCompany ?? "",
    contractorRating: raw.contractor_rating ?? raw.contractorRating ?? 0,
    projectId: raw.project_id ?? raw.projectId ?? "",
    projectTitle: raw.project_title ?? raw.projectTitle ?? "",
    milestoneLabel: raw.milestone_label ?? raw.milestoneLabel ?? "",
    milestoneIndex: raw.milestone_index ?? raw.milestoneIndex ?? 0,
    title: raw.title,
    description: raw.description ?? "",
    category: raw.category ?? "",
    skills: raw.skills ?? [],
    location: raw.location ?? "",
    budgetMin: raw.budget_min ?? raw.budgetMin ?? 0,
    budgetMax: raw.budget_max ?? raw.budgetMax ?? 0,
    paymentPath: raw.payment_path ?? raw.paymentPath ?? "contractor_escrow",
    disclosedToOwner: raw.disclosed_to_owner ?? raw.disclosedToOwner ?? false,
    status: raw.status ?? "open",
    deadline: raw.deadline ?? "",
    bidsCount: raw.bids_count ?? raw.bid_count ?? raw.bidsCount ?? 0,
    postedDate: raw.posted_date ?? raw.posted_at ?? raw.postedDate ?? "",
    urgency: raw.urgency ?? "medium",
  };
}

function toSubBid(raw: any): SubBid {
  return {
    id: raw.id,
    subJobId: raw.sub_job_id ?? raw.subJobId ?? "",
    subContractorId: raw.sub_contractor_id ?? raw.subContractorId ?? "",
    subContractorName: raw.sub_contractor_name ?? raw.subContractorName ?? "",
    subContractorCompany: raw.sub_contractor_company ?? raw.subContractorCompany ?? "",
    subContractorRating: raw.sub_contractor_rating ?? raw.subContractorRating ?? 0,
    amount: raw.amount ?? 0,
    message: raw.message ?? "",
    timeline: raw.timeline ?? "",
    status: raw.status ?? "pending",
    createdDate: raw.created_date ?? raw.created_at ?? raw.createdDate ?? "",
  };
}

/**
 * Fetch sub jobs — real API if backend is reachable, mock data otherwise.
 */
export async function fetchSubJobs(): Promise<SubJob[]> {
  try {
    const rawSubJobs = await api.listSubJobs();
    if (rawSubJobs.length > 0) {
      return rawSubJobs.map(toSubJob);
    }
  } catch {
    // Backend not available — fall through to mock
  }
  return mockSubJobs;
}

/**
 * Fetch bids for a specific sub job — real API with mock fallback.
 */
export async function fetchSubBids(subJobId: string): Promise<SubBid[]> {
  try {
    const { bids } = await api.getSubJob(subJobId);
    if (bids && bids.length > 0) {
      return bids.map(toSubBid);
    }
  } catch {
    // Backend not available — fall through to mock
  }
  return mockSubBids.filter((b) => b.subJobId === subJobId);
}

/**
 * Fetch sub contractor dashboard stats — real API with mock fallback.
 */
export async function fetchSubContractorStats() {
  try {
    const stats = await api.getSubContractorStats();
    if (stats) return stats;
  } catch {
    // Backend not available — fall through to mock
  }
  return subContractorDashboardStats;
}

/**
 * Post a sub job — calls real API.
 */
export async function postSubJob(params: {
  projectId: string;
  milestoneLabel: string;
  milestoneIndex: number;
  title: string;
  description: string;
  category: string;
  skills: string[];
  location: string;
  budgetMin: number;
  budgetMax: number;
  paymentPath: string;
  disclosedToOwner: boolean;
  deadline: string;
}): Promise<SubJob> {
  const raw = await api.postSubJob({
    project_id: params.projectId,
    milestone_label: params.milestoneLabel,
    milestone_index: params.milestoneIndex,
    title: params.title,
    description: params.description,
    category: params.category,
    skills: params.skills,
    location: params.location,
    budget_min: params.budgetMin,
    budget_max: params.budgetMax,
    payment_path: params.paymentPath,
    disclosed_to_owner: params.disclosedToOwner,
    deadline: params.deadline,
  });
  return toSubJob(raw);
}

/**
 * Place a bid on a sub job — calls real API.
 */
export async function placeSubBid(
  subJobId: string,
  bid: { amount: number; message: string; timeline: string }
): Promise<SubBid> {
  const raw = await api.placeSubBid(subJobId, bid);
  return toSubBid(raw);
}

/**
 * Update a sub job's status — calls real API.
 */
export async function updateSubJobStatus(subJobId: string, status: string): Promise<SubJob> {
  const raw = await api.updateSubJobStatus(subJobId, status);
  return toSubJob(raw);
}
