import { createContext, useContext, useState, useEffect } from "react";

export type UserTier = "free" | "starter" | "growth" | "scale";
export type MembershipTier = "STARTER" | "GROWTH" | "SCALE";

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  companyId?: string | null;
  tier: UserTier;
  membershipTier?: MembershipTier;
  isAdmin?: boolean;
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
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
  membershipTier?: MembershipTier;
  impersonation: ImpersonationState;
  impersonateUser: (userId: string) => Promise<void>;
  impersonateCompany: (companyId: string) => Promise<void>;
  exitImpersonation: () => void;
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

  useEffect(() => {
    const savedUser = localStorage.getItem("innovatr_user");
    const savedImpersonation = localStorage.getItem("innovatr_impersonation");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedImpersonation) {
      setImpersonation(JSON.parse(savedImpersonation));
    }
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      if (user?.companyId) {
        try {
          // Pass user email for demo account credit display
          const emailParam = user.email ? `?email=${encodeURIComponent(user.email)}` : '';
          const res = await fetch(`/api/companies/${user.companyId}${emailParam}`);
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
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    };
    
    const loggedInUser: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || email.split("@")[0],
      company: dbUser.company,
      companyId: dbUser.companyId,
      // Admins always get Scale tier access
      tier: isAdmin ? "scale" : (tierMap[dbUser.membershipTier] || "starter"),
      membershipTier: isAdmin ? "SCALE" : dbUser.membershipTier,
      isAdmin,
    };
    
    setUser(loggedInUser);
    localStorage.setItem("innovatr_user", JSON.stringify(loggedInUser));
  };

  const signup = async (email: string, password: string, name: string) => {
    // Call the API to create the user in the database with hashed password
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      if (res.status === 409) {
        throw new Error("User with this email already exists. Please log in instead.");
      }
      throw new Error(error.message || "Failed to create account");
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
    };
    
    const newUser: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || name,
      company: dbUser.company,
      companyId: dbUser.companyId,
      // Admins get Scale tier, regular users start as starter
      tier: isAdmin ? "scale" : (tierMap[dbUser.membershipTier] || "starter"),
      membershipTier: isAdmin ? "SCALE" : (dbUser.membershipTier || "STARTER"),
      isAdmin,
    };
    
    setUser(newUser);
    localStorage.setItem("innovatr_user", JSON.stringify(newUser));
  };

  const logout = async () => {
    // Call API to invalidate session (best effort)
    try {
      await fetch("/api/auth/logout", { method: "POST" });
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
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      
      const targetUser = await res.json();
      const tierMap: Record<string, UserTier> = {
        STARTER: "free",
        GROWTH: "growth",
        SCALE: "scale",
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
      const companyRes = await fetch(`/api/admin/companies/${companyId}`);
      if (!companyRes.ok) throw new Error("Failed to fetch company");
      
      const company = await companyRes.json();
      const tierMap: Record<string, UserTier> = {
        STARTER: "free",
        GROWTH: "growth",
        SCALE: "scale",
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

  return (
    <AuthContext.Provider value={{ 
      user,
      company,
      login, 
      signup, 
      logout, 
      isAuthenticated, 
      isMember, 
      isAdmin, 
      membershipTier,
      impersonation,
      impersonateUser,
      impersonateCompany,
      exitImpersonation,
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
