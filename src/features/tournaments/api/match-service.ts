import type { PlaySessionMatch } from "@/features/socials/types/match"
import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  ConfirmResultDto,
  CreateMatchDto,
  MatchQueryDto,
  MatchStatsResponse,
  UpdateMatchDto,
} from "../types/matches-service"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const TournamentMatchService = {
  createMatch: async (payload: CreateMatchDto): Promise<PlaySessionMatch> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<
      ApiResponse<PlaySessionMatch> | PlaySessionMatch
    >("/api/matches", payload)
    return unwrapApiResponse(response.data)
  },

  listMatches: async (
    params?: MatchQueryDto
  ): Promise<{ items: PlaySessionMatch[]; meta: Record<string, unknown> }> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<
      | ApiResponse<{
          items: PlaySessionMatch[]
          meta: Record<string, unknown>
        }>
      | { items: PlaySessionMatch[]; meta: Record<string, unknown> }
    >("/api/matches", { params })
    return unwrapApiResponse(response.data)
  },

  listMyMatches: async (
    params?: MatchQueryDto
  ): Promise<{ items: PlaySessionMatch[]; meta: Record<string, unknown> }> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<
      | ApiResponse<{
          items: PlaySessionMatch[]
          meta: Record<string, unknown>
        }>
      | { items: PlaySessionMatch[]; meta: Record<string, unknown> }
    >("/api/matches/my", { params })
    return unwrapApiResponse(response.data)
  },

  getMyStats: async (params?: MatchQueryDto): Promise<MatchStatsResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<
      ApiResponse<MatchStatsResponse> | MatchStatsResponse
    >("/api/matches/my/stats", { params })
    return unwrapApiResponse(response.data)
  },

  getStats: async (
    userId: string,
    params?: MatchQueryDto
  ): Promise<MatchStatsResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<
      ApiResponse<MatchStatsResponse> | MatchStatsResponse
    >(`/api/matches/stats/${userId}`, { params })
    return unwrapApiResponse(response.data)
  },

  getMatchDetails: async (id: string): Promise<PlaySessionMatch> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<
      ApiResponse<PlaySessionMatch> | PlaySessionMatch
    >(`/api/matches/${id}`)
    return unwrapApiResponse(response.data)
  },

  updateMatch: async (
    id: string,
    payload: UpdateMatchDto
  ): Promise<PlaySessionMatch> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<
      ApiResponse<PlaySessionMatch> | PlaySessionMatch
    >(`/api/matches/${id}`, payload)
    return unwrapApiResponse(response.data)
  },

  startMatch: async (
    id: string,
    payload?: { firstServingPlayerId?: string }
  ): Promise<PlaySessionMatch> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<
      ApiResponse<PlaySessionMatch> | PlaySessionMatch
    >(`/api/matches/${id}/start`, payload)
    return unwrapApiResponse(response.data)
  },

  confirmMatch: async (
    id: string,
    payload: ConfirmResultDto
  ): Promise<PlaySessionMatch> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<
      ApiResponse<PlaySessionMatch> | PlaySessionMatch
    >(`/api/matches/${id}/confirm`, payload)
    return unwrapApiResponse(response.data)
  },

  cancelMatch: async (id: string): Promise<PlaySessionMatch> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<
      ApiResponse<PlaySessionMatch> | PlaySessionMatch
    >(`/api/matches/${id}/cancel`)
    return unwrapApiResponse(response.data)
  },
}
