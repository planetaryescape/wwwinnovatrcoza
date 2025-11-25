import { createContext, useContext, useState, useEffect } from "react";

export type UserTier = "free" | "entry" | "gold" | "platinum";
export type MembershipTier = "FREE" | "GOLD";

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let tier: UserTier = "gold";
    let membershipTier: MembershipTier = "GOLD";
    let company = "Demo Company";
    
    if (email.includes("free")) {
      tier = "free";
      membershipTier = "FREE";
    } else if (email.includes("entry")) {
      tier = "entry";
      membershipTier = "FREE";
    } else if (email.includes("platinum")) {
      tier = "platinum";
      membershipTier = "GOLD";
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
      membershipTier: "FREE",
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

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, isMember, isAdmin }}>
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
