import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type UserRole = "admin" | "spectate";
export type UserStatus = "pending" | "approved" | "rejected";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  nickname: string;
  status?: UserStatus;
  /** Last login timestamp (from user_logs), null if never logged in */
  lastLogin?: string | null;
  /** Account creation timestamp */
  createdAt?: string | null;
}

function getHeaders(userId: string | undefined, userEmail?: string): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (userId) h["X-User-Id"] = String(userId);
  if (userEmail) h["X-User-Email"] = userEmail;
  return h;
}

export function useUsersList(userId: string | undefined, userEmail?: string) {
  return useQuery({
    queryKey: ["admin", "users", userId, userEmail],
    queryFn: async () => {
      if (!userId && !userEmail) throw new Error("Non connecté");
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: getHeaders(userId, userEmail),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { message?: string }).message ?? "Erreur chargement utilisateurs");
      }
      return res.json() as Promise<AdminUser[]>;
    },
    enabled: !!(userId || userEmail),
  });
}

export function usePendingUsers(userId: string | undefined, userEmail?: string) {
  return useQuery({
    queryKey: ["admin", "users", "pending", userId, userEmail],
    queryFn: async () => {
      if (!userId && !userEmail) throw new Error("Non connecté");
      const res = await fetch(`${API_BASE_URL}/api/users/pending`, {
        headers: getHeaders(userId, userEmail),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { message?: string }).message ?? "Erreur chargement demandes");
      }
      return res.json() as Promise<AdminUser[]>;
    },
    enabled: !!(userId || userEmail),
  });
}

export function useUpdateUser(userId: string | undefined, userEmail?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      role,
      nickname,
    }: {
      id: string;
      status?: UserStatus;
      role?: UserRole;
      nickname?: string;
    }) => {
      if (!userId && !userEmail) throw new Error("Non connecté");
      const body: Record<string, string> = {};
      if (status !== undefined) body.status = status;
      if (role !== undefined) body.role = role;
      if (nickname !== undefined) body.nickname = nickname;
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: "PATCH",
        headers: getHeaders(userId, userEmail),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message ?? "Erreur");
      return data as AdminUser;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export interface UserLog {
  id: string;
  userId: string;
  action: string;
  details: string | null;
  createdAt: string;
  userEmail: string | null;
  userNickname: string | null;
}

export function useLogs(userId: string | undefined, userEmail?: string) {
  return useQuery({
    queryKey: ["admin", "logs", userId, userEmail],
    queryFn: async () => {
      if (!userId && !userEmail) throw new Error("Non connecté");
      const res = await fetch(`${API_BASE_URL}/api/logs`, {
        headers: getHeaders(userId, userEmail),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { message?: string }).message ?? "Erreur chargement des logs");
      }
      return res.json() as Promise<UserLog[]>;
    },
    enabled: !!(userId || userEmail),
  });
}
