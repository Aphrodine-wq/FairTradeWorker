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

const API_BASE = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";
const WS_URL = `${API_BASE}/ws`;

// --- Types matching the backend serializers ---

export interface RealtimeUser {
  id: string;
  name: string;
  role: "homeowner" | "contractor";
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

// --- Event callbacks ---

type JobCallback = (job: RealtimeJob) => void;
type BidCallback = (bid: RealtimeBid) => void;
type MessageCallback = (message: RealtimeMessage) => void;

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

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      // Session expired — clear auth and redirect
      setAuthToken(null);
      localStorage.removeItem("ftw-auth");
      window.location.href = "/login?expired=true";
      throw new Error("Session expired");
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
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

  async switchRole(role: string): Promise<AuthResponse> {
    return apiFetch("/api/auth/switch-role", {
      method: "POST",
      body: JSON.stringify({ role: role.toUpperCase() }),
    });
  },

  // Jobs (public — no auth required for listing)
  async listJobs(): Promise<RealtimeJob[]> {
    const data = await apiFetch<{ jobs: RealtimeJob[] }>("/api/jobs");
    return data.jobs;
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
      body: JSON.stringify({ job }),
    });
    return data.job;
  },

  async placeBid(
    jobId: string,
    bid: { amount: number; message: string; timeline: string }
  ): Promise<RealtimeBid> {
    const data = await apiFetch<{ bid: RealtimeBid }>(`/api/jobs/${jobId}/bids`, {
      method: "POST",
      body: JSON.stringify({ bid }),
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

  // Chat (authenticated)
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
      { method: "POST", body: JSON.stringify({ message }) }
    );
    return data.message;
  },

  // Estimates
  async listEstimates(): Promise<any[]> {
    const data = await apiFetch<{ estimates: any[] }>("/api/estimates");
    return data.estimates;
  },
  async getEstimate(id: string): Promise<any> {
    const data = await apiFetch<{ estimate: any }>(`/api/estimates/${id}`);
    return data.estimate;
  },

  // Invoices
  async listInvoices(): Promise<any[]> {
    const data = await apiFetch<{ invoices: any[] }>("/api/invoices");
    return data.invoices;
  },

  // Projects
  async listProjects(): Promise<any[]> {
    const data = await apiFetch<{ projects: any[] }>("/api/projects");
    return data.projects;
  },

  // Clients
  async listClients(): Promise<any[]> {
    const data = await apiFetch<{ clients: any[] }>("/api/clients");
    return data.clients;
  },

  // Reviews
  async listReviews(forUserId?: string): Promise<any[]> {
    const params = forUserId ? `?for=${forUserId}` : "";
    const data = await apiFetch<{ reviews: any[] }>(`/api/reviews${params}`);
    return data.reviews;
  },

  // Notifications
  async listNotifications(): Promise<any[]> {
    const data = await apiFetch<{ notifications: any[] }>("/api/notifications");
    return data.notifications;
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
      body: JSON.stringify({ settings }),
    });
    return data.settings;
  },

  // Reviews (create + respond)
  async createReview(attrs: { rating: number; comment: string; reviewed_id: string; job_id?: string }): Promise<any> {
    const data = await apiFetch<{ review: any }>("/api/reviews", {
      method: "POST",
      body: JSON.stringify({ review: attrs }),
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

  // FairRecords
  async listFairRecords(contractorId: string): Promise<{ records: any[]; stats: any }> {
    return apiFetch(`/api/contractors/${contractorId}/records`);
  },

  async getPublicRecord(publicId: string): Promise<any> {
    const data = await apiFetch<{ record: any }>(`/api/records/${publicId}`);
    return data.record;
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
      body: JSON.stringify({ data }),
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
}

export const realtimeClient = new RealtimeClient();
