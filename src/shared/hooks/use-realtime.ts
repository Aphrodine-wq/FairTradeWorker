"use client";

import { useState, useEffect, useCallback } from "react";
import {
  realtimeClient,
  api,
  type RealtimeJob,
  type RealtimeBid,
  type RealtimeMessage,
} from "@shared/lib/realtime";

/**
 * Live job feed — jobs appear/update in real-time via WebSocket.
 */
export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<RealtimeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    realtimeClient.connect();

    const leave = realtimeClient.joinJobFeed({
      onJobsList: (list) => {
        setJobs(list);
        setLoading(false);
        setConnected(true);
      },
      onJobPosted: (job) => {
        setJobs((prev) => [job, ...prev]);
      },
      onJobUpdated: (updated) => {
        setJobs((prev) =>
          prev.map((j) => (j.id === updated.id ? updated : j))
        );
      },
    });

    return leave;
  }, []);

  const postJob = useCallback(
    async (attrs: {
      title: string;
      description: string;
      category: string;
      budget_min: number;
      budget_max: number;
      location: string;
      homeowner: string;
    }) => {
      return api.postJob(attrs);
    },
    []
  );

  return { jobs, loading, connected, postJob };
}

/**
 * Live bids on a specific job — bids appear in real-time.
 */
export function useRealtimeBids(jobId: string | null) {
  const [job, setJob] = useState<RealtimeJob | null>(null);
  const [bids, setBids] = useState<RealtimeBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    realtimeClient.connect();

    const leave = realtimeClient.joinJob(jobId, {
      onJobDetails: (data) => {
        setJob(data.job);
        setBids(data.bids);
        setLoading(false);
      },
      onBidPlaced: (bid) => {
        setBids((prev) => [...prev, bid]);
      },
      onBidAccepted: (accepted) => {
        setBids((prev) =>
          prev.map((b) => {
            if (b.id === accepted.id) return { ...b, status: "accepted" as const };
            return { ...b, status: "rejected" as const };
          })
        );
      },
    });

    return leave;
  }, [jobId]);

  const placeBid = useCallback(
    async (attrs: {
      contractor: string;
      amount: number;
      message: string;
      timeline: string;
    }) => {
      if (!jobId) return;
      return api.placeBid(jobId, attrs);
    },
    [jobId]
  );

  const acceptBid = useCallback(
    async (bidId: string) => {
      if (!jobId) return;
      return api.acceptBid(jobId, bidId);
    },
    [jobId]
  );

  return { job, bids, loading, placeBid, acceptBid };
}

/**
 * Live chat — messages appear in real-time via WebSocket.
 */
export function useRealtimeChat(conversationId: string | null) {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    realtimeClient.connect();

    const leave = realtimeClient.joinChat(conversationId, {
      onMessagesList: (list) => {
        setMessages(list);
        setLoading(false);
      },
      onNewMessage: (msg) => {
        setMessages((prev) => [...prev, msg]);
      },
    });

    return leave;
  }, [conversationId]);

  const sendMessage = useCallback(
    async (attrs: { sender: string; body: string }) => {
      if (!conversationId) return;
      return api.sendMessage(conversationId, attrs);
    },
    [conversationId]
  );

  return { messages, loading, sendMessage };
}
