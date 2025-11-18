import { createContext, useContext, useState, useEffect } from "react";

export type UserTier = "free" | "entry" | "gold" | "platinum";

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  tier: UserTier;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isMember: boolean;
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
    
    const mockUser: User = {
      id: "user-1",
      email,
      name: email.split("@")[0],
      company: "Innovatr",
      tier: email.includes("free") ? "free" : "gold",
    };
    
    setUser(mockUser);
    localStorage.setItem("innovatr_user", JSON.stringify(mockUser));
  };

  const signup = async (email: string, password: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: "user-" + Date.now(),
      email,
      name,
      tier: "free",
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

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, isMember }}>
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
