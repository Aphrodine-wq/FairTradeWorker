/**
 * FTW Realtime Client
 *
 * Connects the Next.js frontend to the Spring Boot backend
 * via WebSockets (STOMP/SockJS) and REST API.
 *
 * Usage:
 *   import { realtimeClient } from "@shared/lib/realtime"
 *   realtimeClient.connect(jwtToken)
 */
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { changePassword as changePasswordGap } from "./ftw-svc-gaps";

// FairTradeWorker talks to ftw-svc through this base URL.
const API_BASE = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";
const WS_URL = `${API_BASE}/ws`;

// --- Types matching the backend serializers ---

export interface RealtimeUser {
  id: string;
  name: string;
  role: "homeowner" | "contractor" | "subcontractor";
  location: string;
  rating: number | null;
}

export interface RealtimeJob {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  location: string;
  status: "open" | "bidding" | "awarded" | "in_progress" | "completed" | "disputed" | "cancelled";
  bid_count: number;
  homeowner: RealtimeUser;
  posted_at: string;
}

export interface RealtimeBid {
  id: string;
  job_id: string;
  amount: number;
  message: string;
  timeline: string;
  status: "pending" | "accepted" | "rejected";
  contractor: RealtimeUser;
  placed_at: string;
}

export interface RealtimeMessage {
  id: string;
  conversation_id: string;
  body: string;
  sender: RealtimeUser;
  sent_at: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    roles?: string[];
  };
}

export interface RealtimeSubJob {
  id: string;
  project_id: string;
  milestone_label: string;
  milestone_index: number;
  title: string;
  description?: string;
  category?: string;
  skills?: string[];
  location?: string;
  budget_min?: number;
  budget_max?: number;
  payment_path?: "contractor_escrow" | "passthrough_escrow";
  disclosed_to_owner?: boolean;
  status: "open" | "in_progress" | "completed" | "cancelled";
  deadline?: string;
  bid_count?: number;
  posted_at?: string;
  contractor?: RealtimeUser & { company?: string };
  project?: { title?: string };
}

export interface RealtimeSubBid {
  id: string;
  sub_job_id: string;
  amount: number;
  message?: string;
  timeline?: string;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  placed_at?: string;
  subcontractor?: RealtimeUser & { company?: string };
}

// --- Event callbacks ---

type JobCallback = (job: RealtimeJob) => void;
type BidCallback = (bid: RealtimeBid) => void;
type MessageCallback = (message: RealtimeMessage) => void;
type SubJobCallback = (job: RealtimeSubJob) => void;
type SubBidCallback = (bid: RealtimeSubBid) => void;

// --- Token management ---

let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

export function getAuthToken(): string | null {
  return _authToken;
}

// --- REST API ---

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (_authToken) {
    headers["Authorization"] = `Bearer ${_authToken}`;
  }

  const optionHeaders = (options?.headers || {}) as Record<string, string>;
  const mergedHeaders = { ...headers, ...optionHeaders };
  const allow401Passthrough = Boolean(mergedHeaders["X-Allow-401"]);
  delete mergedHeaders["X-Allow-401"];

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" && !allow401Passthrough) {
      // Session expired — clear auth and redirect
      setAuthToken(null);
      localStorage.removeItem("ftw-auth");
      window.location.href = "/login?expired=true";
      throw new Error("Session expired");
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `API error: ${res.status}`);
  }

  return res.json();
}

function toQuery(params: Record<string, string | number | undefined>) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") qp.set(key, String(value));
  });
  const query = qp.toString();
  return query ? `?${query}` : "";
}

function unwrapList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>)[key])) {
    return (data as Record<string, T[]>)[key];
  }
  return [];
}

function unwrapOne<T>(data: unknown, key: string): T {
  if (data && typeof data === "object" && key in (data as Record<string, unknown>)) {
    return (data as Record<string, T>)[key];
  }
  return data as T;
}

