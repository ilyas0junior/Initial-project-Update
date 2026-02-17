import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Agent {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance: string | null;
  email: string | null;
  telephone: string | null;
  poste: string | null;
  departement: string | null;
  statut: string;
  date_embauche: string | null;
  adresse: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type AgentInsert = Omit<Agent, "id" | "created_at" | "updated_at">;

export const useAgents = () => {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Agent[];
    },
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agent: AgentInsert) => {
      const { data, error } = await supabase.from("agents").insert(agent).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...agent }: Partial<Agent> & { id: string }) => {
      const { data, error } = await supabase.from("agents").update(agent).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });
};
