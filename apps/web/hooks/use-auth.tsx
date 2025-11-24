"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, authApi } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: "YOUTH" | "DONOR" | "ADMIN" | "FIELD_AGENT" | "SUPER_ADMIN";
  category?: "REFUGEE" | "IDP" | "VULNERABLE" | "PWD";
  country?: string;
  camp?: string;
  community?: string;
  dateOfBirth?: string;
  gender?: string;
  organizationName?: string;
  organizationType?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const userData = await api.get<User>("/api/user/profile");
      setUser(userData);
    } catch (error) {
      // Token might be invalid
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for stored token on mount
    // Only access localStorage in browser environment
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        api.setToken(storedToken);
        setToken(storedToken);
        refreshUser();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    api.setToken(response.token);
    setToken(response.token);
    setUser(response.user as User);
    router.push("/dashboard");
  };

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data);
    api.setToken(response.token);
    setToken(response.token);
    setUser(response.user as User);
    router.push("/dashboard");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshUser }}
    >
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

