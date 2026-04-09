"use client";

import { useState, useEffect, useCallback } from "react";
import {
  realtimeClient,
  api,
  getAuthToken,
  type RealtimeJob,
  type RealtimeBid,
  type RealtimeMessage,
  type RealtimeSubJob,
  type RealtimeSubBid,
} from "@shared/lib/realtime";

/**
 * Live job feed — jobs appear/update in real-time via WebSocket.
 * Requires auth token to be set via setAuthToken() or api.login().
 */
export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<RealtimeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      // Fall back to REST if not authenticated
      api.listJobs().then((list) => {
        setJobs(list);
        setLoading(false);
      });
      return;
    }

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

    if (!getAuthToken()) {
      api.getJob(jobId).then((data) => {
        setJob(data.job);
        setBids(data.bids);
        setLoading(false);
      });
      return;
    }

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
    if (!conversationId || !getAuthToken()) return;

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
    async (attrs: { body: string }) => {
      if (!conversationId) return;
      return api.sendMessage(conversationId, attrs);
    },
    [conversationId]
  );

  const sendTyping = useCallback(
    (typing: boolean) => {
      if (!conversationId) return;
      realtimeClient.sendTyping(conversationId, typing);
    },
    [conversationId]
  );

  return { messages, loading, sendMessage, sendTyping };
}

/**
 * Live sub-job feed.
 */
export function useRealtimeSubJobs() {
  const [subJobs, setSubJobs] = useState<RealtimeSubJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    api.listSubJobs({ status: "open", limit: 50 }).then((list) => {
      setSubJobs(list);
      setLoading(false);
    });

    if (!getAuthToken()) return;
    realtimeClient.connect();
    const leave = realtimeClient.joinSubJobFeed({
      onSubJobsList: (list) => {
        setSubJobs(list);
        setConnected(true);
      },
      onSubJobPosted: (job) => setSubJobs((prev) => [job, ...prev]),
      onSubJobUpdated: (updated) =>
        setSubJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j))),
    });
    return leave;
  }, []);

  return { subJobs, loading, connected };
}

/**
 * Live sub-bids on one sub-job.
 */
export function useRealtimeSubJobBids(subJobId: string | null) {
  const [subJob, setSubJob] = useState<RealtimeSubJob | null>(null);
  const [bids, setBids] = useState<RealtimeSubBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subJobId) return;
    api.getSubJob(subJobId).then((data) => {
      setSubJob(data.subJob);
      setBids(data.bids);
      setLoading(false);
    });

    if (!getAuthToken()) return;
    realtimeClient.connect();
    const leave = realtimeClient.joinSubJob(subJobId, {
      onSubJobDetails: (data) => {
        setSubJob(data.sub_job);
        setBids(data.bids || []);
        setLoading(false);
      },
      onSubBidPlaced: (bid) => setBids((prev) => [...prev, bid]),
      onSubBidAccepted: (accepted) =>
        setBids((prev) => prev.map((b) => (b.id === accepted.id ? accepted : b))),
    });
    return leave;
  }, [subJobId]);

  const placeBid = useCallback(
    async (attrs: { amount: number; message?: string; timeline?: string }) => {
      if (!subJobId) return;
      return api.placeSubBid(subJobId, attrs);
    },
    [subJobId]
  );

  const acceptBid = useCallback(
    async (bidId: string) => {
      if (!subJobId) return;
      return api.acceptSubBid(subJobId, bidId);
    },
    [subJobId]
  );

  return { subJob, bids, loading, placeBid, acceptBid };
}
