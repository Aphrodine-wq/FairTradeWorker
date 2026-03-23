/**
 * Simple auth store for the web app.
 * Stores JWT + user in localStorage, syncs with the realtime client.
 */
import { api, setAuthToken } from "./realtime";

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

let _state = load();
const _listeners = new Set<() => void>();

// Hydrate the realtime client with the stored token on load
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
    // Clear any pre-existing session before login to prevent session fixation
    _state = { token: null, user: null };
    save(_state);
    setAuthToken(null);

    const { token, user } = await api.login(email, password);
    _state = { token, user };
    save(_state);
    _listeners.forEach((fn) => fn());
    return user;
  },

  async register(attrs: {
    email: string;
    password: string;
    name: string;
    role: "homeowner" | "contractor";
    location?: string;
  }): Promise<void> {
    await api.register(attrs);
    // After registration, log in automatically
    await authStore.login(attrs.email, attrs.password);
  },

  logout() {
    _state = { token: null, user: null };
    save(_state);
    setAuthToken(null);
    _listeners.forEach((fn) => fn());
  },
};
