import { createContext, useContext, useState, useEffect } from "react";
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

export function getBasicCreditsRemaining(company: Company): number {
  return (company.basicCreditsTotal ?? 0) - (company.basicCreditsUsed ?? 0);
}

export function getProCreditsRemaining(company: Company): number {
  return (company.proCreditsTotal ?? 0) - (company.proCreditsUsed ?? 0);
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, company: string, industry: string, extras?: { surname?: string; referralSource?: string; wantsContact?: boolean; subscribeNewsletter?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
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
  exitImpersonation: () => void;
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
  const [impersonation, setImpersonation] = useState<ImpersonationState>(defaultImpersonation);
  const [isLoading, setIsLoading] = useState(true);

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
          
          // Check if user has admin role or admin email
          const isAdmin = dbUser.role === "ADMIN" || 
            dbUser.email === "hannah@innovatr.co.za" || 
            dbUser.email === "richard@innovatr.co.za";
          
          const tierMap: Record<string, UserTier> = {
            STARTER: "starter",
            GROWTH: "growth",
            SCALE: "scale",
            FREE: "free",
          };
          
          // Determine tier: admins get scale, others get their tier or free for missing/unknown
          const effectiveTier = isAdmin 
            ? "scale" 
            : (tierMap[dbUser.membershipTier] || "free");
          
          const sessionUser: User = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name || dbUser.email.split("@")[0],
            company: dbUser.company,
            companyId: dbUser.companyId,
            tier: effectiveTier,
            membershipTier: isAdmin ? "SCALE" : dbUser.membershipTier,
            isAdmin,
            isPaidSeat: dbUser.isPaidSeat ?? false,
          };
          
          // If impersonation is active, don't overwrite the impersonated user
          // Just verify the session is valid (admin is still logged in)
          if (restoredImpersonation?.isImpersonating && restoredImpersonation.originalAdmin) {
            // Session is valid - keep the impersonated user from localStorage
            // The impersonated user was already set above from savedUser
          } else {
            // No active impersonation - use the real session user
            setUser(sessionUser);
            localStorage.setItem("innovatr_user", JSON.stringify(sessionUser));
          }
        } else {
          // No valid session - clear everything including impersonation
          localStorage.removeItem("innovatr_user");
          localStorage.removeItem("innovatr_impersonation");
          setUser(null);
          setImpersonation(defaultImpersonation);
        }
      } catch (err) {
        console.log("Session check failed, user not logged in");
        localStorage.removeItem("innovatr_user");
        localStorage.removeItem("innovatr_impersonation");
        setUser(null);
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
          // Pass user email for demo account credit display
          const emailParam = user.email ? `?email=${encodeURIComponent(user.email)}` : '';
          const res = await fetch(`/api/companies/${user.companyId}${emailParam}`, {
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
  }, [user?.companyId, user?.email]);

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
    
    // Check if user has admin role or admin email
    const isAdmin = dbUser.role === "ADMIN" || 
      email === "hannah@innovatr.co.za" || 
      email === "richard@innovatr.co.za";
    
    const tierMap: Record<string, UserTier> = {
      STARTER: "starter",
      GROWTH: "growth",
      SCALE: "scale",
      FREE: "free",
    };
    
    const loggedInUser: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || email.split("@")[0],
      company: dbUser.company,
      companyId: dbUser.companyId,
      // Admins always get Scale tier access
      tier: isAdmin ? "scale" : (tierMap[dbUser.membershipTier] || "free"),
      membershipTier: isAdmin ? "SCALE" : dbUser.membershipTier,
      isAdmin,
      isPaidSeat: dbUser.isPaidSeat ?? false,
    };
    
    setUser(loggedInUser);
    localStorage.setItem("innovatr_user", JSON.stringify(loggedInUser));
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
    setImpersonation(defaultImpersonation);
    localStorage.removeItem("innovatr_user");
    localStorage.removeItem("innovatr_impersonation");
  };

  const impersonateUser = async (userId: string) => {
    if (!user?.isAdmin) return;
    
    try {
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
        originalAdmin: user,
        impersonatedUserId: userId,
      };
      
      setUser(impersonatedUser);
      setImpersonation(newImpersonation);
      localStorage.setItem("innovatr_user", JSON.stringify(impersonatedUser));
      localStorage.setItem("innovatr_impersonation", JSON.stringify(newImpersonation));
    } catch (error) {
      console.error("Failed to impersonate user:", error);
    }
  };

  const impersonateCompany = async (companyId: string) => {
    if (!user?.isAdmin) return;
    
    try {
      const companyRes = await fetch(`/api/admin/companies/${companyId}`, {
        credentials: "include",
      });
      if (!companyRes.ok) throw new Error("Failed to fetch company");
      
      const company = await companyRes.json();
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
        isPaidSeat: ["STARTER", "GROWTH", "SCALE"].includes(company.tier), // Reflect actual company paid status
      };
      
      const newImpersonation: ImpersonationState = {
        isImpersonating: true,
        originalAdmin: user,
        impersonatedCompanyId: companyId,
      };
      
      setUser(companyViewUser);
      setImpersonation(newImpersonation);
      localStorage.setItem("innovatr_user", JSON.stringify(companyViewUser));
      localStorage.setItem("innovatr_impersonation", JSON.stringify(newImpersonation));
    } catch (error) {
      console.error("Failed to impersonate company:", error);
    }
  };

  const exitImpersonation = () => {
    if (!impersonation.isImpersonating || !impersonation.originalAdmin) return;
    
    setUser(impersonation.originalAdmin);
    setImpersonation(defaultImpersonation);
    localStorage.setItem("innovatr_user", JSON.stringify(impersonation.originalAdmin));
    localStorage.removeItem("innovatr_impersonation");
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
      login, 
      signup, 
      logout, 
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
