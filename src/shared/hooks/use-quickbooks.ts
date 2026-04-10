"use client";

import { useState, useEffect, useCallback } from "react";
import { authStore } from "@shared/lib/auth-store";

// ── Types ────────────────────────────────────────────────────────

export interface QBConnectionStatus {
  connected: boolean;
  companyName?: string;
  connectedAt?: string;
}

export interface InvoiceStatus {
  id: string;
  bidId: string;
  qbInvoiceId: string | null;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface PayoutStatus {
  id: string;
  bidId: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  feePercent: number;
  status: string;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface ReceiptData {
  receiptId: string;
  receiptNumber: string;
  grossAmount: number;
  platformFee: number;
  totalCharged: number;
  jobTitle: string;
  contractorName: string;
  homeownerName: string;
  lineItems: { description: string; quantity: number; unitPrice: number; amount: number }[];
  paidAt: string;
  createdAt: string;
}

export interface CreateInvoiceParams {
  bidId: string;
  dueDate: string;
  customerName: string;
  customerEmail?: string;
  milestone?: string;
  description?: string;
}

export interface SyncEstimateParams {
  customerName: string;
  customerEmail?: string;
  lineItems: { description: string; quantity: number; unitPrice: number }[];
  expirationDate?: string;
  title?: string;
}

// ── Helpers ──────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = authStore.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── useQuickBooks ────────────────────────────────────────────────

/**
 * Manages QuickBooks connection state for contractors.
 * Handles connect, disconnect, and status polling.
 */
export function useQuickBooks() {
  const [status, setStatus] = useState<QBConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quickbooks/status", {
        headers: authHeaders(),
      });
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/quickbooks/connect", {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate connection");
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setDisconnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/quickbooks/disconnect", {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to disconnect");
      }
      setStatus({ connected: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setDisconnecting(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, loading, connecting, disconnecting, error, connect, disconnect, refresh };
}

// ── useInvoice ──────────────────────────────────────────────────

/**
 * Create and manage QB invoices for bids.
 */
export function useInvoice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvoice = useCallback(async (params: CreateInvoiceParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quickbooks/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invoice creation failed");
      return data as {
        created: boolean;
        qbInvoiceId: string;
        qbDocNumber: string;
        invoiceLink: string;
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncEstimate = useCallback(async (params: SyncEstimateParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quickbooks/sync-estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Estimate sync failed");
      return data as { synced: boolean; qbEstimateId: string; qbDocNumber: string };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createInvoice, syncEstimate, loading, error };
}

// ── usePayout ───────────────────────────────────────────────────

/**
 * Track and trigger contractor payouts.
 */
export function usePayout(bidId: string | null) {
  const [payout, setPayout] = useState<PayoutStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!bidId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quickbooks/payout?bidId=${bidId}`, {
        headers: authHeaders(),
      });
      if (res.status === 404) {
        setPayout(null);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch payout");
      setPayout(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [bidId]);

  const triggerPayout = useCallback(async () => {
    if (!bidId) return null;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quickbooks/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ bidId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payout failed");
      await refresh();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [bidId, refresh]);

  useEffect(() => {
    if (bidId) refresh();
  }, [bidId, refresh]);

  return { payout, loading, error, refresh, triggerPayout };
}

// ── useReceipt ──────────────────────────────────────────────────

/**
 * Fetch or generate a payment receipt for a bid.
 */
export function useReceipt(bidId: string | null) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!bidId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quickbooks/receipt?bidId=${bidId}`, {
        headers: authHeaders(),
      });
      if (res.status === 404) {
        setReceipt(null);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch receipt");
      setReceipt(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [bidId]);

  const generate = useCallback(async () => {
    if (!bidId) return null;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quickbooks/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ bidId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Receipt generation failed");
      setReceipt(data);
      return data as ReceiptData;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [bidId]);

  useEffect(() => {
    if (bidId) refresh();
  }, [bidId, refresh]);

  return { receipt, loading, error, refresh, generate };
}
