"use client";

import { useState, useEffect } from "react";
import { authStore } from "@shared/lib/auth-store";

interface AiEstimate {
  estimateMin: number;
  estimateMax: number;
  confidence: number;
  breakdown: { item: string; cost: number }[] | null;
}

export function useJobEstimate(jobId: string | null) {
  const [estimate, setEstimate] = useState<AiEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const token = authStore.getToken();
    fetch(`/api/jobs/${jobId}/estimate`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setEstimate(data.estimate || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [jobId]);

  return { estimate, loading, error };
}

export function useBidSuggestion(jobId: string | null) {
  const { estimate, loading, error } = useJobEstimate(jobId);

  if (!estimate) return { suggestion: null, loading, error };

  // Suggest bidding at 90% of midpoint for competitive advantage
  const midpoint = (estimate.estimateMin + estimate.estimateMax) / 2;
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
      reasoning: estimate.confidence > 0.7
        ? "High confidence estimate based on similar local projects."
        : "Moderate confidence — review the breakdown before bidding.",
    },
    loading,
    error,
  };
}
