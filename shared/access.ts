/**
 * Centralized access control module for the Innovatr portal.
 * Single source of truth for tier hierarchy, access levels, and content gating.
 */

/**
 * Safely parse a date value, handling strings, Date objects, null, undefined, and invalid dates.
 * Returns null for invalid/empty values, or an ISO string for valid dates.
 */
export function safeParseDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value === "") return null;
  
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Safely parse a date for form submission - returns Date object or null.
 */
export function safeParseDateObject(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value === "") return null;
  
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

export const TIER_LEVELS = {
  FREE: 0,
  STARTER: 1,
  GROWTH: 2,
  SCALE: 3,
  CUSTOM: 4,
} as const;

export type TierLevel = typeof TIER_LEVELS[keyof typeof TIER_LEVELS];
export type TierName = keyof typeof TIER_LEVELS;

export const ACCESS_LEVELS = {
  PUBLIC: 0,
  FREE: 0,
  STARTER: 1,
  GROWTH: 2,
  SCALE: 3,
} as const;

export type AccessLevel = typeof ACCESS_LEVELS[keyof typeof ACCESS_LEVELS];
export type AccessLevelName = keyof typeof ACCESS_LEVELS;

const FREE_CONTENT_SLUGS = new Set([
  "banking-monogamy-is-dead",
  "simplicity-has-status",
  "from-vegan-to-vital",
  "cadbury-pocket-sized-joy",
  "the-oat-based-breakfast-revolution",
  "the-return-of-the-third-place",
  "innovatr-inside-market-simulator",
  "innovatr-inside-ai-qual",
  "innovatr-inside-idea-screen",
  "innovatr-inside-upsiide-overview",
  "innovatr-inside-building-tests-with-upsiide",
  "innovatr-inside-the-respondent-experience",
  "innovatr-inside-the-analysis-engine",
  "innovatr-inside-how-innovatr-research-works",
]);

const FREE_CONTENT_TITLES = new Set([
  "Banking Monogamy Is Dead",
  "Simplicity Has Status",
  "From Vegan to Vital",
  "Cadbury Pocket-Sized Joy",
  "The Oat-Based Breakfast Revolution",
  "The Return of the Third Place",
  "Innovatr Inside: Market Simulator",
  "Innovatr Inside: AI Qual",
  "Innovatr Inside: Idea Screen",
  "Innovatr Inside: Upsiide Overview",
  "Innovatr Inside: Building Tests with Upsiide",
  "Innovatr Inside: The Respondent Experience",
  "Innovatr Inside: The Analysis Engine",
  "Innovatr Inside: How Innovatr Research Works",
]);

export function normalizeUserTier(tier?: string | null): TierName {
  if (!tier) return "FREE";
  const upperTier = tier.toUpperCase();
  if (upperTier === "STARTER" || upperTier === "GROWTH" || upperTier === "SCALE" || upperTier === "CUSTOM") {
    return upperTier as TierName;
  }
  return "FREE";
}

export function normalizeAccessLevel(access?: string | null): AccessLevelName {
  if (!access) return "PUBLIC";
  const upperAccess = access.toUpperCase();
  if (upperAccess === "PUBLIC" || upperAccess === "FREE") return "PUBLIC";
  if (upperAccess === "STARTER" || upperAccess === "MEMBER" || upperAccess === "MEMBERS") return "STARTER";
  if (upperAccess === "GROWTH") return "GROWTH";
  if (upperAccess === "SCALE") return "SCALE";
  return "PUBLIC";
}

export function getTierLevel(tier?: string | null): TierLevel {
  const normalized = normalizeUserTier(tier);
  return TIER_LEVELS[normalized];
}

export function getAccessLevel(access?: string | null): AccessLevel {
  const normalized = normalizeAccessLevel(access);
  return ACCESS_LEVELS[normalized];
}

export function canAccessTier(userTier?: string | null, requiredTier?: string | null): boolean {
  const userLevel = getTierLevel(userTier);
  const requiredLevel = getAccessLevel(requiredTier);
  return userLevel >= requiredLevel;
}

export function isFreeUser(membershipTier?: string | null, role?: string | null): boolean {
  if (role?.toUpperCase() === "ADMIN") return false;
  const tier = normalizeUserTier(membershipTier);
  return tier === "FREE";
}

export function isPaidMember(membershipTier?: string | null): boolean {
  const tier = normalizeUserTier(membershipTier);
  return tier !== "FREE";
}

