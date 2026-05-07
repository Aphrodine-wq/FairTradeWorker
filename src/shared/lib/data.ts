/**
 * Data layer — tries real Elixir API first, falls back to mock data.
 * Pages import from here instead of mock-data directly.
 */
import {
  api,
  getAuthToken,
  type RealtimeJob,
  type RealtimeBid,
  type RealtimePropertyApi,
} from "./realtime";
import {
  mockJobs,
  mockEstimates,
  mockFairRecords,
  mockSubJobs,
  mockSubBids,
  subContractorDashboardStats,
  type Job,
  type Estimate,
  type FairRecord,
  type SubJob,
  type SubBid,
  type PropertyDetails,
} from "./mock-data";

function hasAuthenticatedSession(): boolean {
  if (getAuthToken()) return true;
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("ftw-auth");
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { token?: string | null };
    return Boolean(parsed?.token);
  } catch {
    return false;
  }
}

function shouldUseMockFallback(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACK === "true") {
    return true;
  }
  return process.env.NODE_ENV !== "production" && !hasAuthenticatedSession();
}

const DEFAULT_PROPERTY: PropertyDetails = {
  stories: 0,
  foundation: "slab",
  exterior: "",
  roofType: "",
  roofAge: 0,
  garage: "none",
  lotSize: "",
  hoa: false,
  hoaNotes: "",
  heating: "",
  cooling: "",
  waterHeater: "electric",
  plumbing: "",
  electrical: "",
  sewer: "city",
  knownIssues: [],
  recentWork: [],
};

function mapPropertyFromApi(p?: RealtimePropertyApi | null): PropertyDetails {
  if (!p) return { ...DEFAULT_PROPERTY };
  const rawFoundation = (p.foundation || "slab").toLowerCase().replace(/[\s-]+/g, "_");
  const foundation = (
    rawFoundation === "pier_beam" ||
    rawFoundation === "basement" ||
    rawFoundation === "crawlspace" ||
    rawFoundation === "slab"
      ? rawFoundation
      : "slab"
  ) as PropertyDetails["foundation"];
  const g = (p.garage || "none").toLowerCase();
  const garage: PropertyDetails["garage"] =
    g === "attached" || g === "detached" || g === "carport" || g === "none" ? g : "none";
  const sewer: PropertyDetails["sewer"] = (p.sewer || "city").toLowerCase() === "septic" ? "septic" : "city";
  const wh = (p.water_heater || "electric").toLowerCase();
  const waterHeater: PropertyDetails["waterHeater"] =
    wh === "gas" || wh === "electric" || wh === "tankless_gas" || wh === "tankless_electric" ? wh : "electric";

  return {
    stories: p.stories ?? 0,
    foundation,
    exterior: p.exterior ?? "",
    roofType: p.roof_type ?? "",
    roofAge: p.roof_age ?? 0,
    garage,
    lotSize: p.lot_size ?? "",
    hoa: Boolean(p.hoa),
    hoaNotes: p.hoa_notes ?? "",
    heating: p.heating ?? "",
    cooling: p.cooling ?? "",
    waterHeater,
    plumbing: p.plumbing ?? "",
    electrical: p.electrical ?? "",
    sewer,
    knownIssues: Array.isArray(p.known_issues) ? p.known_issues : [],
    recentWork: Array.isArray(p.recent_work) ? p.recent_work : [],
  };
}

function homeownerDisplayName(ho: RealtimeJob["homeowner"]): string {
  if (!ho) return "Homeowner";
  if (typeof ho === "string") return ho;
  return ho.name ?? "Homeowner";
}

function normUrgency(u: string | undefined): Job["urgency"] {
  const x = (u || "medium").toLowerCase();
  if (x === "low" || x === "high" || x === "medium") return x;
  return "medium";
}

function normPropertyType(p: string | undefined): Job["propertyType"] {
  const x = (p || "residential").toLowerCase();
  if (x === "residential" || x === "commercial" || x === "industrial") return x;
  return "residential";
}

