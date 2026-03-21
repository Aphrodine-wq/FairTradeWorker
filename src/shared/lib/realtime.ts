/**
 * FTW Realtime Client
 *
 * Connects the Next.js frontend to the Elixir/Phoenix backend
 * via WebSockets (Phoenix Channels) and REST API.
 *
 * Usage:
 *   import { realtimeClient } from "@shared/lib/realtime"
 *   realtimeClient.connect()
 */
import { Socket, Channel } from "phoenix";

const API_BASE = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";
const WS_URL = API_BASE.replace(/^http/, "ws") + "/socket";

// ─── Types matching the Elixir backend ──────────────────────────────────────

export interface RealtimeJob {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  location: string;
  homeowner: string;
  status: "open" | "awarded" | "completed";
  posted_at: string;
  bid_count: number;
}

export interface RealtimeBid {
  id: string;
  job_id: string;
  contractor: string;
  amount: number;
  message: string;
  timeline: string;
  status: "pending" | "accepted" | "rejected";
  placed_at: string;
}

export interface RealtimeMessage {
  id: string;
  conversation_id: string;
  sender: string;
  body: string;
  sent_at: string;
}

// ─── Event callbacks ────────────────────────────────────────────────────────

type JobCallback = (job: RealtimeJob) => void;
type BidCallback = (bid: RealtimeBid) => void;
type MessageCallback = (message: RealtimeMessage) => void;

// ─── REST API ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  async listJobs(): Promise<RealtimeJob[]> {
    const data = await apiFetch<{ jobs: RealtimeJob[] }>("/api/jobs");
    return data.jobs;
  },

  async getJob(id: string): Promise<{ job: RealtimeJob; bids: RealtimeBid[] }> {
    return apiFetch(`/api/jobs/${id}`);
  },

  async postJob(job: {
    title: string;
    description: string;
    category: string;
    budget_min: number;
    budget_max: number;
    location: string;
    homeowner: string;
  }): Promise<RealtimeJob> {
    const data = await apiFetch<{ job: RealtimeJob }>("/api/jobs", {
      method: "POST",
      body: JSON.stringify({ job }),
    });
    return data.job;
  },

  async placeBid(
    jobId: string,
    bid: { contractor: string; amount: number; message: string; timeline: string }
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

  async listMessages(conversationId: string): Promise<RealtimeMessage[]> {
    const data = await apiFetch<{ messages: RealtimeMessage[] }>(
      `/api/chat/${conversationId}`
    );
    return data.messages;
  },

  async sendMessage(
    conversationId: string,
    message: { sender: string; body: string }
  ): Promise<RealtimeMessage> {
    const data = await apiFetch<{ message: RealtimeMessage }>(
      `/api/chat/${conversationId}`,
      { method: "POST", body: JSON.stringify({ message }) }
    );
    return data.message;
  },
};

// ─── WebSocket Client ───────────────────────────────────────────────────────

class RealtimeClient {
  private socket: Socket | null = null;
  private channels: Map<string, Channel> = new Map();
  private userId: string = "anonymous";

  connect(userId?: string) {
    if (this.socket?.isConnected()) return;

    this.userId = userId || "anonymous";
    this.socket = new Socket(WS_URL, {
      params: { user_id: this.userId },
    });
    this.socket.connect();
  }

  disconnect() {
    this.socket?.disconnect();
    this.channels.clear();
  }

  // Subscribe to the live job feed
  joinJobFeed(callbacks: {
    onJobsList?: (jobs: RealtimeJob[]) => void;
    onJobPosted?: JobCallback;
    onJobUpdated?: JobCallback;
  }): () => void {
    if (!this.socket) this.connect();

    const channel = this.socket!.channel("jobs:feed", {});

    channel.on("jobs:list", (payload: { jobs: RealtimeJob[] }) => {
      callbacks.onJobsList?.(payload.jobs);
    });

    channel.on("job:posted", (job: RealtimeJob) => {
      callbacks.onJobPosted?.(job);
    });

    channel.on("job:updated", (job: RealtimeJob) => {
      callbacks.onJobUpdated?.(job);
    });

    channel.join();
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

    const topic = `job:${jobId}`;
    const channel = this.socket!.channel(topic, {});

    channel.on("job:details", (data: { job: RealtimeJob; bids: RealtimeBid[] }) => {
      callbacks.onJobDetails?.(data);
    });

    channel.on("bid:placed", (bid: RealtimeBid) => {
      callbacks.onBidPlaced?.(bid);
    });

    channel.on("bid:accepted", (bid: RealtimeBid) => {
      callbacks.onBidAccepted?.(bid);
    });

    channel.join();
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
    }
  ): () => void {
    if (!this.socket) this.connect();

    const topic = `chat:${conversationId}`;
    const channel = this.socket!.channel(topic, {});

    channel.on("messages:list", (payload: { messages: RealtimeMessage[] }) => {
      callbacks.onMessagesList?.(payload.messages);
    });

    channel.on("message:new", (message: RealtimeMessage) => {
      callbacks.onNewMessage?.(message);
    });

    channel.join();
    this.channels.set(topic, channel);

    return () => {
      channel.leave();
      this.channels.delete(topic);
    };
  }

  // Send a message through a channel (instead of REST)
  sendViaChannel(conversationId: string, attrs: { sender: string; body: string }) {
    const channel = this.channels.get(`chat:${conversationId}`);
    if (channel) {
      channel.push("send_message", attrs);
    }
  }

  // Place a bid through a channel
  placeBidViaChannel(jobId: string, attrs: { contractor: string; amount: number; message: string; timeline: string }) {
    const channel = this.channels.get(`job:${jobId}`);
    if (channel) {
      channel.push("place_bid", attrs);
    }
  }

  // Post a job through the feed channel
  postJobViaChannel(attrs: {
    title: string;
    description: string;
    category: string;
    budget_min: number;
    budget_max: number;
    location: string;
    homeowner: string;
  }) {
    const channel = this.channels.get("jobs:feed");
    if (channel) {
      channel.push("post_job", attrs);
    }
  }
}

export const realtimeClient = new RealtimeClient();
