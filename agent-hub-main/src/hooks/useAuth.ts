import React, { createContext, useContext, useState, useEffect } from "react";

export interface LocalUser {
  id: string;
  email: string;
  fullName: string;
}

const STORAGE_KEY = "local_auth_user";
export const AUTH_STORAGE_KEY = STORAGE_KEY;

interface AuthContextValue {
  session: LocalUser | null;
  loading: boolean;
  signOut: () => void;
  setSession: (user: LocalUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSession(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { session, loading, signOut, setSession } },
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