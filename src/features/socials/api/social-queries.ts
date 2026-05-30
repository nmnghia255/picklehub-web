"use client"

import { useQuery } from "@tanstack/react-query"

import { socialService, type SocialListQuery } from "./social-service.client"

export const socialQueryKeys = {
  all: ["socials"] as const,
  list: (params: SocialListQuery) => [...socialQueryKeys.all, "list", params] as const,
  detail: (id: string) => [...socialQueryKeys.all, "detail", id] as const,
  playSessions: (socialId: string) => [...socialQueryKeys.all, "play-sessions", socialId] as const,
}

export function useSocialListQuery(params: SocialListQuery) {
  return useQuery({
    queryKey: socialQueryKeys.list(params),
    queryFn: async () => socialService.discover(params),
  })
}

export function useMySocialScheduleQuery(params: { page?: number; limit?: number; tab?: "upcoming" | "history"; role?: "host" | "player" }) {
  return useQuery({
    queryKey: [...socialQueryKeys.all, "my-schedule", params] as const,
    queryFn: async () => socialService.listMySocials(),
  })
}

export function useSocialDetailQuery(id?: string) {
  return useQuery({
    queryKey: id ? socialQueryKeys.detail(id) : [...socialQueryKeys.all, "detail", "missing"] as const,
    queryFn: async () => socialService.getSocial(id as string),
    enabled: Boolean(id),
  })
}

export function usePlaySessionsQuery(socialId?: string) {
  return useQuery({
    queryKey: socialId ? socialQueryKeys.playSessions(socialId) : [...socialQueryKeys.all, "play-sessions", "missing"] as const,
    queryFn: async () => socialService.listPlaySessions(socialId as string),
    enabled: Boolean(socialId),
  })
}
