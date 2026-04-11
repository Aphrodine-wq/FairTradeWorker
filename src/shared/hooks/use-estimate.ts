"use client";

import { useState, useEffect, useCallback } from "react";
import { authStore } from "@shared/lib/auth-store";

// ── Types ────────────────────────────────────────────────────────

interface BreakdownItem {
  division?: string;
  item: string;
  cost: number;
  description?: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total: number;
  division?: string;
}

interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total: number;
}

export interface AiEstimate {
  id: string;
  jobId: string;
  estimateNumber: string;
  estimateMin: number;
  estimateMax: number;
  estimateMid: number;
  confidence: number;
  breakdown: BreakdownItem[] | null;
  lineItems: LineItem[] | null;
  materials: MaterialItem[] | null;
  laborHours: number | null;
  laborCost: number | null;
  materialCost: number | null;
  equipmentCost: number | null;
  subtotal: number | null;
  overheadPercent: number | null;
  profitPercent: number | null;
  contingencyPct: number | null;
  total: number | null;
  exclusions: string[];
  notes: string[];
  timelineWeeks: number | null;
  pdfUrl: string | null;
  modelVersion: string;
  regionFactor: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedEstimate {
  id: string;
  contractorId: string;
  aiEstimateId: string | null;
  aiEstimate: AiEstimate | null;
  title: string;
  projectType: string;
  location: string;
  sqft: number | null;
  quality: string | null;
  estimateData: Record<string, unknown>;
  pdfUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateEstimateParams {
  projectType: string;
  description: string;
  location: string;
  subcategory?: string;
  sqft?: number;
  quality?: string;
  clientName?: string;
  propertyType?: string;
  yearBuilt?: number;
}

// ── Helpers ──────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = authStore.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── useJobEstimate ───────────────────────────────────────────────

export function useJobEstimate(jobId: string | null) {
  const [estimate, setEstimate] = useState<AiEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (force = false) => {
      if (!jobId) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/jobs/${jobId}/estimate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({ force }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to generate estimate");
        setEstimate(data.estimate || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [jobId]
  );

  useEffect(() => {
    if (jobId) generate(false);
  }, [jobId, generate]);

  return { estimate, loading, error, regenerate: () => generate(true) };
}

// ── useBidSuggestion ─────────────────────────────────────────────

export function useBidSuggestion(jobId: string | null) {
  const { estimate, loading, error, regenerate } = useJobEstimate(jobId);

  if (!estimate) return { suggestion: null, loading, error, regenerate };

  const midpoint = estimate.estimateMid || (estimate.estimateMin + estimate.estimateMax) / 2;
  const suggestedBid = Math.round(midpoint * 0.9);
  const range = {
    low: Math.round(estimate.estimateMin * 0.85),
    high: Math.round(estimate.estimateMax * 0.95),
  };

  return {
    suggestion: {
      amount: suggestedBid,
      range,
      confidence: estimate.confidence,
      breakdown: estimate.breakdown,
      lineItems: estimate.lineItems,
      total: estimate.total,
      timelineWeeks: estimate.timelineWeeks,
      reasoning:
        estimate.confidence > 0.7
          ? "High confidence estimate based on similar local projects."
          : "Moderate confidence — review the breakdown before bidding.",
    },
    loading,
    error,
    regenerate,
  };
}

// ── useContractorEstimates ───────────────────────────────────────

export function useContractorEstimates() {
  const [estimates, setEstimates] = useState<SavedEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/estimates", {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch estimates");
      setEstimates(data.estimates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete estimate");
      }
      setEstimates((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { estimates, loading, error, refresh, remove };
}

// ── useGenerateEstimate ──────────────────────────────────────────

export function useGenerateEstimate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (params: GenerateEstimateParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate estimate");
      return data.estimate as SavedEstimate;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error };
}
