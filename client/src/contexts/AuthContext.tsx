import { createContext, useContext, useState, useEffect } from "react";

export type UserTier = "free" | "entry" | "gold" | "platinum";
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

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
  membershipTier?: MembershipTier;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("innovatr_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`/api/users/email/${encodeURIComponent(email)}`);
      if (res.ok) {
        const dbUser = await res.json();
        const isAdmin = email === "hannah@innovatr.co.za" || email === "richard@innovatr.co.za";
        
        const tierMap: Record<string, UserTier> = {
          STARTER: "entry",
          GROWTH: "gold",
          SCALE: "platinum",
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
    
    let tier: UserTier = "gold";
    let membershipTier: MembershipTier = "GROWTH";
    let company = "Demo Company";
    
    if (email.includes("free")) {
      tier = "free";
      membershipTier = "STARTER";
    } else if (email.includes("entry")) {
      tier = "entry";
      membershipTier = "STARTER";
    } else if (email.includes("platinum")) {
      tier = "platinum";
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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const isAdmin = email === "hannah@innovatr.co.za" || email === "richard@innovatr.co.za";
    
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
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("innovatr_user");
  };

  const isAuthenticated = user !== null;
  const isMember = user !== null && user.tier !== "free";
  const isAdmin = user?.isAdmin ?? false;
  const membershipTier = user?.membershipTier;

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, isMember, isAdmin, membershipTier }}>
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
