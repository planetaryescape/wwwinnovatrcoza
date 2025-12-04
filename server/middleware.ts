import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { hashSessionToken, isExpired } from "./auth/password";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string | null;
    membershipTier: string;
    name?: string;
    [key: string]: any;
  };
  session?: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    [key: string]: any;
  };
}

const ADMIN_EMAILS = ["hannah@innovatr.co.za", "richard@innovatr.co.za"];

export function isAdminUser(email?: string | null): boolean {
  return email !== undefined && email !== null && ADMIN_EMAILS.includes(email);
}

export function redactUser(user: any): any {
  if (!user) return user;
  
  const {
    password,
    passwordHash,
    resetToken,
    resetTokenHash,
    resetTokenExpires,
    ...safeUser
  } = user;
  
  return safeUser;
}

export function redactUsers(users: any[]): any[] {
  return users.map(redactUser);
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionToken = req.cookies?.session;
    
    if (!sessionToken) {
      res.status(401).json({ error: "Not authenticated", code: "AUTH_REQUIRED" });
      return;
    }
    
    const tokenHash = hashSessionToken(sessionToken);
    const session = await storage.getSessionByTokenHash(tokenHash);
    
    if (!session) {
      res.clearCookie("session", { path: "/" });
      res.status(401).json({ error: "Session expired or invalid", code: "SESSION_INVALID" });
      return;
    }
    
    if (isExpired(session.expiresAt)) {
      await storage.deleteSession(session.id);
      res.clearCookie("session", { path: "/" });
      res.status(401).json({ error: "Session expired", code: "SESSION_EXPIRED" });
      return;
    }
    
    const user = await storage.getUser(session.userId);
    if (!user) {
      await storage.deleteSession(session.id);
      res.clearCookie("session", { path: "/" });
      res.status(401).json({ error: "User not found", code: "USER_NOT_FOUND" });
      return;
    }
    
    if (!user.isActive) {
      res.status(403).json({ error: "Account is disabled", code: "ACCOUNT_DISABLED" });
      return;
    }
    
    req.user = redactUser(user) as AuthenticatedRequest["user"];
    req.session = session as unknown as AuthenticatedRequest["session"];
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication error", code: "AUTH_ERROR" });
  }
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, () => {
    if (!req.user) {
      return;
    }
    
    const hasAdminRole = req.user.role === "ADMIN";
    const hasAdminEmail = isAdminUser(req.user.email);
    
    if (!hasAdminRole && !hasAdminEmail) {
      res.status(403).json({ error: "Forbidden: Admin access required", code: "ADMIN_REQUIRED" });
      return;
    }
    
    next();
  });
}

export function apiError(res: Response, status: number, error: string, code?: string): void {
  res.status(status).json({ error, code: code || "ERROR" });
}
