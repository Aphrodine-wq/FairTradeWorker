import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Use SECRET_KEY_BASE to match Spring Boot, fall back to JWT_SECRET for backwards compat
const JWT_SECRET = process.env.SECRET_KEY_BASE || process.env.JWT_SECRET || "dev-secret-key-change-in-production";
const TOKEN_EXPIRY = "24h";
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h — must match TOKEN_EXPIRY

export interface TokenPayload {
  userId: string;
  email: string;
  role: "CONTRACTOR" | "HOMEOWNER" | "SUBCONTRACTOR";
  roles: ("CONTRACTOR" | "HOMEOWNER" | "SUBCONTRACTOR")[];
}

// Internal JWT claims use user_id/snake_case to match Spring Boot format
interface JwtClaims {
  user_id: string;
  email: string;
  role: string;
  roles: string[];
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: TokenPayload): string {
  const claims: JwtClaims = {
    user_id: payload.userId,
    email: payload.email,
    role: payload.role,
    roles: payload.roles,
  };
  return jwt.sign(claims, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    issuer: "ftw-realtime",
    audience: "ftw",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const claims = jwt.verify(token, JWT_SECRET, {
      issuer: "ftw-realtime",
      audience: "ftw",
    }) as JwtClaims;
    return {
      userId: claims.user_id,
      email: claims.email,
      role: claims.role as TokenPayload["role"],
      roles: claims.roles as TokenPayload["roles"],
    };
  } catch {
    // Try without issuer/audience for tokens minted before this change
    try {
      const claims = jwt.verify(token, JWT_SECRET) as any;
      return {
        userId: claims.user_id || claims.userId,
        email: claims.email,
        role: claims.role,
        roles: claims.roles,
      };
    } catch {
      return null;
    }
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies.get("ftw-token")?.value || null;
}

export function getAuthUser(req: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}
