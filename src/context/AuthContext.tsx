"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import * as api from "../services/api";

type User = { id: string; name: string; email: string; provider?: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(() => typeof window !== "undefined" ? localStorage.getItem("token") : null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      if (token) {
        try {
          const profile = await api.getProfile(token);
          setUser(profile.user || profile);
        } catch (e) {
          console.error(e);
          setToken(null);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    }
    init();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    localStorage.setItem("token", res.token);
    const profile = await api.getProfile(res.token);
    setUser(profile.user || profile);
    router.push("/");
  };

  // show toast for global errors
  useEffect(() => {
    // Example: show welcome toast when user logs in
    if (user) {
      toast.success(`Welcome back, ${user.name}`);
    }
  }, [user]);

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    setToken(res.token);
    localStorage.setItem("token", res.token);
    const profile = await api.getProfile(res.token);
    setUser(profile.user || profile);
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    router.push("/login");
  };

  const refreshProfile = async () => {
    if (!token) return;
    const profile = await api.getProfile(token);
    setUser(profile.user || profile);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshProfile }}>
      <Toaster position="top-right" />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
