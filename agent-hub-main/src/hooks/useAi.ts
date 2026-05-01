import { useMutation, useQuery } from "@tanstack/react-query";
import { API_BASE_URL, getAuthHeaders } from "@/hooks/usePartenariats";

export interface AiInsight {
  summary: {
    total: number;
    active: number;
    operationnels: number;
    enCours: number;
    expired: number;
    renewSoon: number;
    missingDates: number;
    missingDescriptions: number;
    duplicatePartners: number;
  };
  topDomaines: Array<{ name: string; count: number }>;
  urgentPartenariats: Array<{
    id: string;
    titre: string;
    partenaire: string;
    date_fin: string | null;
    statut: string;
    daysRemaining: number | null;
  }>;
  recommendations: string[];
}

export interface AiAssistantResponse {
  answer: string;
  matches: Array<{
    id: string;
    titre: string;
    partenaire: string;
    statut: string;
    date_fin: string | null;
  }>;
  suggestedQuestions: string[];
}

export const useAiInsights = (userId?: string) => {
  return useQuery({
    queryKey: ["ai-insights", userId || null],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/ai/insights`, {
        headers: getAuthHeaders(userId),
      });
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des insights IA.");
      }
      return (await response.json()) as AiInsight;
    },
  });
};

export const useAskAiAssistant = (userId?: string) => {
  return useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch(`${API_BASE_URL}/api/ai/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(userId),
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la réponse de l'assistant IA.");
      }
      return (await response.json()) as AiAssistantResponse;
    },
  });
};
