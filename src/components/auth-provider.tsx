"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Lock, Sparkles, KeyRound, AlertCircle, ArrowRight, ShieldCheck, User } from "lucide-react";
import { UserProfile } from "@/lib/services/user.service";

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form states for login gate
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check current session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsSubmitting(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      } else {
        const err = data.error || "Username atau password salah.";
        setLoginError(err);
        return { success: false, error: err };
      }
    } catch (err: any) {
      const errText = err.message || "Terjadi kesalahan jaringan.";
      setLoginError(errText);
      return { success: false, error: errText };
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setLoginError("Username dan password tidak boleh kosong.");
      return;
    }
    await login(usernameInput, passwordInput);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 shadow-xl shadow-indigo-600/30 animate-pulse">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="mt-4 text-xs font-mono text-slate-400">Memeriksa Sesi LeonorePortal...</div>
      </div>
    );
  }

  // Not Authenticated -> Show Global Login Gate
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative isolate bg-slate-950">
        {/* Ambient Glow */}
        <div className="absolute inset-0 -z-10 bg-slate-950 overflow-hidden">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 opacity-25 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-2xl">
          {/* Brand Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-indigo-500/25">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              LeonorePortal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Private Workspace Hub • Silakan masuk untuk mengakses portal
            </p>
          </div>

          <form onSubmit={handleGateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Masukkan username..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  autoFocus
                  required
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="Masukkan password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Memverifikasi..." : "Masuk ke Portal"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated -> Render Full Application
  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}