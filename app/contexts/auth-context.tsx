"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { clearAuthData, getUserData, isAuthenticated } from "../lib/auth-utils";
import { useRouter } from "next/navigation";
import { LoginResponse } from "../types/login";
import { api } from "../lib/api";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUserData();
        setUser(userData);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      console.log("Logout request sent successfully");
    } catch (error) {
      console.error("Error during logout request:", error);
    } finally {
      clearAuthData();
      setUser(null);
      router.push("/login");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
