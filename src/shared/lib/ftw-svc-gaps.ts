export class FtwSvcGapError extends Error {
  readonly feature: string;
  readonly suggestedEndpoint: string;

  constructor(feature: string, suggestedEndpoint: string, details: string) {
    super(
      `TODO(ftw-svc): ${feature} is not implemented in ftw-svc yet. ` +
        `Add ${suggestedEndpoint}. ${details}`
    );
    this.name = "FtwSvcGapError";
    this.feature = feature;
    this.suggestedEndpoint = suggestedEndpoint;
  }
}

export function isFtwSvcGapError(error: unknown): error is FtwSvcGapError {
  return error instanceof FtwSvcGapError;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface HomeownerPropertyPayload {
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
}

export interface QuickBooksSupportState {
  supported: boolean;
  title: string;
  description: string;
  todo: string;
}

const API_BASE = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4000";

function getAuthTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ftw-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string | null };
    return typeof parsed.token === "string" ? parsed.token : null;
  } catch {
    return null;
  }
}

async function callApi<T>(path: string, options: RequestInit = {}, useAuth = false): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (useAuth) {
    const token = getAuthTokenFromStorage();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  return {} as T;
}

export function getQuickBooksSupportState(): QuickBooksSupportState {
  return {
    supported: true,
    title: "QuickBooks integration is available",
    description:
      "QuickBooks endpoints are now implemented in ftw-svc and can be called directly from the frontend.",
    todo: "Use /api/integrations/quickbooks/* and /api/auth/quickbooks routes from ftw-svc.",
  };
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean }> {
  return callApi<{ ok: boolean }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<{ ok: boolean }> {
  return callApi<{ ok: boolean }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean }> {
  return callApi<{ ok: boolean }>(
    "/api/auth/change-password",
    {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    },
    true
  );
}

export async function submitContactForm(
  payload: ContactPayload
): Promise<{ ok: boolean; contactId?: string; status?: string }> {
  return callApi<{ ok: boolean; contactId?: string; status?: string }>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function saveHomeownerProperty(
  payload: HomeownerPropertyPayload
): Promise<{
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    propertyType: string;
  };
}> {
  return callApi("/api/homeowner/property", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      property_type: payload.propertyType,
    }),
  }, true);
}

export async function generateJobEstimate(
  jobId: string,
  force = false
): Promise<any> {
  const data = await callApi<{ estimate: any }>(`/api/jobs/${jobId}/ai-estimate`, {
    method: "POST",
    body: JSON.stringify({ force }),
  }, true);

  const estimate = data.estimate || {};
  const total = Number(estimate.total || 0);
  const lineItems = Array.isArray(estimate.line_items) ? estimate.line_items : [];
  const breakdown = lineItems.map((item: any) => ({
    division: item.category || undefined,
    item: item.description || "Line item",
    cost: Number(item.total || 0),
  }));

  return {
    id: estimate.id || `ai-${jobId}`,
    jobId: estimate.job_id || jobId,
    estimateNumber: estimate.id || `EST-${jobId}`,
    estimateMin: total,
    estimateMax: total,
    estimateMid: total,
    confidence: 0.75,
    breakdown,
    lineItems: lineItems.map((item: any) => ({
      description: item.description || "Line item",
      quantity: Number(item.quantity || 1),
      unit: item.unit || "lot",
      unit_cost: Number(item.unit_price || 0),
      total: Number(item.total || 0),
      division: item.category || undefined,
    })),
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
    notes: estimate.notes ? [String(estimate.notes)] : [],
    timelineWeeks: null,
    pdfUrl: null,
    modelVersion: "ftw-svc-ai-estimate",
    regionFactor: null,
    createdAt: estimate.created_at || new Date().toISOString(),
    updatedAt: estimate.created_at || new Date().toISOString(),
  };
}

export async function getEstimatePdf(id: string): Promise<void> {
  const token = getAuthTokenFromStorage();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/estimates/${id}/pdf`, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to fetch estimate PDF");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

export async function getQuickBooksStatus(): Promise<any> {
  return callApi("/api/integrations/quickbooks/status", {}, true);
}

export async function startQuickBooksConnect(): Promise<{ authUrl: string; state: string; expiresInSeconds: number }> {
  return callApi("/api/integrations/quickbooks/connect", {}, true);
}

export async function disconnectQuickBooks(): Promise<any> {
  return callApi("/api/integrations/quickbooks/disconnect", { method: "POST" }, true);
}

export async function startQuickBooksSignIn(): Promise<void> {
  const data = await callApi<{ authUrl: string }>("/api/auth/quickbooks");
  if (!data.authUrl) {
    throw new Error("QuickBooks sign-in URL was not provided.");
  }
  window.location.href = data.authUrl;
}
