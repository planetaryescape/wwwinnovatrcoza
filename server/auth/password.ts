import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token for password resets
 * Returns both the plain token (to send to user) and the hash (to store in DB)
 */
export function generateResetToken(): { token: string; tokenHash: string } {
  // Generate a cryptographically secure random token
  const token = crypto.randomBytes(32).toString("hex");
  // Hash it for storage (using SHA-256, not bcrypt - it's already a random token)
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

/**
 * Hash a reset token for comparison
 */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(48).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

/**
 * Hash a session token for comparison
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate password reset token expiry (1 hour from now)
 */
export function getResetTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);
  return expiry;
}

/**
 * Calculate session token expiry (30 days from now by default)
 */
export function getSessionExpiry(daysValid: number = 30): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + daysValid);
  return expiry;
}

/**
 * Check if a date has expired
 */
export function isExpired(date: Date | null): boolean {
  if (!date) return true;
  return new Date() > date;
}
