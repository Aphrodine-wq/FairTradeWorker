"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
      // Use the ftw-svc REST feed until the user has an auth token for websockets
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
 * Typing indicators come through the STOMP presence channel.
 */
export function useRealtimeChat(conversationId: string | null) {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

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
        // Clear typing indicator for this sender
        const senderName = typeof msg.sender === "string" ? msg.sender : msg.sender?.name;
        if (senderName) {
          setTypingUsers((prev) => prev.filter((u) => u !== senderName));
        }
      },
      onPresence: (data: any) => {
        if (data?.typing !== undefined && data?.user) {
          const userName = data.user.name || data.user;
          if (data.typing) {
            setTypingUsers((prev) => prev.includes(userName) ? prev : [...prev, userName]);
            // Auto-clear after 4s
            const existing = typingTimeoutRef.current.get(userName);
            if (existing) clearTimeout(existing);
            typingTimeoutRef.current.set(
              userName,
              setTimeout(() => {
                setTypingUsers((prev) => prev.filter((u) => u !== userName));
                typingTimeoutRef.current.delete(userName);
              }, 4000)
            );
          } else {
            setTypingUsers((prev) => prev.filter((u) => u !== userName));
          }
        }
      },
    });

    return () => {
      leave();
      typingTimeoutRef.current.forEach((t) => clearTimeout(t));
      typingTimeoutRef.current.clear();
      setTypingUsers([]);
    };
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

  return { messages, loading, sendMessage, sendTyping, typingUsers };
}

/**
 * Real-time notifications — subscribes to user notification channel.
 * Also fetches initial notification list via REST.
 */
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial list via REST
    api.listNotifications()
      .then((notifs) => {
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.read).length);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Subscribe to real-time notifications if authenticated
    const token = getAuthToken();
    if (!token) return;

    realtimeClient.connect();

    // Decode user ID from JWT for subscription
    let userId = "me";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub || payload.id || "me";
    } catch {
      // Use "me" as fallback
    }

    const leave = realtimeClient.joinNotifications(userId, {
      onNotification: (payload: any) => {
        setNotifications((prev) => [payload, ...prev]);
        if (!payload.read) {
          setUnreadCount((prev) => prev + 1);
        }
      },
    });

    return leave;
  }, []);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    api.markNotificationRead(id).catch(() => {});
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    api.markAllNotificationsRead().catch(() => {});
  }, []);

  return { notifications, loading, unreadCount, markRead, markAllRead };
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
