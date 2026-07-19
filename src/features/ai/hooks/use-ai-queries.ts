"use client"

import { useQuery } from "@tanstack/react-query"

import { AiClient } from "../api/ai-client"

export const aiQueryKeys = {
  all: ["ai"] as const,
  recommendations: (category: string, limit: number) =>
    [...aiQueryKeys.all, "recommendations", { category, limit }] as const,
  centerAi: (centerId: string, language: string) =>
    [...aiQueryKeys.all, "center-ai", { centerId, language }] as const,
}

export function usePersonalizedRecommendations(
  category = "training",
  limit = 5
) {
  return useQuery({
    queryKey: aiQueryKeys.recommendations(category, limit),
    queryFn: () => AiClient.getPersonalizedRecommendations(category, limit),
  })
}

export function useSportCenterAi(
  centerId: string,
  language: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: aiQueryKeys.centerAi(centerId, language),
    queryFn: () => AiClient.getAiForCenter(centerId, language),
    enabled: options?.enabled ?? true,
  })
}