export const api = {
  // Health
  async health(): Promise<any> {
    return apiFetch("/api/health", { headers: { "X-Allow-401": "1" } });
  },

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  async register(attrs: {
    email: string;
    password: string;
    name: string;
    role: "homeowner" | "contractor" | "subcontractor";
    location?: string;
  }): Promise<{ user: AuthResponse["user"] }> {
    return apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        ...attrs,
        role: attrs.role.toUpperCase(),
      }),
    });
  },

  async me(): Promise<{ user: AuthResponse["user"] }> {
    return apiFetch("/api/auth/me");
  },

  async loginWithGoogle(idToken: string, role?: string): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken, role }),
    });
    setAuthToken(data.token);
    return data;
  },

  async loginWithApple(idToken: string, name?: string, role?: string): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>("/api/auth/apple", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken, name, role }),
    });
    setAuthToken(data.token);
    return data;
  },

  async switchRole(role: string): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>("/api/auth/switch-role", {
      method: "POST",
      body: JSON.stringify({ role: role.toUpperCase() }),
    });
    setAuthToken(data.token);
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    return changePasswordGap(currentPassword, newPassword);
  },

  // Jobs (public — no auth required for listing)
  async listJobs(params?: {
    status?: string;
    category?: string;
    limit?: number;
  }): Promise<RealtimeJob[]> {
    const data = await apiFetch<{ jobs: RealtimeJob[] } | RealtimeJob[]>(
      `/api/jobs${toQuery(params || {})}`,
      { headers: { "X-Allow-401": "1" } }
    );
    return unwrapList<RealtimeJob>(data, "jobs");
  },

  async getJob(id: string): Promise<{ job: RealtimeJob; bids: RealtimeBid[] }> {
    return apiFetch(`/api/jobs/${id}`);
  },

  // Jobs (authenticated)
  async postJob(job: {
    title: string;
    description: string;
    category: string;
    budget_min: number;
    budget_max: number;
    location: string;
  }): Promise<RealtimeJob> {
    const data = await apiFetch<{ job: RealtimeJob }>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(job),
    });
    return data.job;
  },

  async placeBid(
    jobId: string,
    bid: { amount: number; message: string; timeline: string }
  ): Promise<RealtimeBid> {
    const data = await apiFetch<{ bid: RealtimeBid }>(`/api/jobs/${jobId}/bids`, {
      method: "POST",
      body: JSON.stringify(bid),
    });
    return data.bid;
  },

  async acceptBid(jobId: string, bidId: string): Promise<RealtimeBid> {
    const data = await apiFetch<{ bid: RealtimeBid }>(
      `/api/jobs/${jobId}/bids/${bidId}/accept`,
      { method: "POST" }
    );
    return data.bid;
  },

  async transitionJob(jobId: string, status: string): Promise<RealtimeJob> {
    const data = await apiFetch<{ job: RealtimeJob } | RealtimeJob>(
      `/api/jobs/${jobId}/transition`,
      {
        method: "POST",
        body: JSON.stringify({ status }),
      }
    );
    return unwrapOne<RealtimeJob>(data, "job");
  },

  // Chat (authenticated)
  async listConversations(): Promise<any[]> {
    const data = await apiFetch<{ conversations: any[] }>("/api/chat/conversations");
    return data.conversations;
  },

  async listMessages(conversationId: string): Promise<RealtimeMessage[]> {
    const data = await apiFetch<{ messages: RealtimeMessage[] }>(
      `/api/chat/${conversationId}`
    );
    return data.messages;
  },

  async sendMessage(
    conversationId: string,
    message: { body: string }
  ): Promise<RealtimeMessage> {
    const data = await apiFetch<{ message: RealtimeMessage }>(
      `/api/chat/${conversationId}`,
      { method: "POST", body: JSON.stringify(message) }
    );
    return data.message;
  },

  // Estimates
  async listEstimates(): Promise<any[]> {
    const data = await apiFetch<{ estimates: any[] } | any[]>("/api/estimates");
    return unwrapList<any>(data, "estimates");
  },
  async getEstimate(id: string): Promise<any> {
    const data = await apiFetch<{ estimate: any } | any>(`/api/estimates/${id}`);
    return unwrapOne<any>(data, "estimate");
  },
  async createEstimate(estimate: Record<string, unknown>): Promise<any> {
    const data = await apiFetch<{ estimate: any } | any>("/api/estimates", {
      method: "POST",
      body: JSON.stringify({ estimate }),
    });
    return unwrapOne<any>(data, "estimate");
  },
  async updateEstimate(id: string, estimate: Record<string, unknown>): Promise<any> {
    const data = await apiFetch<{ estimate: any } | any>(`/api/estimates/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ estimate }),
    });
    return unwrapOne<any>(data, "estimate");
  },
  async deleteEstimate(id: string): Promise<void> {
    await apiFetch(`/api/estimates/${id}`, { method: "DELETE" });
  },

  // Invoices
  async listInvoices(): Promise<any[]> {
    const data = await apiFetch<{ invoices: any[] } | any[]>("/api/invoices");
    return unwrapList<any>(data, "invoices");
  },
  async getInvoice(id: string): Promise<any> {
    const data = await apiFetch<{ invoice: any } | any>(`/api/invoices/${id}`);
    return unwrapOne<any>(data, "invoice");
  },
  async createInvoice(invoice: Record<string, unknown>): Promise<any> {
    const data = await apiFetch<{ invoice: any } | any>("/api/invoices", {
      method: "POST",
      body: JSON.stringify({ invoice }),
    });
    return unwrapOne<any>(data, "invoice");
  },
  async updateInvoice(id: string, invoice: Record<string, unknown>): Promise<any> {
    const data = await apiFetch<{ invoice: any } | any>(`/api/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ invoice }),
    });
    return unwrapOne<any>(data, "invoice");
  },

  // Projects
  async listProjects(params?: { status?: string }): Promise<any[]> {
    const data = await apiFetch<{ projects: any[] } | any[]>(
      `/api/projects${toQuery(params || {})}`
    );
    return unwrapList<any>(data, "projects");
  },
  async getProject(id: string): Promise<any> {
    const data = await apiFetch<{ project: any } | any>(`/api/projects/${id}`);
    return unwrapOne<any>(data, "project");
  },
  async createProject(project: Record<string, unknown>): Promise<any> {
    const data = await apiFetch<{ project: any } | any>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ project }),
    });
    return unwrapOne<any>(data, "project");
  },
  async updateProject(id: string, project: Record<string, unknown>): Promise<any> {
    const data = await apiFetch<{ project: any } | any>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ project }),
    });
    return unwrapOne<any>(data, "project");
  },

  // Clients
  async listClients(): Promise<any[]> {
    const data = await apiFetch<{ clients: any[] } | any[]>("/api/clients");
    return unwrapList<any>(data, "clients");
  },
  async getClient(id: string): Promise<any> {
    const data = await apiFetch<{ client: any } | any>(`/api/clients/${id}`);
    return unwrapOne<any>(data, "client");
  },
  async createClient(client: Record<string, unknown>): Promise<any> {
    const data = await apiFetch<{ client: any } | any>("/api/clients", {
      method: "POST",
      body: JSON.stringify({ client }),
    });
    return unwrapOne<any>(data, "client");
  },
  async updateClient(id: string, client: Record<string, unknown>): Promise<any> {
    const data = await apiFetch<{ client: any } | any>(`/api/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ client }),
    });
    return unwrapOne<any>(data, "client");
  },
  async deleteClient(id: string): Promise<void> {
    await apiFetch(`/api/clients/${id}`, { method: "DELETE" });
  },

  // Reviews
  async listReviews(forUserId?: string): Promise<any[]> {
    const params = forUserId ? `?for=${forUserId}` : "";
    const data = await apiFetch<{ reviews: any[] } | any[]>(`/api/reviews${params}`);
    return unwrapList<any>(data, "reviews");
  },
  async getReview(id: string): Promise<any> {
    const data = await apiFetch<{ review: any } | any>(`/api/reviews/${id}`);
    return unwrapOne<any>(data, "review");
  },

  // Notifications
  async listNotifications(): Promise<any[]> {
    const data = await apiFetch<{ notifications: any[] } | any[]>("/api/notifications");
    return unwrapList<any>(data, "notifications");
  },
  async markNotificationRead(id: string): Promise<any> {
    return apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
  },
  async markAllNotificationsRead(): Promise<any> {
    return apiFetch("/api/notifications/read-all", { method: "POST" });
  },

  // AI Estimation
  async getAIEstimate(description: string): Promise<{ estimate: any; raw: string | null }> {
    return apiFetch("/api/ai/estimate", {
      method: "POST",
      body: JSON.stringify({ description }),
    });
  },
  async getFairPrice(params: { category: string; zip: string; size: string }): Promise<any> {
    return apiFetch(`/api/ai/fair-price${toQuery(params)}`, {
      headers: { "X-Allow-401": "1" },
    });
  },
  async getAIStats(): Promise<any> {
    return apiFetch("/api/ai/stats", {
      headers: { "X-Allow-401": "1" },
    });
  },
  async getFairScope(attrs: {
    category: string;
    title?: string;
    areas?: string[];
    materials?: string[];
  }): Promise<any> {
    return apiFetch("/api/ai/fair-scope", {
      method: "POST",
      body: JSON.stringify(attrs),
    });
  },

  // File Uploads
  async uploadFile(file: File, entityType: string, entityId: string): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entity_type", entityType);
    formData.append("entity_id", entityId);

    const headers: Record<string, string> = {};
    if (_authToken) {
      headers["Authorization"] = `Bearer ${_authToken}`;
    }
    // Don't set Content-Type — browser sets it with boundary for multipart
    const res = await fetch(`${API_BASE}/api/uploads`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  },

  async listUploads(entityType: string, entityId: string): Promise<any[]> {
    const data = await apiFetch<{ uploads: any[] }>(`/api/uploads?entity_type=${entityType}&entity_id=${entityId}`);
    return data.uploads;
  },

  async deleteUpload(id: string): Promise<void> {
    await apiFetch(`/api/uploads/${id}`, { method: "DELETE" });
  },

  // Settings
  async getSettings(): Promise<any> {
    const data = await apiFetch<{ settings: any }>("/api/settings");
    return data.settings;
  },

  async updateSettings(settings: Record<string, any>): Promise<any> {
    const data = await apiFetch<{ settings: any }>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    return data.settings;
  },

  // Reviews (create + respond)
  async createReview(attrs: { rating: number; comment: string; reviewed_id: string; job_id?: string }): Promise<any> {
    const data = await apiFetch<{ review: any }>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(attrs),
    });
    return data.review;
  },

  async respondToReview(reviewId: string, response: string): Promise<any> {
    const data = await apiFetch<{ review: any }>(`/api/reviews/${reviewId}/respond`, {
      method: "POST",
      body: JSON.stringify({ response }),
    });
    return data.review;
  },

  // Sub Jobs
  async listSubJobs(): Promise<any[]> {
    const data = await apiFetch<{ sub_jobs: any[] }>("/api/sub-jobs");
    return data.sub_jobs;
  },

  async getSubJob(id: string): Promise<{ sub_job: any; bids: any[] }> {
    return apiFetch(`/api/sub-jobs/${id}`);
  },

  async postSubJob(subJob: {
    project_id: string;
    milestone_label: string;
    milestone_index: number;
    title: string;
    description: string;
    category: string;
    skills: string[];
    location: string;
    budget_min: number;
    budget_max: number;
    payment_path: string;
    disclosed_to_owner: boolean;
    deadline: string;
  }): Promise<any> {
    const data = await apiFetch<{ sub_job: any }>("/api/sub-jobs", {
      method: "POST",
      body: JSON.stringify(subJob),
    });
    return data.sub_job;
  },

  async placeSubBid(
    subJobId: string,
    bid: { amount: number; message: string; timeline: string }
  ): Promise<any> {
    const data = await apiFetch<{ bid: any }>(`/api/sub-jobs/${subJobId}/bids`, {
      method: "POST",
      body: JSON.stringify(bid),
    });
    return data.bid;
  },

  async getSubContractorStats(): Promise<any> {
    return apiFetch("/api/sub-contractors/stats");
  },

  async updateSubJobStatus(subJobId: string, status: string): Promise<any> {
    const data = await apiFetch<{ sub_job: any }>(`/api/sub-jobs/${subJobId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return data.sub_job;
  },

  // FairRecords
  async listFairRecords(contractorId: string): Promise<{ records: any[]; stats: any }> {
    return apiFetch(`/api/contractors/${contractorId}/records`);
  },

  async getPublicRecord(publicId: string): Promise<any> {
    const data = await apiFetch<{ record: any }>(`/api/records/${publicId}`);
    return data.record;
  },

  async getRecordCertificate(publicId: string): Promise<string> {
    const res = await fetch(`${API_BASE}/api/records/${publicId}/certificate`, {
      headers: _authToken ? { Authorization: `Bearer ${_authToken}` } : {},
    });
    if (!res.ok) throw new Error(`Certificate fetch failed: ${res.status}`);
    return res.text();
  },

  async getProjectRecord(projectId: string): Promise<any> {
    const data = await apiFetch<{ record: any }>(`/api/projects/${projectId}/record`);
    return data.record;
  },

  async confirmFairRecord(recordId: string): Promise<any> {
    const data = await apiFetch<{ record: any }>(`/api/records/${recordId}/confirm`, {
      method: "POST",
    });
    return data.record;
  },

  // Verification
  async getVerificationStatus(): Promise<any> {
    return apiFetch("/api/contractor/verification");
  },

  async submitVerificationStep(step: string, data: Record<string, unknown>): Promise<any> {
    return apiFetch(`/api/contractor/verification/${step}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Sub-jobs
  async listSubJobs(params?: { status?: string; limit?: number }): Promise<RealtimeSubJob[]> {
    const data = await apiFetch<{ sub_jobs: RealtimeSubJob[] } | RealtimeSubJob[]>(
      `/api/sub-jobs${toQuery(params || {})}`,
      { headers: { "X-Allow-401": "1" } }
    );
    return unwrapList<RealtimeSubJob>(data, "sub_jobs");
  },
  async getSubJob(id: string): Promise<{ subJob: RealtimeSubJob; bids: RealtimeSubBid[] }> {
    const data = await apiFetch<any>(`/api/sub-jobs/${id}`, {
      headers: { "X-Allow-401": "1" },
    });
    return {
      subJob: (data.sub_job || data.subJob || data) as RealtimeSubJob,
      bids: (data.bids || []) as RealtimeSubBid[],
    };
  },
  async createSubJob(payload: Record<string, unknown>): Promise<RealtimeSubJob> {
    const data = await apiFetch<{ sub_job: RealtimeSubJob } | RealtimeSubJob>("/api/sub-jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return unwrapOne<RealtimeSubJob>(data, "sub_job");
  },
  async placeSubBid(subJobId: string, bid: { amount: number; message?: string; timeline?: string }): Promise<RealtimeSubBid> {
    const data = await apiFetch<{ bid: RealtimeSubBid } | RealtimeSubBid>(`/api/sub-jobs/${subJobId}/bids`, {
      method: "POST",
      body: JSON.stringify(bid),
    });
    return unwrapOne<RealtimeSubBid>(data, "bid");
  },
  async acceptSubBid(subJobId: string, bidId: string): Promise<RealtimeSubBid> {
    const data = await apiFetch<{ bid: RealtimeSubBid } | RealtimeSubBid>(
      `/api/sub-jobs/${subJobId}/bids/${bidId}/accept`,
      { method: "POST" }
    );
    return unwrapOne<RealtimeSubBid>(data, "bid");
  },
  async listMySubJobPosts(): Promise<RealtimeSubJob[]> {
    const data = await apiFetch<{ sub_jobs: RealtimeSubJob[] } | RealtimeSubJob[]>("/api/sub-jobs/my-posts");
    return unwrapList<RealtimeSubJob>(data, "sub_jobs");
  },

  async registerPushToken(token: string, platform: string): Promise<any> {
    return apiFetch("/api/push/register", {
      method: "POST",
      body: JSON.stringify({ token, platform }),
    });
  },
  async unregisterPushToken(token: string): Promise<any> {
    return apiFetch("/api/push/unregister", {
      method: "DELETE",
      body: JSON.stringify({ token }),
    });
  },
};

// --- WebSocket Client (STOMP over SockJS) ---

interface StompEvent {
  event: string;
  data: any;
}

class RealtimeClient {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private _connected = false;

  /**
   * Connect to the Spring Boot WebSocket via STOMP/SockJS.
   * The token is verified server-side on CONNECT — no anonymous connections allowed.
   */
  connect(token?: string) {
    if (this._connected) return;

    const authToken = token || _authToken;
    if (!authToken) {
      console.warn("[FTW Realtime] No auth token — cannot connect. Call api.login() first.");
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as any,
      connectHeaders: { token: authToken },
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this._connected = true;
      },
      onDisconnect: () => {
        this._connected = false;
      },
      onStompError: (frame) => {
        this._connected = false;
        console.error("[FTW Realtime] STOMP error:", frame.headers?.message);
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
    this._connected = false;
  }

  get isConnected() {
    return this._connected;
  }

  private subscribe(topic: string, callback: (event: StompEvent) => void): () => void {
    if (!this.client) this.connect();
    if (!this.client) return () => {};

    const doSubscribe = () => {
      const sub = this.client!.subscribe(topic, (msg: IMessage) => {
        try {
          const parsed = JSON.parse(msg.body) as StompEvent;
          callback(parsed);
        } catch {
          // If the message isn't a StompEvent envelope, wrap it
          callback({ event: "message", data: JSON.parse(msg.body) });
        }
      });
      this.subscriptions.set(topic, sub);
    };

    if (this._connected) {
      doSubscribe();
    } else {
      // Wait for connection
      const interval = setInterval(() => {
        if (this._connected) {
          clearInterval(interval);
          doSubscribe();
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 10000);
    }

    return () => {
      this.subscriptions.get(topic)?.unsubscribe();
      this.subscriptions.delete(topic);
    };
  }

  // Subscribe to the live job feed
  joinJobFeed(callbacks: {
    onJobsList?: (jobs: RealtimeJob[]) => void;
    onJobPosted?: JobCallback;
    onJobUpdated?: JobCallback;
  }): () => void {
    return this.subscribe("/topic/jobs.feed", (msg) => {
      switch (msg.event) {
        case "jobs:list":
          callbacks.onJobsList?.(msg.data.jobs);
          break;
        case "job:posted":
          callbacks.onJobPosted?.(msg.data);
          break;
        case "job:updated":
          callbacks.onJobUpdated?.(msg.data);
          break;
      }
    });
  }

  // Subscribe to bids on a specific job
  joinJob(
    jobId: string,
    callbacks: {
      onJobDetails?: (data: { job: RealtimeJob; bids: RealtimeBid[] }) => void;
      onBidPlaced?: BidCallback;
      onBidAccepted?: BidCallback;
    }
  ): () => void {
    return this.subscribe(`/topic/job.${jobId}`, (msg) => {
      switch (msg.event) {
        case "job:details":
          callbacks.onJobDetails?.(msg.data);
          break;
        case "bid:placed":
          callbacks.onBidPlaced?.(msg.data);
          break;
        case "bid:accepted":
          callbacks.onBidAccepted?.(msg.data);
          break;
      }
    });
  }

  // Subscribe to a chat conversation
  joinChat(
    conversationId: string,
    callbacks: {
      onMessagesList?: (messages: RealtimeMessage[]) => void;
      onNewMessage?: MessageCallback;
      onPresence?: (presences: Record<string, unknown>) => void;
    }
  ): () => void {
    return this.subscribe(`/topic/chat.${conversationId}`, (msg) => {
      switch (msg.event) {
        case "messages:list":
          callbacks.onMessagesList?.(msg.data.messages);
          break;
        case "message:new":
          callbacks.onNewMessage?.(msg.data);
          break;
        case "typing":
          callbacks.onPresence?.(msg.data);
          break;
        case "presence_state":
        case "presence_diff":
          callbacks.onPresence?.(msg.data);
          break;
      }
    });
  }

  // Subscribe to user notifications
  joinNotifications(
    userId: string,
    callbacks: {
      onNotification?: (payload: Record<string, unknown>) => void;
      onPresence?: (presences: Record<string, unknown>) => void;
    }
  ): () => void {
    return this.subscribe(`/topic/user.${userId}`, (msg) => {
      switch (msg.event) {
        case "notification":
          callbacks.onNotification?.(msg.data);
          break;
        case "presence_state":
          callbacks.onPresence?.(msg.data);
          break;
      }
    });
  }

  // Subscribe to live sub-job feed
  joinSubJobFeed(callbacks: {
    onSubJobsList?: (jobs: RealtimeSubJob[]) => void;
    onSubJobPosted?: SubJobCallback;
    onSubJobUpdated?: SubJobCallback;
  }): () => void {
    return this.subscribe("/topic/sub-jobs.feed", (msg) => {
      switch (msg.event) {
        case "sub-jobs:list":
          callbacks.onSubJobsList?.(msg.data.sub_jobs || msg.data.jobs || []);
          break;
        case "sub-job:posted":
          callbacks.onSubJobPosted?.(msg.data);
          break;
        case "sub-job:updated":
          callbacks.onSubJobUpdated?.(msg.data);
          break;
      }
    });
  }

  joinSubJob(
    subJobId: string,
    callbacks: {
      onSubJobDetails?: (data: { sub_job: RealtimeSubJob; bids: RealtimeSubBid[] }) => void;
      onSubBidPlaced?: SubBidCallback;
      onSubBidAccepted?: SubBidCallback;
    }
  ): () => void {
    return this.subscribe(`/topic/sub-job.${subJobId}`, (msg) => {
      switch (msg.event) {
        case "sub-job:details":
          callbacks.onSubJobDetails?.(msg.data);
          break;
        case "sub-bid:placed":
          callbacks.onSubBidPlaced?.(msg.data);
          break;
        case "sub-bid:accepted":
          callbacks.onSubBidAccepted?.(msg.data);
          break;
      }
    });
  }

  // Send a message through the chat channel
  sendViaChannel(conversationId: string, attrs: { body: string }) {
    this.client?.publish({
      destination: `/app/chat.${conversationId}.send`,
      body: JSON.stringify(attrs),
    });
  }

  // Send typing indicator
  sendTyping(conversationId: string, typing: boolean) {
    this.client?.publish({
      destination: `/app/chat.${conversationId}.typing`,
      body: JSON.stringify({ typing }),
    });
  }

  // Place a bid through the WebSocket
  placeBidViaChannel(
    jobId: string,
    attrs: { amount: number; message: string; timeline: string }
  ) {
    this.client?.publish({
      destination: `/app/job.${jobId}.bid`,
      body: JSON.stringify(attrs),
    });
  }

  acceptBidViaChannel(jobId: string, bidId: string) {
    this.client?.publish({
      destination: `/app/job.${jobId}.accept`,
      body: JSON.stringify({ bid_id: bidId }),
    });
  }

  // Post a job through the feed channel
  postJobViaChannel(attrs: {
    title: string;
    description: string;
    category: string;
    budget_min: number;
    budget_max: number;
    location: string;
  }) {
    this.client?.publish({
      destination: "/app/jobs.feed.post",
      body: JSON.stringify(attrs),
    });
  }

  postSubJobViaChannel(attrs: Record<string, unknown>) {
    this.client?.publish({
      destination: "/app/sub-jobs.feed.post",
      body: JSON.stringify(attrs),
    });
  }

  placeSubBidViaChannel(subJobId: string, attrs: { amount: number; message?: string; timeline?: string }) {
    this.client?.publish({
      destination: `/app/sub-job.${subJobId}.bid`,
      body: JSON.stringify(attrs),
    });
  }
}

export const realtimeClient = new RealtimeClient();
