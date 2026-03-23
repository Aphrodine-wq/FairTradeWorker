/**
 * FTW Realtime Client
 *
 * Connects the Next.js frontend to the Elixir/Phoenix backend
 * via WebSockets (Phoenix Channels) and REST API.
 *
 * Usage:
 *   import { realtimeClient } from "@shared/lib/realtime"
 *   realtimeClient.connect(jwtToken)
 */
import { Socket, Channel } from "phoenix";

const API_BASE = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";
const WS_URL = API_BASE.replace(/^http/, "ws") + "/socket";

// --- Types matching the Elixir backend serializers ---

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
    role: "homeowner" | "contractor";
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
    role: "homeowner" | "contractor";
    location?: string;
  }): Promise<{ user: AuthResponse["user"] }> {
    return apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(attrs),
    });
  },

  async me(): Promise<{ user: AuthResponse["user"] }> {
    return apiFetch("/api/auth/me");
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
};

// --- WebSocket Client ---

class RealtimeClient {
  private socket: Socket | null = null;
  private channels: Map<string, Channel> = new Map();
  private _connected = false;

  /**
   * Connect to the Phoenix WebSocket with a JWT token.
   * The token is verified server-side — no anonymous connections allowed.
   */
  connect(token?: string) {
    if (this.socket?.isConnected()) return;

    const authToken = token || _authToken;
    if (!authToken) {
      console.warn("[FTW Realtime] No auth token — cannot connect. Call api.login() first.");
      return;
    }

    this.socket = new Socket(WS_URL, {
      params: { token: authToken },
      reconnectAfterMs: (tries: number) => [1000, 2000, 5000, 10000][Math.min(tries - 1, 3)],
    });

    this.socket.onOpen(() => {
      this._connected = true;
    });

    this.socket.onClose(() => {
      this._connected = false;
    });

    this.socket.onError(() => {
      this._connected = false;
    });

    this.socket.connect();
  }

  disconnect() {
    this.channels.forEach((ch) => ch.leave());
    this.channels.clear();
    this.socket?.disconnect();
    this.socket = null;
    this._connected = false;
  }

  get isConnected() {
    return this._connected;
  }

  // Subscribe to the live job feed
  joinJobFeed(callbacks: {
    onJobsList?: (jobs: RealtimeJob[]) => void;
    onJobPosted?: JobCallback;
    onJobUpdated?: JobCallback;
  }): () => void {
    if (!this.socket) this.connect();
    if (!this.socket) return () => {};

    const channel = this.socket.channel("jobs:feed", {});

    channel.on("jobs:list", (payload: { jobs: RealtimeJob[] }) => {
      callbacks.onJobsList?.(payload.jobs);
    });

    channel.on("job:posted", (job: RealtimeJob) => {
      callbacks.onJobPosted?.(job);
    });

    channel.on("job:updated", (job: RealtimeJob) => {
      callbacks.onJobUpdated?.(job);
    });

    channel
      .join()
      .receive("error", (resp) => {
        console.error("[FTW Realtime] Failed to join jobs:feed", resp);
      });

    this.channels.set("jobs:feed", channel);

    return () => {
      channel.leave();
      this.channels.delete("jobs:feed");
    };
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
    if (!this.socket) this.connect();
    if (!this.socket) return () => {};

    const topic = `job:${jobId}`;
    const channel = this.socket.channel(topic, {});

    channel.on("job:details", (data: { job: RealtimeJob; bids: RealtimeBid[] }) => {
      callbacks.onJobDetails?.(data);
    });

    channel.on("bid:placed", (bid: RealtimeBid) => {
      callbacks.onBidPlaced?.(bid);
    });

    channel.on("bid:accepted", (bid: RealtimeBid) => {
      callbacks.onBidAccepted?.(bid);
    });

    channel
      .join()
      .receive("error", (resp) => {
        console.error(`[FTW Realtime] Failed to join ${topic}`, resp);
      });

    this.channels.set(topic, channel);

    return () => {
      channel.leave();
      this.channels.delete(topic);
    };
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
    if (!this.socket) this.connect();
    if (!this.socket) return () => {};

    const topic = `chat:${conversationId}`;
    const channel = this.socket.channel(topic, {});

    channel.on("messages:list", (payload: { messages: RealtimeMessage[] }) => {
      callbacks.onMessagesList?.(payload.messages);
    });

    channel.on("message:new", (message: RealtimeMessage) => {
      callbacks.onNewMessage?.(message);
    });

    channel.on("presence_state", (state) => {
      callbacks.onPresence?.(state);
    });

    channel.on("presence_diff", (diff) => {
      callbacks.onPresence?.(diff);
    });

    channel
      .join()
      .receive("error", (resp) => {
        console.error(`[FTW Realtime] Failed to join ${topic}`, resp);
      });

    this.channels.set(topic, channel);

    return () => {
      channel.leave();
      this.channels.delete(topic);
    };
  }

  // Subscribe to user notifications
  joinNotifications(
    userId: string,
    callbacks: {
      onNotification?: (payload: Record<string, unknown>) => void;
      onPresence?: (presences: Record<string, unknown>) => void;
    }
  ): () => void {
    if (!this.socket) this.connect();
    if (!this.socket) return () => {};

    const topic = `user:${userId}`;
    const channel = this.socket.channel(topic, {});

    channel.on("notification", (payload) => {
      callbacks.onNotification?.(payload);
    });

    channel.on("presence_state", (state) => {
      callbacks.onPresence?.(state);
    });

    channel
      .join()
      .receive("error", (resp) => {
        console.error(`[FTW Realtime] Failed to join ${topic}`, resp);
      });

    this.channels.set(topic, channel);

    return () => {
      channel.leave();
      this.channels.delete(topic);
    };
  }

  // Send a message through the chat channel (server uses socket auth for sender_id)
  sendViaChannel(conversationId: string, attrs: { body: string }) {
    const channel = this.channels.get(`chat:${conversationId}`);
    if (channel) {
      return channel.push("send_message", attrs);
    }
  }

  // Send typing indicator
  sendTyping(conversationId: string, typing: boolean) {
    const channel = this.channels.get(`chat:${conversationId}`);
    if (channel) {
      channel.push("typing", { typing });
    }
  }

  // Place a bid through the bid channel (server uses socket auth for contractor_id)
  placeBidViaChannel(
    jobId: string,
    attrs: { amount: number; message: string; timeline: string }
  ) {
    const channel = this.channels.get(`job:${jobId}`);
    if (channel) {
      return channel.push("place_bid", attrs);
    }
  }

  // Post a job through the feed channel (server uses socket auth for homeowner_id)
  postJobViaChannel(attrs: {
    title: string;
    description: string;
    category: string;
    budget_min: number;
    budget_max: number;
    location: string;
  }) {
    const channel = this.channels.get("jobs:feed");
    if (channel) {
      return channel.push("post_job", attrs);
    }
  }
}

export const realtimeClient = new RealtimeClient();
