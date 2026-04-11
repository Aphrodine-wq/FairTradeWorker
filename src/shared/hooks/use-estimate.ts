"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@shared/lib/realtime";
import { generateJobEstimate, getEstimatePdf } from "@shared/lib/ftw-svc-gaps";

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
  description?: string;
  total?: number | null;
  status?: string | null;
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

const META_PREFIX = "FTW_META_V1:";

interface EstimateMetadata {
  projectType?: string;
  location?: string;
  sqft?: number | null;
  quality?: string | null;
  clientName?: string;
  propertyType?: string;
  yearBuilt?: number;
  pdfUrl?: string | null;
  aiEstimate?: AiEstimate | null;
}

interface RawEstimateRecord extends Record<string, unknown> {
  id?: string;
  title?: string;
  description?: string;
  total?: number;
  notes?: string | null;
  status?: string | null;
  line_items?: unknown[];
  lineItems?: unknown[];
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  client_id?: string | null;
  clientId?: string | null;
  job_id?: string | null;
  jobId?: string | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseStoredNotes(notes: string | null | undefined): {
  meta: EstimateMetadata;
  noteText: string | null;
} {
  if (!notes) {
    return { meta: {}, noteText: null };
  }

  const [firstLine, ...rest] = notes.split("\n");
  if (!firstLine.startsWith(META_PREFIX)) {
    return { meta: {}, noteText: notes };
  }

  try {
    const meta = JSON.parse(firstLine.slice(META_PREFIX.length)) as EstimateMetadata;
    const noteText = rest.join("\n").trim();
    return {
      meta,
      noteText: noteText || null,
    };
  } catch {
    return { meta: {}, noteText: notes };
  }
}

function buildStoredNotes(meta: EstimateMetadata, noteText?: string | null): string {
  const serialized = `${META_PREFIX}${JSON.stringify(meta)}`;
  const trimmedNotes = noteText?.trim();
  return trimmedNotes ? `${serialized}\n\n${trimmedNotes}` : serialized;
}

function normalizeLineItems(value: unknown): LineItem[] | null {
  if (!Array.isArray(value)) return null;

  const items = value.reduce<LineItem[]>((acc, item) => {
      const record = asRecord(item);
      if (!record) return acc;
      acc.push({
        description: asString(record.description, asString(record.item, "Line item")),
        quantity: asNumber(record.quantity, 1),
        unit: asString(record.unit, "ea"),
        unit_cost: asNumber(record.unit_cost ?? record.unit_price, 0),
        total: asNumber(record.total, 0),
        division: asString(record.division ?? record.category) || undefined,
      });
      return acc;
    }, []);

  return items.length > 0 ? items : null;
}

function normalizeAiEstimate(value: unknown): AiEstimate | null {
  const record = asRecord(value);
  if (!record) return null;

  const lineItems = normalizeLineItems(record.line_items ?? record.lineItems);
  const estimateMin = asNumber(record.estimate_min ?? record.estimateMin ?? record.total_min ?? record.total, 0);
  const estimateMax = asNumber(record.estimate_max ?? record.estimateMax ?? record.total_max ?? record.total, estimateMin);
  const estimateMid = asNumber(
    record.estimate_mid ??
      record.estimateMid ??
      record.total ??
      (estimateMin && estimateMax ? (estimateMin + estimateMax) / 2 : estimateMin),
    estimateMin
  );

  return {
    id: asString(record.id, ""),
    jobId: asString(record.job_id ?? record.jobId, ""),
    estimateNumber: asString(record.estimate_number ?? record.estimateNumber, ""),
    estimateMin,
    estimateMax,
    estimateMid,
    confidence: asNumber(record.confidence, 0),
    breakdown: Array.isArray(record.breakdown) ? (record.breakdown as BreakdownItem[]) : null,
    lineItems,
    materials: Array.isArray(record.materials) ? (record.materials as MaterialItem[]) : null,
    laborHours: asNullableNumber(record.labor_hours ?? record.laborHours),
    laborCost: asNullableNumber(record.labor_cost ?? record.laborCost),
    materialCost: asNullableNumber(record.material_cost ?? record.materialCost),
    equipmentCost: asNullableNumber(record.equipment_cost ?? record.equipmentCost),
    subtotal: asNullableNumber(record.subtotal),
    overheadPercent: asNullableNumber(record.overhead_percent ?? record.overheadPercent),
    profitPercent: asNullableNumber(record.profit_percent ?? record.profitPercent),
    contingencyPct: asNullableNumber(record.contingency_pct ?? record.contingencyPct),
    total: asNullableNumber(record.total ?? record.estimate_total),
    exclusions: asStringArray(record.exclusions),
    notes: asStringArray(record.notes),
    timelineWeeks: asNullableNumber(record.timeline_weeks ?? record.timelineWeeks),
    pdfUrl: typeof record.pdf_url === "string" ? record.pdf_url : asString(record.pdfUrl, "") || null,
    modelVersion: asString(record.model_version ?? record.modelVersion, "ftw-svc-ai"),
    regionFactor: asNullableNumber(record.region_factor ?? record.regionFactor),
    createdAt: asString(record.created_at ?? record.createdAt, new Date().toISOString()),
    updatedAt: asString(record.updated_at ?? record.updatedAt, new Date().toISOString()),
  };
}

function buildFallbackAiEstimate(rawEstimate: RawEstimateRecord): AiEstimate | null {
  const total = asNullableNumber(rawEstimate.total);
  const lineItems = normalizeLineItems(rawEstimate.line_items ?? rawEstimate.lineItems);

  if (total == null && !lineItems) {
    return null;
  }

  return {
    id: asString(rawEstimate.id, ""),
    jobId: asString(rawEstimate.job_id ?? rawEstimate.jobId, ""),
    estimateNumber: "",
    estimateMin: total ?? 0,
    estimateMax: total ?? 0,
    estimateMid: total ?? 0,
    confidence: 0,
    breakdown: null,
    lineItems,
    materials: null,
    laborHours: null,
    laborCost: null,
    materialCost: null,
    equipmentCost: null,
    subtotal: total,
    overheadPercent: null,
    profitPercent: null,
    contingencyPct: null,
    total,
    exclusions: [],
    notes: [],
    timelineWeeks: null,
    pdfUrl: null,
    modelVersion: "ftw-svc",
    regionFactor: null,
    createdAt: asString(rawEstimate.created_at ?? rawEstimate.createdAt, new Date().toISOString()),
    updatedAt: asString(rawEstimate.updated_at ?? rawEstimate.updatedAt, new Date().toISOString()),
  };
}

function normalizeSavedEstimate(value: unknown): SavedEstimate {
  const record = (asRecord(value) ?? {}) as RawEstimateRecord;
  const parsed = parseStoredNotes(typeof record.notes === "string" ? record.notes : null);
  const aiEstimate = parsed.meta.aiEstimate ?? normalizeAiEstimate(record) ?? buildFallbackAiEstimate(record);

  return {
    id: asString(record.id, ""),
    contractorId: "",
    aiEstimateId: null,
    aiEstimate,
    title: asString(record.title, "Estimate"),
    projectType: parsed.meta.projectType ?? "General Estimate",
    location: parsed.meta.location ?? "",
    sqft: typeof parsed.meta.sqft === "number" ? parsed.meta.sqft : null,
    quality: parsed.meta.quality ?? null,
    estimateData: record,
    pdfUrl: parsed.meta.pdfUrl ?? aiEstimate?.pdfUrl ?? null,
    notes: parsed.noteText,
    description: asString(record.description),
    total: asNullableNumber(record.total),
    status: typeof record.status === "string" ? record.status : null,
    createdAt: asString(record.created_at ?? record.createdAt, new Date().toISOString()),
    updatedAt: asString(record.updated_at ?? record.updatedAt, new Date().toISOString()),
  };
}

function buildEstimateTitle(params: GenerateEstimateParams): string {
  return params.clientName
    ? `${params.clientName} - ${params.projectType}`
    : `${params.projectType} Estimate`;
}

function buildEstimatePayload(params: GenerateEstimateParams, aiEstimate: AiEstimate | null) {
  const lineItems = aiEstimate?.lineItems?.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_cost,
    total: item.total,
    category: item.division,
  }));

  const noteLines = [
    params.clientName ? `Client: ${params.clientName}` : null,
    params.location ? `Location: ${params.location}` : null,
    params.quality ? `Quality: ${params.quality}` : null,
    params.propertyType ? `Property type: ${params.propertyType}` : null,
    typeof params.yearBuilt === "number" ? `Year built: ${params.yearBuilt}` : null,
    typeof params.sqft === "number" ? `Square footage: ${params.sqft}` : null,
  ].filter(Boolean) as string[];

  const meta: EstimateMetadata = {
    projectType: params.projectType,
    location: params.location,
    sqft: params.sqft ?? null,
    quality: params.quality ?? null,
    clientName: params.clientName,
    propertyType: params.propertyType,
    yearBuilt: params.yearBuilt,
    pdfUrl: aiEstimate?.pdfUrl ?? null,
    aiEstimate,
  };

  return {
    title: buildEstimateTitle(params),
    description: params.description,
    total: aiEstimate?.total ?? aiEstimate?.estimateMid ?? 0,
    notes: buildStoredNotes(meta, noteLines.join("\n")),
    line_items: lineItems,
  };
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
        const data = await generateJobEstimate(jobId, force);
        setEstimate(data);
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
      const data = await api.listEstimates();
      setEstimates(data.map(normalizeSavedEstimate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await api.deleteEstimate(id);
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
      const aiResult = await api.getAIEstimate(params.description);
      const aiEstimate = normalizeAiEstimate(aiResult.estimate ?? aiResult);
      const createdEstimate = await api.createEstimate(buildEstimatePayload(params, aiEstimate));
      return normalizeSavedEstimate(createdEstimate);
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

export async function openEstimatePdf(estimate: SavedEstimate) {
  if (estimate.pdfUrl) {
    window.open(estimate.pdfUrl, "_blank");
    return;
  }

  await getEstimatePdf(estimate.id);
}
