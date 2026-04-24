import { createContext, useContext, useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { 
  normalizeUserTier, 
  getTierLevel, 
  canAccessTier, 
  isFreeUser as checkIsFreeUser,
  isPaidMember as checkIsPaidMember,
  hasPaidSeatAccess as checkHasPaidSeatAccess,
  isAdminUser as checkIsAdminUser,
  type TierName,
  type TierLevel,
  TIER_LEVELS
} from "@shared/access";
import { trackLinkedInEvent } from "@/lib/linkedin-tracking";

export type UserTier = "free" | "starter" | "growth" | "scale" | "custom";
export type MembershipTier = "STARTER" | "GROWTH" | "SCALE" | "CUSTOM" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  companyId?: string | null;
  tier: UserTier;
  membershipTier?: MembershipTier;
  isAdmin?: boolean;
  isPaidSeat?: boolean;
}

export interface ImpersonationState {
  isImpersonating: boolean;
  originalAdmin: User | null;
  impersonatedUserId?: string;
  impersonatedCompanyId?: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
  tier?: string;
  basicCreditsTotal: number;
  basicCreditsUsed: number;
  proCreditsTotal: number;
  proCreditsUsed: number;
}

export interface CompanyMembership {
  id: string;
  userId: string;
  companyId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: "ACTIVE" | "REMOVED";
  company: Company;
}

export function getBasicCreditsRemaining(company: Company): number {
  return (company.basicCreditsTotal ?? 0) - (company.basicCreditsUsed ?? 0);
}

