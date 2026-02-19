import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Partenariat {
  id: string;
  titre: string;
  type_partenariat: string;
  nature: string;
  domaine: string;
  entite_cnss: string;
  entite_concernee: string | null;
  partenaire: string;
  date_debut: string | null;
  date_fin: string | null;
  statut: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const TYPES_PARTENARIAT = [
  { value: "convention", label: "Convention" },
  { value: "convention_cadre", label: "Convention Cadre" },
  { value: "protocole_accord", label: "Protocole d'accord" },
  { value: "avenant", label: "Avenant" },
  { value: "academique", label: "Académique" },
  { value: "strategique", label: "Stratégique" },
  { value: "entreprise_privee", label: "Entreprise Privée" },
  { value: "internationale", label: "Internationale" },
  { value: "semi_public", label: "Semi Public" },
];

export const NATURES = [
  { value: "public", label: "Public" },
  { value: "prive", label: "Privé" },
  { value: "mixte", label: "Mixte" },
];

export const DOMAINES = [
  { value: "sante", label: "Santé" },
  { value: "social", label: "Social" },
  { value: "education", label: "Éducation" },
  { value: "technologie", label: "Technologie" },
  { value: "finance", label: "Finance" },
  { value: "autre", label: "Autre" },
];

export const ENTITES_CNSS = [
  { value: "entite_centrale", label: "Entité Centrale" },
  { value: "dr", label: "DR (Direction Régionale)" },
  { value: "pum", label: "PUM" },
  { value: "clinique", label: "Clinique" },
  { value: "polyclinique", label: "Polyclinique" },
];

export const STATUTS = [
  { value: "operationnel", label: "Opérationnel" },
  { value: "non_operationnel", label: "Non opérationnel" },
  { value: "echu", label: "Échu" },
  { value: "a_renouveler", label: "À renouveler" },
  { value: "en_cours", label: "En cours" },
];

export const usePartenariats = () => {
  return useQuery({
    queryKey: ["partenariats"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/partenariats`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des partenariats.");
      }
      const data = await response.json();
      return data as Partenariat[];
    },
  });
};

export const useCreatePartenariat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<Partenariat, "id" | "created_at" | "updated_at">) => {
      const response = await fetch(`${API_BASE_URL}/api/partenariats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(p),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la création du partenariat.");
      }
      const data = await response.json();
      return data as Partenariat;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partenariats"] }),
  });
};

export const useUpdatePartenariat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...p }: Partial<Partenariat> & { id: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/partenariats/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(p),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du partenariat.");
      }
      const data = await response.json();
      return data as Partenariat;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partenariats"] }),
  });
};

export const useDeletePartenariat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/partenariats/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du partenariat.");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partenariats"] }),
  });
};