/**
 * Check if user has paid seat access for premium content.
 * This should be used for content gating (dashboards, premium reports, etc.)
 * as opposed to isPaidMember which is for pricing/membership tier checks.
 * 
 * @param isPaidSeat - Whether the user has a paid seat
 * @param isAdmin - Whether the user is an admin (admins always have access)
 * @returns True if user can access premium content
 */
export function hasPaidSeatAccess(isPaidSeat?: boolean | null, isAdmin?: boolean | null): boolean {
  if (isAdmin) return true;
  return isPaidSeat === true;
}

export function isAdminUser(email?: string | null, role?: string | null): boolean {
  if (role?.toUpperCase() === "ADMIN") return true;
  if (!email) return false;
  const lowerEmail = email.toLowerCase();
  return (
    lowerEmail === "hannah@innovatr.co.za" ||
    lowerEmail === "richard@innovatr.co.za" ||
    lowerEmail === "alroy@innovatr.co.za"
  );
}

export function isFreeContent(report: { 
  slug?: string | null; 
  title?: string | null; 
  category?: string | null;
  accessLevel?: string | null;
}): boolean {
  if (report.accessLevel?.toUpperCase() === "PUBLIC" || report.accessLevel?.toUpperCase() === "FREE") {
    return true;
  }
  if (report.category?.toLowerCase() === "inside") {
    return true;
  }
  if (report.slug && FREE_CONTENT_SLUGS.has(report.slug)) {
    return true;
  }
  if (report.title && FREE_CONTENT_TITLES.has(report.title)) {
    return true;
  }
  return false;
}

export function getEffectiveAccessLevel(report: {
  slug?: string | null;
  title?: string | null;
  category?: string | null;
  accessLevel?: string | null;
}): AccessLevelName {
  if (isFreeContent(report)) {
    return "PUBLIC";
  }
  return normalizeAccessLevel(report.accessLevel);
}

export function checkContentAccess(
  report: { 
    slug?: string | null; 
    title?: string | null; 
    category?: string | null;
    accessLevel?: string | null;
  },
  user: { 
    membershipTier?: string | null; 
    role?: string | null;
    email?: string | null;
  } | null
): { hasAccess: boolean; reason: string; requiredTier?: TierName } {
  if (isAdminUser(user?.email, user?.role)) {
    return { hasAccess: true, reason: "admin" };
  }

  const effectiveAccess = getEffectiveAccessLevel(report);
  
  if (effectiveAccess === "PUBLIC") {
    return { hasAccess: true, reason: "public" };
  }

  if (!user) {
    return { 
      hasAccess: false, 
      reason: "not_logged_in",
      requiredTier: effectiveAccess as TierName
    };
  }

  const userLevel = getTierLevel(user.membershipTier);
  const requiredLevel = ACCESS_LEVELS[effectiveAccess];

  if (userLevel >= requiredLevel) {
    return { hasAccess: true, reason: "tier_allowed" };
  }

  return {
    hasAccess: false,
    reason: "tier_required",
    requiredTier: effectiveAccess as TierName
  };
}

export function getTierDisplayName(tier?: string | null): string {
  const normalized = normalizeUserTier(tier);
  switch (normalized) {
    case "FREE": return "Free";
    case "STARTER": return "Starter";
    case "GROWTH": return "Growth";
    case "SCALE": return "Scale";
    default: return "Free";
  }
}

export function getAccessDisplayName(access?: string | null): string {
  const normalized = normalizeAccessLevel(access);
  switch (normalized) {
    case "PUBLIC": return "Free";
    case "STARTER": return "Starter+";
    case "GROWTH": return "Growth+";
    case "SCALE": return "Scale";
    default: return "Free";
  }
}

export const INDUSTRY_OPTIONS = [
  "Food & Beverage",
  "Retail",
  "Financial Services",
  "Banking & Fintech",
  "Insurance",
  "Technology",
  "Telecoms & Connectivity",
  "Media & Entertainment",
  "FMCG / Packaged Goods",
  "Alcohol & Beverages",
  "Beauty & Personal Care",
  "Household & Homecare",
  "Quick Service Restaurants & Fast Food",
  "Automotive & Mobility",
  "Travel & Tourism",
  "Healthcare & Pharma",
  "Education",
  "Non-profit & NGOs",
  "Government & Public Sector",
  "E-commerce & Marketplaces",
  "Real Estate & Property",
  "Other",
] as const;

export type IndustryOption = typeof INDUSTRY_OPTIONS[number];