export function getProCreditsRemaining(company: Company): number {
  return (company.proCreditsTotal ?? 0) - (company.proCreditsUsed ?? 0);
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  activeCompany: Company | null;
  memberships: CompanyMembership[];
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, company: string, industry: string, extras?: { surname?: string; referralSource?: string; wantsContact?: boolean; subscribeNewsletter?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  createCompany: (data: { name: string; industry?: string }) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMember: boolean;
  isAdmin: boolean;
  isFreeUser: boolean;
  isPaidMember: boolean;
  hasPaidSeatAccess: boolean;
  membershipTier?: MembershipTier;
  tierLevel: TierLevel;
  canAccess: (requiredTier: string) => boolean;
  impersonation: ImpersonationState;
  impersonateUser: (userId: string) => Promise<void>;
  impersonateCompany: (companyId: string) => Promise<void>;
  exitImpersonation: () => Promise<void>;
  isViewingAsCompany: boolean;
  viewingCompanyName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultImpersonation: ImpersonationState = {
  isImpersonating: false,
  originalAdmin: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [memberships, setMemberships] = useState<CompanyMembership[]>([]);
  const [impersonation, setImpersonation] = useState<ImpersonationState>(defaultImpersonation);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthPayload = (dbUser: any, fallbackEmail?: string): User => {
    const isAdmin = dbUser.role === "ADMIN" ||
      dbUser.email === "hannah@innovatr.co.za" ||
      dbUser.email === "richard@innovatr.co.za" ||
      dbUser.email === "alroy@innovatr.co.za";

    const tierMap: Record<string, UserTier> = {
      STARTER: "starter",
      GROWTH: "growth",
      SCALE: "scale",
      FREE: "free",
    };

    const sessionUser: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || (fallbackEmail || dbUser.email).split("@")[0],
      company: dbUser.activeCompany?.name ?? dbUser.company,
      companyId: dbUser.activeCompany?.id ?? dbUser.companyId,
      tier: isAdmin ? "scale" : (tierMap[dbUser.membershipTier] || "free"),
      membershipTier: isAdmin ? "SCALE" : dbUser.membershipTier,
      isAdmin,
      isPaidSeat: dbUser.isPaidSeat ?? false,
    };

    setUser(sessionUser);
    setCompany(dbUser.activeCompany ?? null);
    setMemberships(dbUser.memberships ?? []);
    localStorage.setItem("innovatr_user", JSON.stringify(sessionUser));
    return sessionUser;
  };

  // Check for existing session on mount using HTTP-only cookie
  useEffect(() => {
    // Try to restore from localStorage first for faster UI
    const savedUser = localStorage.getItem("innovatr_user");
    const savedImpersonation = localStorage.getItem("innovatr_impersonation");
    let restoredImpersonation: ImpersonationState = defaultImpersonation;
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedImpersonation) {
      restoredImpersonation = JSON.parse(savedImpersonation);
      setImpersonation(restoredImpersonation);
    }
    
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", // Include cookies
        });
        
        if (res.ok) {
          const dbUser = await res.json();

          const impersonationIsValid =
            restoredImpersonation?.isImpersonating &&
            restoredImpersonation.originalAdmin?.id === dbUser.id &&
            dbUser.role === "ADMIN";

          if (impersonationIsValid) {
            // Session matches — keep the impersonated user from localStorage
          } else {
            // Stale / mismatched / non-admin — clear impersonation and load the real user
            if (restoredImpersonation?.isImpersonating) {
              setImpersonation(defaultImpersonation);
              localStorage.removeItem("innovatr_impersonation");
            }
            applyAuthPayload(dbUser);
          }
        } else {
          // No valid session - clear everything including impersonation
          localStorage.removeItem("innovatr_user");
          localStorage.removeItem("innovatr_impersonation");
          setUser(null);
          setCompany(null);
          setMemberships([]);
          setImpersonation(defaultImpersonation);
        }
      } catch (err) {
        console.log("Session check failed, user not logged in");
        localStorage.removeItem("innovatr_user");
        localStorage.removeItem("innovatr_impersonation");
        setUser(null);
        setCompany(null);
        setMemberships([]);
        setImpersonation(defaultImpersonation);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Verify session with server
    checkSession();
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      if (user?.companyId) {
        try {
          const res = await fetch(`/api/member/company`, {
            credentials: "include", // Include session cookie
          });
          if (res.ok) {
            const companyData = await res.json();
            setCompany(companyData);
          }
        } catch (err) {
          console.log("Failed to fetch company data");
        }
      } else {
        setCompany(null);
      }
    };
    fetchCompany();
  }, [user?.companyId]);

  const login = async (email: string, password: string) => {
    // Use real API authentication with bcrypt password validation
    // Session cookie is set automatically by the server (HTTP-only)
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies for session management
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Invalid email or password");
    }
    
    const dbUser = await res.json();
    queryClient.clear();
    // Clear any stale impersonation left over from a previous user in this browser
    setImpersonation(defaultImpersonation);
    localStorage.removeItem("innovatr_impersonation");
    applyAuthPayload(dbUser, email);
  };

  const signup = async (email: string, password: string, name: string, company: string, industry: string, extras?: { surname?: string; referralSource?: string; wantsContact?: boolean; subscribeNewsletter?: boolean }) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name, company, industry, ...extras }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      if (res.status === 409) {
        throw new Error("User with this email already exists. Please log in instead.");
      }
      throw new Error(error.message || "Failed to create account");
    }
    
    const dbUser = await res.json();

    // Fire LinkedIn Sign Up conversion only on a successful signup
    trackLinkedInEvent("sign_up");

    // After signup, automatically log in to create session
    await login(email, password);
  };

  const logout = async () => {
    // Call API to invalidate session and clear HTTP-only cookie
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include", // Include session cookie so server can clear it
      });
    } catch (err) {
      console.log("Logout API call failed, clearing local state");
    }
    
    setUser(null);
    setCompany(null);
    setMemberships([]);
    setImpersonation(defaultImpersonation);
    queryClient.clear();
    localStorage.removeItem("innovatr_user");
    localStorage.removeItem("innovatr_impersonation");
  };

  const switchCompany = async (companyId: string) => {
    queryClient.clear();
    const res = await fetch("/api/member/active-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ companyId }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || error.message || "Failed to switch company");
    }

    const payload = await res.json();
    const activeCompany = payload.activeCompany ?? null;
    setCompany(activeCompany);
    setMemberships(payload.memberships ?? []);
    setUser((current) => {
      if (!current) return current;
      const updated = {
        ...current,
        company: activeCompany?.name ?? null,
        companyId: activeCompany?.id ?? null,
        membershipTier: activeCompany?.tier ?? current.membershipTier,
      };
      localStorage.setItem("innovatr_user", JSON.stringify(updated));
      return updated;
    });
    queryClient.clear();
  };

  const createCompany = async (data: { name: string; industry?: string }) => {
    const res = await fetch("/api/member/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || error.message || "Failed to create company");
    }

    const payload = await res.json();
    const activeCompany = payload.activeCompany ?? payload.company ?? null;
    setCompany(activeCompany);
    setMemberships(payload.memberships ?? []);
    setUser((current) => {
      if (!current) return current;
      const updated = {
        ...current,
        company: activeCompany?.name ?? null,
        companyId: activeCompany?.id ?? null,
        membershipTier: activeCompany?.tier ?? current.membershipTier,
      };
      localStorage.setItem("innovatr_user", JSON.stringify(updated));
      return updated;
    });
    queryClient.clear();
  };

  const impersonateUser = async (userId: string) => {
    // If currently impersonating, the originalAdmin is the real admin; fall back to current user
    const adminUser = impersonation.isImpersonating ? impersonation.originalAdmin : user;
    if (!adminUser?.isAdmin) {
      throw new Error("Admin access required to impersonate a user");
    }

    const res = await fetch(`/api/admin/users/${userId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch user");

    const targetUser = await res.json();
    const tierMap: Record<string, UserTier> = {
      STARTER: "starter",
      GROWTH: "growth",
      SCALE: "scale",
      FREE: "free",
    };

    const impersonatedUser: User = {
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.name || targetUser.email.split("@")[0],
      company: targetUser.company,
      companyId: targetUser.companyId,
      tier: tierMap[targetUser.membershipTier] || "free",
      membershipTier: targetUser.membershipTier,
      isAdmin: false,
      isPaidSeat: targetUser.isPaidSeat ?? false,
    };

    const newImpersonation: ImpersonationState = {
      isImpersonating: true,
      originalAdmin: adminUser,
      impersonatedUserId: userId,
    };

    setUser(impersonatedUser);
    setImpersonation(newImpersonation);
    localStorage.setItem("innovatr_user", JSON.stringify(impersonatedUser));
    localStorage.setItem("innovatr_impersonation", JSON.stringify(newImpersonation));
    queryClient.clear();
  };

  const impersonateCompany = async (companyId: string) => {
    // If already impersonating, originalAdmin holds the real admin; otherwise the current user is the admin
    const adminUser = impersonation.isImpersonating ? impersonation.originalAdmin : user;
    if (!adminUser?.isAdmin) {
      throw new Error("Admin access required to view as company");
    }

    const companyRes = await fetch("/api/admin/session-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ companyId }),
    });
    if (!companyRes.ok) throw new Error("Failed to fetch company");

    const payload = await companyRes.json();
    const company = payload.activeCompany;
    if (!company) throw new Error("Failed to set company context");

    const tierMap: Record<string, UserTier> = {
      STARTER: "starter",
      GROWTH: "growth",
      SCALE: "scale",
      FREE: "free",
    };

    const companyViewUser: User = {
      id: `company_${companyId}`,
      email: `admin@${company.domain || 'company.com'}`,
      name: company.name,
      company: company.name,
      companyId: companyId,
      tier: tierMap[company.tier] || "free",
      membershipTier: company.tier,
      isAdmin: false,
      isPaidSeat: ["STARTER", "GROWTH", "SCALE"].includes(company.tier),
    };

    const newImpersonation: ImpersonationState = {
      isImpersonating: true,
      originalAdmin: adminUser,
      impersonatedCompanyId: companyId,
    };

    setUser(companyViewUser);
    setCompany(company);
    setMemberships([]);
    setImpersonation(newImpersonation);
    localStorage.setItem("innovatr_user", JSON.stringify(companyViewUser));
    localStorage.setItem("innovatr_impersonation", JSON.stringify(newImpersonation));
    queryClient.clear();
  };

  const exitImpersonation = async () => {
    if (!impersonation.isImpersonating || !impersonation.originalAdmin) return;

    const originalAdmin = impersonation.originalAdmin;

    try {
      await fetch("/api/admin/session-company", {
        method: "DELETE",
        credentials: "include",
      });

      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        const dbUser = await res.json();
        applyAuthPayload(dbUser);
      } else {
        setUser(originalAdmin);
        localStorage.setItem("innovatr_user", JSON.stringify(originalAdmin));
      }
    } catch (error) {
      setUser(originalAdmin);
      localStorage.setItem("innovatr_user", JSON.stringify(originalAdmin));
    }

    setImpersonation(defaultImpersonation);
    localStorage.removeItem("innovatr_impersonation");
    queryClient.clear();
  };

  const isAuthenticated = user !== null;
  // Admins always have full member access (Scale tier perks)
  const isAdminUser = impersonation.isImpersonating ? false : (user?.isAdmin ?? false);
  const isMember = user !== null && (user.tier !== "free" || isAdminUser);
  const isAdmin = isAdminUser;
  const membershipTier = user?.membershipTier;
  
  // Use centralized access helpers
  const isFreeUser = user ? checkIsFreeUser(user.membershipTier, user.isAdmin ? "ADMIN" : "MEMBER") : true;
  const isPaidMember = user ? checkIsPaidMember(user.membershipTier) : false;
  const hasPaidSeatAccess = user ? checkHasPaidSeatAccess(user.isPaidSeat, user.isAdmin) : false;
  const tierLevel = getTierLevel(user?.membershipTier);
  const canAccess = (requiredTier: string) => canAccessTier(user?.membershipTier, requiredTier);
  
  // View-as-company state
  const isViewingAsCompany = impersonation.isImpersonating && !!impersonation.impersonatedCompanyId;
  const viewingCompanyName = isViewingAsCompany ? user?.company : undefined;

  return (
    <AuthContext.Provider value={{ 
      user,
      company,
      activeCompany: company,
      memberships,
      login, 
      signup, 
      logout, 
      switchCompany,
      createCompany,
      isAuthenticated,
      isLoading,
      isMember, 
      isAdmin,
      isFreeUser,
      isPaidMember,
      hasPaidSeatAccess,
      membershipTier,
      tierLevel,
      canAccess,
      impersonation,
      impersonateUser,
      impersonateCompany,
      exitImpersonation,
      isViewingAsCompany,
      viewingCompanyName,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
