import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "spectate";

export interface LocalUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  nickname: string;
}

const STORAGE_KEY = "local_auth_user";
export const AUTH_STORAGE_KEY = STORAGE_KEY;
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/** These emails are always treated as admin (fallback if role not synced). */
export const ADMIN_EMAILS = ["admin@local", "ilyas@local"];

export function isAdminUser(session: LocalUser | null): boolean {
  if (!session) return false;
  if (session.role === "admin") return true;
  return Boolean(session.email && ADMIN_EMAILS.includes(session.email));
}

interface AuthContextValue {
  session: LocalUser | null;
  loading: boolean;
  signOut: () => void;
  setSession: (user: LocalUser | null) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistSession(user: LocalUser | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    let parsed: LocalUser | null = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw) as LocalUser;
        if (parsed && !parsed.role) (parsed as LocalUser).role = "spectate";
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    if (parsed?.id) {
      // If we already have a role from storage, show it immediately (admin UI works)
      if (parsed.role) {
        setSession(parsed);
        setLoading(false);
      }
      // Refresh session from server (fixes stale or missing role)
      fetch(`${API_BASE}/api/me`, { headers: { "X-User-Id": parsed.id } })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((user) => {
          const full: LocalUser = {
            id: String(user.id),
            email: user.email,
            fullName: user.fullName ?? user.full_name ?? "",
            role: user.role === "admin" ? "admin" : "spectate",
            nickname: user.nickname ?? user.fullName ?? user.email ?? "",
          };
          setSession(full);
          persistSession(full);
        })
        .catch(() => {
          if (!parsed?.role) {
            setSession(parsed);
            persistSession(parsed);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setSession(parsed);
      setLoading(false);
    }
  }, []);

  const signOut = () => {
    persistSession(null);
    setSession(null);
  };

  const setSessionAndPersist = (user: LocalUser | null) => {
    setSession(user);
    persistSession(user);
  };

  const isAdmin = isAdminUser(session);

  return React.createElement(
    AuthContext.Provider,
    { value: { session, loading, signOut, setSession: setSessionAndPersist, isAdmin } },
    children
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};