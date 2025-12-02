import { createContext, useContext, useState, useEffect } from "react";

export type UserTier = "free" | "entry" | "growth" | "scale";
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
  creditsBasic: number;
  creditsPro: number;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
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
          const res = await fetch(`/api/companies/${user.companyId}`);
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
    try {
      const res = await fetch(`/api/users/email/${encodeURIComponent(email)}`);
      if (res.ok) {
        const dbUser = await res.json();
        const isAdmin = email === "hannah@innovatr.co.za" || email === "richard@innovatr.co.za";
        
        const tierMap: Record<string, UserTier> = {
          STARTER: "free",
          GROWTH: "growth",
          SCALE: "scale",
        };
        
        const loggedInUser: User = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || email.split("@")[0],
          company: dbUser.company,
          companyId: dbUser.companyId,
          tier: tierMap[dbUser.membershipTier] || "gold",
          membershipTier: dbUser.membershipTier,
          isAdmin,
        };
        
        setUser(loggedInUser);
        localStorage.setItem("innovatr_user", JSON.stringify(loggedInUser));
        return;
      }
    } catch (err) {
      console.log("User not found in backend, using mock data");
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let tier: UserTier = "free";
    let membershipTier: MembershipTier = "STARTER";
    let company = "Demo Company";
    
    if (email.includes("growth")) {
      tier = "growth";
      membershipTier = "GROWTH";
    } else if (email.includes("scale")) {
      tier = "scale";
      membershipTier = "SCALE";
    }
    
    const isAdmin = email === "hannah@innovatr.co.za" || email === "richard@innovatr.co.za";
    
    const mockUser: User = {
      id: "user-" + Date.now(),
      email,
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      company,
      tier,
      membershipTier,
      isAdmin,
    };
    
    setUser(mockUser);
    localStorage.setItem("innovatr_user", JSON.stringify(mockUser));
  };

  const signup = async (email: string, password: string, name: string) => {
    const isAdmin = email === "hannah@innovatr.co.za" || email === "richard@innovatr.co.za";
    
    try {
      // Call the API to create the user in the database
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      
      if (res.ok) {
        const dbUser = await res.json();
        
        const newUser: User = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || name,
          company: dbUser.company,
          tier: "free", // New users start as free
          membershipTier: "STARTER", // All new signups are STARTER
          isAdmin,
        };
        
        setUser(newUser);
        localStorage.setItem("innovatr_user", JSON.stringify(newUser));
        return;
      }
      
      // If user already exists, try logging in instead
      if (res.status === 409) {
        throw new Error("User with this email already exists. Please log in instead.");
      }
      
      throw new Error("Failed to create account");
    } catch (err: any) {
      console.error("Signup error:", err);
      // If API fails, still create local user for demo purposes
      const mockUser: User = {
        id: "user-" + Date.now(),
        email,
        name,
        tier: "free",
        membershipTier: "STARTER",
        isAdmin,
      };
      
      setUser(mockUser);
      localStorage.setItem("innovatr_user", JSON.stringify(mockUser));
    }
  };

  const logout = () => {
    setUser(null);
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
  const isMember = user !== null && user.tier !== "free";
  const isAdmin = impersonation.isImpersonating ? false : (user?.isAdmin ?? false);
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
