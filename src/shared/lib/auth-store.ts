/**
 * Auth store — tries Spring Boot backend first (via realtime.ts),
 * falls back to Next.js API routes. Syncs JWT to httpOnly cookie
 * for middleware route protection.
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

/** Sync JWT to httpOnly cookie so Next.js middleware can read it */
async function syncTokenCookie(token: string) {
  try {
    await fetch("/api/auth/sync-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch {
    // Non-critical — middleware cookie sync failed, but auth still works via localStorage
  }
}

/** Clear the httpOnly cookie on logout */
async function clearTokenCookie() {
  try {
    await fetch("/api/auth/sync-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "" }),
    });
  } catch {
    // Non-critical
  }
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

    try {
      // Try Spring Boot backend first
      const result = await api.login(email, password);
      const apiUser = result.user as Record<string, unknown>;
      const role = normalizeRole(String(apiUser.role));
      const apiRoles = apiUser.roles as string[] | undefined;
      const roles = apiRoles
        ? apiRoles.map((r) => normalizeRole(r))
        : [role];
      const user: AuthUser = {
        id: String(apiUser.id),
        email: String(apiUser.email),
        name: String(apiUser.name),
        role,
        roles,
      };
      _state = { token: result.token, user };
      save(_state);
      setAuthToken(result.token);
      await syncTokenCookie(result.token);
      startSessionCheck();
      notify();
      return user;
    } catch {
      // Fall back to Next.js Prisma route (dev/offline)
      const { token, user: rawUser } = await authFetch<{ token: string; user: Record<string, unknown> }>(
        "/api/auth/login",
        { email, password }
      );
      const rawRole = normalizeRole(String(rawUser.role));
      const rawRoles = rawUser.roles as string[] | undefined;
      const user: AuthUser = {
        id: String(rawUser.id),
        email: String(rawUser.email),
        name: String(rawUser.name),
        role: rawRole,
        roles: rawRoles ? rawRoles.map((r) => normalizeRole(r)) : [rawRole],
      };
      _state = { token, user };
      save(_state);
      setAuthToken(token);
      await syncTokenCookie(token);
      startSessionCheck();
      notify();
      return user;
    }
  },

  async register(attrs: {
    email: string;
    password: string;
    name: string;
    role: UserRoleClient;
    phone?: string;
  }): Promise<AuthUser> {
    try {
      // Try Spring Boot backend first
      const result = await api.register({
        email: attrs.email,
        password: attrs.password,
        name: attrs.name,
        role: attrs.role as "homeowner" | "contractor" | "subcontractor",
        location: undefined,
      });
      // Spring Boot register may not return a token — login after registration
      const loginResult = await api.login(attrs.email, attrs.password);
      const apiUser = loginResult.user as Record<string, unknown>;
      const role = normalizeRole(String(apiUser.role));
      const apiRoles = apiUser.roles as string[] | undefined;
      const roles = apiRoles
        ? apiRoles.map((r) => normalizeRole(r))
        : [role];
      const user: AuthUser = {
        id: String(apiUser.id),
        email: String(apiUser.email),
        name: String(apiUser.name),
        role,
        roles,
      };
      _state = { token: loginResult.token, user };
      save(_state);
      setAuthToken(loginResult.token);
      await syncTokenCookie(loginResult.token);
      startSessionCheck();
      notify();
      return user;
    } catch {
      // Fall back to Next.js Prisma route
      const { token, user: rawUser } = await authFetch<{ token: string; user: Record<string, unknown> }>(
        "/api/auth/signup",
        { ...attrs, role: attrs.role.toUpperCase() }
      );
      const rawRole = normalizeRole(String(rawUser.role));
      const rawRoles = rawUser.roles as string[] | undefined;
      const user: AuthUser = {
        id: String(rawUser.id),
        email: String(rawUser.email),
        name: String(rawUser.name),
        role: rawRole,
        roles: rawRoles ? rawRoles.map((r) => normalizeRole(r)) : [rawRole],
      };
      _state = { token, user };
      save(_state);
      setAuthToken(token);
      await syncTokenCookie(token);
      startSessionCheck();
      notify();
      return user;
    }
  },

  async switchRole(targetRole: UserRoleClient): Promise<AuthUser> {
    if (!_state.user || !_state.user.roles.includes(targetRole)) {
      throw new Error(`Cannot switch to role: ${targetRole}`);
    }
    try {
      // Try Spring Boot backend first
      const result = await api.switchRole(targetRole);
      const apiUser = result.user as Record<string, unknown>;
      const role = normalizeRole(String(apiUser.role));
      const apiRoles = apiUser.roles as string[] | undefined;
      const roles = apiRoles
        ? apiRoles.map((r) => normalizeRole(r))
        : _state.user.roles;
      const user: AuthUser = {
        id: String(apiUser.id),
        email: String(apiUser.email),
        name: String(apiUser.name || _state.user.name),
        role,
        roles,
      };
      _state = { token: result.token, user };
      save(_state);
      setAuthToken(result.token);
      await syncTokenCookie(result.token);
      notify();
      return user;
    } catch {
      try {
        // Fall back to Next.js Prisma route
        const { token, user: rawUser } = await authFetch<{ token: string; user: Record<string, unknown> }>(
          "/api/auth/switch-role",
          { role: targetRole.toUpperCase() }
        );
        const rawRoles = rawUser.roles as string[] | undefined;
        const user: AuthUser = {
          id: String(rawUser.id),
          email: String(rawUser.email),
          name: String(rawUser.name),
          role: normalizeRole(String(rawUser.role)),
          roles: rawRoles ? rawRoles.map((r) => normalizeRole(r)) : _state.user!.roles,
        };
        _state = { token, user };
        save(_state);
        setAuthToken(token);
        await syncTokenCookie(token);
        notify();
        return user;
      } catch {
        // Optimistic local switch if both APIs unavailable
        const user: AuthUser = { ..._state.user!, role: targetRole };
        _state = { ..._state, user };
        save(_state);
        notify();
        return user;
      }
    }
  },

  logout() {
    _state = { token: null, user: null };
    save(_state);
    setAuthToken(null);
    stopSessionCheck();
    clearTokenCookie();
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
        const apiUser = result.user as Record<string, unknown>;
        const role = normalizeRole(String(apiUser.role));
        const apiRoles = apiUser.roles as string[] | undefined;
        const roles = apiRoles
          ? apiRoles.map((r) => normalizeRole(r))
          : _state.user?.roles || [role];
        _state = {
          ..._state,
          user: {
            id: String(apiUser.id),
            email: String(apiUser.email),
            name: String(apiUser.name),
            role,
            roles,
          },
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
