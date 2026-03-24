/**
 * Auth store — calls Next.js API routes for auth, syncs token with realtime client.
 */
import { setAuthToken } from "./realtime";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "homeowner" | "contractor";
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const STORAGE_KEY = "ftw-auth";

function load(): AuthState {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    return JSON.parse(raw);
  } catch {
    return { token: null, user: null };
  }
}

function save(state: AuthState) {
  if (typeof window === "undefined") return;
  if (state.token) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

async function authFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Auth error: ${res.status}`);
  return data;
}

let _state = load();
const _listeners = new Set<() => void>();

if (_state.token) {
  setAuthToken(_state.token);
}

export const authStore = {
  getState(): AuthState {
    return _state;
  },

  isAuthenticated(): boolean {
    return !!_state.token && !!_state.user;
  },

  getUser(): AuthUser | null {
    return _state.user;
  },

  getToken(): string | null {
    return _state.token;
  },

  subscribe(listener: () => void): () => void {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },

  async login(email: string, password: string): Promise<AuthUser> {
    _state = { token: null, user: null };
    save(_state);
    setAuthToken(null);

    const { token, user } = await authFetch<{ token: string; user: AuthUser }>(
      "/api/auth/login",
      { email, password }
    );
    _state = { token, user };
    save(_state);
    setAuthToken(token);
    _listeners.forEach((fn) => fn());
    return user;
  },

  async register(attrs: {
    email: string;
    password: string;
    name: string;
    role: "homeowner" | "contractor";
    phone?: string;
  }): Promise<AuthUser> {
    const { token, user } = await authFetch<{ token: string; user: AuthUser }>(
      "/api/auth/signup",
      { ...attrs, role: attrs.role.toUpperCase() }
    );
    _state = { token, user };
    save(_state);
    setAuthToken(token);
    _listeners.forEach((fn) => fn());
    return user;
  },

  logout() {
    _state = { token: null, user: null };
    save(_state);
    setAuthToken(null);
    _listeners.forEach((fn) => fn());
  },
};
