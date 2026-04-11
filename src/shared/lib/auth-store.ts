/**
 * Auth store — uses ftw-svc for all auth operations and mirrors the JWT into
 * a browser cookie so Next middleware can enforce protected routes.
 */
import { api, setAuthToken } from "./realtime";

export type UserRoleClient = "homeowner" | "contractor" | "subcontractor";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRoleClient;
  roles: UserRoleClient[];
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

/** Normalize backend role names (e.g. "sub_contractor" -> "subcontractor") */
function normalizeRole(role: string): UserRoleClient {
  return role.toLowerCase().replace(/_/g, "") as UserRoleClient;
}

const STORAGE_KEY = "ftw-auth";
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const AUTH_COOKIE_KEY = "ftw-token";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours, aligned with the current JWT lifetime

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

function syncTokenCookie(token: string | null) {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const cookieValue = token ? encodeURIComponent(token) : "";
  const maxAge = token ? AUTH_COOKIE_MAX_AGE : 0;

  document.cookie =
    `${AUTH_COOKIE_KEY}=${cookieValue}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/** Decode JWT payload (no verification — just reads claims) */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/** Check if JWT is expired or expiring within 60 seconds */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 < Date.now() + 60_000;
}

function toAuthUser(rawUser: Record<string, unknown>, fallbackRoles?: UserRoleClient[]): AuthUser {
  const role = normalizeRole(String(rawUser.role));
  const rawRoles = rawUser.roles as string[] | undefined;

  return {
    id: String(rawUser.id),
    email: String(rawUser.email),
    name: String(rawUser.name),
    role,
    roles: rawRoles ? rawRoles.map((r) => normalizeRole(r)) : fallbackRoles || [role],
  };
}

let _state = load();
const _listeners = new Set<() => void>();
let _sessionCheckTimer: ReturnType<typeof setInterval> | null = null;

if (_state.token) {
  setAuthToken(_state.token);
}

function notify() {
  _listeners.forEach((fn) => fn());
}

function startSessionCheck() {
  stopSessionCheck();
  _sessionCheckTimer = setInterval(() => {
    authStore.checkSession();
  }, SESSION_CHECK_INTERVAL);

  // Also check on tab focus
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        authStore.checkSession();
      }
    });
  }
}

function stopSessionCheck() {
  if (_sessionCheckTimer) {
    clearInterval(_sessionCheckTimer);
    _sessionCheckTimer = null;
  }
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
    syncTokenCookie(null);

    const result = await api.login(email, password);
    const user = toAuthUser(result.user as Record<string, unknown>);
    _state = { token: result.token, user };
    save(_state);
    setAuthToken(result.token);
    syncTokenCookie(result.token);
    startSessionCheck();
    notify();
    return user;
  },

  async register(attrs: {
    email: string;
    password: string;
    name: string;
    role: UserRoleClient;
    phone?: string;
  }): Promise<AuthUser> {
    await api.register({
      email: attrs.email,
      password: attrs.password,
      name: attrs.name,
      role: attrs.role as "homeowner" | "contractor" | "subcontractor",
      location: undefined,
    });

    const loginResult = await api.login(attrs.email, attrs.password);
    const user = toAuthUser(loginResult.user as Record<string, unknown>);
    _state = { token: loginResult.token, user };
    save(_state);
    setAuthToken(loginResult.token);
    syncTokenCookie(loginResult.token);
    startSessionCheck();
    notify();
    return user;
  },

  async switchRole(targetRole: UserRoleClient): Promise<AuthUser> {
    if (!_state.user || !_state.user.roles.includes(targetRole)) {
      throw new Error(`Cannot switch to role: ${targetRole}`);
    }

    const result = await api.switchRole(targetRole);
    const user = toAuthUser(result.user as Record<string, unknown>, _state.user.roles);
    _state = { token: result.token, user };
    save(_state);
    setAuthToken(result.token);
    syncTokenCookie(result.token);
    notify();
    return user;
  },

  logout() {
    _state = { token: null, user: null };
    save(_state);
    setAuthToken(null);
    stopSessionCheck();
    syncTokenCookie(null);
    notify();
  },

  /** Check if current session is still valid */
  checkSession() {
    if (!_state.token) return;
    if (isTokenExpired(_state.token)) {
      this.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login?expired=true";
      }
      return;
    }
    api.me()
      .then((result) => {
        _state = {
          ..._state,
          user: toAuthUser(result.user as Record<string, unknown>, _state.user?.roles),
        };
        save(_state);
        notify();
      })
      .catch(() => {
        // Non-fatal: keep local auth state until token expires.
      });
  },
};

// Start session monitoring if already authenticated
if (_state.token) {
  startSessionCheck();
}