/** Maps GET /api/jobs (and WebSocket job payloads) to the UI `Job` model. */
export function mapRealtimeJobToJob(rj: RealtimeJob): Job {
  const ho = rj.homeowner;
  const pb = rj.posted_by;
  const postedByName = pb?.name ?? homeownerDisplayName(ho);
  const postedByRating = Number(
    pb?.rating ?? (typeof ho === "object" && ho && "rating" in ho ? ho.rating ?? 0 : 0)
  );
  const postedByJobs = Number(pb?.jobs_posted ?? 0);
  const postedByAvatar =
    String(pb?.avatar ?? "").trim() ||
    String(typeof ho === "object" && ho && "avatar_url" in ho ? ho.avatar_url ?? "" : "").trim();

  const tags = rj.tags?.length ? rj.tags : [rj.category];

  return {
    id: rj.id,
    title: rj.title,
    description: rj.description,
    detailedScope: rj.detailed_scope ?? rj.description,
    category: rj.category,
    subcategory: rj.subcategory ?? rj.category,
    budget: { min: rj.budget_min, max: rj.budget_max },
    location: rj.location,
    fullAddress: rj.full_address ?? rj.location,
    postedBy: postedByName,
    postedByRating,
    postedByJobs,
    postedByAvatar,
    postedDate: rj.inserted_at ?? rj.posted_at,
    deadline: rj.deadline ?? "",
    preferredStartDate: rj.preferred_start_date ?? "",
    estimatedDuration: rj.estimated_duration ?? "",
    status: rj.status as Job["status"],
    bidsCount: rj.bid_count,
    viewCount: Number(rj.view_count ?? 0),
    urgency: normUrgency(rj.urgency),
    propertyType: normPropertyType(rj.property_type),
    sqft: Number(rj.sqft ?? 0),
    yearBuilt: Number(rj.year_built ?? 0),
    accessNotes: rj.access_notes ?? "",
    materialsProvided: Boolean(rj.materials_provided),
    permitsRequired: Boolean(rj.permits_required),
    inspectionRequired: Boolean(rj.inspection_required),
    insuranceClaim: Boolean(rj.insurance_claim),
    requirements: Array.isArray(rj.requirements)
      ? rj.requirements.map((r) => ({ label: r.label, met: Boolean(r.met) }))
      : [],
    tags,
    specialInstructions: rj.special_instructions ?? "",
    thumbnail: rj.thumbnail ?? "",
    photos: (rj.photos ?? []).map((ph) => ({
      url: ph.url,
      caption: ph.caption ?? "",
      type: ph.type === "video" ? "video" : "photo",
    })),
    property: mapPropertyFromApi(rj.property),
  };
}

/**
 * Fetch jobs — real API if backend is reachable, mock data otherwise.
 */
export async function fetchJobs(): Promise<Job[]> {
  try {
    const realtimeJobs = await api.listJobs();
    return realtimeJobs.map(mapRealtimeJobToJob);
  } catch {
    if (shouldUseMockFallback()) return mockJobs;
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
    return apiEstimates;
  } catch {
    if (shouldUseMockFallback()) return mockEstimates;
    return [];
  }
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
    return { data: convos, isMock: false };
  } catch {
    // Conversation fallback to hardcoded mock data is intentionally disabled.
    return { data: [], isMock: false };
  }
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
    return {
      records: data.records || [],
      stats: data.stats || {
        total: 0,
        avg_budget_accuracy: 0,
        on_time_rate: 0,
        avg_rating: 0,
      },
    };
  } catch {
    if (!shouldUseMockFallback()) {
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
    if (!shouldUseMockFallback()) return null;
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
    return rawSubJobs.map(toSubJob);
  } catch {
    if (shouldUseMockFallback()) return mockSubJobs;
    return [];
  }
}

/**
 * Fetch bids for a specific sub job — real API with mock fallback.
 */
export async function fetchSubBids(subJobId: string): Promise<SubBid[]> {
  try {
    const { bids } = await api.getSubJob(subJobId);
    return (bids || []).map(toSubBid);
  } catch {
    if (shouldUseMockFallback()) return mockSubBids.filter((b) => b.subJobId === subJobId);
    return [];
  }
}

/**
 * Fetch sub contractor dashboard stats — real API with mock fallback.
 */
export async function fetchSubContractorStats() {
  try {
    const stats = await api.getSubContractorStats();
    if (stats) return stats;
    return null;
  } catch {
    if (shouldUseMockFallback()) return subContractorDashboardStats;
    return null;
  }
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
